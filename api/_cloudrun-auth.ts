/**
 * Gets a fresh Google ID token using the stored refresh token.
 * Cloud Run requires this Bearer token for authentication.
 */
export async function getCloudRunIdToken(): Promise<string> {
  const refreshToken = process.env.CLOUD_RUN_REFRESH_TOKEN;
  const clientId     = process.env.CLOUD_RUN_CLIENT_ID;
  const clientSecret = process.env.CLOUD_RUN_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error(
      'Missing Cloud Run auth env vars: CLOUD_RUN_REFRESH_TOKEN, CLOUD_RUN_CLIENT_ID, CLOUD_RUN_CLIENT_SECRET'
    );
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
      client_id:     clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh Cloud Run token: ${error}`);
  }

  const data = await response.json();

  // Google returns id_token when the original OAuth used the openid scope
  if (data.id_token) return data.id_token;

  throw new Error('No id_token returned from Google token endpoint');
}
