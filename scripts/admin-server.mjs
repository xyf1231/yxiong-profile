#!/usr/bin/env node
import { createServer } from "node:http";
import { mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { basename, extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(scriptDir, "..");
const port = Number(process.env.ADMIN_PORT || 8787);
const allowedBuckets = new Set(["assets", "papers"]);
const bundledBin = "/Users/xiongyifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/pnpm";
const bundledNodeBin = "/Users/xiongyifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin";

// ── 本地预览服务器状态 ──
let previewServer = null;
let previewPort = 3456;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function safeBucket(value) {
  const bucket = String(value || "assets");
  if (!allowedBuckets.has(bucket)) throw new Error("只允许写入 assets 或 papers 文件夹。");
  return bucket;
}

function safeRelativePath(rawPath, fallbackName = "file") {
  const cleaned = String(rawPath || fallbackName)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/\0/g, "")
    .trim();
  const normalized = normalize(cleaned || fallbackName).replace(/^\.\/+/, "");
  if (!normalized || normalized.startsWith("..") || normalized.includes("/../") || resolve(rootDir, normalized) === rootDir) {
    throw new Error("文件路径不安全，请使用普通文件名或子文件夹路径。");
  }
  return normalized;
}

function bucketFilePath(bucket, rawPath) {
  const relativePath = safeRelativePath(rawPath, "file");
  const fullPath = resolve(rootDir, bucket, relativePath);
  const bucketRoot = resolve(rootDir, bucket);
  if (!fullPath.startsWith(bucketRoot + "/") && fullPath !== bucketRoot) {
    throw new Error("文件路径超出允许目录。");
  }
  return { relativePath, fullPath };
}

async function listFilesInBucket(bucket) {
  const bucketRoot = resolve(rootDir, bucket);
  if (!existsSync(bucketRoot)) await mkdir(bucketRoot, { recursive: true });
  const files = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const info = await stat(fullPath);
        files.push({
          path: relative(bucketRoot, fullPath).replace(/\\/g, "/"),
          size: info.size,
          mtime: info.mtime.toISOString(),
        });
      }
    }
  }
  await walk(bucketRoot);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

async function saveData(req, res) {
  const body = await readRequestBody(req);
  const payload = JSON.parse(body.toString("utf8") || "{}");
  const siteData = payload.data || payload;
  if (!siteData || typeof siteData !== "object" || Array.isArray(siteData)) {
    throw new Error("没有收到有效的网站数据。");
  }
  const text = `\ufeffwindow.DEFAULT_SITE_DATA = ${JSON.stringify(siteData, null, 2)};\n`;
  await writeFile(join(rootDir, "js", "data.js"), text, "utf8");
  sendJson(res, 200, { ok: true, path: "js/data.js", bytes: Buffer.byteLength(text) });
}

async function uploadFile(req, res, url) {
  const bucket = safeBucket(url.searchParams.get("bucket"));
  const requestedPath = url.searchParams.get("path") || basename(url.searchParams.get("filename") || "file");
  const { relativePath, fullPath } = bucketFilePath(bucket, requestedPath);
  const body = await readRequestBody(req);
  await mkdir(resolve(fullPath, ".."), { recursive: true });
  await writeFile(fullPath, body);
  sendJson(res, 200, { ok: true, bucket, path: relativePath, url: `${bucket}/${relativePath}`, bytes: body.length });
}

async function deleteFile(res, url) {
  const bucket = safeBucket(url.searchParams.get("bucket"));
  const { relativePath, fullPath } = bucketFilePath(bucket, url.searchParams.get("path"));
  await unlink(fullPath);
  sendJson(res, 200, { ok: true, bucket, path: relativePath });
}

// ── 发布工具 API ──

