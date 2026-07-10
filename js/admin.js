/**
 * admin.js — 后台管理核心脚本
 * 负责：内容管理（CRUD、拖拽排序、文件上传）、版本发布（版本号、Git、预览、诊断）、
 *       备份管理、本地/远程服务通信。
 * 仅在 admin.html 中加载，依赖 data.js 提供的 window.DEFAULT_SITE_DATA。
 */

const STORAGE_KEY = "academicSiteData";
// 是否使用本地后台服务（仅 localhost:8787）
const USE_LOCAL_ADMIN_SERVER = ["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port === "8787";

// ═══════════════════════════════════════════════════════════════
//  模式定义
// ═══════════════════════════════════════════════════════════════

const schemas = {
  profile: {
    title: "基本资料",
    type: "object",
    fields: [
      ["nameCn", "中文名", "", "zh"],
      ["nameEn", "英文名", "", "en"],
      ["title", "头衔", "", "zh"],
      ["titleEn", "头衔（英）", "", "en"],
      ["subtitle", "副标题", "textarea", "zh"],
      ["subtitleEn", "副标题（英）", "textarea", "en"],
      ["affiliation", "单位", "", "zh"],
      ["affiliationEn", "单位（英）", "", "en"],
      ["email", "邮箱", "", "common"],
      ["phone", "电话", "", "common"],
      ["photo", "人物照片", "image", "common"],
      ["bio", "个人简介", "textarea", "zh"],
      ["bioEn", "个人简介（英）", "textarea", "en"],
      ["focus", "研究关键词", "", "zh"],
      ["focusEn", "研究关键词（英）", "", "en"],
    ],
  },
  research: {
    title: "研究内容",
    fields: [
      ["title", "中文标题", "", "zh"],
      ["titleEn", "英文标题", "", "en"],
      ["text", "中文说明", "textarea", "zh"],
      ["textEn", "英文说明", "textarea", "en"],
    ],
  },
  news: {
    title: "新闻",
    fields: [
      ["date", "日期", "", "common"],
      ["slug", "标识", "", "common"],
      ["eyebrow", "首屏标签", "", "common"],
      ["eyebrowEn", "首屏标签（英）", "", "en"],
      ["title", "中文标题", "textarea", "zh"],
      ["titleEn", "英文标题", "textarea", "en"],
      ["subtitle", "导语/副标题", "textarea", "common"],
      ["subtitleEn", "导语/副标题（英）", "textarea", "en"],
      ["text", "中文摘要（主页轮播）", "textarea", "zh"],
      ["textEn", "英文摘要（主页轮播）", "textarea", "en"],
      ["image", "封面图片", "image", "common"],
      ["url", "详情页链接", "", "common"],
      ["contentHtml", "正文（富文本）", "richtext", "common"],
      ["contentHtmlEn", "正文（英，富文本）", "richtext", "en"],
      ["content", "正文纯文本", "textarea", "common"],
      ["contentEn", "正文纯文本（英）", "textarea", "en"],
      ["paperTitle", "论文题目", "textarea", "common"],
      ["paperTitleEn", "论文题目（英）", "textarea", "en"],
      ["journal", "期刊", "", "common"],
      ["journalEn", "期刊（英）", "", "en"],
      ["authors", "作者", "", "common"],
      ["authorsEn", "作者（英）", "", "en"],
      ["correspondingAuthors", "通讯作者", "", "common"],
      ["correspondingAuthorsEn", "通讯作者（英）", "", "en"],
      ["affiliation", "完成单位", "textarea", "common"],
      ["affiliationEn", "完成单位（英）", "textarea", "en"],
      ["doi", "DOI", "", "common"],
      ["pdf", "PDF/链接", "file", "common"],
    ],
  },
  publications: {
    title: "论文管理",
    dataKey: "allPublications",
    fields: [
      ["year", "年份", "", "common"],
      ["title", "英文题名", "textarea", "en"],
      ["titleZh", "中文题名", "textarea", "zh"],
      ["authors", "作者", "textarea", "common"],
      ["venue", "期刊英文", "", "en"],
      ["venueZh", "期刊中文", "", "zh"],
      ["date", "发表日期", "", "common"],
      ["impact", "影响因子", "", "common"],
      ["image", "图片/主图", "image", "common"],
      ["url", "PDF/链接", "file", "common"],
      ["representative", "代表性论文", "checkbox", "common"],
    ],
  },
  projects: {
    title: "项目",
    fields: [
      ["title", "中文标题", "", "common"],
      ["titleEn", "英文标题", "", "en"],
      ["text", "中文说明", "textarea", "common"],
      ["textEn", "英文说明", "textarea", "en"],
      ["image", "图片", "image", "common"],
      ["url", "链接", "", "common"],
    ],
  },
  achievements: {
    title: "成果",
    fields: [
      ["type", "中文类型", "", "common"],
      ["typeEn", "英文类型", "", "en"],
      ["year", "年份", "", "common"],
      ["title", "中文标题", "", "common"],
      ["titleEn", "英文标题", "", "en"],
      ["applicant", "申请人/发明人名单", "", "common"],
      ["applicantEn", "申请人/发明人名单（英）", "", "en"],
      ["detail", "中文详情", "textarea", "common"],
      ["detailEn", "英文详情", "textarea", "en"],
    ],
  },
  experience: {
    title: "经历",
    fields: [
      ["period", "中文时间", "", "common"],
      ["periodEn", "英文时间", "", "en"],
      ["title", "中文标题", "", "common"],
      ["titleEn", "英文标题", "", "en"],
      ["text", "中文说明", "textarea", "common"],
      ["textEn", "英文说明", "textarea", "en"],
    ],
  },
  contacts: {
    title: "联系方式",
    fields: [
      ["label", "中文标签", "", "common"],
      ["labelEn", "英文标签", "", "en"],
      ["value", "显示文本", "", "common"],
      ["valueEn", "显示文本（英）", "", "en"],
      ["url", "链接", "", "common"],
    ],
  },
  metrics: {
    title: "统计数据",
    fields: [
      ["label", "中文标签", "", "common"],
      ["labelEn", "英文标签", "", "en"],
      ["value", "数值", "", "common"],
    ],
  },
  footer: {
    title: "页脚信息",
    type: "object",
    fields: [
      ["year", "版权年份", "", "common"],
      ["email", "邮箱", "", "common"],
      ["address", "通讯地址", "", "common"],
      ["addressEn", "通讯地址（英）", "", "en"],
      ["version", "版本号文本", "", "common"],
    ],
  },
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
let formLang = "all";
let undoStack = null; // { deletedItem, collection, index, timeout }

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
let listFilterValue = "";
const jsonBuffer = document.querySelector("#json-buffer");
const folderStatus = document.querySelector("#folder-status");
const localStatus = document.querySelector("#local-status") || folderStatus;
const storageList = document.querySelector("#storage-list");
const storageRecent = document.querySelector("#storage-recent");
const storageSearch = document.querySelector("#storage-search");
const storageCurrentTarget = document.querySelector("#storage-current-target");
const storageBucket = document.querySelector("#storage-bucket");
const storagePath = document.querySelector("#storage-path");
const storageFile = document.querySelector("#storage-file");
const filesList = document.querySelector("#files-list");
const filesRecent = document.querySelector("#files-recent");
const filesSearch = document.querySelector("#files-search");
const filesCurrentTarget = document.querySelector("#files-current-target");
const restoreBackupSelect = document.querySelector("#restore-backup");
const backupList = document.querySelector("#backup-list");
const backupCountBadge = document.querySelector("#backup-count-badge");
let pendingStorageFieldName = "";
let pendingStorageBucket = "images";
let storageSearchValue = "";
let filesSearchValue = "";
const RECENT_FILES_KEY = "academicSiteRecentFiles";
let recentFilesMap = loadRecentFilesMap();

const AUTO_TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";
const autoTranslateCache = new Map();
const autoTranslateGlossary = [
  ["南京大学现代工程与应用科学学院", "School of Modern Engineering and Applied Sciences, Nanjing University"],
  ["南京大学固体微结构国家实验室", "National Laboratory of Solid State Microstructures, Nanjing University"],
  ["南京大学", "Nanjing University"],
  ["现代工程与应用科学学院", "School of Modern Engineering and Applied Sciences"],
  ["固体微结构国家实验室", "National Laboratory of Solid State Microstructures"],
  ["准聘助理教授", "tenure-track assistant professor"],
  ["助理教授", "assistant professor"],
  ["博士生导师", "PhD supervisor"],
  ["研究方向", "research directions"],
  ["光纤集成", "fiber integration"],
  ["光纤端面", "fiber tip"],
  ["光纤", "optical fibre"],
  ["异质材料", "heterogeneous materials"],
  ["智能感知", "intelligent sensing"],
  ["智能光电探测", "intelligent optoelectronic detection"],
  ["智能光电子器件", "intelligent optoelectronic devices"],
  ["光电子器件", "optoelectronic devices"],
  ["光学", "optics"],
  ["模式", "mode"],
  ["偏振", "polarization"],
  ["波长", "wavelength"],
  ["强度", "intensity"],
  ["单像素", "one-pixel"],
  ["图像加密通信", "image encryption communication"],
  ["图像", "image"],
  ["论文管理", "publications"],
  ["研究内容", "research"],
  ["学习工作经历", "education and work experience"],
  ["代表论文", "selected publications"],
  ["学术任职", "appointments"],
  ["联系方式", "contacts"],
  ["统计数据", "metrics"],
  ["页脚信息", "footer information"],
  ["成果", "achievements"],
  ["经历", "experience"],
  ["项目", "projects"],
  ["新闻", "news"],
  ["个人简介", "profile"],
  ["页面标题", "page title"],
  ["首屏标签", "eyebrow"],
  ["副标题", "subtitle"],
  ["中文标题", "Chinese title"],
  ["英文标题", "English title"],
  ["中文说明", "Chinese description"],
  ["英文说明", "English description"],
  ["中文内容", "Chinese content"],
  ["英文内容", "English content"],
  ["中文摘要", "Chinese abstract"],
  ["英文摘要", "English abstract"],
  ["论文题目", "paper title"],
  ["期刊", "journal"],
  ["作者", "authors"],
  ["通讯作者", "corresponding authors"],
  ["完成单位", "affiliation"],
  ["研究关键词", "research keywords"],
  ["邮箱", "email"],
  ["通讯地址", "mailing address"],
  ["标题", "title"],
  ["时间", "period"],
  ["标签", "label"],
  ["内容", "content"],
  ["分类", "type"],
  ["主页", "home"],
  ["本地后台", "local admin"],
  ["文件管理", "file manager"],
  ["版本控制台", "deploy console"],
  ["一键翻译英文", "translate to English"],
  ["自动翻译", "auto translate"],
  ["保存到本地", "save locally"],
  ["清空", "clear"],
  ["翻译中", "translating"],
  ["记得保存", "remember to save"],
].sort((a, b) => b[0].length - a[0].length);

// 版本更新 DOM
const deployLogEl = document.querySelector("#deploy-log");
const optimizeLogEl = document.querySelector("#optimize-log");
const networkDiagnosticsLogEl = document.querySelector("#network-diagnostics-log");
const optimizeProgressEl = document.querySelector("#optimize-progress");
const optimizeStatusTextEl = document.querySelector("#optimize-status-text");
const optimizeTargetEl = document.querySelector("#optimize-target");
const sbVersion = document.querySelector("#sb-version");
const sbGit = document.querySelector("#sb-git");
const sbPreview = document.querySelector("#sb-preview");
const sbConnection = document.querySelector("#sb-connection");
const sbVersionInline = document.querySelector("#sb-version-inline");
const sbAssetSourceInline = document.querySelector("#sb-asset-source-inline");
const sbGitInline = document.querySelector("#sb-git-inline");
const sbPreviewInline = document.querySelector("#sb-preview-inline");
const sbConnectionInline = document.querySelector("#sb-connection-inline");
const deployStrategyText = document.querySelector("#deploy-strategy-text");
const deployPreviewText = document.querySelector("#deploy-preview-text");
const deployDiagnosticText = document.querySelector("#deploy-diagnostic-text");
const deployMiniGit = document.querySelector("#deploy-mini-git");
const deployMiniPreview = document.querySelector("#deploy-mini-preview");
const deployMiniSource = document.querySelector("#deploy-mini-source");
const assetSourceButtons = Array.from(document.querySelectorAll("#asset-source-switch [data-asset-source]"));
const ASSET_BASE_URL = (window.ASSET_BASE_URL || "").replace(/\/+$/, "");

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

function currentAssetSource() {
  return String(data.assetSource || window.DEFAULT_SITE_DATA.assetSource || "vercel").toLowerCase();
}

function updateAssetSourceUI(source = currentAssetSource()) {
  assetSourceButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.assetSource === source);
  });
  if (sbAssetSourceInline) {
    sbAssetSourceInline.textContent = source === "cdn" ? "jsDelivr/CDN" : "Vercel";
  }
  if (deployMiniSource) deployMiniSource.textContent = source === "cdn" ? "jsDelivr/CDN" : "Vercel";
}

