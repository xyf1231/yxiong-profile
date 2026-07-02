#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const nextVersion = process.argv[2]?.replace(/^v/i, "");

if (!nextVersion || !/^\d+\.\d+\.\d+$/.test(nextVersion)) {
  console.error("Usage: npm run bump -- 1.5.24");
  process.exit(1);
}

const cacheToken = `v${nextVersion}`;
const footerText = `Version ${nextVersion}`;
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith(".html"));
let changedFiles = 0;

for (const file of htmlFiles) {
  const filePath = path.join(root, file);
  const before = fs.readFileSync(filePath, "utf8");
  let after = before.replace(/((?:styles\.css|(?:data|script|admin)\.js)\?v=)[^"']+/g, `$1${cacheToken}`);
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