async function getVersion(res) {
  try {
    const versionPath = resolve(rootDir, "VERSION");
    let version = "v0.0.0";
    if (existsSync(versionPath)) {
      version = (await readFile(versionPath, "utf8")).trim();
    }
    sendJson(res, 200, { ok: true, version });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
}

async function updateVersion(req, res) {
  try {
    const body = await readRequestBody(req);
    const payload = JSON.parse(body.toString("utf8") || "{}");
    const strategy = payload.strategy || "patch"; // patch | minor | manual
    const manualVersion = payload.version || "";

    const versionPath = resolve(rootDir, "VERSION");
    let current = "v0.0.0";
    if (existsSync(versionPath)) {
      current = (await readFile(versionPath, "utf8")).trim();
    }

    let major = 1, minor = 0, patch = 0;
    const match = current.match(/^v?(\d+)\.(\d+)\.(\d+)/);
    if (match) {
      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);
      patch = parseInt(match[3], 10);
    }

    let newVersion;
    if (strategy === "manual" && manualVersion) {
      newVersion = manualVersion.startsWith("v") ? manualVersion : `v${manualVersion}`;
    } else if (strategy === "minor") {
      newVersion = `v${major}.${minor + 1}.0`;
    } else {
      // patch (default)
      newVersion = `v${major}.${minor}.${patch + 1}`;
    }

    await writeFile(versionPath, `${newVersion}\n`, "utf8");
    sendJson(res, 200, { ok: true, previous: current, version: newVersion, strategy });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
}

async function runBumpVersion(res) {
  try {
    const bumpScript = resolve(rootDir, "bump-version.sh");
    if (!existsSync(bumpScript)) {
      sendJson(res, 404, { ok: false, message: "bump-version.sh 不存在" });
      return;
    }
    const child = spawn("bash", [bumpScript], { cwd: rootDir });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => {
      const output = `${stdout}\n${stderr}`.trim();
      sendJson(res, code === 0 ? 200 : 500, { ok: code === 0, code, output });
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
}

async function getGitStatus(res) {
  try {
    const child = spawn("git", ["status", "--short"], { cwd: rootDir });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => {
      const files = stdout.trim().split("\n").filter(Boolean).map((line) => ({
        status: line.slice(0, 2).trim(),
        path: line.slice(3).trim(),
      }));
      sendJson(res, 200, { ok: true, hasChanges: files.length > 0, files, raw: stdout.trim() });
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
}

async function gitAddCommitPush(req, res) {
  try {
    const body = await readRequestBody(req);
    const payload = JSON.parse(body.toString("utf8") || "{}");
    const message = payload.message || "Deploy - update content";

    // Step 1: git add -A
    const addChild = spawn("git", ["add", "-A"], { cwd: rootDir });
    let addOut = "";
    addChild.stdout.on("data", (c) => (addOut += c));
    addChild.stderr.on("data", (c) => (addOut += c));

    await new Promise((resolve) => addChild.on("close", resolve));

    // Step 2: check if there's anything to commit
    const diffChild = spawn("git", ["diff", "--cached", "--quiet"], { cwd: rootDir });
    let hasChanges = true;
    await new Promise((resolve) => diffChild.on("close", (code) => {
      hasChanges = code !== 0; // exit 0 means no changes
      resolve();
    }));

    if (!hasChanges) {
      sendJson(res, 200, { ok: true, committed: false, message: "没有新的更改需要提交" });
      return;
    }

    // Step 3: git commit
    const commitChild = spawn("git", ["commit", "-m", message], { cwd: rootDir });
    let commitOut = "";
    commitChild.stdout.on("data", (c) => (commitOut += c));
    commitChild.stderr.on("data", (c) => (commitOut += c));
    await new Promise((resolve) => commitChild.on("close", resolve));

    // Step 4: git push
    const pushChild = spawn("git", ["push", "origin", "main"], { cwd: rootDir });
    let pushOut = "";
    pushChild.stdout.on("data", (c) => (pushOut += c));
    pushChild.stderr.on("data", (c) => (pushOut += c));
    await new Promise((resolve) => pushChild.on("close", resolve));

    sendJson(res, 200, {
      ok: true,
      committed: true,
      message,
      output: { add: addOut.trim(), commit: commitOut.trim(), push: pushOut.trim() },
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
}

async function startPreview(res) {
  if (previewServer) {
    sendJson(res, 200, { ok: true, running: true, url: `http://localhost:${previewPort}`, message: "预览服务器已在运行" });
    return;
  }
  try {
    const serveBin = resolve(rootDir, "node_modules", ".bin", "serve");
    const args = existsSync(serveBin)
      ? [serveBin, ".", "-l", String(previewPort)]
      : ["npx", "serve", ".", "-l", String(previewPort)];
    const cmd = args.shift();
    previewServer = spawn(cmd, args, { cwd: rootDir, detached: true, stdio: "ignore" });
    previewServer.unref();

    // 等待一小段时间确认启动
    await new Promise((resolve) => setTimeout(resolve, 1500));

    sendJson(res, 200, {
      ok: true,
      running: true,
      url: `http://localhost:${previewPort}`,
      message: `本地预览已启动: http://localhost:${previewPort}`,
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
}

async function stopPreview(res) {
  if (!previewServer) {
    sendJson(res, 200, { ok: true, running: false, message: "预览服务器未运行" });
    return;
  }
  try {
    previewServer.kill("SIGTERM");
    previewServer = null;
    sendJson(res, 200, { ok: true, running: false, message: "预览服务器已关闭" });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
}

async function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/admin.html";
  const filePath = normalize(join(rootDir, pathname));
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    // ── CMS API ──
    if (url.pathname === "/api/status") {
      sendJson(res, 200, { ok: true, mode: "local-static-cloudflare", rootDir, canWrite: true, buckets: [...allowedBuckets] });
      return;
    }
    if (url.pathname === "/api/save-data" && req.method === "POST") {
      await saveData(req, res);
      return;
    }
    if (url.pathname === "/api/upload" && req.method === "POST") {
      await uploadFile(req, res, url);
      return;
    }
    if (url.pathname === "/api/files" && req.method === "GET") {
      const bucket = safeBucket(url.searchParams.get("bucket"));
      sendJson(res, 200, { ok: true, bucket, files: await listFilesInBucket(bucket) });
      return;
    }
    if (url.pathname === "/api/files" && req.method === "DELETE") {
      await deleteFile(res, url);
      return;
    }

    // ── 发布工具 API ──
    if (url.pathname === "/api/version" && req.method === "GET") {
      await getVersion(res);
      return;
    }
    if (url.pathname === "/api/version" && req.method === "POST") {
      await updateVersion(req, res);
      return;
    }
    if (url.pathname === "/api/bump" && req.method === "POST") {
      await runBumpVersion(res);
      return;
    }
    if (url.pathname === "/api/git/status" && req.method === "GET") {
      await getGitStatus(res);
      return;
    }
    if (url.pathname === "/api/git/push" && req.method === "POST") {
      await gitAddCommitPush(req, res);
      return;
    }
    if (url.pathname === "/api/preview/start" && req.method === "POST") {
      await startPreview(res);
      return;
    }
    if (url.pathname === "/api/preview/stop" && req.method === "POST") {
      await stopPreview(res);
      return;
    }

    await serveStatic(req, res, url);
  } catch (error) {
    sendJson(res, 500, { ok: false, error: "admin_server_error", message: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  const openPath = process.env.ADMIN_OPEN_PATH || "/admin.html";
  const openUrl = `http://localhost:${port}${openPath.startsWith("/") ? openPath : `/${openPath}`}`;
  console.log(`Local CMS Server: http://localhost:${port}/admin.html`);
  console.log(`Deploy Tool:      http://localhost:${port}/deploy.html`);
  console.log(`Preview URL:      http://localhost:${port}/index.html`);
  console.log(`Project folder:   ${rootDir}`);
  console.log("Content writes to data.js; files write to assets/ and papers/; deploy uses GitHub + Cloudflare Pages.");
  if (process.env.ADMIN_OPEN_BROWSER !== "0") {
    const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
    const args = process.platform === "win32" ? ["/c", "start", openUrl] : [openUrl];
    const child = spawn(opener, args, { stdio: "ignore", detached: true });
    child.unref();
  }
});