function assetUrlForDiagnostics(src = "") {
  const value = String(src || "");
  if (!value || /^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const normalized = value.replace(/^\/+/, "");
  if (!ASSET_BASE_URL || currentAssetSource() !== "cdn") return value;
  if (!normalized.startsWith("resources/")) return value;
  return `${ASSET_BASE_URL}/${normalized}`;
}

async function setAssetSource(source) {
  const next = source === "cdn" ? "cdn" : "vercel";
  if (currentAssetSource() === next) return;
  data.assetSource = next;
  updateAssetSourceUI(next);
  await persistAndWrite();
  deployLog(`资源源已切换为: ${next === "cdn" ? "jsDelivr/CDN" : "Vercel"}`, "success");
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
  const schema = schemas[activeTab];
  const dataKey = schema.dataKey || activeTab;
  return schema.type === "object" ? data[dataKey] : data[dataKey] || [];
}

function currentContentTarget() {
  const schema = schemas[activeTab];
  if (!schema) return null;
  return schema.type === "object" ? data[activeTab] : currentCollection()[editingIndex] || null;
}

function syncCurrentFormToTarget(target = currentContentTarget()) {
  const schema = schemas[activeTab];
  if (!schema || !target) return;
  syncAllRichTextSources();
  for (const [key, , kind] of schema.fields) {
    const el = form.elements[key];
    if (!el) continue;
    if (kind === "checkbox") target[key] = Boolean(el.checked);
    else target[key] = el.value || "";
  }
}

function loadRecentFilesMap() {
  try {
    const raw = localStorage.getItem(RECENT_FILES_KEY);
    return raw ? JSON.parse(raw) || {} : {};
  } catch {
    return {};
  }
}

function persistRecentFilesMap() {
  try {
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(recentFilesMap));
  } catch {
    /* ignore */
  }
}

function touchRecentFile(bucket = "images", path = "") {
  const cleanBucket = String(bucket || "images");
  const cleanPath = String(path || "").trim();
  if (!cleanPath) return;
  const next = [cleanPath, ...((recentFilesMap[cleanBucket] || []).filter((item) => item !== cleanPath))].slice(0, 6);
  recentFilesMap[cleanBucket] = next;
  persistRecentFilesMap();
  renderRecentFiles("storage");
  renderRecentFiles("files");
}

function recentFilesForBucket(bucket = "images") {
  return Array.isArray(recentFilesMap[bucket]) ? recentFilesMap[bucket] : [];
}

function fileUrlForBucket(bucket = "images", path = "") {
  return `${storageFolderPath(bucket)}/${path}`;
}

async function openLocalFileFolder(bucket = "images", path = "") {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开后再打开文件夹。", "error");
    return false;
  }
  try {
    const payload = { bucket, path };
    const result = await localRequest("/api/files/open-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLocalStatus(`已打开文件夹：${result.path}`, "success");
    return true;
  } catch (error) {
    setLocalStatus(`打开文件夹失败：${error.message}`, "error");
    return false;
  }
}

function normalizeFileSearch(value = "") {
  return String(value || "").trim().toLowerCase();
}

function matchesFileSearch(file, bucket, query = "") {
  const needle = normalizeFileSearch(query);
  if (!needle) return true;
  const haystack = [
    bucket,
    file.path,
    file.size ? String(Math.round(file.size / 1024)) : "",
    file.mtime || "",
  ].join(" ").toLowerCase();
  return haystack.includes(needle);
}

function currentFileTargetLabel() {
  if (pendingStorageFieldName) return pendingStorageFieldName;
  const schema = schemas[activeTab];
  if (!schema) return "—";
  return activeFileFieldName();
}

function updateCurrentFileTargetLabels() {
  const label = currentFileTargetLabel();
  if (storageCurrentTarget) storageCurrentTarget.textContent = label || "—";
  const filesBucket = document.querySelector("#files-bucket")?.value || "images";
  if (filesCurrentTarget) filesCurrentTarget.textContent = `resources/${filesBucket}`;
}

function fillCurrentFileField(url = "", bucket = "images", path = "") {
  const fieldName = activeFileFieldName();
  const field = form.elements[fieldName];
  if (!field) {
    setLocalStatus("当前栏目没有可填入的文件/图片字段。", "error");
    return false;
  }
  field.value = url;
  if (bucket && path) touchRecentFile(bucket, path);
  setLocalStatus(`已填入当前条目的 ${fieldName} 字段。记得保存当前条目。`, "success");
  return true;
}

function hasChineseText(value = "") {
  return /[\u3400-\u9fff]/.test(String(value));
}

