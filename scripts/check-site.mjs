#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "index.html",
  "profile.html",
  "results.html",
  "honors.html",
  "conferences.html",
  "styles.css",
  "script.js",
  "data.js",
  "vercel.json",
];

const errors = [];
const warnings = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing required file: ${file}`);
}

const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));
const versions = new Set();
const footerVersions = new Set();

for (const file of htmlFiles) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  for (const match of content.matchAll(/\?v=([^"']+)/g)) versions.add(match[1]);
  for (const match of content.matchAll(/Version (\d+\.\d+\.\d+)/g)) footerVersions.add(match[1]);

  if (!content.includes('<meta charset="utf-8"')) {
    warnings.push(`${file}: missing explicit utf-8 meta tag`);
  }
  if (content.includes("data.js") && !content.includes('charset="utf-8"')) {
    errors.push(`${file}: script tags should keep charset="utf-8"`);
  }
}

if (versions.size !== 1) errors.push(`cache versions are not consistent: ${[...versions].join(", ")}`);
if (footerVersions.size > 1) errors.push(`footer versions are not consistent: ${[...footerVersions].join(", ")}`);
if (footerVersions.size === 0) warnings.push("no footer Version text found");

const dataPath = path.join(root, "data.js");
if (fs.existsSync(dataPath)) {
  const data = fs.readFileSync(dataPath);
  if (!(data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf)) {
    warnings.push("data.js has no UTF-8 BOM; keep BOM if Chinese displays incorrectly in some browsers");
  }
}

try {
  const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  if (!Array.isArray(vercel.headers)) warnings.push("vercel.json has no headers array");
} catch (error) {
  errors.push(`vercel.json is not valid JSON: ${error.message}`);
}

if (warnings.length) {
  console.log("Warnings:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.error("Errors:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Site check passed (${htmlFiles.length} html files, ${versions.size ? [...versions][0] : "no cache token"})`);
