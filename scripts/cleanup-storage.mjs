/**
 * Cleanup orphaned files in Supabase Storage
 * Finds files in the 'generated-images' bucket that have no matching
 * record in the generated_images table, then deletes them.
 *
 * Usage: node scripts/cleanup-storage.mjs
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars (or .env file)
 */

import { readFileSync } from 'fs';

// Load .env.local manually (no dotenv dependency)
try {
  const envFile = readFileSync('.env.local', 'utf-8');
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch {}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET       = 'generated-images';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey':        SERVICE_KEY,
  'Content-Type':  'application/json',
};

async function listStorageFiles(prefix = '', allFiles = []) {
  const body = { prefix, limit: 1000, offset: allFiles.length };
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`List failed: ${res.status} ${await res.text()}`);
  const items = await res.json();

  for (const item of items) {
    if (item.id) {
      // It's a file
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      allFiles.push({ name: fullPath, size: item.metadata?.size || 0 });
    } else if (item.name && !item.id) {
      // It's a folder — recurse
      const folderPath = prefix ? `${prefix}/${item.name}` : item.name;
      await listStorageFiles(folderPath, allFiles);
    }
  }

  return allFiles;
}

async function getDbStoragePaths() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/generated_images?select=storage_path&limit=10000`, { headers });
  if (!res.ok) throw new Error(`DB query failed: ${res.status}`);
  const rows = await res.json();
  // storage_path might be "generated-images/folder/file.png" — strip bucket prefix
  return new Set(rows.map(r => {
    const sp = r.storage_path || '';
    return sp.startsWith(`${BUCKET}/`) ? sp.slice(BUCKET.length + 1) : sp;
  }).filter(Boolean));
}

async function deleteFiles(paths) {
  // Supabase Storage batch delete
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ prefixes: paths }),
  });
  if (!res.ok) {
    console.error(`Batch delete failed: ${res.status} ${await res.text()}`);
    return false;
  }
  return true;
}

async function main() {
  console.log('Listing all files in storage bucket:', BUCKET);
  const storageFiles = await listStorageFiles();
  console.log(`Found ${storageFiles.length} files in storage`);

  const totalSize = storageFiles.reduce((sum, f) => sum + f.size, 0);
  console.log(`Total storage used: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);

  console.log('\nFetching DB records...');
  const dbPaths = await getDbStoragePaths();
  console.log(`Found ${dbPaths.size} records in generated_images table`);

  // Find orphans — files in storage with no matching DB record
  const orphans = storageFiles.filter(f => !dbPaths.has(f.name));
  const orphanSize = orphans.reduce((sum, f) => sum + f.size, 0);

  if (orphans.length === 0) {
    console.log('\nNo orphaned files found. Storage is clean!');
    return;
  }

  console.log(`\nFound ${orphans.length} orphaned files (${(orphanSize / 1024 / 1024).toFixed(1)} MB):`);
  orphans.forEach(f => console.log(`  ${f.name} (${(f.size / 1024).toFixed(0)} KB)`));

  // Delete in batches of 100
  console.log(`\nDeleting ${orphans.length} orphaned files...`);
  const batchSize = 100;
  let deleted = 0;
  for (let i = 0; i < orphans.length; i += batchSize) {
    const batch = orphans.slice(i, i + batchSize).map(f => f.name);
    const ok = await deleteFiles(batch);
    if (ok) {
      deleted += batch.length;
      console.log(`  Deleted ${deleted}/${orphans.length}`);
    }
  }

  console.log(`\nDone! Freed ~${(orphanSize / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(err => { console.error(err); process.exit(1); });
