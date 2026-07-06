#!/usr/bin/env node
/**
 * bump-version.mjs — 版本号统一更新脚本
 * 读取命令行参数中的版本号，批量更新所有 HTML 的缓存戳、页脚版本号、
 * package.json 版本以及 docs/WORKFLOW.md 中的当前版本记录。
 * 用法：npm run bump -- 1.7.8
 */

import fs from "node:fs";
import path from "node:path";

// 项目根目录与目标版本号
const root = process.cwd();
const nextVersion = process.argv[2]?.replace(/^v/i, "");

if (!nextVersion || !/^\d+\.\d+\.\d+$/.test(nextVersion)) {
  console.error("Usage: npm run bump -- 1.5.24");
  process.exit(1);
}

// 缓存戳与页脚文本
const cacheToken = `v${nextVersion}`;
const footerText = `Version ${nextVersion}`;
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));
let changedFiles = 0;

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  const before = fs.readFileSync(filePath, "utf8");
  let after = before.replace(/((?:css\/styles\.css|css\/[^"']*-config\.css|js\/(?:data|script|admin)\.js|js\/[^"']*-content\.js)\?v=)[^"']+/g, `$1${cacheToken}`);
  after = after.replace(/Version \d+\.\d+\.\d+/g, footerText);

  if (after !== before) {
    fs.writeFileSync(filePath, after, "utf8");
    changedFiles += 1;
    console.log(`updated ${file}`);
  }
}

const packagePath = path.join(root, "package.json");
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  if (pkg.version !== nextVersion) {
    pkg.version = nextVersion;
    fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
    changedFiles += 1;
    console.log("updated package.json");
  }
}

const workflowPath = path.join(root, "docs", "WORKFLOW.md");
if (fs.existsSync(workflowPath)) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(new Date());
  const before = fs.readFileSync(workflowPath, "utf8");
  let after = before.replace(/\*\*当前版本\*\*: `?v?\d+\.\d+\.\d+`?/g, `**当前版本**: \`v${nextVersion}\``);
  after = after.replace(/\*\*最后更新\*\*: \d{4}-\d{2}-\d{2}/g, `**最后更新**: ${today}`);
  if (after !== before) {
    fs.writeFileSync(workflowPath, after, "utf8");
    changedFiles += 1;
    console.log("updated docs/WORKFLOW.md");
  }
}

console.log(changedFiles === 0 ? `already at ${cacheToken}` : `version bumped to ${cacheToken}`);
