/**
 * xyfoptics 发布工具前端逻辑
 * 配合 scripts/admin-server.mjs 使用
 */

const API_BASE = "";

// ── DOM 引用 ──
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
  versionPill: $("#current-version"),
  versionStrategy: $("#version-strategy"),
  manualVersionRow: $("#manual-version-row"),
  manualVersionInput: $("#manual-version"),
  btnSetVersion: $("#btn-set-version"),
  btnUpdateVersion: $("#btn-update-version"),
  versionSpinner: $("#version-spinner"),
  versionBtnText: $("#version-btn-text"),
  btnBump: $("#btn-bump"),
  bumpSpinner: $("#bump-spinner"),
  btnRefreshGit: $("#btn-refresh-git"),
  gitStatusList: $("#git-status-list"),
  btnDeploy: $("#btn-deploy"),
  deploySpinner: $("#deploy-spinner"),
  deployBtnText: $("#deploy-btn-text"),
  btnPreviewStart: $("#btn-preview-start"),
  btnPreviewStop: $("#btn-preview-stop"),
  previewSpinner: $("#preview-spinner"),
  previewLink: $("#preview-link"),
  previewStatus: $("#preview-status"),
  log: $("#deploy-log"),
  btnClearLog: $("#btn-clear-log"),
};

let currentStrategy = "patch";
let isDeploying = false;

// ── 日志工具 ──
function log(message, type = "info") {
  const entry = document.createElement("div");
  entry.className = `deploy-log-entry ${type}`;
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  entry.textContent = `[${time}] ${message}`;
  els.log.appendChild(entry);
  els.log.scrollTop = els.log.scrollHeight;
}

function clearLog() {
  els.log.innerHTML = "";
  log("日志已清空");
}

// ── API 请求 ──
async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  return res.json();
}

async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

// ── 版本号 ──
async function loadVersion() {
  try {
    const data = await apiGet("/api/version");
    if (data.ok) {
      els.versionPill.textContent = data.version;
      log(`当前版本号: ${data.version}`);
    } else {
      log(`获取版本号失败: ${data.message}`, "error");
    }
  } catch (err) {
    log(`获取版本号错误: ${err.message}`, "error");
    els.versionPill.textContent = "未知";
  }
}

async function updateVersion() {
  if (isDeploying) return;
  isDeploying = true;
  els.versionSpinner.style.display = "inline-block";
  els.versionBtnText.textContent = "更新中…";
  els.btnUpdateVersion.disabled = true;

  try {
    const payload = { strategy: currentStrategy };
    if (currentStrategy === "manual") {
      const manual = els.manualVersionInput.value.trim();
      if (!manual) {
        log("请输入版本号", "warn");
        return;
      }
      payload.version = manual;
    }

    log(`正在更新版本号 (策略: ${currentStrategy})…`, "cmd");
    const data = await apiPost("/api/version", payload);

    if (data.ok) {
      els.versionPill.textContent = data.version;
      log(`✅ 版本号已更新: ${data.previous} → ${data.version}`, "success");
    } else {
      log(`❌ 更新失败: ${data.message}`, "error");
    }
  } catch (err) {
    log(`❌ 错误: ${err.message}`, "error");
  } finally {
    isDeploying = false;
    els.versionSpinner.style.display = "none";
    els.versionBtnText.textContent = "更新版本号";
    els.btnUpdateVersion.disabled = false;
  }
}

async function runBump() {
  if (isDeploying) return;
  isDeploying = true;
  els.bumpSpinner.style.display = "inline-block";
  els.btnBump.disabled = true;

  try {
    log("正在运行 bump-version.sh…", "cmd");
    const data = await apiPost("/api/bump");
    if (data.ok) {
      log("✅ bump-version.sh 执行成功", "success");
      if (data.output) {
        data.output.split("\n").forEach((line) => {
          if (line.trim()) log(line, "info");
        });
      }
      await loadVersion();
    } else {
      log(`❌ 执行失败: ${data.message || data.output}`, "error");
    }
  } catch (err) {
    log(`❌ 错误: ${err.message}`, "error");
  } finally {
    isDeploying = false;
    els.bumpSpinner.style.display = "none";
    els.btnBump.disabled = false;
  }
}

