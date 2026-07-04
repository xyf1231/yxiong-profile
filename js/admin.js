/**
 * xyfoptics 后台管理 — 内容管理 + 版本更新
 * 统一入口，实时状态，一键更新
 */

const STORAGE_KEY = "academicSiteData";
const USE_LOCAL_ADMIN_SERVER = ["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port === "8787";

// ═══════════════════════════════════════════════════════════════
//  模式定义
// ═══════════════════════════════════════════════════════════════

const schemas = {
  profile: {
    title: "基本资料",
    type: "object",
    fields: [
      ["nameCn", "中文名"],
      ["nameEn", "英文名"],
      ["title", "标题"],
      ["subtitle", "副标题", "textarea"],
      ["affiliation", "单位"],
      ["email", "邮箱"],
      ["phone", "电话"],
      ["photo", "人物照片", "image"],
      ["bio", "个人简介", "textarea"],
      ["focus", "研究关键词"],
    ],
  },
  research: { title: "研究内容", fields: [["title", "标题"], ["text", "说明", "textarea"]] },
  news: {
    title: "新闻",
    fields: [
      ["date", "日期"],
      ["title", "中文标题", "textarea"],
      ["titleEn", "英文标题", "textarea"],
      ["text", "中文内容", "textarea"],
      ["textEn", "英文内容", "textarea"],
      ["image", "图片", "image"],
      ["url", "链接"],
    ],
  },
  newsDetails: {
    title: "新闻详情",
    fields: [
      ["slug", "标识"],
      ["eyebrow", "首屏标签"],
      ["title", "标题", "textarea"],
      ["subtitle", "导语/副标题", "textarea"],
      ["image", "主图", "image"],
      ["contentHtml", "自由排版正文", "richtext"],
      ["content", "正文（用 ## 小标题分节）", "textarea"],
      ["paperTitle", "论文题目", "textarea"],
      ["journal", "期刊"],
      ["authors", "作者"],
      ["correspondingAuthors", "通讯作者"],
      ["affiliation", "完成单位", "textarea"],
      ["doi", "DOI"],
      ["pdf", "PDF/链接", "file"],
    ],
  },
  publications: {
    title: "论文",
    fields: [
      ["year", "年份"],
      ["title", "英文题名", "textarea"],
      ["titleZh", "中文题名", "textarea"],
      ["authors", "作者", "textarea"],
      ["venue", "期刊英文"],
      ["venueZh", "期刊中文"],
      ["date", "发表日期"],
      ["impact", "影响因子"],
      ["image", "主图", "image"],
      ["url", "PDF/链接", "file"],
    ],
  },
  allPublications: {
    title: "全部论文",
    fields: [
      ["year", "年份"],
      ["title", "英文题名", "textarea"],
      ["titleZh", "中文题名", "textarea"],
      ["authors", "作者", "textarea"],
      ["venue", "期刊英文"],
      ["venueZh", "期刊中文"],
      ["date", "发表日期"],
      ["url", "PDF/链接", "file"],
    ],
  },
  projects: { title: "项目", fields: [["title", "标题"], ["text", "说明", "textarea"], ["image", "图片", "image"], ["url", "链接"]] },
  achievements: {
    title: "成果",
    fields: [["type", "类型"], ["year", "年份"], ["title", "标题"], ["applicant", "申请人/发明人名单"], ["detail", "详情", "textarea"]],
  },
  experience: { title: "经历", fields: [["period", "时间"], ["title", "标题"], ["text", "说明", "textarea"]] },
  contacts: { title: "联系方式", fields: [["label", "标签"], ["value", "显示文本"], ["url", "链接"]] },
};

// ═══════════════════════════════════════════════════════════════
//  状态
// ═══════════════════════════════════════════════════════════════

let data = loadData();
let activeTab = "profile";
let editingIndex = 0;
let siteDirectoryHandle = null;
let draggedIndex = null;
let savedRichTextSelection = null;

// 版本更新状态
let deployState = {
  versionStrategy: "patch",
  isDeploying: false,
};

// ═══════════════════════════════════════════════════════════════
//  DOM 引用
// ═══════════════════════════════════════════════════════════════

const form = document.querySelector("#content-form");
const list = document.querySelector("#item-list");
const addButton = document.querySelector("#add-item");
const jsonBuffer = document.querySelector("#json-buffer");
const folderStatus = document.querySelector("#folder-status");
const localStatus = document.querySelector("#local-status") || folderStatus;
const storageList = document.querySelector("#storage-list");
const storageBucket = document.querySelector("#storage-bucket");
const storagePath = document.querySelector("#storage-path");
const storageFile = document.querySelector("#storage-file");

// 版本更新 DOM
const deployLogEl = document.querySelector("#deploy-log");
const optimizeLogEl = document.querySelector("#optimize-log");
const optimizeProgressEl = document.querySelector("#optimize-progress");
const optimizeStatusTextEl = document.querySelector("#optimize-status-text");
const optimizeTargetEl = document.querySelector("#optimize-target");
const sbVersion = document.querySelector("#sb-version");
const sbGit = document.querySelector("#sb-git");
const sbPreview = document.querySelector("#sb-preview");
const sbConnection = document.querySelector("#sb-connection");

// ═══════════════════════════════════════════════════════════════
//  工具函数
// ═══════════════════════════════════════════════════════════════

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function mergeWithDefaultData(source) {
  const base = clone(window.DEFAULT_SITE_DATA);
  const merged = { ...base, ...source };
  merged.profile = { ...base.profile, ...(source.profile || {}) };
  Object.keys(base).forEach((key) => {
    if (Array.isArray(base[key])) {
      if (!Array.isArray(merged[key]) || merged[key].length === 0) merged[key] = base[key];
    }
  });
  return merged;
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return clone(window.DEFAULT_SITE_DATA);
  try {
    const parsed = JSON.parse(saved);
    return parsed.version === window.DEFAULT_SITE_DATA.version ? mergeWithDefaultData(parsed) : clone(window.DEFAULT_SITE_DATA);
  } catch { return clone(window.DEFAULT_SITE_DATA); }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  jsonBuffer.value = JSON.stringify(data, null, 2);
}

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function slugify(value = "") {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90).toLowerCase();
}