function tidyEnglishText(value = "") {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([([\{])\s+/g, "$1")
    .replace(/\s+([)\]}\u3001])/g, "$1")
    .replace(/\s+([’'])/g, "$1")
    .replace(/\s*([·•])\s*/g, " $1 ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function applyLocalTranslationGlossary(value = "") {
  let text = String(value);
  for (const [zh, en] of autoTranslateGlossary) {
    text = text.split(zh).join(en);
  }
  return tidyEnglishText(
    text
      .replace(/，/g, ", ")
      .replace(/。/g, ". ")
      .replace(/：/g, ": ")
      .replace(/；/g, "; ")
      .replace(/（/g, "(")
      .replace(/）/g, ")")
      .replace(/“|”/g, "\"")
      .replace(/‘|’/g, "'"),
  );
}

async function remoteTranslateText(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  if (!hasChineseText(text)) return text;
  const cacheKey = `remote:${text}`;
  if (autoTranslateCache.has(cacheKey)) return autoTranslateCache.get(cacheKey);
  const params = new URLSearchParams({
    client: "gtx",
    sl: "zh-CN",
    tl: "en",
    dt: "t",
    q: text,
  });
  const response = await fetch(`${AUTO_TRANSLATE_ENDPOINT}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = await response.json();
  const translated = Array.isArray(payload?.[0]) ? payload[0].map((part) => part?.[0] || "").join("") : "";
  const cleaned = tidyEnglishText(translated);
  if (!cleaned || hasChineseText(cleaned)) throw new Error("translation returned empty text");
  autoTranslateCache.set(cacheKey, cleaned);
  return cleaned;
}

async function translateText(value = "") {
  const text = String(value || "");
  const trimmed = text.trim();
  if (!trimmed) return "";
  const cacheKey = `text:${trimmed}`;
  if (autoTranslateCache.has(cacheKey)) return autoTranslateCache.get(cacheKey);
  if (!hasChineseText(trimmed)) {
    autoTranslateCache.set(cacheKey, text);
    return text;
  }
  try {
    const remote = await remoteTranslateText(trimmed);
    autoTranslateCache.set(cacheKey, remote);
    return remote;
  } catch {
    const local = applyLocalTranslationGlossary(trimmed);
    autoTranslateCache.set(cacheKey, local);
    return local;
  }
}

async function translateHtmlContent(html = "") {
  const markup = String(html || "");
  if (!markup.trim()) return "";
  const template = document.createElement("template");
  template.innerHTML = markup;
  const nodeFilter = window.NodeFilter || { SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 0 };
  const nodes = [];
  const walker = document.createTreeWalker(
    template.content,
    nodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return nodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "CODE", "PRE", "TEXTAREA"].includes(parent.tagName)) return nodeFilter.FILTER_REJECT;
        if (!String(node.nodeValue || "").trim()) return nodeFilter.FILTER_REJECT;
        return hasChineseText(node.nodeValue) ? nodeFilter.FILTER_ACCEPT : nodeFilter.FILTER_REJECT;
      },
    },
  );
  while (walker.nextNode()) nodes.push(walker.currentNode);
  if (nodes.length === 0) return markup;
  const translated = await Promise.all(nodes.map((node) => translateText(node.nodeValue)));
  nodes.forEach((node, index) => {
    node.nodeValue = translated[index];
  });
  return template.innerHTML;
}

function autoTranslatePairsForSchema(schemaId) {
  const pairs = {
    profile: [
      ["title", "titleEn"],
      ["subtitle", "subtitleEn"],
      ["affiliation", "affiliationEn"],
      ["bio", "bioEn"],
      ["focus", "focusEn"],
    ],
    research: [
      ["title", "titleEn"],
      ["text", "textEn"],
    ],
    news: [
      ["eyebrow", "eyebrowEn"],
      ["title", "titleEn"],
      ["subtitle", "subtitleEn"],
      ["text", "textEn"],
      ["contentHtml", "contentHtmlEn"],
      ["content", "contentEn"],
      ["paperTitle", "paperTitleEn"],
      ["journal", "journalEn"],
      ["authors", "authorsEn"],
      ["correspondingAuthors", "correspondingAuthorsEn"],
      ["affiliation", "affiliationEn"],
    ],
    publications: [
      ["titleZh", "title"],
      ["venueZh", "venue"],
    ],
    projects: [
      ["title", "titleEn"],
      ["text", "textEn"],
    ],
    achievements: [
      ["type", "typeEn"],
      ["title", "titleEn"],
      ["applicant", "applicantEn"],
      ["detail", "detailEn"],
    ],
    experience: [
      ["period", "periodEn"],
      ["title", "titleEn"],
      ["text", "textEn"],
    ],
    contacts: [
      ["label", "labelEn"],
      ["value", "valueEn"],
    ],
    metrics: [
      ["label", "labelEn"],
    ],
    footer: [
      ["address", "addressEn"],
    ],
  };
  const schema = schemas[schemaId];
  if (!schema) return [];
  const allowed = new Set(schema.fields.map(([key]) => key));
  return (pairs[schemaId] || []).filter(([fromKey, toKey]) => allowed.has(fromKey) && allowed.has(toKey));
}

async function autoTranslateCurrentEntry(forceOverwrite = false) {
  const schema = schemas[activeTab];
  if (!schema) return;
  const pairs = autoTranslatePairsForSchema(activeTab);
  if (!pairs.length) {
    setLocalStatus("当前栏目没有可自动翻译的中英字段。", "info");
    return;
  }
  syncAllRichTextSources();
  const translateButton = document.querySelector("#translate-current");
  const previousText = translateButton?.textContent || "一键翻译英文";
  if (translateButton) {
    translateButton.disabled = true;
    translateButton.textContent = "翻译中…";
  }
  try {
    const liveTarget = currentContentTarget();
    let pending = [];
    const overwriteTargets = [];
    for (const [sourceKey, targetKey] of pairs) {
      const sourceField = form.elements[sourceKey];
      const sourceValue = sourceField ? sourceField.value : "";
      if (sourceValue === undefined || sourceValue === null || String(sourceValue).trim() === "") continue;
      const targetField = form.elements[targetKey];
      const targetValue = targetField ? targetField.value : "";
      const targetHasValue = String(targetValue || "").trim() !== "";
      if (targetHasValue && !forceOverwrite) {
        overwriteTargets.push(targetKey);
        continue;
      }
      pending.push({ sourceKey, targetKey, sourceValue });
    }

    if (pending.length === 0 && overwriteTargets.length === 0) {
      setLocalStatus("没有找到可翻译的空字段。", "info");
      return;
    }

    if (overwriteTargets.length > 0 && !forceOverwrite) {
      const confirmed = window.confirm(`有 ${overwriteTargets.length} 个英文字段已经有内容。确定后会覆盖这些字段；取消则只填空缺字段。`);
      if (confirmed) {
        if (translateButton) translateButton.textContent = "覆盖翻译中…";
        pending = pairs
          .map(([sourceKey, targetKey]) => ({
            sourceKey,
            targetKey,
            sourceValue: form.elements[sourceKey]?.value || "",
          }))
          .filter((item) => item.sourceValue !== undefined && item.sourceValue !== null && String(item.sourceValue).trim() !== "");
      }
    }

    const translatedCount = [];
    for (const item of pending) {
      const schemaField = schema.fields.find(([key]) => key === item.targetKey) || [];
      const kind = schemaField[2];
      const sourceValue = item.sourceValue;
      let translatedValue = "";
      if (kind === "richtext") translatedValue = await translateHtmlContent(sourceValue);
      else translatedValue = await translateText(sourceValue);
      if (!translatedValue) continue;
      const input = form.elements[item.targetKey];
      if (input) input.value = translatedValue;
      const editor = form.querySelector(`.richtext-editor[data-rich-editor="${item.targetKey}"]`);
      if (editor) editor.innerHTML = translatedValue;
      if (liveTarget) liveTarget[item.targetKey] = translatedValue;
      translatedCount.push(item.targetKey);
    }
    if (translatedCount.length === 0) {
      setLocalStatus("翻译没有产生新的英文内容。", "info");
      return;
    }
    if (liveTarget) buildForm();
    persist();
    setLocalStatus(`已生成 ${translatedCount.length} 个英文草稿，记得保存。`, "success");
  } catch (error) {
    setLocalStatus(`自动翻译失败：${error.message}`, "error");
  } finally {
    if (translateButton) {
      translateButton.disabled = false;
      translateButton.textContent = previousText;
    }
  }
}

async function autoTranslateCurrentSection(forceOverwrite = false) {
  const schema = schemas[activeTab];
  if (!schema) return;
  const pairs = autoTranslatePairsForSchema(activeTab);
  if (!pairs.length) {
    setLocalStatus("当前板块没有可自动翻译的中英字段。", "info");
    return;
  }
  syncCurrentFormToTarget();
  const translateButton = document.querySelector("#translate-section");
  const previousText = translateButton?.textContent || "当前板块批量翻译";
  if (translateButton) {
    translateButton.disabled = true;
    translateButton.textContent = "翻译中…";
  }
  try {
    const collection = schema.type === "object" ? [data[activeTab]] : currentCollection();
    let translatedCount = 0;
    let skippedCount = 0;
    for (const item of collection) {
      if (!item) continue;
      for (const [sourceKey, targetKey] of pairs) {
        const sourceValue = String(item[sourceKey] || "").trim();
        if (!sourceValue) continue;
        const targetValue = String(item[targetKey] || "").trim();
        if (targetValue && !forceOverwrite) {
          skippedCount += 1;
          continue;
        }
        const schemaField = schema.fields.find(([key]) => key === targetKey) || [];
        const kind = schemaField[2];
        const translatedValue = kind === "richtext" ? await translateHtmlContent(sourceValue) : await translateText(sourceValue);
        if (!translatedValue) continue;
        item[targetKey] = translatedValue;
        translatedCount += 1;
      }
    }
    if (translatedCount === 0) {
      setLocalStatus("没有找到可批量翻译的空英文内容。", "info");
      return;
    }
    buildForm();
    renderList();
    persist();
    if (skippedCount > 0 && !forceOverwrite) {
      setLocalStatus(`已批量生成 ${translatedCount} 个英文草稿，跳过 ${skippedCount} 个已存在内容；记得保存。`, "success");
    } else {
      setLocalStatus(`已批量生成 ${translatedCount} 个英文草稿，记得保存。`, "success");
    }
  } catch (error) {
    setLocalStatus(`批量翻译失败：${error.message}`, "error");
  } finally {
    if (translateButton) {
      translateButton.disabled = false;
      translateButton.textContent = previousText;
    }
  }
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

function storageFolderPath(bucket = "images") {
  const map = {
    images: "resources/images",
    papers: "resources/papers",
    videos: "resources/videos",
    frames: "resources/frames",
    news: "resources/news",
  };
  return map[bucket] || map.images;
}

function fileFieldForBucket(bucket = "images") {
  return ["papers", "videos", "news"].includes(bucket) ? "file" : "image";
}

function activeFileFieldName() {
  if (pendingStorageFieldName) return pendingStorageFieldName;
  const schema = schemas[activeTab];
  if (!schema) return fileFieldForBucket(storageBucket?.value || "images") === "file" ? "url" : "image";
  const imageField = schema.fields.find(([, , kind]) => kind === "image")?.[0];
  const fileField = schema.fields.find(([, , kind]) => kind === "file")?.[0];
  return fileFieldForBucket(storageBucket?.value) === "file" ? fileField || "url" : imageField || "image";
}

function openFileManager(bucket = "images", fieldName = "") {
  pendingStorageBucket = bucket;
  pendingStorageFieldName = fieldName;
  const tab = schemas[activeTab] ? activeTab : "profile";
  setActiveTab(tab);
  if (storageBucket && bucket) storageBucket.value = bucket;
  updateCurrentFileTargetLabels();
  refreshFileManager();
  document.querySelector("#cms-file-manager")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ═══════════════════════════════════════════════════════════════
//  撤销 Toast
// ═══════════════════════════════════════════════════════════════

function showUndoToast(message, onUndo) {
  if (undoStack) { clearTimeout(undoStack.timeout); }
  const toast = document.querySelector("#undo-toast");
  const msgEl = document.querySelector("#undo-message");
  const btnEl = document.querySelector("#undo-btn");
  if (!toast || !msgEl || !btnEl) return;
  msgEl.textContent = message;
  toast.style.display = "flex";
  const handleUndo = () => {
    toast.style.display = "none";
    if (undoStack) clearTimeout(undoStack.timeout);
    onUndo();
    undoStack = null;
  };
  btnEl.onclick = handleUndo;
  undoStack = {
    timeout: setTimeout(() => {
      toast.style.display = "none";
      undoStack = null;
    }, 6000),
  };
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
  const segments = String(name || "").split("/").filter(Boolean);
  let current = siteDirectoryHandle;
  for (const segment of segments) {
    current = await current.getDirectoryHandle(segment, { create: true });
  }
  return current;
}

async function saveFileToSiteFolder(file, key, kind, target) {
  const bucket = kind === "image" ? "images" : "papers";
  const folder = storageFolderPath(bucket);
  const filename = buildUploadFilename(file, key, target);
  if (USE_LOCAL_ADMIN_SERVER) {
    const response = await fetch(`/api/upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(filename)}`, {
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
  const saveButtons = [document.querySelector("#save-all"), document.querySelector("#save-top")].filter(Boolean);
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
      triggerSaveFlash();
      return;
    }
    if (await writeDataJsToSiteFolder()) {
      report("已保存：data.js 已同步更新。", "success");
      triggerSaveFlash();
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

function triggerSaveFlash() {
  const el = document.querySelector("#folder-status") || document.querySelector(".folder-status");
  if (el) { el.classList.remove("flash-save"); void el.offsetWidth; el.classList.add("flash-save"); }
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

function localeLabel(loc) {
  if (loc === "zh") return "中文";
  if (loc === "en") return "English";
  return "";
}

function localeGroupLabel(loc) {
  if (loc === "zh") return "📖 中文内容";
  if (loc === "en") return "🌍 English";
  return "📋 共用字段";
}

function buildForm() {
  const schema = schemas[activeTab];
  const source = schema.type === "object" ? data[activeTab] : currentCollection()[editingIndex] || {};

  // 检测哪些语言有字段
  const hasZh = schema.fields.some((f) => f[3] === "zh");
  const hasEn = schema.fields.some((f) => f[3] === "en");
  const showLangPicker = hasZh || hasEn;

  // 语言切换栏
  let langBar = "";
  if (showLangPicker) {
    const langs = [
      { id: "all", label: "全部" },
      ...(hasZh ? [{ id: "zh", label: "中文" }] : []),
      ...(hasEn ? [{ id: "en", label: "English" }] : []),
    ];
    langBar = `<div class="lang-tabs" data-form-lang-bar="1">${langs
      .map((l) => `<button type="button" class="lang-tab${l.id === formLang ? " active" : ""}" data-lang="${l.id}">${l.label}</button>`)
      .join("")}</div>`;
  }

  // 按语言筛选字段
  let filteredFields = schema.fields;
  if (formLang !== "all") {
    filteredFields = schema.fields.filter((f) => f[3] === formLang || f[3] === "common" || !f[3]);
  }

  // 按 locale 分组
  const groups = {};
  const order = [];
  for (const field of filteredFields) {
    const loc = field[3] || "common";
    if (!groups[loc]) {
      groups[loc] = [];
      order.push(loc);
    }
    groups[loc].push(field);
  }

  // 统计缺漏
  function missingCount(fields) {
    return fields.filter(([key]) => !source[key] && source[key] !== 0).length;
  }

  // 渲染一组字段
  function renderGroup(loc, fields) {
    const missing = missingCount(fields);
    const label = localeGroupLabel(loc);
    const warn = missing > 0 ? ` <span class="missing-badge">${missing} 项未填写</span>` : "";
    const header = showLangPicker ? `<div class="lang-group-header">${label}${warn}</div>` : "";
    const body = fields
      .map(([key, label, kind]) => {
        const value = source[key];
        const isEmpty = !value && value !== 0;
        const cls = kind === "textarea" || kind === "image" || kind === "file" || kind === "richtext" ? "field full" : "field";
        const missingCls = isEmpty && formLang !== "all" && loc !== "common" ? " field-missing" : "";
        if (kind === "richtext") return richTextFieldHtml(key, label, value);
        if (kind === "textarea")
          return `<label class="${cls}${missingCls}"><span>${label}</span><textarea name="${key}">${escapeHtml(value)}</textarea></label>`;
        if (kind === "checkbox") {
          const checked = value ? " checked" : "";
          return `<label class="${cls} checkbox-field"><span class="checkbox-label"><input type="checkbox" name="${key}"${checked} /> ${label}</span></label>`;
        }
        if (kind === "image" || kind === "file") {
          const accept = kind === "image" ? "image/*" : ".pdf,.doc,.docx,image/*";
          const bucket = kind === "image" ? "images" : "papers";
          return `<label class="${cls}${missingCls}"><span>${label}</span><input name="${key}" value="${escapeHtml(value)}" placeholder="可粘贴路径/URL，或选择文件上传" /><div class="field-inline-actions"><input name="${key}Upload" type="file" accept="${accept}" /><button class="admin-button" type="button" data-open-file-manager="${bucket}" data-open-field="${key}">打开文件管理</button></div></label>`;
        }
        return `<label class="${cls}${missingCls}"><span>${label}</span><input name="${key}" value="${escapeHtml(value)}" /></label>`;
      })
      .join("");
    return `<div class="lang-group${missing > 0 && formLang !== "all" ? " lang-group-incomplete" : ""}">${header}${body}</div>`;
  }

  form.innerHTML = langBar + order.map((loc) => renderGroup(loc, groups[loc])).join("");
  setupRichTextEditors();
  injectConverterImportButton();

  // 语言切换事件
  if (showLangPicker) {
    form.querySelectorAll(".lang-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        formLang = tab.dataset.lang;
        buildForm();
        // 同步保存到缓存但不写文件
        syncAllRichTextSources();
        for (const [key] of schema.fields) {
          const el = form.elements[key];
          if (el) source[key] = el.value || "";
        }
      });
    });
  }
}

function injectConverterImportButton() {
  const existing = form.querySelector('#import-converter-btn');
  if (existing) existing.remove();
  if (activeTab !== 'news') return;
  const schema = schemas[activeTab];
  let payload = null;
  try {
    const stored = localStorage.getItem('docxConverterOutput');
    if (stored) payload = JSON.parse(stored);
  } catch (e) { /* ignore */ }
  if (!payload || payload._from !== 'docx-converter') {
    const hint = document.createElement('p');
    hint.id = 'import-converter-btn';
    hint.style.cssText = 'margin-top:16px;font-size:0.78rem;color:rgba(255,255,255,0.32);';
    hint.textContent = '💡 在 docx-converter.html 中转换后点击「提取图片并发送」，数据会自动出现在这里。';
    form.appendChild(hint);
    return;
  }
  const btn = document.createElement('button');
  btn.id = 'import-converter-btn';
  btn.className = 'admin-button primary';
  btn.type = 'button';
  btn.textContent = '📤 导入转换内容（' + (payload.title || '') + '）';
  btn.style.marginTop = '16px';
  btn.addEventListener('click', function () {
    for (const [key, , kind] of schema.fields) {
      const el = form.elements[key];
      if (el && payload[key] !== undefined) el.value = payload[key];
      if (kind === 'richtext' && payload[key]) {
        const editor = form.querySelector(`.richtext-editor[data-rich-editor="${key}"]`);
        if (editor) editor.innerHTML = payload[key];
      }
    }
    localStorage.removeItem('docxConverterOutput');
    btn.remove();
    deployLog('✅ 已从转换器导入，请检查后保存。', 'success');
  });
  form.appendChild(btn);
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
  let items = currentCollection();

  // 搜索筛选
  const filterVal = listFilterValue.trim().toLowerCase();
  if (filterVal) {
    items = items.filter((item) =>
      Object.values(item).some((v) => String(v || "").toLowerCase().includes(filterVal))
    );
  }

  let repHtml = "";
  if (activeTab === "publications") {
    const order = data.representativeOrder || [];
    const repItems = [];
    for (const title of order) {
      const found = items.findIndex(p => p.title === title);
      if (found >= 0) repItems.push(found);
    }
    // Add any representative items not in order
    items.forEach((item, idx) => {
      if (item.representative && !repItems.includes(idx)) repItems.push(idx);
    });
    const repCount = repItems.length;
    repHtml = `
      <div class="rep-order-header">
        <h4>★ 代表性论文排序 <span class="rep-count">${repCount}/5 篇</span></h4>
        <p class="rep-order-hint">拖拽调整代表作显示顺序</p>
      </div>
      <div class="item-list rep-order-list" id="rep-order-list">
        ${repItems.length === 0
          ? `<div class="managed-item empty-item"><div style="text-align:center;width:100%;padding:20px;color:rgba(255,255,255,0.35);font-size:0.85rem;">暂无代表作，请在下方论文列表中勾选「代表性论文」</div></div>`
          : repItems.map((dataIdx, displayIdx) => {
              const item = items[dataIdx];
              const title = item.title || "";
              const venue = item.venue || "";
              return `
                <article class="managed-item" draggable="false" data-rep-index="${displayIdx}" data-array-index="${dataIdx}">
                  <button class="drag-handle" type="button" aria-label="拖动排序" title="拖动排序">⋮⋮</button>
                  <div class="managed-copy">
                    <h3><span class="item-number">${String(displayIdx + 1).padStart(2, "0")}</span>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(venue)}</p>
                  </div>
                  <div class="item-actions">
                    <button class="icon-button" data-action="rep-up" data-index="${displayIdx}" type="button" title="上移">▲</button>
                    <button class="icon-button" data-action="rep-down" data-index="${displayIdx}" type="button" title="下移">▼</button>
                  </div>
                </article>`;
            }).join("")
        }
      </div>
      <hr class="rep-divider">
      <div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0;">
        <h4 style="font-size:0.9rem;font-weight:700;margin:0;color:rgba(255,255,255,0.55);">全部论文</h4>
      </div>`;
  }
  list.dataset.sortable = activeTab !== "publications" ? "true" : "false";
  if (items.length === 0) {
    list.innerHTML = repHtml + `<div class="managed-item empty-item"><div style="text-align:center;width:100%;padding:30px 20px;color:rgba(255,255,255,0.35);font-size:0.85rem;">暂无条目，点击「新增」添加</div></div>`;
    return;
  }
  list.innerHTML = repHtml + items
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

function openBucketForFileItem(bucket, path) {
  if (storageBucket) storageBucket.value = bucket;
  pendingStorageBucket = bucket;
  listLocalFiles(bucket).then(() => {
    const item = storageList?.querySelector(`.storage-item[data-path="${CSS.escape(path)}"]`);
    item?.scrollIntoView({ block: "center", behavior: "smooth" });
    item?.classList.add("is-targeted");
    window.setTimeout(() => item?.classList.remove("is-targeted"), 1200);
  });
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
  for (const [key, , kind] of schema.fields) {
    const el = form.elements[key];
    if (kind === "checkbox" && el) {
      target[key] = el.checked ? true : false;
    } else {
      target[key] = el?.value || "";
    }
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
  const previousTab = activeTab;
  activeTab = tab;
  editingIndex = 0;
  if (tab !== previousTab) {
    pendingStorageFieldName = "";
  }

  // 更新按钮状态
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.setAttribute("aria-selected", String(btn.dataset.tab === tab));
  });

  // 切换面板
  const isDeploy = tab === "deploy";
  const isFiles = tab === "files";
  document.querySelector("#panel-cms")?.classList.toggle("active", !isDeploy && !isFiles && tab !== "translations");
  document.querySelector("#panel-deploy")?.classList.toggle("active", isDeploy);
  document.querySelector("#panel-files")?.classList.toggle("active", isFiles);

  if (isDeploy) {
    loadDeployData();
    return;
  }
  if (isFiles) {
    loadFilesPanel();
    return;
  }

  // 翻译管理（自定义面板）
  if (tab === "translations") {
    renderTranslationsPanel();
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
  updateCurrentFileTargetLabels();
}

function renderTranslationsPanel() {
  const panel = document.querySelector("#panel-cms");
  panel.classList.add("active");
  document.querySelector("#active-kicker").textContent = "translations";
  document.querySelector("#active-title").textContent = "翻译管理";
  const editorPanel = document.querySelector("#panel-cms .editor-panel");
  const listCol = document.querySelector("#panel-cms .cms-list-col");
  if (editorPanel) {
    if (!data.translations) data.translations = {};
    const json = JSON.stringify(data.translations, null, 2);
    editorPanel.innerHTML = `
      <div class="section-heading inline">
        <div>
          <p class="section-kicker">Translations</p>
          <h2>翻译管理</h2>
        </div>
      </div>
      <p style="color:var(--muted);font-size:0.82rem;line-height:1.5;margin:0 0 12px;">
        编辑中英文翻译对照。左侧为中文原文，右侧为英文翻译。修改后点击「保存翻译」。
      </p>
      <textarea id="translations-editor" spellcheck="false" style="width:100%;min-height:500px;background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:16px;color:rgba(255,255,255,0.7);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:0.78rem;line-height:1.6;resize:vertical;">${escapeHtml(json)}</textarea>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="admin-button primary" id="btn-save-translations" type="button">保存翻译</button>
        <button class="admin-button" id="btn-format-translations" type="button">格式化</button>
      </div>
    `;
    document.querySelector("#btn-save-translations")?.addEventListener("click", async () => {
      try {
        const raw = document.querySelector("#translations-editor")?.value || "{}";
        data.translations = JSON.parse(raw);
        await persistAndWrite();
        setLocalStatus("翻译已保存到 data.js", "success");
        triggerSaveFlash();
      } catch (e) {
        setLocalStatus(`JSON 格式错误：${e.message}`, "error");
      }
    });
    document.querySelector("#btn-format-translations")?.addEventListener("click", () => {
      try {
        const raw = document.querySelector("#translations-editor")?.value || "{}";
        const formatted = JSON.stringify(JSON.parse(raw), null, 2);
        document.querySelector("#translations-editor").value = formatted;
      } catch (e) {
        setLocalStatus(`格式化失败：${e.message}`, "error");
      }
    });
  }
  if (listCol) listCol.style.display = "none";
}

async function loadFilesPanel() {
  if (!USE_LOCAL_ADMIN_SERVER) return;
  const bucket = document.querySelector("#files-bucket")?.value || "images";
  updateCurrentFileTargetLabels();
  await loadLocalFiles(bucket, {
    container: filesList,
    search: filesSearch?.value || filesSearchValue,
    allowFill: false,
    listType: "files",
    recentTarget: "files",
    status: false,
  });
}

async function uploadFileEx() {
  const file = document.querySelector("#files-file")?.files?.[0];
  const bucket = document.querySelector("#files-bucket")?.value || "images";
  if (!file) { setLocalStatus("请先选择一个要上传的文件。", "error"); return; }
  if (!USE_LOCAL_ADMIN_SERVER) { setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开。", "error"); return; }
  const pathInput = document.querySelector("#files-path");
  const manualPath = pathInput?.value ? cleanStoragePath(pathInput.value) : "";
  try {
    let uploadPath = manualPath;
    if (!uploadPath) {
      const ext = extensionOf(file.name);
      uploadPath = `${slugify(file.name.replace(/\.[^.]+$/, "")) || "file"}${ext}`;
    }
    const result = await localRequest(`/api/upload?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(uploadPath)}`, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (pathInput) pathInput.value = result.path;
    touchRecentFile(bucket, result.path);
    setLocalStatus(`上传成功：${result.url}`, "success");
    await navigator.clipboard?.writeText(result.url).catch(() => {});
    await loadLocalFiles(bucket, {
      container: filesList,
      search: filesSearch?.value || filesSearchValue,
      allowFill: false,
      listType: "files",
      recentTarget: "files",
      status: false,
    });
  } catch (error) {
    setLocalStatus(`上传失败：${error.message}`, "error");
  }
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

function networkDiagLog(message, type = "info") {
  if (!networkDiagnosticsLogEl) return;
  const entry = document.createElement("div");
  entry.className = `deploy-log-entry ${type}`;
  const time = new Date().toLocaleTimeString("zh-CN", { hour12: false });
  entry.textContent = `[${time}] ${message}`;
  networkDiagnosticsLogEl.appendChild(entry);
  networkDiagnosticsLogEl.scrollTop = networkDiagnosticsLogEl.scrollHeight;
}

function clearNetworkDiagLog() {
  if (!networkDiagnosticsLogEl) return;
  networkDiagnosticsLogEl.innerHTML = "";
  networkDiagLog("点击「开始诊断」后会显示各项耗时。");
}

function formatDuration(ms) {
  if (!Number.isFinite(ms)) return "n/a";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(ms < 10000 ? 2 : 1)}s`;
}

async function timedFetch(label, url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || 12000;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      ...options.fetchOptions,
      signal: controller.signal,
    });
    const duration = performance.now() - startedAt;
    let body = "";
    if ((options.readBody ?? true) && response.status !== 204) {
      body = await response.text();
    }
    return {
      label,
      url: response.url || url,
      ok: response.ok,
      status: response.status,
      duration,
      size: body.length,
      sample: body.slice(0, 160),
    };
  } catch (error) {
    const duration = performance.now() - startedAt;
    return {
      label,
      url,
      ok: false,
      status: 0,
      duration,
      error: error.name === "AbortError" ? `超时 ${timeoutMs}ms` : error.message,
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

async function runNetworkDiagnostics() {
  const btn = document.querySelector("#btn-network-diagnostics");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "诊断中…";
  }
  if (deployDiagnosticText) deployDiagnosticText.textContent = "诊断中";
  if (networkDiagnosticsLogEl) networkDiagnosticsLogEl.innerHTML = "";
  networkDiagLog("开始网络诊断…", "cmd");

  const nav = performance.getEntriesByType("navigation")[0];
  if (nav) {
    networkDiagLog(
      `页面导航: 总耗时 ${formatDuration(nav.duration)} | TTFB ${formatDuration(nav.responseStart - nav.startTime)} | DOMContentLoaded ${formatDuration(nav.domContentLoadedEventEnd - nav.startTime)} | load ${formatDuration(nav.loadEventEnd - nav.startTime)}`,
      "info"
    );
  } else {
    networkDiagLog("当前浏览器未提供 navigation timing。", "warn");
  }

  const pagePath = `${window.location.pathname}${window.location.search || ""}`;
  const scriptSrc = document.querySelector('script[src*="js/admin.js"]')?.src || "js/admin.js";
  const resourceProbe = assetUrlForDiagnostics("resources/images/profile.webp");
  const assetModeLabel = currentAssetSource() === "cdn" ? "jsDelivr/CDN" : "Vercel";
  networkDiagLog(`资源分发模式：${assetModeLabel}`, "info");
  const tasks = [
    ["后台 HTML", pagePath, { readBody: true, timeoutMs: 12000 }],
    ["后台脚本", scriptSrc, { readBody: true, timeoutMs: 12000 }],
    ["版本接口", "/api/version", { readBody: true, timeoutMs: 12000 }],
    ["预览状态", "/api/preview/status", { readBody: true, timeoutMs: 12000 }],
    ["资源分发", resourceProbe, { readBody: false, timeoutMs: 12000, fetchOptions: { method: "HEAD" } }],
    ["首页视频", "resources/videos/frame-lq.mp4", { readBody: false, timeoutMs: 20000, fetchOptions: { method: "HEAD" } }],
    ["代表图片", "resources/images/profile.webp", { readBody: false, timeoutMs: 12000, fetchOptions: { method: "HEAD" } }],
    ["代表论文", "resources/papers/light-fingerprint-2026.pdf", { readBody: false, timeoutMs: 20000, fetchOptions: { method: "HEAD" } }],
    ["静态首帧", "resources/frames/frame_001.webp", { readBody: false, timeoutMs: 12000, fetchOptions: { method: "HEAD" } }],
  ];

  const results = [];
  for (const [label, url, options] of tasks) {
    networkDiagLog(`测试 ${label}…`, "cmd");
    const result = await timedFetch(label, url, options);
    results.push(result);
    if (result.ok) {
      const extra = result.size ? `, ${result.size} 字符` : "";
      networkDiagLog(`✅ ${label}: ${formatDuration(result.duration)} (${result.status})${extra}`, "success");
      if (result.sample && label !== "静态首帧" && label !== "首页视频") {
        networkDiagLog(`   预览: ${result.sample.replace(/\s+/g, " ").slice(0, 120)}`, "info");
      }
    } else {
      networkDiagLog(`❌ ${label}: ${result.error || `HTTP ${result.status}`}`, "error");
    }
  }

  const slowest = results.filter((item) => item.ok).sort((a, b) => b.duration - a.duration)[0];
  if (slowest) {
    networkDiagLog(`最慢项：${slowest.label}（${formatDuration(slowest.duration)}）`, "warn");
    if (deployDiagnosticText) deployDiagnosticText.textContent = `${slowest.label} ${formatDuration(slowest.duration)}`;
  } else if (deployDiagnosticText) {
    deployDiagnosticText.textContent = "无可用结果";
  }
  const failed = results.filter((item) => !item.ok);
  if (failed.length) {
    networkDiagLog(`有 ${failed.length} 项失败，优先看失败项对应的错误。`, "warn");
  } else {
    networkDiagLog("诊断完成，未发现明显失败项。", "success");
  }
  if (!slowest && deployDiagnosticText) deployDiagnosticText.textContent = "诊断完成";

  if (btn) {
    btn.disabled = false;
    btn.textContent = "重新诊断";
  }
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
  if (sbVersionInline) sbVersionInline.textContent = version;
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
    if (sbGitInline) sbGitInline.textContent = `${count} 个未提交`;
    if (deployMiniGit) deployMiniGit.textContent = `${count} 个未提交`;
  } else {
    sbGit.innerHTML = `<span class="dot"></span>Git 干净`;
    sbGit.classList.remove("has-changes");
    if (sbGitInline) sbGitInline.textContent = "Git 干净";
    if (deployMiniGit) deployMiniGit.textContent = "Git 干净";
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
      if (result.detail) deployLog(`  详情: ${result.detail}`, "error");
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
        deployLog("🌐 站点将自动构建部署", "success");
        deployLog("⏱️ CDN 缓存约 5-10 分钟后生效", "info");
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
//  版本更新 — 从 GitHub 拉到下载文件夹
// ═══════════════════════════════════════════════════════════════

async function pullToDownloads() {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开后再操作。", "error");
    return;
  }
  if (!confirm("将从 GitHub 拉取最新代码并下载到「下载」文件夹，确定继续？")) return;
  const btn = document.querySelector("#btn-pull-to-downloads");
  if (btn) { btn.disabled = true; btn.textContent = "拉取中…"; }
  deployLog("正在从 GitHub 拉取最新代码…", "cmd");
  try {
    const result = await apiPost("/api/git/pull-to-downloads");
    if (result.ok) {
      deployLog(`✅ ${result.message}`, "success");
      deployLog(`版本: ${result.version}`, "info");
      if (result.pullOutput) deployLog(result.pullOutput, "info");
    } else {
      deployLog(`❌ ${result.message}`, "error");
    }
  } catch (err) {
    deployLog(`❌ 错误: ${err.message}`, "error");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = "从 GitHub 下载到下载文件夹"; }
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
      if (sbPreviewInline) sbPreviewInline.textContent = "预览运行中";
      if (deployPreviewText) deployPreviewText.textContent = "运行中";
      if (deployMiniPreview) deployMiniPreview.textContent = "运行中";
    } else {
      sbPreview.innerHTML = `<span class="dot"></span>预览未运行`;
      sbPreview.classList.remove("running");
      if (sbPreviewInline) sbPreviewInline.textContent = "预览未运行";
      if (deployPreviewText) deployPreviewText.textContent = "未运行";
      if (deployMiniPreview) deployMiniPreview.textContent = "未运行";
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
    if (sbConnectionInline) sbConnectionInline.textContent = "本地模式";
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
    if (sbConnectionInline) sbConnectionInline.textContent = "服务器已连接";
  } catch {
    if (sbConnection) {
      sbConnection.innerHTML = `<span class="dot"></span>服务器断开`;
      sbConnection.classList.add("disconnected");
      sbConnection.classList.remove("connected");
    }
    if (sbConnectionInline) sbConnectionInline.textContent = "服务器断开";
  }
}

