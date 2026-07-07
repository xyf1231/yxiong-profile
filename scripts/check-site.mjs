#!/usr/bin/env node
/**
 * check-site.mjs — 站点静态检查脚本
 * 检查：必需文件是否存在、HTML 缓存版本戳是否一致、页脚版本号是否一致、
 *       UTF-8 声明、script 标签 charset、data.js BOM 等。
 * 用法：npm run check
 */

import fs from "node:fs";
import path from "node:path";

// 项目根目录
const root = process.cwd();
// 站点必需文件清单
const requiredFiles = [
  "index.html",
  "profile.html",
  "results.html",
  "honors.html",
  "activities.html",
  "css/styles.css",
  "css/home-config.css",
  "css/profile-config.css",
  "css/results-config.css",
  "css/honors-config.css",
  "css/activities-config.css",
  "js/script.js",
  "js/data.js",
  "js/home-content.js",
  "js/profile-content.js",
  "js/results-content.js",
  "js/honors-content.js",
  "js/activities-content.js",
  "css/loading-config.css",
  "js/loading-content.js",
];

// 收集检查错误与警告
const errors = [];
const warnings = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) errors.push(`missing required file: ${file}`);
}

function collectHtmlFiles(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && item.name !== "node_modules" && !item.name.startsWith(".")) {
      files = files.concat(collectHtmlFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

const htmlFiles = collectHtmlFiles(root);
const versions = new Set();
const footerVersions = new Set();

for (const filePath of htmlFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const file = path.relative(root, filePath);
  for (const match of content.matchAll(/\?v=([^"']+)/g)) versions.add(match[1]);
  for (const match of content.matchAll(/Version (\d+\.\d+\.\d+)/g)) footerVersions.add(match[1]);

  if (!content.includes('<meta charset="utf-8"')) {
    warnings.push(`${file}: missing explicit utf-8 meta tag`);
  }
  if (content.includes("data.js") && !content.includes('charset="utf-8"')) {
    errors.push(`${file}: script tags should keep charset="utf-8"`);
  }

  // 检查主页面是否加载了对应的 config CSS 和 content JS
  const pageName = file.replace(/\.html$/, "");
  if (["index", "profile", "results", "honors", "activities"].includes(pageName)) {
    const cssName = pageName === "index" ? "home-config" : `${pageName}-config`;
    const jsName = pageName === "index" ? "home-content" : `${pageName}-content`;
    if (!content.includes(`css/${cssName}.css`)) {
      errors.push(`${file}: missing css/${cssName}.css`);
    }
    if (!content.includes(`js/${jsName}.js`)) {
      errors.push(`${file}: missing js/${jsName}.js`);
    }
  }
  // 所有通过 <script> 实际加载 script.js 的页面都应加载全局加载遮罩配置
  if (/<script[^>]*src="[^"]*js\/script\.js/.test(content)) {
    if (!content.includes("css/loading-config.css")) {
      errors.push(`${file}: missing css/loading-config.css`);
    }
    if (!content.includes("js/loading-content.js")) {
      errors.push(`${file}: missing js/loading-content.js`);
    }
  }
}

if (versions.size !== 1) errors.push(`cache versions are not consistent: ${[...versions].join(", ")}`);
if (footerVersions.size > 1) errors.push(`footer versions are not consistent: ${[...footerVersions].join(", ")}`);
if (footerVersions.size === 0) warnings.push("no footer Version text found");

const dataPath = path.join(root, "js", "data.js");
if (fs.existsSync(dataPath)) {
  const data = fs.readFileSync(dataPath);
  if (!(data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf)) {
    warnings.push("js/data.js has no UTF-8 BOM; keep BOM if Chinese displays incorrectly in some browsers");
  }
}

try {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  if (pkg.version !== [...footerVersions][0]) {
    warnings.push(`package.json version (${pkg.version}) does not match footer version (${[...footerVersions][0]})`);
  }
} catch (error) {
  warnings.push(`package.json check skipped: ${error.message}`);
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