// ── Git 状态 ──
async function refreshGitStatus() {
  try {
    els.btnRefreshGit.disabled = true;
    els.btnRefreshGit.textContent = "刷新中…";
    log("正在获取 Git 状态…", "cmd");

    const data = await apiGet("/api/git/status");
    if (data.ok) {
      if (data.files.length === 0) {
        els.gitStatusList.innerHTML = '<div class="deploy-file-list empty">✅ 工作区干净，没有未提交的更改</div>';
        log("工作区干净，没有未提交的更改", "success");
      } else {
        const html = data.files
          .map((f) => {
            let statusClass = "";
            if (f.status === "A" || f.status === "??") statusClass = "added";
            else if (f.status === "M" || f.status === "MM") statusClass = "modified";
            else if (f.status === "D") statusClass = "deleted";
            return `<div class="deploy-file-item"><span class="deploy-file-status ${statusClass}">${f.status}</span><span>${escapeHtml(f.path)}</span></div>`;
          })
          .join("");
        els.gitStatusList.innerHTML = html;
        log(`发现 ${data.files.length} 个变更文件`, "warn");
      }
    } else {
      log(`获取 Git 状态失败: ${data.message}`, "error");
    }
  } catch (err) {
    log(`错误: ${err.message}`, "error");
  } finally {
    els.btnRefreshGit.disabled = false;
    els.btnRefreshGit.textContent = "刷新状态";
  }
}

// ── 发布 ──
async function deploy() {
  if (isDeploying) return;
  isDeploying = true;
  els.deploySpinner.style.display = "inline-block";
  els.deployBtnText.textContent = "推送中…";
  els.btnDeploy.disabled = true;

  try {
    const version = els.versionPill.textContent.trim();
    const message = `Deploy ${version} - update content`;

    log("开始发布流程…", "cmd");
    log(`提交信息: ${message}`, "info");

    const data = await apiPost("/api/git/push", { message });

    if (data.ok) {
      if (data.committed) {
        log("✅ 推送成功！", "success");
        log("📦 git add -A", "info");
        if (data.output?.commit) log(data.output.commit, "info");
        if (data.output?.push) log(data.output.push, "info");
        log("🌐 Cloudflare Pages 将自动构建部署", "success");
        log("⏱️ jsDelivr CDN 缓存约 5-10 分钟后生效", "info");
      } else {
        log("✅ 没有新的更改需要提交", "success");
      }
    } else {
      log(`❌ 推送失败: ${data.message}`, "error");
    }
  } catch (err) {
    log(`❌ 错误: ${err.message}`, "error");
  } finally {
    isDeploying = false;
    els.deploySpinner.style.display = "none";
    els.deployBtnText.textContent = "推送到 GitHub";
    els.btnDeploy.disabled = false;
  }
}

// ── 本地预览 ──
async function startPreview() {
  try {
    els.previewSpinner.style.display = "inline-block";
    els.btnPreviewStart.disabled = true;
    log("正在启动本地预览服务器…", "cmd");

    const data = await apiPost("/api/preview/start");
    if (data.ok && data.running) {
      log(`✅ ${data.message}`, "success");
      els.previewStatus.innerHTML = '<span class="deploy-status-dot running"></span>运行中';
      els.previewLink.style.display = "inline-flex";
    } else {
      log(`❌ 启动失败: ${data.message}`, "error");
    }
  } catch (err) {
    log(`❌ 错误: ${err.message}`, "error");
  } finally {
    els.previewSpinner.style.display = "none";
    els.btnPreviewStart.disabled = false;
  }
}

async function stopPreview() {
  try {
    els.btnPreviewStop.disabled = true;
    log("正在停止本地预览服务器…", "cmd");

    const data = await apiPost("/api/preview/stop");
    if (data.ok) {
      log(`✅ ${data.message}`, "success");
      els.previewStatus.innerHTML = '<span class="deploy-status-dot"></span>未运行';
      els.previewLink.style.display = "none";
    } else {
      log(`❌ 停止失败: ${data.message}`, "error");
    }
  } catch (err) {
    log(`❌ 错误: ${err.message}`, "error");
  } finally {
    els.btnPreviewStop.disabled = false;
  }
}

// ── 工具 ──
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ── 事件绑定 ──
function init() {
  // 版本号策略切换
  els.versionStrategy.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      els.versionStrategy.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentStrategy = btn.dataset.strategy;
      els.manualVersionRow.style.display = currentStrategy === "manual" ? "flex" : "none";
      log(`版本号策略切换为: ${currentStrategy}`);
    });
  });

  // 手动设置版本号
  els.btnSetVersion.addEventListener("click", updateVersion);

  // 更新版本号（策略模式）
  els.btnUpdateVersion.addEventListener("click", updateVersion);

  // 运行 bump-version.sh
  els.btnBump.addEventListener("click", runBump);

  // 刷新 Git 状态
  els.btnRefreshGit.addEventListener("click", refreshGitStatus);

  // 推送到 GitHub
  els.btnDeploy.addEventListener("click", deploy);

  // 本地预览
  els.btnPreviewStart.addEventListener("click", startPreview);
  els.btnPreviewStop.addEventListener("click", stopPreview);

  // 清空日志
  els.btnClearLog.addEventListener("click", clearLog);

  // 初始化
  loadVersion();
  log("发布工具已初始化");
  log("提示: 请先更新版本号，再运行 bump-version.sh，最后推送到 GitHub");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
