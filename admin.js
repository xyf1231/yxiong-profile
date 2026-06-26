const STORAGE_KEY = "academicSiteData";

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
      ["contentHtml", "自由排版 HTML（可插入图片）", "textarea"],
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

let data = loadData();
let activeTab = "profile";
let editingIndex = 0;
let siteDirectoryHandle = null;
let draggedIndex = null;

const form = document.querySelector("#content-form");
const list = document.querySelector("#item-list");
const addButton = document.querySelector("#add-item");
const jsonBuffer = document.querySelector("#json-buffer");
const folderStatus = document.querySelector("#folder-status");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeWithDefaultData(source) {
  const base = clone(window.DEFAULT_SITE_DATA);
  const merged = { ...base, ...source };
  merged.profile = { ...base.profile, ...(source.profile || {}) };
  Object.keys(base).forEach((key) => {
    if (Array.isArray(base[key])) {
      if (!Array.isArray(merged[key]) || merged[key].length === 0) {
        merged[key] = base[key];
      }
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
  } catch {
    return clone(window.DEFAULT_SITE_DATA);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  jsonBuffer.value = JSON.stringify(data, null, 2);
}

async function writeDataJsToSiteFolder() {
  if (!siteDirectoryHandle) return false;
  const fileHandle = await siteDirectoryHandle.getFileHandle("data.js", { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(`window.DEFAULT_SITE_DATA = ${JSON.stringify(data, null, 2)};\n`);
  await writable.close();
  return true;
}

async function persistAndWrite() {
  persist();
  if (await writeDataJsToSiteFolder()) {
    folderStatus.textContent = "已保存：文件已写入 papers/ 或 assets/，data.js 也已同步更新。发布时上传整个网站文件夹即可。";
  }
}

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .toLowerCase();
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

async function ensureWritableDirectory(name) {
  if (!siteDirectoryHandle) return null;
  return siteDirectoryHandle.getDirectoryHandle(name, { create: true });
}

async function saveFileToSiteFolder(file, key, kind, target) {
  if (!siteDirectoryHandle) return null;
  const folder = kind === "image" ? "assets" : "papers";
  const dir = await ensureWritableDirectory(folder);
  const filename = buildUploadFilename(file, key, target);
  const fileHandle = await dir.getFileHandle(filename, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();
  return `${folder}/${filename}`;
}

function currentCollection() {
  return schemas[activeTab].type === "object" ? data[activeTab] : data[activeTab] || [];
}

function buildForm() {
  const schema = schemas[activeTab];
  const source = schema.type === "object" ? data[activeTab] : currentCollection()[editingIndex] || {};
  form.innerHTML = schema.fields
    .map(([key, label, kind]) => {
      const value = source[key] || "";
      const cls = kind === "textarea" || kind === "image" || kind === "file" ? "field full" : "field";
      if (kind === "textarea") return `<label class="${cls}"><span>${label}</span><textarea name="${key}">${escapeHtml(value)}</textarea></label>`;
      if (kind === "image" || kind === "file") {
        const accept = kind === "image" ? "image/*" : ".pdf,.doc,.docx,image/*";
        return `<label class="${cls}"><span>${label}</span><input name="${key}" value="${escapeHtml(value)}" placeholder="可粘贴路径/URL，或选择文件上传" /><input name="${key}Upload" type="file" accept="${accept}" /></label>`;
      }
      return `<label class="${cls}"><span>${label}</span><input name="${key}" value="${escapeHtml(value)}" /></label>`;
    })
    .join("");
}

function renderList() {
  const schema = schemas[activeTab];
  addButton.style.display = schema.type === "object" ? "none" : "inline-flex";
  if (schema.type === "object") {
    list.dataset.sortable = "false";
    list.innerHTML = `<article class="managed-item"><div><h3>${escapeHtml(data.profile.nameCn)}</h3><p>${escapeHtml(data.profile.affiliation)}</p></div></article>`;
    return;
  }
  list.dataset.sortable = "true";
  list.innerHTML = currentCollection()
    .map(
      (item, index) => `
        <article class="managed-item" draggable="false" data-index="${index}">
          <button class="drag-handle" type="button" aria-label="拖动排序" title="拖动排序">⋮⋮</button>
          <div class="managed-copy">
            <h3>${escapeHtml(item.title || item.label || `条目 ${index + 1}`)}</h3>
            <p>${escapeHtml(item.venue || item.text || item.detail || item.period || item.url || "")}</p>
          </div>
          <div class="item-actions">
            <button class="icon-button" data-action="up" data-index="${index}" type="button">上移</button>
            <button class="icon-button" data-action="down" data-index="${index}" type="button">下移</button>
            <button class="icon-button" data-action="edit" data-index="${index}" type="button">编辑</button>
            <button class="icon-button" data-action="delete" data-index="${index}" type="button">删除</button>
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

function setActiveTab(tab) {
  activeTab = tab;
  editingIndex = 0;
  document.querySelectorAll(".tab-button").forEach((button) => button.setAttribute("aria-selected", String(button.dataset.tab === tab)));
  document.querySelector("#active-title").textContent = schemas[tab].title;
  document.querySelector("#active-kicker").textContent = tab;
  buildForm();
  renderList();
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function saveCurrent() {
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
}

document.querySelectorAll(".tab-button").forEach((button) => button.addEventListener("click", () => setActiveTab(button.dataset.tab)));
list.addEventListener("click", async (event) => {
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
list.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest(".drag-handle");
  if (!handle || list.dataset.sortable !== "true") return;
  list.querySelectorAll(".managed-item").forEach((node) => (node.draggable = false));
  const item = handle.closest(".managed-item[data-index]");
  if (item) {
    item.draggable = true;
    item.classList.add("drag-ready");
  }
});
list.addEventListener("pointerup", () => {
  if (draggedIndex !== null) return;
  list.querySelectorAll(".managed-item").forEach((node) => {
    node.draggable = false;
    node.classList.remove("drag-ready");
  });
});
list.addEventListener("dragstart", (event) => {
  const item = event.target.closest(".managed-item[data-index]");
  if (!item || item.draggable !== true) {
    event.preventDefault();
    return;
  }
  draggedIndex = Number(item.dataset.index);
  item.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(draggedIndex));
});
list.addEventListener("dragover", (event) => {
  if (draggedIndex === null || list.dataset.sortable !== "true") return;
  const item = event.target.closest(".managed-item[data-index]");
  if (!item) return;
  event.preventDefault();
  const targetIndex = Number(item.dataset.index);
  list.querySelectorAll(".managed-item").forEach((node) => node.classList.remove("drag-over-before", "drag-over-after"));
  item.classList.add(targetIndex > draggedIndex ? "drag-over-after" : "drag-over-before");
});
list.addEventListener("dragleave", (event) => {
  const item = event.target.closest(".managed-item[data-index]");
  if (item && !item.contains(event.relatedTarget)) item.classList.remove("drag-over-before", "drag-over-after");
});
list.addEventListener("drop", async (event) => {
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
list.addEventListener("dragend", () => {
  draggedIndex = null;
  list.querySelectorAll(".managed-item").forEach((node) => {
    node.draggable = false;
    node.classList.remove("drag-ready", "is-dragging", "drag-over-before", "drag-over-after");
  });
});
addButton.addEventListener("click", clearForm);
document.querySelector("#clear-form").addEventListener("click", clearForm);
document.querySelector("#save-item").addEventListener("click", saveCurrent);
document.querySelector("#save-all").addEventListener("click", persistAndWrite);
document.querySelector("#choose-site-folder")?.addEventListener("click", async () => {
  if (!window.showDirectoryPicker) {
    folderStatus.textContent = "当前浏览器不支持自动写入文件夹。请使用 Chrome/Edge 本地打开后台，或手动把文件放入 papers/、assets/ 后填写相对路径。";
    return;
  }
  try {
    siteDirectoryHandle = await window.showDirectoryPicker({ mode: "readwrite" });
    folderStatus.textContent = "已选择网站文件夹：上传 PDF 将保存到 papers/，图片将保存到 assets/；保存后 data.js 会同步更新。";
  } catch {
    folderStatus.textContent = "未选择网站文件夹：上传文件不会自动写入项目目录。";
  }
});
document.querySelector("#reset-data").addEventListener("click", async () => {
  if (!confirm("确定恢复默认数据？")) return;
  data = clone(window.DEFAULT_SITE_DATA);
  await persistAndWrite();
  setActiveTab(activeTab);
});
document.querySelector("#export-json").addEventListener("click", () => {
  persist();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "academic-site-data.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

jsonBuffer.value = JSON.stringify(data, null, 2);
setActiveTab(activeTab);
