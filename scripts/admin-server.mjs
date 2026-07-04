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
const pythonCandidates = [
  process.env.PYTHON_BIN,
  "/Users/xiongyifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
  "python3",
].filter(Boolean);

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

function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { cwd: rootDir, ...options });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
    child.on("error", (error) => resolve({ code: 1, stdout, stderr: String(error.message || error) }));
  });
}

async function readVersionFile() {
  const versionPath = resolve(rootDir, "VERSION");
  if (!existsSync(versionPath)) return "v0.0.0";
  return (await readFile(versionPath, "utf8")).trim() || "v0.0.0";
}

async function writeVersionFile(version) {
  const versionPath = resolve(rootDir, "VERSION");
  await writeFile(versionPath, `${version}\n`, "utf8");
}

async function syncVersionArtifacts(version) {
  const child = spawn("node", ["scripts/bump-version.mjs", version], { cwd: rootDir });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => (stdout += chunk));
  child.stderr.on("data", (chunk) => (stderr += chunk));
  const code = await new Promise((resolve) => child.on("close", resolve));
  return { code, output: `${stdout}\n${stderr}`.trim() };
}

function normalizeVersionInput(rawValue = "") {
  const value = String(rawValue).trim();
  const match = value.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error("版本号格式不正确，请使用 v1.7.8 这种格式。");
  return `v${match[1]}.${match[2]}.${match[3]}`;
}

function bumpVersionString(version, strategy = "patch") {
  const match = String(version).match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error("VERSION 文件格式不正确。");
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (strategy === "minor") return `v${major}.${minor + 1}.0`;
  return `v${major}.${minor}.${patch + 1}`;
}

function safeBucket(value) {
  const bucket = String(value || "assets");
  if (!allowedBuckets.has(bucket)) throw new Error("只允许写入 assets 或 papers 文件夹。");
  return bucket;
}