// ═══════════════════════════════════════════════════════════════
//  版本更新 — 加载仪表盘数据
// ═══════════════════════════════════════════════════════════════

async function loadDeployData() {
  deployLog("加载版本仪表盘数据…", "cmd");
  updateAssetSourceUI();
  if (deployStrategyText) deployStrategyText.textContent = "patch +1";
  if (deployDiagnosticText) deployDiagnosticText.textContent = "等待执行";
  await Promise.all([
    loadVersion(),
    refreshGitStatus(true),
    checkPreviewStatus(),
    loadBackupsPanel(),
    loadBackupPreviews(),
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
  const kind = fileFieldForBucket(bucket);
  const stem = buildUploadFilename(file, kind === "image" ? "image" : "file", target).replace(/\.[^.]+$/, "");
  return `${stem || slugify(file.name.replace(/\.[^.]+$/, "")) || "file"}${extensionOf(file.name)}`;
}

function renderRecentFiles(view = "storage", search = "") {
  const container = view === "files" ? filesRecent : storageRecent;
  if (!container) return;
  const bucket = view === "files" ? document.querySelector("#files-bucket")?.value || "images" : storageBucket?.value || "images";
  const recentPaths = recentFilesForBucket(bucket);
  if (!recentPaths.length) {
    container.innerHTML = `<p class="storage-empty">暂无最近使用的文件。</p>`;
    return;
  }
  const filtered = recentPaths
    .map((path) => ({ path, file: { path } }))
    .filter(({ path }) => matchesFileSearch({ path }, bucket, search));
  if (!filtered.length) {
    container.innerHTML = `<p class="storage-empty">最近使用中没有符合 “${escapeHtml(search || "全部")}” 的文件。</p>`;
    return;
  }
  container.innerHTML = filtered
    .map((path) => {
      const relativeUrl = fileUrlForBucket(bucket, path.path);
      const actionButtons = view === "storage"
        ? `
            <button class="icon-button primary" data-storage-action="use" data-url="${escapeHtml(relativeUrl)}" data-path="${escapeHtml(path.path)}" data-bucket="${escapeHtml(bucket)}" type="button">填入当前字段</button>
            <button class="icon-button" data-storage-action="copy" data-url="${escapeHtml(relativeUrl)}" data-path="${escapeHtml(path.path)}" data-bucket="${escapeHtml(bucket)}" type="button">复制路径</button>
          `
        : `
            <button class="icon-button" data-files-action="copy" data-url="${escapeHtml(relativeUrl)}" data-path="${escapeHtml(path.path)}" data-bucket="${escapeHtml(bucket)}" type="button">复制路径</button>
          `;
      return `
        <article class="storage-recent-item" data-path="${escapeHtml(path.path)}">
          <div class="storage-recent-copy">
            <strong>${escapeHtml(path.path)}</strong>
            <span>${escapeHtml(relativeUrl)}</span>
          </div>
          <div class="storage-recent-actions">
            ${actionButtons}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderFileList(container, bucket, files, { search = "", allowFill = false, listType = "storage" } = {}) {
  if (!container) return;
  const filtered = files.filter((file) => matchesFileSearch(file, bucket, search));
  const renderCard = (file, isRecent = false) => {
    const relativeUrl = fileUrlForBucket(bucket, file.path);
    const size = file.size ? `${Math.round(file.size / 1024)} KB` : "";
    const actions = listType === "storage"
      ? `
          <button class="icon-button" data-storage-action="folder" data-bucket="${escapeHtml(bucket)}" data-path="${escapeHtml(file.path)}" type="button">打开文件夹</button>
          <button class="icon-button" data-storage-action="copy" data-url="${escapeHtml(relativeUrl)}" data-path="${escapeHtml(file.path)}" data-bucket="${escapeHtml(bucket)}" type="button">复制路径</button>
          ${allowFill ? `<button class="icon-button primary" data-storage-action="use" data-url="${escapeHtml(relativeUrl)}" data-path="${escapeHtml(file.path)}" data-bucket="${escapeHtml(bucket)}" type="button">填入当前字段</button>` : ""}
          <button class="icon-button danger" data-storage-action="delete" data-path="${escapeHtml(file.path)}" data-bucket="${escapeHtml(bucket)}" type="button">删除</button>
        `
      : `
          <button class="icon-button" data-files-action="folder" data-bucket="${escapeHtml(bucket)}" data-path="${escapeHtml(file.path)}" type="button">打开文件夹</button>
          <button class="icon-button" data-files-action="copy" data-url="${escapeHtml(relativeUrl)}" data-path="${escapeHtml(file.path)}" data-bucket="${escapeHtml(bucket)}" type="button">复制路径</button>
          <button class="icon-button danger" data-files-action="delete" data-path="${escapeHtml(file.path)}" data-bucket="${escapeHtml(bucket)}" type="button">删除</button>
        `;
    return `
      <article class="storage-item${isRecent ? " is-recent" : ""}" data-path="${escapeHtml(file.path)}">
        <div>
          <h3>${escapeHtml(file.path)}</h3>
          <p>${escapeHtml([bucket, size, file.mtime || ""].filter(Boolean).join(" · "))}</p>
        </div>
        <div class="item-actions">
          ${actions}
        </div>
      </article>
    `;
  };
  if (!filtered.length) {
    container.innerHTML = `<p class="storage-empty">未找到符合 “${escapeHtml(search || "全部")}” 的文件。</p>`;
    return;
  }
  container.innerHTML = filtered
    .map((file) => renderCard(file, false))
    .join("");
}

async function loadLocalFiles(bucket = storageBucket?.value || "images", options = {}) {
  const container = options.container || storageList;
  const search = options.search ?? storageSearch?.value ?? storageSearchValue;
  const allowFill = options.allowFill ?? true;
  const listType = options.listType || "storage";
  const recentTarget = options.recentTarget || listType;
  if (!container) return;
  container.innerHTML = `<p class="storage-empty">正在读取 ${bucket}…</p>`;
  try {
    const result = await localRequest(`/api/files?bucket=${encodeURIComponent(bucket)}`);
    const files = result.files || [];
    renderFileList(container, bucket, files, { search, allowFill, listType });
    renderRecentFiles(recentTarget, search);
    if (options.status !== false) {
      setLocalStatus(`已读取 ${bucket}：${files.length} 个文件。`, "success");
    }
    return files;
  } catch (error) {
    container.innerHTML = `<p class="storage-empty">读取失败：${escapeHtml(error.message)}</p>`;
    setLocalStatus(`读取文件失败：${error.message}`, "error");
    return [];
  }
}

async function listLocalFiles(bucket = storageBucket?.value || "images") {
  updateCurrentFileTargetLabels();
  return loadLocalFiles(bucket, {
    container: storageList,
    search: storageSearch?.value || storageSearchValue,
    allowFill: true,
    listType: "storage",
    recentTarget: "storage",
  });
}

async function uploadLocalFile() {
  const file = storageFile?.files?.[0];
  const bucket = storageBucket?.value || "images";
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
    touchRecentFile(bucket, result.path);
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
    recentFilesMap[bucket] = recentFilesForBucket(bucket).filter((item) => item !== path);
    persistRecentFilesMap();
    setLocalStatus(`已删除：${bucket}/${path}`, "success");
    await listLocalFiles(bucket);
  } catch (error) {
    setLocalStatus(`删除失败：${error.message}`, "error");
  }
}

// ═══════════════════════════════════════════════════════════════
//  发布到线上（GitHub -> 自动部署）
// ═══════════════════════════════════════════════════════════════

async function publishToGitHub() {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开后再发布。", "error");
    return;
  }
  if (!confirm("确定推送到 GitHub？请先确认当前内容已经保存。")) return;
  await deployToGitHub();
}

async function backupSite() {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开后再备份。", "error");
    return;
  }
  if (!confirm("确定备份整个网页吗？这会把当前站点文件复制到本地备份目录。")) return;
  try {
    setLocalStatus("正在创建网页备份…", "info");
    const result = await localRequest("/api/backup-site", { method: "POST" });
    setLocalStatus(`备份完成：${result.path}`, "success");
  } catch (error) {
    setLocalStatus(`备份失败：${error.message}`, "error");
  }
}

function formatBackupLabel(item) {
  const shortName = item.name.replace(/^site-backup-/, "");
  const date = new Date(item.mtime);
  const readable = Number.isNaN(date.getTime())
    ? shortName
    : date.toLocaleString("zh-CN", { hour12: false });
  return `${shortName} · ${readable}`;
}

function renderBackupSelection(backups, preserveValue = true) {
  if (!restoreBackupSelect) return;
  const previous = preserveValue ? restoreBackupSelect.value : "";
  restoreBackupSelect.innerHTML = '<option value="">还原最新备份</option>';
  for (const item of backups) {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = formatBackupLabel(item);
    restoreBackupSelect.appendChild(option);
  }
  if (previous && backups.some((item) => item.name === previous)) {
    restoreBackupSelect.value = previous;
  }
}

function renderBackupList(backups) {
  if (!backupList) return;
  if (!backups.length) {
    backupList.innerHTML = `<div class="backup-empty">暂无备份。先点击“备份网页”创建第一个备份。</div>`;
    if (backupCountBadge) backupCountBadge.innerHTML = `<span class="dot"></span>0 个备份`;
    return;
  }
  backupList.innerHTML = backups
    .map(
      (item) => `
        <article class="backup-item" data-backup-name="${item.name}">
          <div class="backup-item-copy">
            <h3>${escapeHtml(item.name.replace(/^site-backup-/, ""))}</h3>
            <p>${escapeHtml(formatBackupLabel(item))}</p>
            <code>${escapeHtml(item.path)}</code>
          </div>
          <div class="backup-item-actions">
            <button class="deploy-btn primary" type="button" data-backup-action="restore" data-backup-name="${escapeHtml(item.name)}">还原</button>
            <button class="deploy-btn success" type="button" data-backup-action="preview" data-backup-name="${escapeHtml(item.name)}">打开备份</button>
            <button class="deploy-btn" type="button" data-backup-action="select" data-backup-name="${escapeHtml(item.name)}">选中</button>
            <button class="deploy-btn danger" type="button" data-backup-action="delete" data-backup-name="${escapeHtml(item.name)}">删除</button>
          </div>
        </article>`,
    )
    .join("");
  if (backupCountBadge) backupCountBadge.innerHTML = `<span class="dot"></span>${backups.length} 个备份`;
}

async function loadBackupsPanel() {
  if (!USE_LOCAL_ADMIN_SERVER) return;
  try {
    const result = await localRequest("/api/backups");
    const backups = Array.isArray(result.backups) ? result.backups : [];
    renderBackupSelection(backups, true);
    renderBackupList(backups);
  } catch (error) {
    console.warn("加载历史备份失败", error);
  }
}

async function refreshFileManager() {
  if (!USE_LOCAL_ADMIN_SERVER) return;
  await listLocalFiles(storageBucket?.value || "images");
}

async function restoreSite() {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开后再还原。", "error");
    return;
  }
  const backupName = restoreBackupSelect?.value || "";
  const message = backupName
    ? `确定还原选中的备份「${backupName}」吗？当前站点文件会被覆盖。`
    : "确定从最新备份还原网页吗？当前站点文件会被覆盖。";
  if (!confirm(message)) return;
  try {
    setLocalStatus("正在还原网页…", "info");
    const result = await localRequest("/api/restore-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupName }),
    });
    setLocalStatus(`还原完成：${result.path}`, "success");
  } catch (error) {
    setLocalStatus(`还原失败：${error.message}`, "error");
  }
}

async function deleteBackup(backupName) {
  if (!USE_LOCAL_ADMIN_SERVER) return;
  if (!backupName) return;
  if (!confirm(`确定删除备份「${backupName}」？删除后无法恢复。`)) return;
  try {
    setLocalStatus("正在删除备份…", "info");
    const result = await localRequest("/api/backups", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupName }),
    });
    setLocalStatus(`已删除备份：${result.name}`, "success");
    await loadBackupsPanel();
  } catch (error) {
    setLocalStatus(`删除备份失败：${error.message}`, "error");
  }
}

// ═══════════════════════════════════════════════════════════════
//  备份预览
// ═══════════════════════════════════════════════════════════════

async function startBackupPreview(backupName) {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("请从本地后台 http://localhost:8787/admin.html 打开后再操作。", "error");
    return;
  }
  if (!backupName) return;
  try {
    setLocalStatus(`正在启动备份预览：${backupName}…`, "info");
    const result = await localRequest("/api/backup-preview/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupName }),
    });
    if (result.ok && result.url) {
      setLocalStatus(`备份预览已启动：${result.url}`, "success");
      window.open(result.url, "_blank", "noopener");
      await loadBackupPreviews();
    } else {
      setLocalStatus(`启动备份预览失败：${result.message}`, "error");
    }
  } catch (error) {
    setLocalStatus(`启动备份预览失败：${error.message}`, "error");
  }
}

async function stopBackupPreview(backupName) {
  if (!USE_LOCAL_ADMIN_SERVER) return;
  if (!backupName) return;
  try {
    const result = await localRequest("/api/backup-preview/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backupName }),
    });
    if (result.ok) {
      setLocalStatus(`备份预览已关闭：${backupName}`, "success");
      await loadBackupPreviews();
    }
  } catch (error) {
    setLocalStatus(`关闭备份预览失败：${error.message}`, "error");
  }
}

async function loadBackupPreviews() {
  if (!USE_LOCAL_ADMIN_SERVER) return;
  const container = document.querySelector("#backup-preview-status");
  if (!container) return;
  try {
    const result = await localRequest("/api/backup-preview/list");
    const previews = result.previews || [];
    if (!previews.length) {
      container.innerHTML = `<div class="deploy-mini-item"><span>无运行中的备份预览</span></div>`;
      return;
    }
    container.innerHTML = previews
      .map(
        (p) => `
        <div class="deploy-mini-item">
          <span>${escapeHtml(p.name.replace(/^site-backup-/, ""))}</span>
          <strong style="display:flex;align-items:center;gap:6px;">
            <a href="${p.url}" target="_blank" rel="noopener" style="color:#2997FF;text-decoration:none;font-weight:600;">:${p.port}</a>
            <button class="deploy-btn danger" type="button" data-backup-preview-stop="${escapeHtml(p.name)}" style="height:28px;padding:0 8px;font-size:0.72rem;">停止</button>
          </strong>
        </div>`,
      )
      .join("");
  } catch (error) {
    container.innerHTML = `<div class="deploy-mini-item"><span>加载失败：${escapeHtml(error.message)}</span></div>`;
  }
}

async function checkLocalServer() {
  if (!USE_LOCAL_ADMIN_SERVER) {
    setLocalStatus("当前不是本地后台模式：请双击「站点维护.command」，再从 http://localhost:8787/admin.html 打开。", "error");
    return;
  }
  try {
    const status = await localRequest("/api/status");
    setLocalStatus(`本地后台已连接：${status.rootDir}`, "success");
    await listLocalFiles(storageBucket?.value || "images");
  } catch (error) {
    setLocalStatus(`本地后台连接失败：${error.message}`, "error");
  }
}

// ═══════════════════════════════════════════════════════════════
//  事件绑定
// ═══════════════════════════════════════════════════════════════

function init() {
  const isFilesPage = document.body.dataset.page === "files";
  // ── 标签切换 ──
  document.querySelectorAll(".tab-button").forEach((btn) => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });

  // ── CMS 编辑器事件 ──
  addButton?.addEventListener("click", clearForm);
  document.querySelector("#translate-current")?.addEventListener("click", async (event) => {
    await autoTranslateCurrentEntry(Boolean(event.shiftKey || event.altKey || event.metaKey));
  });
  document.querySelector("#translate-section")?.addEventListener("click", async (event) => {
    await autoTranslateCurrentSection(Boolean(event.shiftKey || event.altKey || event.metaKey));
  });
  document.querySelector("#clear-form")?.addEventListener("click", clearForm);
  document.querySelector("#save-top")?.addEventListener("click", saveCurrent);
  document.querySelector("#save-all")?.addEventListener("click", saveCurrent);
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
  document.querySelector("#backup-site")?.addEventListener("click", backupSite);
  document.querySelector("#restore-site")?.addEventListener("click", restoreSite);
  document.querySelector("#btn-refresh-backups")?.addEventListener("click", loadBackupsPanel);
  restoreBackupSelect?.addEventListener("change", () => {
    if (!restoreBackupSelect.value) return;
    setLocalStatus(`已选择备份：${restoreBackupSelect.value}`, "info");
  });
  document.querySelector("#btn-refresh-backup-previews")?.addEventListener("click", loadBackupPreviews);
  document.querySelector("#backup-preview-status")?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-backup-preview-stop]");
    if (!button) return;
    await stopBackupPreview(button.dataset.backupPreviewStop);
  });
  backupList?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-backup-action]");
    if (!button) return;
    const backupName = button.dataset.backupName || "";
    const action = button.dataset.backupAction;
    if (action === "select") {
      if (restoreBackupSelect) restoreBackupSelect.value = backupName;
      setLocalStatus(`已选中备份：${backupName}`, "success");
    } else if (action === "restore") {
      if (restoreBackupSelect) restoreBackupSelect.value = backupName;
      await restoreSite();
    } else if (action === "preview") {
      await startBackupPreview(backupName);
    } else if (action === "delete") {
      await deleteBackup(backupName);
    }
  });

  // ── 条目搜索筛选 ──
  const listFilter = document.querySelector("#list-filter");
  listFilter?.addEventListener("input", (e) => {
    listFilterValue = e.target.value;
    renderList();
  });
  listFilter?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { listFilter.value = ""; listFilterValue = ""; renderList(); }
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
    } else if (button.dataset.action === "rep-up" || button.dataset.action === "rep-down") {
      const order = data.representativeOrder || [];
      const items = currentCollection();
      // Build current rep order from stored titles
      const repTitles = [];
      for (const t of order) {
        if (items.find(p => p.title === t && p.representative)) repTitles.push(t);
      }
      // Add any reps not in order
      items.forEach(p => { if (p.representative && !repTitles.includes(p.title)) repTitles.push(p.title); });
      const from = index;
      const to = button.dataset.action === "rep-up" ? Math.max(0, from - 1) : Math.min(repTitles.length - 1, from + 1);
      if (from === to) return;
      const [moved] = repTitles.splice(from, 1);
      repTitles.splice(to, 0, moved);
      data.representativeOrder = repTitles.slice(0, 5);
      await persistAndWrite();
      buildForm();
      renderList();
    } else {
      // 删除确认 + 撤销
      const item = currentCollection()[index];
      const label = item?.title || item?.label || `条目 ${index + 1}`;
      if (!confirm(`确定删除「${label}」？删除后可通过「撤销」恢复。`)) return;
      const deleted = currentCollection().splice(index, 1)[0];
      editingIndex = 0;
      await persistAndWrite();
      buildForm();
      renderList();
      showUndoToast(`已删除「${label}」`, () => {
        currentCollection().splice(index, 0, deleted);
        persistAndWrite();
        buildForm();
        renderList();
      });
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

  // ── 版本更新事件 ──
  document.querySelectorAll("#version-strategy button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#version-strategy button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      deployState.versionStrategy = btn.dataset.strategy;
      const manualRow = document.querySelector("#manual-version-row");
      if (manualRow) manualRow.style.display = deployState.versionStrategy === "manual" ? "flex" : "none";
      if (deployStrategyText) {
        const label = deployState.versionStrategy === "patch"
          ? "patch +1"
          : deployState.versionStrategy === "minor"
            ? "minor +1"
            : "手动输入";
        deployStrategyText.textContent = label;
      }
      deployLog(`版本号策略切换为: ${deployState.versionStrategy}`);
    });
  });
  document.querySelector("#btn-set-version")?.addEventListener("click", updateVersion);
  document.querySelector("#btn-update-version")?.addEventListener("click", updateVersion);
  document.querySelector("#btn-refresh-git")?.addEventListener("click", () => refreshGitStatus());
  document.querySelector("#btn-test-git")?.addEventListener("click", testGitHubConnection);
  document.querySelector("#btn-network-diagnostics")?.addEventListener("click", runNetworkDiagnostics);
  document.querySelector("#btn-optimize-images")?.addEventListener("click", optimizeImages);
  document.querySelector("#btn-deploy")?.addEventListener("click", deployToGitHub);
  document.querySelector("#btn-pull-to-downloads")?.addEventListener("click", pullToDownloads);
  document.querySelector("#btn-preview-start")?.addEventListener("click", startPreview);
  document.querySelector("#btn-preview-stop")?.addEventListener("click", stopPreview);
  document.querySelector("#btn-clear-log")?.addEventListener("click", clearDeployLog);
  assetSourceButtons.forEach((btn) => {
    btn.addEventListener("click", () => setAssetSource(btn.dataset.assetSource));
  });

  // ── 文件管理面板 ──
  document.querySelector("#local-refresh-files")?.addEventListener("click", refreshFileManager);
  document.querySelector("#storage-upload")?.addEventListener("click", uploadLocalFile);
  storageBucket?.addEventListener("change", () => {
    updateCurrentFileTargetLabels();
    listLocalFiles(storageBucket.value);
  });
  storageSearch?.addEventListener("input", (event) => {
    storageSearchValue = event.target.value;
    listLocalFiles(storageBucket?.value || "images");
  });
  storageSearch?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    storageSearch.value = "";
    storageSearchValue = "";
    listLocalFiles(storageBucket?.value || "images");
  });
  storageList?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-storage-action]");
    if (button) {
      const action = button.dataset.storageAction;
      if (action === "folder") {
        await openLocalFileFolder(button.dataset.bucket || storageBucket?.value || "images", button.dataset.path || "");
        return;
      }
      if (action === "copy") {
        await navigator.clipboard?.writeText(button.dataset.url).catch(() => {});
        setLocalStatus("已复制相对路径。", "success");
      } else if (action === "use") {
        fillCurrentFileField(button.dataset.url || "", button.dataset.bucket || storageBucket?.value || "images", button.dataset.path || "");
      } else if (action === "delete") {
        await deleteLocalFile(button.dataset.bucket || storageBucket?.value || "images", button.dataset.path || "");
      }
      return;
    }
    const item = event.target.closest(".storage-item[data-path]");
    if (!item || event.target.closest(".item-actions")) return;
    const bucket = storageBucket?.value || "images";
    const url = fileUrlForBucket(bucket, item.dataset.path || "");
    fillCurrentFileField(url, bucket, item.dataset.path || "");
    await listLocalFiles(bucket);
  });
  storageRecent?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-storage-action]");
    if (!button) return;
    const action = button.dataset.storageAction;
    if (action === "copy") {
      await navigator.clipboard?.writeText(button.dataset.url).catch(() => {});
      setLocalStatus("已复制相对路径。", "success");
    } else if (action === "use") {
      fillCurrentFileField(button.dataset.url || "", button.dataset.bucket || storageBucket?.value || "images", button.dataset.path || "");
    } else if (action === "delete") {
      await deleteLocalFile(button.dataset.bucket || storageBucket?.value || "images", button.dataset.path || "");
    }
  });

  form?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-open-file-manager]");
    if (!button) return;
    const bucket = button.dataset.openFileManager || "images";
    const fieldName = button.dataset.openField || "";
    openFileManager(bucket, fieldName);
  });

  // ── 独立文件面板事件 ──
  document.querySelector("#files-refresh-files")?.addEventListener("click", () => {
    const bucket = document.querySelector("#files-bucket")?.value || "images";
    loadLocalFiles(bucket, {
      container: filesList,
      search: filesSearch?.value || filesSearchValue,
      allowFill: false,
      listType: "files",
      recentTarget: "files",
      status: false,
    });
  });
  document.querySelector("#files-upload")?.addEventListener("click", uploadFileEx);
  document.querySelector("#files-bucket")?.addEventListener("change", () => {
    const bucket = document.querySelector("#files-bucket")?.value || "images";
    updateCurrentFileTargetLabels();
    loadLocalFiles(bucket, {
      container: filesList,
      search: filesSearch?.value || filesSearchValue,
      allowFill: false,
      listType: "files",
      recentTarget: "files",
      status: false,
    });
  });
  filesSearch?.addEventListener("input", (event) => {
    filesSearchValue = event.target.value;
    loadLocalFiles(document.querySelector("#files-bucket")?.value || "images", {
      container: filesList,
      search: filesSearchValue,
      allowFill: false,
      listType: "files",
      recentTarget: "files",
      status: false,
    });
  });
  filesSearch?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    filesSearch.value = "";
    filesSearchValue = "";
    loadLocalFiles(document.querySelector("#files-bucket")?.value || "images", {
      container: filesList,
      search: "",
      allowFill: false,
      listType: "files",
      recentTarget: "files",
      status: false,
    });
  });
  filesList?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-files-action]");
    if (!button) return;
    const action = button.dataset.filesAction;
    if (action === "folder") {
      await openLocalFileFolder(button.dataset.bucket || document.querySelector("#files-bucket")?.value || "images", button.dataset.path || "");
      return;
    }
    if (action === "copy") {
      await navigator.clipboard?.writeText(button.dataset.url).catch(() => {});
      setLocalStatus("已复制相对路径。", "success");
    } else if (action === "delete") {
      const bucket = button.dataset.bucket || "images";
      const path = button.dataset.path;
      if (!confirm(`确定删除 ${bucket}/${path}？`)) return;
      try {
        await localRequest(`/api/files?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`, { method: "DELETE" });
        recentFilesMap[bucket] = recentFilesForBucket(bucket).filter((item) => item !== path);
        persistRecentFilesMap();
        setLocalStatus(`已删除：${bucket}/${path}`, "success");
        await loadLocalFiles(bucket, {
          container: filesList,
          search: filesSearch?.value || filesSearchValue,
          allowFill: false,
          listType: "files",
          recentTarget: "files",
          status: false,
        });
      } catch (error) {
        setLocalStatus(`删除失败：${error.message}`, "error");
      }
    }
  });
  filesRecent?.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-files-action]");
    if (!button) return;
    const action = button.dataset.filesAction;
    if (action === "copy") {
      await navigator.clipboard?.writeText(button.dataset.url).catch(() => {});
      setLocalStatus("已复制相对路径。", "success");
    } else if (action === "delete") {
      const bucket = button.dataset.bucket || "images";
      const path = button.dataset.path;
      if (!confirm(`确定删除 ${bucket}/${path}？`)) return;
      try {
        await localRequest(`/api/files?bucket=${encodeURIComponent(bucket)}&path=${encodeURIComponent(path)}`, { method: "DELETE" });
        recentFilesMap[bucket] = recentFilesForBucket(bucket).filter((item) => item !== path);
        persistRecentFilesMap();
        setLocalStatus(`已删除：${bucket}/${path}`, "success");
        await loadLocalFiles(bucket, {
          container: filesList,
          search: filesSearch?.value || filesSearchValue,
          allowFill: false,
          listType: "files",
          recentTarget: "files",
          status: false,
        });
      } catch (error) {
        setLocalStatus(`删除失败：${error.message}`, "error");
      }
    }
  });

  // ── 状态栏点击刷新 ──
  sbGit?.addEventListener("click", () => refreshGitStatus());

  // ── 初始化 ──
  jsonBuffer.value = JSON.stringify(data, null, 2);
  updateAssetSourceUI();
  setActiveTab(isFilesPage ? "files" : activeTab);
  clearNetworkDiagLog();
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