function extensionOf(filename = "", fallback = "") {
  const ext = filename.includes(".") ? filename.split(".").pop().toLowerCase() : fallback;
  return ext ? `.${ext.replace(/^\./, "")}` : "";
}

function buildUploadFilename(file, key, target) {
  const year = target.year || target.date || new Date().getFullYear();
  const title = target.title || target.titleZh || target.paperTitle || target.nameEn || target.nameCn || key || "file";
  const suffix = key === "image" || key === "photo" ? "main" : "";
  const stem = [year, slugify(title), suffix].filter(Boolean).join("-");
  return `${stem || slugify(file.name) || "file"}${extensionOf(file.name)}`;
}

function currentCollection() {
  return schemas[activeTab].type === "object" ? data[activeTab] : data[activeTab] || [];
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function cleanStoragePath(value = "") {
  return String(value).replace(/^\/+/, "").replace(/\/+/g, "/").trim();
}

function activeFileFieldName() {
  const schema = schemas[activeTab];
  const imageField = schema.fields.find(([, , kind]) => kind === "image")?.[0];
  const fileField = schema.fields.find(([, , kind]) => kind === "file")?.[0];
  return storageBucket?.value === "papers" ? fileField || "url" : imageField || "image";
}

// ═══════════════════════════════════════════════════════════════
//  API 请求
// ═══════════════════════════════════════════════════════════════

async function apiGet(path) {
  const res = await fetch(path, { cache: "no-store" });
  return res.json();
}

async function apiPost(path, body = {}) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function localRequest(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", ...options });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof payload === "string" ? payload : payload.message || JSON.stringify(payload);
    throw new Error(message);
  }
  return payload;
}

// ═══════════════════════════════════════════════════════════════
//  文件写入（本地服务器 / File System Access）
// ═══════════════════════════════════════════════════════════════

async function ensureWritableDirectory(name) {
  if (!siteDirectoryHandle) return null;
  return siteDirectoryHandle.getDirectoryHandle(name, { create: true });
}

async function saveFileToSiteFolder(file, key, kind, target) {
  const folder = kind === "image" ? "assets" : "papers";
  const filename = buildUploadFilename(file, key, target);
  if (USE_LOCAL_ADMIN_SERVER) {
    const response = await fetch(`/api/upload?bucket=${encodeURIComponent(folder)}&path=${encodeURIComponent(filename)}`, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!response.ok) throw new Error(await response.text());
    const result = await response.json();
    return result.url;
  }
  if (!siteDirectoryHandle) return null;
  const dir = await ensureWritableDirectory(folder);
  const fileHandle = await dir.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();
  return `${folder}/${filename}`;
}

