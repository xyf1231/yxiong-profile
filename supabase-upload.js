#!/usr/bin/env node
/**
 * Supabase Storage Upload Script
 * Run after creating buckets in Supabase Dashboard:
 * 1. Create 'assets' bucket (public)
 * 2. Create 'papers' bucket (public)
 * 3. Set RLS policies to allow anon uploads
 *
 * Usage: node supabase-upload.js
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://lmmkxikbhnorwliimnvc.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: SUPABASE_ANON_KEY environment variable not set');
  console.error('Usage: SUPABASE_ANON_KEY=your_key node supabase-upload.js');
  process.exit(1);
}

const ASSETS_DIR = './assets';
const PAPERS_DIR = './papers';

async function uploadFile(bucket, filePath, destPath) {
  const fileData = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = ext === '.webp' ? 'image/webp' :
                      ext === '.png' ? 'image/png' :
                      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                      ext === '.pdf' ? 'application/pdf' : 'application/octet-stream';

  const url = `${SUPABASE_URL}/storage/v1/object/${bucket}/${destPath}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true'
    },
    body: fileData
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`❌ Failed to upload ${destPath}: ${response.status} ${text}`);
    return false;
  }

  console.log(`✅ Uploaded ${bucket}/${destPath}`);
  return true;
}

async function uploadDirectory(localDir, bucket, prefix = '') {
  const files = fs.readdirSync(localDir);
  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    const localPath = path.join(localDir, file);
    const stat = fs.statSync(localPath);

    if (stat.isDirectory()) {
      const result = await uploadDirectory(localPath, bucket, `${prefix}${file}/`);
      uploaded += result.uploaded;
      failed += result.failed;
    } else {
      const destPath = `${prefix}${file}`;
      const success = await uploadFile(bucket, localPath, destPath);
      if (success) uploaded++;
      else failed++;
    }
  }

  return { uploaded, failed };
}

async function main() {
  console.log('Supabase Storage Upload Script');
  console.log('==============================\n');

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`Assets directory not found: ${ASSETS_DIR}`);
    process.exit(1);
  }

  // Upload assets
  console.log('Uploading assets...');
  const assetsResult = await uploadDirectory(ASSETS_DIR, 'assets');
  console.log(`Assets: ${assetsResult.uploaded} uploaded, ${assetsResult.failed} failed\n`);

  // Upload papers
  if (fs.existsSync(PAPERS_DIR)) {
    console.log('Uploading papers...');
    const papersResult = await uploadDirectory(PAPERS_DIR, 'papers');
    console.log(`Papers: ${papersResult.uploaded} uploaded, ${papersResult.failed} failed\n`);
  }

  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