function safeRelativePath(rawPath, fallbackName = "file") {
  const cleaned = String(rawPath || fallbackName)
    .replace(/\\/g, "/")
    .replace(/^\/+/ ,"")
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

async function runOptimizeImages(req, res) {
  try {
    const body = req.method === "POST" ? await readRequestBody(req) : Buffer.from("");
    const payload = body.length ? JSON.parse(body.toString("utf8") || "{}") : {};
    const target = String(payload.target || "resources/images").trim();
    const normalizedTarget = safeRelativePath(target, "resources/images");
    const targetDir = resolve(rootDir, normalizedTarget);
    if (!targetDir.startsWith(resolve(rootDir, "resources") + "/") && targetDir !== resolve(rootDir, "resources")) {
      throw new Error("只允许压缩 resources/ 下的图片目录。");
    }
    const python = pythonCandidates.find((candidate) => candidate === "python3" || existsSync(candidate));
    if (!python) {
      throw new Error("没有找到可用的 Python 3。");
    }

    const result = await runCommand(python, ["scripts/optimize-images.py", normalizedTarget]);
    const output = `${result.stdout}\n${result.stderr}`.trim();
    sendJson(res, result.code === 0 ? 200 : 500, {
      ok: result.code === 0,
      code: result.code,
      target: normalizedTarget,
      output,
      message: result.code === 0 ? "图片压缩完成" : "图片压缩失败",
    });
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
}

// ── 发布工具 API ──

async function getVersion(res) {
  try {
    const version = await readVersionFile();
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
    const current = await readVersionFile();
    const newVersion = strategy === "manual" && manualVersion
      ? normalizeVersionInput(manualVersion)
      : bumpVersionString(current, strategy);
    await writeVersionFile(newVersion);
    const syncResult = await syncVersionArtifacts(newVersion.replace(/^v/, ""));
    if (syncResult.code !== 0) {
      throw new Error(syncResult.output || "同步版本信息失败");
    }
    sendJson(res, 200, { ok: true, previous: current, version: newVersion, strategy, output: syncResult.output });
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

async function testGitHubConnection(res) {
  try {
    // Step 1: check if git repo exists and has remote
    const remoteChild = spawn("git", ["remote", "get-url", "origin"], { cwd: rootDir });
    let remoteUrl = "";
    let remoteErr = "";
    remoteChild.stdout.on("data", (c) => (remoteUrl += c));
    remoteChild.stderr.on("data", (c) => (remoteErr += c));
    const remoteCode = await new Promise((resolve) => remoteChild.on("close", resolve));
    if (remoteCode !== 0) {
      sendJson(res, 200, { ok: false, message: "未配置 Git 远程仓库 origin", detail: remoteErr.trim() });
      return;
    }

    // Step 2: test connectivity with git ls-remote
    const testChild = spawn("git", ["ls-remote", "--heads", "origin"], { cwd: rootDir });
    let testOut = "";
    let testErr = "";
    testChild.stdout.on("data", (c) => (testOut += c));
    testChild.stderr.on("data", (c) => (testErr += c));
    const testCode = await new Promise((resolve) => testChild.on("close", resolve));
    if (testCode === 0) {
      sendJson(res, 200, {
        ok: true,
        message: "GitHub 连接正常",
        remote: remoteUrl.trim(),
        heads: testOut.trim().split("\n").filter(Boolean).length,
      });
    } else {
      sendJson(res, 200, {
        ok: false,
        message: "GitHub 连接失败，请检查网络或代理设置",
        remote: remoteUrl.trim(),
        detail: testErr.trim(),
      });
    }
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

async function getPreviewStatus(res) {
  const running = previewServer !== null;
  sendJson(res, 200, {
    ok: true,
    running,
    url: running ? `http://localhost:${previewPort}` : null,
  });
}

// ── 统一状态 API ──
async function getAllStatus(res) {
  try {
    const versionPath = resolve(rootDir, "VERSION");
    let version = "v0.0.0";
    if (existsSync(versionPath)) version = (await readFile(versionPath, "utf8")).trim();

    const gitChild = spawn("git", ["status", "--short"], { cwd: rootDir });
    let gitStdout = "";
    gitChild.stdout.on("data", (c) => (gitStdout += c));
    await new Promise((resolve) => gitChild.on("close", resolve));
    const gitFiles = gitStdout.trim().split("\n").filter(Boolean).map((line) => ({
      status: line.slice(0, 2).trim(),
      path: line.slice(3).trim(),
    }));

    sendJson(res, 200, {
      ok: true,
      version,
      git: { hasChanges: gitFiles.length > 0, fileCount: gitFiles.length, files: gitFiles },
      preview: { running: previewServer !== null, url: previewServer ? `http://localhost:${previewPort}` : null },
      server: { rootDir, canWrite: true },
    });
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
    if (url.pathname === "/api/status/all" && req.method === "GET") {
      await getAllStatus(res);
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
    if (url.pathname === "/api/images/optimize" && req.method === "POST") {
      await runOptimizeImages(req, res);
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
    if (url.pathname === "/api/git/status" && req.method === "GET") {
      await getGitStatus(res);
      return;
    }
    if (url.pathname === "/api/git/test" && req.method === "GET") {
      await testGitHubConnection(res);
      return;
    }
    if (url.pathname === "/api/git/push" && req.method === "POST") {
      await gitAddCommitPush(req, res);
      return;
    }
    if (url.pathname === "/api/preview/status" && req.method === "GET") {
      await getPreviewStatus(res);
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
  console.log(`╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║  xyfoptics 本地管理后台                                       ║`);
  console.log(`╠══════════════════════════════════════════════════════════════╣`);
  console.log(`║  管理界面:  http://localhost:${port}/admin.html              ║`);
  console.log(`║  本地预览:  http://localhost:${port}/index.html              ║`);
  console.log(`║  项目目录:  ${rootDir.padEnd(47)}║`);
  console.log(`╚══════════════════════════════════════════════════════════════╝`);
  console.log("内容写入 data.js；文件写入 resources/；发布使用 GitHub + Cloudflare Pages。");
  if (process.env.ADMIN_OPEN_BROWSER !== "0") {
    const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
    const args = process.platform === "win32" ? ["/c", "start", openUrl] : [openUrl];
    const child = spawn(opener, args, { stdio: "ignore", detached: true });
    child.unref();
  }
});