async function writeDataJsToSiteFolder() {
  if (!siteDirectoryHandle) return false;
  const fileHandle = await siteDirectoryHandle.getFileHandle("data.js", { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(`window.DEFAULT_SITE_DATA = ${JSON.stringify(data, null, 2)};\n`);
  await writable.close();
  return true;
}

// ═══════════════════════════════════════════════════════════════
//  保存逻辑
// ═══════════════════════════════════════════════════════════════

async function persistAndWrite() {
  persist();
  const saveButtons = [document.querySelector("#save-all"), document.querySelector("#local-save-top")].filter(Boolean);
  saveButtons.forEach((button) => {
    button.disabled = true;
    button.dataset.originalText = button.dataset.originalText || button.textContent;
    button.textContent = "保存中…";
  });
  const report = (message, type = "info") => {
    if (folderStatus) {
      folderStatus.textContent = message;
      folderStatus.dataset.type = type;
    }
    setLocalStatus(message, type);
  };
  try {
    if (USE_LOCAL_ADMIN_SERVER) {
      report("正在保存到本地 data.js…", "info");
      const result = await localRequest("/api/save-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      report(`已保存到本地：${result.path}。现在可以预览或发布。`, "success");
      return;
    }
    if (await writeDataJsToSiteFolder()) {
      report("已保存：data.js 已同步更新。", "success");
      return;
    }
    report("未连接本地后台：请双击「站点维护.command」，并从 http://localhost:8787/admin.html 打开。", "error");
  } catch (error) {
    report(`保存失败：${error.message}`, "error");
  } finally {
    saveButtons.forEach((button) => {
      button.disabled = false;
      button.textContent = button.dataset.originalText || "保存到本地";
    });
  }
}

function setLocalStatus(message, type = "info") {
  if (!localStatus) return;
  localStatus.textContent = message;
  localStatus.dataset.type = type;
}

// ═══════════════════════════════════════════════════════════════
//  富文本编辑器
// ═══════════════════════════════════════════════════════════════

function activeRichTextEditor() { return form.querySelector(".richtext-editor"); }

function saveRichTextSelection() {
  const editor = activeRichTextEditor();
  const selection = window.getSelection();
  if (!editor || !selection?.rangeCount) return;
  const range = selection.getRangeAt(0);
  if (editor.contains(range.commonAncestorContainer)) savedRichTextSelection = range.cloneRange();
}

function restoreRichTextSelection(editor = activeRichTextEditor()) {
  if (!editor || !savedRichTextSelection) return;
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(savedRichTextSelection);
}

function syncRichTextSource(editor) {
  const key = editor?.dataset.richEditor;
  const source = key ? form.elements[key] : null;
  if (source) source.value = editor.innerHTML.trim();
}

function syncAllRichTextSources() {
  form.querySelectorAll(".richtext-editor").forEach(syncRichTextSource);
}

function insertRichHtml(html) {
  const editor = activeRichTextEditor();
  if (!editor) return;
  editor.focus();
  restoreRichTextSelection(editor);
  document.execCommand("insertHTML", false, html);
  syncRichTextSource(editor);
  saveRichTextSelection();
}

function insertRichImage(src, caption = "") {
  const safeSrc = escapeHtml(src);
  const safeCaption = escapeHtml(caption);
  insertRichHtml(`<figure><img src="${safeSrc}" alt="" /><figcaption>${safeCaption}</figcaption></figure><p><br></p>`);
}

async function handleRichImageUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  const target = schemas[activeTab].type === "object" ? data[activeTab] : currentCollection()[editingIndex] || {};
  let src = await saveFileToSiteFolder(file, "content-image", "image", target);
  if (!src) src = await readFile(file);
  insertRichImage(src, file.name.replace(/\.[^.]+$/, ""));
  input.value = "";
}

function richTextFieldHtml(key, label, value) {
  return `
    <section class="field full richtext-field" data-richtext-field="${key}">
      <span>${label}</span>
      <div class="richtext-toolbar" role="toolbar" aria-label="新闻详情排版工具">
        <select data-rich-command="formatBlock" aria-label="段落样式">
          <option value="P">段落：正文</option>
          <option value="H2">段落：大标题</option>
          <option value="H3">段落：小标题</option>
          <option value="BLOCKQUOTE">段落：引用</option>
        </select>
        <select data-rich-command="fontSize" aria-label="字号">
          <option value="3">字号：正文</option>
          <option value="4">字号：稍大</option>
          <option value="5">字号：小标题</option>
          <option value="6">字号：大标题</option>
        </select>
        <button type="button" data-rich-command="bold">加粗</button>
        <button type="button" data-rich-command="italic">斜体</button>
        <button type="button" data-rich-command="insertUnorderedList">项目符号</button>
        <button type="button" data-rich-command="insertOrderedList">编号</button>
        <button type="button" data-rich-action="insertImageUrl">插入图片链接</button>
        <label class="richtext-file-button">上传插图<input type="file" accept="image/*" data-rich-image-upload /></label>
      </div>
      <div class="richtext-editor" contenteditable="true" data-rich-editor="${key}" aria-label="新闻详情正文编辑区">${value || "<p>在这里输入新闻正文。可以像 Word 一样分段、插入标题和图片。</p>"}</div>
      <textarea class="richtext-source" name="${key}" spellcheck="false">${escapeHtml(value)}</textarea>
      <p class="richtext-hint">提示：在正文中点击要插图的位置，再使用「上传插图」或「插入图片链接」。保存当前条目后会写入新闻详情。</p>
    </section>`;
}

function setupRichTextEditors() {
  form.querySelectorAll(".richtext-editor").forEach((editor) => {
    editor.addEventListener("keyup", () => syncRichTextSource(editor));
    editor.addEventListener("input", () => syncRichTextSource(editor));
    editor.addEventListener("mouseup", saveRichTextSelection);
    editor.addEventListener("focus", saveRichTextSelection);
    editor.addEventListener("blur", saveRichTextSelection);
  });
  form.querySelectorAll("[data-rich-command]").forEach((control) => {
    const runCommand = () => {
      const editor = activeRichTextEditor();
      if (!editor) return;
      restoreRichTextSelection(editor);
      const value = control.tagName === "SELECT" ? control.value : null;
      document.execCommand(control.dataset.richCommand, false, value);
      editor.focus();
      syncRichTextSource(editor);
      saveRichTextSelection();
    };
    if (control.tagName === "SELECT") control.addEventListener("change", runCommand);
    else {
      control.addEventListener("mousedown", (event) => event.preventDefault());
      control.addEventListener("click", runCommand);
    }
  });
  form.querySelector("[data-rich-action='insertImageUrl']")?.addEventListener("click", () => {
    const url = prompt("请输入图片 URL 或 resources/images/xxx.jpg 路径");
    if (url) insertRichImage(url.trim(), "");
  });
  form.querySelector("[data-rich-image-upload]")?.addEventListener("change", (event) => handleRichImageUpload(event.target));
}

// ═══════════════════════════════════════════════════════════════
//  表单与列表渲染
// ═══════════════════════════════════════════════════════════════

function buildForm() {
  const schema = schemas[activeTab];
  const source = schema.type === "object" ? data[activeTab] : currentCollection()[editingIndex] || {};
  form.innerHTML = schema.fields
    .map(([key, label, kind]) => {
      const value = source[key] || "";
      const cls = kind === "textarea" || kind === "image" || kind === "file" || kind === "richtext" ? "field full" : "field";
      if (kind === "richtext") return richTextFieldHtml(key, label, value);
      if (kind === "textarea") return `<label class="${cls}"><span>${label}</span><textarea name="${key}">${escapeHtml(value)}</textarea></label>`;
      if (kind === "image" || kind === "file") {
        const accept = kind === "image" ? "image/*" : ".pdf,.doc,.docx,image/*";
        return `<label class="${cls}"><span>${label}</span><input name="${key}" value="${escapeHtml(value)}" placeholder="可粘贴路径/URL，或选择文件上传" /><input name="${key}Upload" type="file" accept="${accept}" /></label>`;
      }
      return `<label class="${cls}"><span>${label}</span><input name="${key}" value="${escapeHtml(value)}" /></label>`;
    })
    .join("");
  setupRichTextEditors();
}

function renderList() {
  const schema = schemas[activeTab];
  addButton.style.display = schema.type === "object" ? "none" : "inline-flex";
  if (schema.type === "object") {
    list.dataset.sortable = "false";
    const p = data.profile || {};
    list.innerHTML = `
      <article class="managed-item profile-summary">
        <div class="profile-avatar">👤</div>
        <div class="managed-copy">
          <h3>${escapeHtml(p.nameCn || "未命名")}</h3>
          <p>${escapeHtml(p.affiliation || "")}</p>
          <p style="margin-top:2px;font-size:0.78rem;color:rgba(255,255,255,0.4);">${escapeHtml(p.title || "")} · ${escapeHtml(p.email || "")}</p>
        </div>
      </article>`;
    return;
  }
  list.dataset.sortable = "true";
  const items = currentCollection();
  if (items.length === 0) {
    list.innerHTML = `<div class="managed-item empty-item"><div style="text-align:center;width:100%;padding:30px 20px;color:rgba(255,255,255,0.35);font-size:0.85rem;">暂无条目，点击「新增」添加</div></div>`;
    return;
  }
  list.innerHTML = items
    .map(
      (item, index) => `
        <article class="managed-item" draggable="false" data-index="${index}">
          <button class="drag-handle" type="button" aria-label="拖动排序" title="拖动排序">⋮⋮</button>
          <div class="managed-copy">
            <h3><span class="item-number">${String(index + 1).padStart(2, "0")}</span>${escapeHtml(item.title || item.label || item.nameCn || `条目 ${index + 1}`)}</h3>
            <p>${escapeHtml(item.venue || item.text || item.detail || item.period || item.subtitle || item.affiliation || item.url || "")}</p>
          </div>
          <div class="item-actions">
            <button class="icon-button" data-action="up" data-index="${index}" type="button" title="上移">▲</button>
            <button class="icon-button" data-action="down" data-index="${index}" type="button" title="下移">▼</button>
            <button class="icon-button" data-action="edit" data-index="${index}" type="button" title="编辑">✎</button>
            <button class="icon-button" data-action="delete" data-index="${index}" type="button" title="删除">🗑</button>
          </div>
        </article>
      `,
    )
    .join("");
}

async function reorderCurrentCollection(fromIndex, toIndex) {
  const collection = currentCollection();
  if (!Array.isArray(collection) || fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
  if (fromIndex >= collection.length || toIndex >= collection.length) return;
  const [moved] = collection.splice(fromIndex, 1);
  collection.splice(toIndex, 0, moved);
  if (editingIndex === fromIndex) editingIndex = toIndex;
  else if (fromIndex < editingIndex && toIndex >= editingIndex) editingIndex -= 1;
  else if (fromIndex > editingIndex && toIndex <= editingIndex) editingIndex += 1;
  await persistAndWrite();
  buildForm();
  renderList();
}

async function saveCurrent() {
  syncAllRichTextSources();
  const schema = schemas[activeTab];
  const target = schema.type === "object" ? data[activeTab] : currentCollection()[editingIndex] || {};
  for (const [key] of schema.fields) {
    const value = form.elements[key]?.value;
    if (value !== undefined) target[key] = value || "";
  }
  for (const [key, , kind] of schema.fields) {
    if (kind !== "image" && kind !== "file") continue;
    const upload = form.elements[`${key}Upload`];
    const file = upload?.files?.[0];
    if (!file) continue;
    const savedPath = await saveFileToSiteFolder(file, key, kind, target);
    target[key] = savedPath || (await readFile(file));
  }
  if (schema.type !== "object" && !currentCollection()[editingIndex]) {
    currentCollection().push(target);
    editingIndex = currentCollection().length - 1;
  }
  await persistAndWrite();
  buildForm();
  renderList();
}

function clearForm() {
  editingIndex = currentCollection().length;
  form.querySelectorAll("input:not([type=file]), textarea").forEach((input) => (input.value = ""));
  form.querySelectorAll(".richtext-editor").forEach((editor) => (editor.innerHTML = "<p></p>"));
}

// ═══════════════════════════════════════════════════════════════
//  标签切换（CMS + Deploy）
// ═══════════════════════════════════════════════════════════════

function setActiveTab(tab) {
  activeTab = tab;
  editingIndex = 0;

  // 更新按钮状态
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.setAttribute("aria-selected", String(btn.dataset.tab === tab));
  });

  // 切换面板
  const isDeploy = tab === "deploy";
  document.querySelector("#panel-cms").classList.toggle("active", !isDeploy);
  document.querySelector("#panel-deploy").classList.toggle("active", isDeploy);

  if (isDeploy) {
    // 加载版本仪表盘初始数据
    loadDeployData();
    return;
  }

  // CMS 模式
  const schema = schemas[tab];
  document.querySelector("#active-kicker").textContent = tab;
  document.querySelector("#active-title").textContent = schema.title;
  document.querySelector("#editor-kicker").textContent = "编辑";
  document.querySelector("#editor-title").textContent = "编辑当前条目";
  buildForm();
  renderList();
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — 日志
// ═══════════════════════════════════════════════════════════════

function deployLog(message, type = "info") {
  if (!deployLogEl) return;
  const entry = document.createElement("div");
  entry.className = `deploy-log-entry ${type}`;
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  entry.textContent = `[${time}] ${message}`;
  deployLogEl.appendChild(entry);
  deployLogEl.scrollTop = deployLogEl.scrollHeight;
}

function clearDeployLog() {
  if (!deployLogEl) return;
  deployLogEl.innerHTML = "";
  deployLog("日志已清空");
}

function optimizeLog(message, type = "info") {
  if (!optimizeLogEl) return;
  const entry = document.createElement("div");
  entry.className = `deploy-log-entry ${type}`;
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  entry.textContent = `[${time}] ${message}`;
  optimizeLogEl.appendChild(entry);
  optimizeLogEl.scrollTop = optimizeLogEl.scrollHeight;
}

function setOptimizeRunning(running, text = "") {
  optimizeProgressEl?.classList.toggle("running", running);
  if (optimizeStatusTextEl && text) optimizeStatusTextEl.textContent = text;
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — 版本管理
// ═══════════════════════════════════════════════════════════════

async function loadVersion() {
  try {
    const data = await apiGet("/api/version");
    if (data.ok) {
      updateVersionPill(data.version);
      deployLog(`当前版本号: ${data.version}`);
    }
  } catch (err) {
    deployLog(`获取版本号失败: ${err.message}`, "error");
  }
}

function updateVersionPill(version) {
  if (sbVersion) sbVersion.innerHTML = `<span class="dot"></span>${version}`;
}

async function updateVersion() {
  if (deployState.isDeploying) return;
  deployState.isDeploying = true;
  const spinner = document.querySelector("#version-spinner");
  const btnText = document.querySelector("#version-btn-text");
  const btn = document.querySelector("#btn-update-version");
  spinner.style.display = "inline-block";
  btnText.textContent = "更新中…";
  btn.disabled = true;

  try {
    const payload = { strategy: deployState.versionStrategy };
    if (deployState.versionStrategy === "manual") {
      const manual = document.querySelector("#manual-version").value.trim();
      if (!manual) { deployLog("请输入版本号", "warn"); return; }
      payload.version = manual;
    }
    deployLog(`正在更新版本号 (策略: ${deployState.versionStrategy})…`, "cmd");
    const result = await apiPost("/api/version", payload);
    if (result.ok) {
      updateVersionPill(result.version);
      deployLog(`✅ 版本号已更新: ${result.previous} → ${result.version}`, "success");
    } else {
      deployLog(`❌ 更新失败: ${result.message}`, "error");
    }
  } catch (err) {
    deployLog(`❌ 错误: ${err.message}`, "error");
  } finally {
    deployState.isDeploying = false;
    spinner.style.display = "none";
    btnText.textContent = "更新版本号";
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — Git 状态
// ═══════════════════════════════════════════════════════════════

async function refreshGitStatus(silent = false) {
  const btn = document.querySelector("#btn-refresh-git");
  try {
    if (btn) { btn.disabled = true; btn.textContent = "刷新中…"; }
    if (!silent) deployLog("正在获取 Git 状态…", "cmd");
    const result = await apiGet("/api/git/status");
    if (result.ok) {
      updateGitPill(result);
      const listEl = document.querySelector("#git-status-list");
      if (result.files.length === 0) {
        if (listEl) listEl.innerHTML = '<div class="deploy-file-list empty">✅ 工作区干净，没有未提交的更改</div>';
        if (!silent) deployLog("工作区干净，没有未提交的更改", "success");
      } else {
        if (listEl) {
          listEl.innerHTML = result.files.map((f) => {
            let statusClass = "";
            if (f.status === "A" || f.status === "??") statusClass = "added";
            else if (f.status === "M" || f.status === "MM") statusClass = "modified";
            else if (f.status === "D") statusClass = "deleted";
            return `<div class="deploy-file-item"><span class="deploy-file-status ${statusClass}">${f.status}</span><span>${escapeHtml(f.path)}</span></div>`;
          }).join("");
        }
        if (!silent) deployLog(`发现 ${result.files.length} 个变更文件`, "warn");
      }
    }
  } catch (err) {
    if (!silent) deployLog(`获取 Git 状态失败: ${err.message}`, "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "刷新状态"; }
  }
}

function updateGitPill(result) {
  if (!sbGit) return;
  const count = result.files?.length || 0;
  if (count > 0) {
    sbGit.innerHTML = `<span class="dot"></span>${count} 个未提交`;
    sbGit.classList.add("has-changes");
  } else {
    sbGit.innerHTML = `<span class="dot"></span>Git 干净`;
    sbGit.classList.remove("has-changes");
  }
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — 测试 GitHub 连接
// ═══════════════════════════════════════════════════════════════

async function testGitHubConnection() {
  const btn = document.querySelector("#btn-test-git");
  if (btn) { btn.disabled = true; btn.textContent = "测试中…"; }
  deployLog("正在测试 GitHub 连接…", "cmd");
  try {
    const result = await apiGet("/api/git/test");
    if (result.ok) {
      deployLog(`✅ GitHub 连接正常: ${result.message}`, "success");
      if (result.remote) deployLog(`远程仓库: ${result.remote}`, "info");
    } else {
      deployLog(`❌ GitHub 连接失败: ${result.message}`, "error");
    }
  } catch (err) {
    deployLog(`❌ 测试失败: ${err.message}`, "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "测试 GitHub 连接"; }
  }
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — 推送到 GitHub
// ═══════════════════════════════════════════════════════════════

async function deployToGitHub() {
  if (deployState.isDeploying) return;
  deployState.isDeploying = true;
  const spinner = document.querySelector("#deploy-spinner");
  const btnText = document.querySelector("#deploy-btn-text");
  const btn = document.querySelector("#btn-deploy");
  spinner.style.display = "inline-block";
  btnText.textContent = "推送中…";
  btn.disabled = true;

  try {
    const versionText = sbVersion ? sbVersion.textContent.trim() : "v1.6.5";
    const version = versionText.replace(/^[^v]*/, "").trim() || "v1.6.5";
    const message = `Deploy ${version} - update content`;
    deployLog("开始发布流程…", "cmd");
    deployLog(`提交信息: ${message}`, "info");
    const result = await apiPost("/api/git/push", { message });
    if (result.ok) {
      if (result.committed) {
        deployLog("✅ 推送成功！", "success");
        if (result.output?.commit) deployLog(result.output.commit, "info");
        if (result.output?.push) deployLog(result.output.push, "info");
        deployLog("🌐 Cloudflare Pages 将自动构建部署", "success");
        deployLog("⏱️ jsDelivr CDN 缓存约 5-10 分钟后生效", "info");
      } else {
        deployLog("✅ 没有新的更改需要提交", "success");
      }
      await refreshGitStatus(true);
    } else {
      deployLog(`❌ 推送失败: ${result.message}`, "error");
    }
  } catch (err) {
    deployLog(`❌ 错误: ${err.message}`, "error");
  } finally {
    deployState.isDeploying = false;
    spinner.style.display = "none";
    btnText.textContent = "推送到 GitHub";
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — 本地预览
// ═══════════════════════════════════════════════════════════════

async function startPreview() {
  const spinner = document.querySelector("#preview-spinner");
  const btn = document.querySelector("#btn-preview-start");
  spinner.style.display = "inline-block";
  btn.disabled = true;
  try {
    deployLog("正在启动本地预览服务器…", "cmd");
    const result = await apiPost("/api/preview/start");
    if (result.ok && result.running) {
      deployLog(`✅ ${result.message}`, "success");
      updatePreviewUI(true);
    } else {
      deployLog(`❌ 启动失败: ${result.message}`, "error");
    }
  } catch (err) {
    deployLog(`❌ 错误: ${err.message}`, "error");
  } finally {
    spinner.style.display = "none";
    btn.disabled = false;
  }
}

async function stopPreview() {
  const btn = document.querySelector("#btn-preview-stop");
  btn.disabled = true;
  try {
    deployLog("正在停止本地预览服务器…", "cmd");
    const result = await apiPost("/api/preview/stop");
    if (result.ok) {
      deployLog(`✅ ${result.message}`, "success");
      updatePreviewUI(false);
    } else {
      deployLog(`❌ 停止失败: ${result.message}`, "error");
    }
  } catch (err) {
    deployLog(`❌ 错误: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
  }
}

async function checkPreviewStatus() {
  try {
    const result = await apiGet("/api/preview/status");
    updatePreviewUI(result.running);
  } catch { /* 静默失败 */ }
}

function updatePreviewUI(running) {
  if (sbPreview) {
    if (running) {
      sbPreview.innerHTML = `<span class="dot"></span>预览运行中`;
      sbPreview.classList.add("running");
    } else {
      sbPreview.innerHTML = `<span class="dot"></span>预览未运行`;
      sbPreview.classList.remove("running");
    }
  }
  const statusEl = document.querySelector("#preview-status");
  const linkEl = document.querySelector("#preview-link");
  if (statusEl) statusEl.className = running ? "deploy-status-badge running" : "deploy-status-badge";
  if (statusEl) statusEl.innerHTML = running ? '<span class="dot"></span>运行中' : '<span class="dot"></span>未运行';
  if (linkEl) linkEl.style.display = running ? "inline-flex" : "none";
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — 状态栏轮询
// ═══════════════════════════════════════════════════════════════

async function pollStatus() {
  if (!USE_LOCAL_ADMIN_SERVER) {
    if (sbConnection) {
      sbConnection.innerHTML = `<span class="dot"></span>本地模式`;
      sbConnection.classList.remove("connected", "disconnected");
    }
    return;
  }
  try {
    // 并发获取所有状态
    const [versionRes, gitRes, previewRes] = await Promise.allSettled([
      apiGet("/api/version"),
      apiGet("/api/git/status"),
      apiGet("/api/preview/status"),
    ]);

    if (versionRes.status === "fulfilled" && versionRes.value.ok) {
      updateVersionPill(versionRes.value.version);
    }
    if (gitRes.status === "fulfilled" && gitRes.value.ok) {
      updateGitPill(gitRes.value);
    }
    if (previewRes.status === "fulfilled" && previewRes.value.ok) {
      updatePreviewUI(previewRes.value.running);
    }

    if (sbConnection) {
      sbConnection.innerHTML = `<span class="dot"></span>服务器已连接`;
      sbConnection.classList.add("connected");
      sbConnection.classList.remove("disconnected");
    }
  } catch {
    if (sbConnection) {
      sbConnection.innerHTML = `<span class="dot"></span>服务器断开`;
      sbConnection.classList.add("disconnected");
      sbConnection.classList.remove("connected");
    }
  }
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — 加载仪表盘数据
// ═══════════════════════════════════════════════════════════════

async function loadDeployData() {
  deployLog("加载版本仪表盘数据…", "cmd");
  await Promise.all([
    loadVersion(),
    refreshGitStatus(true),
    checkPreviewStatus(),
  ]);
  deployLog("版本仪表盘数据加载完成", "success");
}

async function optimizeImages() {
  const btn = document.querySelector("#btn-optimize-images");
  if (!btn) return;
  const target = (optimizeTargetEl?.value || "resources/images").trim() || "resources/images";
  btn.disabled = true;
  setOptimizeRunning(true, "正在压缩...");
  optimizeLog(`开始压缩目录: ${target}`, "cmd");
  try {
    const result = await apiPost("/api/images/optimize", { target });
    if (result.ok) {
      optimizeLog(`✅ ${result.message}`, "success");
      if (result.output) result.output.split("\n").forEach((line) => { if (line.trim()) optimizeLog(line, "info"); });
      setOptimizeRunning(false, "压缩完成");
    } else {
      optimizeLog(`❌ ${result.message || "压缩失败"}`, "error");
      if (result.output) result.output.split("\n").forEach((line) => { if (line.trim()) optimizeLog(line, "info"); });
      setOptimizeRunning(false, "压缩失败");
    }
  } catch (err) {
    optimizeLog(`❌ 错误: ${err.message}`, "error");
    setOptimizeRunning(false, "执行失败");
  } finally {
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════════════
//  文件管理器
// ═══════════════════════════════════════════════════════════════

function buildStoragePath(file, bucket) {
  const manual = cleanStoragePath(storagePath?.value || "");
  if (manual) return manual;
  const target = schemas[activeTab].type === "object" ? data[activeTab] : currentCollection()[editingIndex] || {};
  const stem = buildUploadFilename(file, bucket === "assets" ? "image" : "file", bucket === "assets" ? "image" : "file", target).replace(/\.[^.]+$/, "");
  return `${stem || slugify(file.name.replace(/\.[^.]+$/, "")) || "file"}${extensionOf(file.name)}`;
}

async function listLocalFiles(bucket = storageBucket?.value || "assets") {
  if (!storageList) return;
  storageList.innerHTML = `<p class="storage-empty">正在读取 ${bucket}…</p>`;
  try {
    const result = await localRequest(`/api/files?bucket=${encodeURIComponent(bucket)}`);
    const files = result.files || [];
    if (!files.length) {
      storageList.innerHTML = `<p class="storage-empty">${bucket} 中暂时没有文件。</p>`;
      return;
    }
    storageList.innerHTML = files.map((file) => {
      const relativeUrl = `${bucket}/${file.path}`;
      const size = file.size ? `${Math.round(file.size / 1024)} KB` : "";
      return `
        <article class="storage-item" data-path="${escapeHtml(file.path)}">
          <div>
            <h3>${escapeHtml(file.path)}</h3>
            <p>${escapeHtml([bucket, size, file.mtime || ""].filter(Boolean).join(" · "))}</p>
          </div>
          <div class="item-actions">
            <a class="icon-button" href="${escapeHtml(relativeUrl)}" target="_blank" rel="noopener">打开</a>
            <button class="icon-button" data-storage-action="copy" data-url="${escapeHtml(relativeUrl)}" type="button">复制路径</button>
            <button class="icon-button" data-storage-action="use" data-url="${escapeHtml(relativeUrl)}" type="button">填入当前项</button>
            <button class="icon-button danger" data-storage-action="delete" data-path="${escapeHtml(file.path)}" type="button">删除</button>
          </div>
        </article>
      `;
    }).join("");
    setLocalStatus(`已读取 ${bucket}：${files.length} 个文件。`, "success");
  } catch (error) {
    storageList.innerHTML = `<p class="storage-empty">读取失败：${escapeHtml(error.message)}</p>`;
    setLocalStatus(`读取文件失败：${error.message}`, "error");
  }
}

async function uploadLocalFile() {
  const file = storageFile?.files?.[0];
  const bucket = storageBucket?.value || "assets";
  if (!file) { setLocalStatus("请先选择一个要上传的文件。", "error"); return; }
  if (!USE_LOCAL_ADMIN_SERVER) { setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开，才能写入项目文件夹。", "error"); return; }
  const path = buildStoragePath(file, bucket);
  try {
    const result = await localRequest(`/api/upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    storagePath.value = result.path;
    setLocalStatus(`上传成功：${result.url}`, "success");
    await navigator.clipboard?.writeText(result.url).catch(() => {});
    await listLocalFiles(bucket);
  } catch (error) {
    setLocalStatus(`上传失败：${error.message}`, "error");
  }
}

async function deleteLocalFile(bucket, path) {
  if (!confirm(`确定删除 ${bucket}/${path}？`)) return;
  try {
    await localRequest(`/api/files?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`, { method: "DELETE" });
    setLocalStatus(`已删除：${bucket}/${path}`, "success");
    await listLocalFiles(bucket);
  } catch (error) {
    setLocalStatus(`删除失败：${error.message}`, "error");
  }
}

// ═══════════════════════════════════════════════════════════════
//  发布到线上（GitHub -> Cloudflare Pages）
// ═══════════════════════════════════════════════════════════════

async function publishToGitHub() {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开后再发布。", "error");
    return;
  }
  if (!confirm("确定推送到 GitHub？请先确认当前内容已经保存。")) return;
  await deployToGitHub();
}

async function checkLocalServer() {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("当前不是本地后台模式：请双击「站点维护.command」，再从 http://localhost:8787/admin.html 打开。", "error");
    return;
  }
  try {
    const status = await localRequest("/api/status");
    setLocalStatus(`本地后台已连接：${status.rootDir}`, "success");
    await listLocalFiles(storageBucket?.value || "assets");
  } catch (error) {
    setLocalStatus(`本地后台连接失败：${error.message}`, "error");
  }
}

// ═══════════════════════════════════════════════════════════════
//  事件绑定
// ═══════════════════════════════════════════════════════════════

function init() {
  // ── 标签切换 ──
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });

  // ── CMS 编辑器事件 ──
  addButton?.addEventListener("click", clearForm);
  document.querySelector("#clear-form")?.addEventListener("click", clearForm);
  document.querySelector("#save-item")?.addEventListener("click", saveCurrent);
  document.querySelector("#save-item-bottom")?.addEventListener("click", saveCurrent);
  document.querySelector("#save-all")?.addEventListener("click", persistAndWrite);
  document.querySelector("#reset-data")?.addEventListener("click", async () => {
    if (!confirm("确定恢复默认数据？")) return;
    data = clone(window.DEFAULT_SITE_DATA);
    await persistAndWrite();
    setActiveTab(activeTab);
  });
  document.querySelector("#export-json")?.addEventListener("click", () => {
    persist();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "academic-site-data.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  // ── 条目列表事件 ──
  list?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (button.dataset.action === "edit") {
      editingIndex = index;
      buildForm();
    } else if (button.dataset.action === "up") {
      await reorderCurrentCollection(index, Math.max(0, index - 1));
    } else if (button.dataset.action === "down") {
      await reorderCurrentCollection(index, Math.min(currentCollection().length - 1, index + 1));
    } else {
      currentCollection().splice(index, 1);
      editingIndex = 0;
      await persistAndWrite();
      buildForm();
      renderList();
    }
  });

  // ── 拖拽排序 ──
  list?.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".drag-handle");
    if (!handle || list.dataset.sortable !== "true") return;
    list.querySelectorAll(".managed-item").forEach((node) => (node.draggable = false));
    const item = handle.closest(".managed-item[data-index]");
    if (item) { item.draggable = true; item.classList.add("drag-ready"); }
  });
  list?.addEventListener("pointerup", () => {
    if (draggedIndex !== null) return;
    list.querySelectorAll(".managed-item").forEach((node) => { node.draggable = false; node.classList.remove("drag-ready"); });
  });
  list?.addEventListener("dragstart", (event) => {
    const item = event.target.closest(".managed-item[data-index]");
    if (!item || item.draggable !== true) { event.preventDefault(); return; }
    draggedIndex = Number(item.dataset.index);
    item.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(draggedIndex));
  });
  list?.addEventListener("dragover", (event) => {
    if (draggedIndex === null || list.dataset.sortable !== "true") return;
    const item = event.target.closest(".managed-item[data-index]");
    if (!item) return;
    event.preventDefault();
    const targetIndex = Number(item.dataset.index);
    list.querySelectorAll(".managed-item").forEach((node) => node.classList.remove("drag-over-before", "drag-over-after"));
    item.classList.add(targetIndex > draggedIndex ? "drag-over-after" : "drag-over-before");
  });
  list?.addEventListener("dragleave", (event) => {
    const item = event.target.closest(".managed-item[data-index]");
    if (item && !item.contains(event.relatedTarget)) item.classList.remove("drag-over-before", "drag-over-after");
  });
  list?.addEventListener("drop", async (event) => {
    if (draggedIndex === null || list.dataset.sortable !== "true") return;
    const item = event.target.closest(".managed-item[data-index]");
    if (!item) return;
    event.preventDefault();
    const targetIndex = Number(item.dataset.index);
    list.querySelectorAll(".managed-item").forEach((node) => node.classList.remove("is-dragging", "drag-over-before", "drag-over-after"));
    const fromIndex = draggedIndex;
    draggedIndex = null;
    await reorderCurrentCollection(fromIndex, targetIndex);
  });
  list?.addEventListener("dragend", () => {
    draggedIndex = null;
    list.querySelectorAll(".managed-item").forEach((node) => {
      node.draggable = false;
      node.classList.remove("drag-ready", "is-dragging", "drag-over-before", "drag-over-after");
    });
  });

  // ── 文件管理器 ──
  document.querySelector("#local-refresh-files")?.addEventListener("click", () => listLocalFiles(storageBucket?.value || "assets"));
  document.querySelector("#local-refresh-files-bottom")?.addEventListener("click", () => listLocalFiles(storageBucket?.value || "assets"));
  document.querySelector("#storage-upload")?.addEventListener("click", uploadLocalFile);
  storageBucket?.addEventListener("change", () => listLocalFiles(storageBucket.value));
  storageList?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-storage-action]");
    if (!button) return;
    const action = button.dataset.storageAction;
    if (action === "copy") {
      await navigator.clipboard?.writeText(button.dataset.url).catch(() => {});
      setLocalStatus("已复制相对路径。", "success");
    } else if (action === "use") {
      const fieldName = activeFileFieldName();
      const field = form.elements[fieldName];
      if (field) { field.value = button.dataset.url; setLocalStatus(`已填入当前条目的 ${fieldName} 字段。记得保存当前条目。`, "success"); }
      else setLocalStatus("当前栏目没有可填入的文件/图片字段。", "error");
    } else if (action === "delete") {
      await deleteLocalFile(storageBucket?.value || "assets", button.dataset.path);
    }
  });

  // ── 旧版部署按钮兼容 ──
  document.querySelector("#local-deploy")?.addEventListener("click", publishToGitHub);
  document.querySelector("#local-deploy-top")?.addEventListener("click", publishToGitHub);
  document.querySelector("#local-deploy-bottom")?.addEventListener("click", publishToGitHub);

  // ── 版本更新事件 ──
  document.querySelectorAll("#version-strategy button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#version-strategy button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      deployState.versionStrategy = btn.dataset.strategy;
      const manualRow = document.querySelector("#manual-version-row");
      if (manualRow) manualRow.style.display = deployState.versionStrategy === "manual" ? "flex" : "none";
      deployLog(`版本号策略切换为: ${deployState.versionStrategy}`);
    });
  });
  document.querySelector("#btn-set-version")?.addEventListener("click", updateVersion);
  document.querySelector("#btn-update-version")?.addEventListener("click", updateVersion);
  document.querySelector("#btn-refresh-git")?.addEventListener("click", () => refreshGitStatus());
  document.querySelector("#btn-test-git")?.addEventListener("click", testGitHubConnection);
  document.querySelector("#btn-optimize-images")?.addEventListener("click", optimizeImages);
  document.querySelector("#btn-deploy")?.addEventListener("click", deployToGitHub);
  document.querySelector("#btn-preview-start")?.addEventListener("click", startPreview);
  document.querySelector("#btn-preview-stop")?.addEventListener("click", stopPreview);
  document.querySelector("#btn-clear-log")?.addEventListener("click", clearDeployLog);

  // ── 状态栏点击刷新 ──
  sbGit?.addEventListener("click", () => refreshGitStatus());

  // ── 初始化 ──
  jsonBuffer.value = JSON.stringify(data, null, 2);
  setActiveTab(activeTab);
  checkLocalServer();

  // ── 启动状态轮询 ──
  if (USE_LOCAL_ADMIN_SERVER) {
    pollStatus();
    setInterval(pollStatus, 5000);
  }

  // ── 页面可见性变化时刷新 ──
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && USE_LOCAL_ADMIN_SERVER) pollStatus();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
