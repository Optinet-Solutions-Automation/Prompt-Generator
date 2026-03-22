import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Authenticates to Cloud Run using Vercel Workload Identity Federation (WIF).
 *
 * Flow:
 *  1. Vercel injects a short-lived OIDC token into each function invocation
 *  2. We swap it with Google STS for a federated access token
 *  3. We use that access token to impersonate the service account and get a
 *     Cloud Run ID token (the thing Cloud Run actually accepts)
 *
 * No keys, no refresh tokens — everything is automatic.
 */
async function getCloudRunIdToken(cloudRunUrl: string, req: VercelRequest): Promise<string> {
  const workloadProvider = process.env.GCP_WORKLOAD_PROVIDER;
  const serviceAccount   = process.env.GCP_SERVICE_ACCOUNT;

  if (!workloadProvider || !serviceAccount) {
    const missing = [
      !workloadProvider && 'GCP_WORKLOAD_PROVIDER',
      !serviceAccount   && 'GCP_SERVICE_ACCOUNT',
    ].filter(Boolean).join(', ');
    throw new Error(`Missing env vars: ${missing}`);
  }

  // Vercel injects the OIDC token into the request header for each invocation
  const oidcToken =
    (req.headers['x-vercel-oidc-token'] as string | undefined) ||
    process.env.VERCEL_OIDC_TOKEN;

  if (!oidcToken) {
    throw new Error(
      'No Vercel OIDC token found. Make sure OIDC is enabled in Vercel project settings ' +
      '(Settings → Security → Enable Vercel Authentication).'
    );
  }

  // ── Step 1: Exchange Vercel OIDC token → Google federated access token ──
  const stsRes = await fetch('https://sts.googleapis.com/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:           'urn:ietf:params:oauth:grant-type:token-exchange',
      audience:             `//iam.googleapis.com/${workloadProvider}`,
      scope:                'https://www.googleapis.com/auth/cloud-platform',
      requested_token_type: 'urn:ietf:params:oauth:token-type:access_token',
      subject_token_type:   'urn:ietf:params:oauth:token-type:jwt',
      subject_token:        oidcToken,
    }),
  });

  if (!stsRes.ok) {
    const err = await stsRes.text();
    throw new Error(`Google STS token exchange failed (${stsRes.status}): ${err}`);
  }
  const { access_token: federatedToken } = await stsRes.json();

  // ── Step 2: Use federated token to generate a Cloud Run ID token ─────────
  const idTokenRes = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccount}:generateIdToken`,
    {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${federatedToken}`,
      },
      body: JSON.stringify({ audience: cloudRunUrl, includeEmail: true }),
    }
  );

  if (!idTokenRes.ok) {
    const err = await idTokenRes.text();
    throw new Error(`generateIdToken failed (${idTokenRes.status}): ${err}`);
  }
  const { token } = await idTokenRes.json();
  return token;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, provider, aspectRatio, imageSize, backend, resolution } = req.body;

    if (!prompt || !provider) {
      return res.status(400).json({ error: 'Prompt and provider are required' });
    }

    // ── Cloud Run backend (high-res 1K/2K/3K/4K) ───────────────────────────
    if (backend === 'cloud-run') {
      const cloudRunUrl =
        process.env.GCP_CLOUD_RUN_URL ||
        process.env.CLOUD_RUN_URL ||
        process.env.NEXT_PUBLIC_IMAGE_API_URL;

      if (!cloudRunUrl) {
        return res.status(500).json({ error: 'GCP_CLOUD_RUN_URL is not configured' });
      }

      const idToken = await getCloudRunIdToken(cloudRunUrl, req);

      console.log('Sending to Cloud Run:', { provider, aspectRatio, resolution });

      const response = await fetch(`${cloudRunUrl}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          prompt,
          provider,
          aspectRatio: aspectRatio || '1:1',
          resolution:  resolution  || '1K',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloud Run error:', response.status, errorText);
        return res.status(500).json({
          error: `Cloud Run failed (${response.status}): ${errorText || 'No details returned'}`
        });
      }

      const data = await response.json();
      console.log('Cloud Run response:', JSON.stringify(data));
      const result = Array.isArray(data) ? data[0] : data;
      return res.status(200).json(result);
    }

    // ── n8n backend (default) ──────────────────────────────────────────────
    const webhookUrl = process.env.N8N_WEBHOOK_GENERATE_IMAGE;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'Image generation webhook URL is not configured' });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        provider,
        aspectRatio: aspectRatio || '1:1',
        imageSize:   imageSize   || 'default',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: 'Failed to generate image', details: errorText });
    }

    const data = await response.json();
    const result = Array.isArray(data) ? data[0] : data;
    return res.status(200).json(result);

  } catch (error) {
    console.error('Image generation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
