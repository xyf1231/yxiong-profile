#!/usr/bin/env node
/**
 * generate-resource-manifest.mjs — 生成静态资源清单
 * 直接扫描站点资源目录，输出 js/resource-manifest.js，供加载页显示固定总量。
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "js", "resource-manifest.js");

const allowedExts = new Set([
  ".html",
  ".css",
  ".js",
  ".json",
  ".webp",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".mp4",
  ".pdf",
  ".ico",
  ".woff2",
  ".woff",
  ".ttf",
  ".otf",
]);

const scanRoots = ["css", "js", "resources"];
const ignoreParts = new Set([".git", ".agents", "docs", "vercel-archive", "node_modules"]);
const manifest = {};

function isIgnored(filePath) {
  return filePath.split(path.sep).some((part) => ignoreParts.has(part));
}

function walk(dir) {
  if (!fs.existsSync(dir) || isIgnored(dir)) return;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (isIgnored(fullPath)) continue;
    if (item.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!item.isFile()) continue;
    const ext = path.extname(item.name).toLowerCase();
    if (!allowedExts.has(ext)) continue;
    const relative = path.relative(root, fullPath).replace(/\\/g, "/");
    if (relative === "js/resource-manifest.js") continue;
    try {
      const stat = fs.statSync(fullPath);
      manifest[relative] = stat.size;
    } catch {
      // Skip transient files.
    }
  }
}

for (const dir of scanRoots) {
  walk(path.join(root, dir));
}

for (const file of [
  "index.html",
  "profile.html",
  "results.html",
  "honors.html",
  "activities.html",
]) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath) || isIgnored(fullPath)) continue;
  const stat = fs.statSync(fullPath);
  manifest[file] = stat.size;
}

const totalBytes = Object.values(manifest).reduce((sum, size) => sum + Number(size || 0), 0);
const output = `window.RESOURCE_SIZE_MANIFEST = ${JSON.stringify(manifest, null, 2)};\nwindow.RESOURCE_SIZE_MANIFEST_TOTAL = ${totalBytes};\n`;
fs.writeFileSync(outputPath, output, "utf8");
console.log(`Wrote ${relativePath(outputPath)} with ${Object.keys(manifest).length} entries (${totalBytes} bytes).`);

function relativePath(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}
