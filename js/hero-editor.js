/**
 * hero-editor.js — 全站页面排版可视化编辑器
 * 读取/保存各页面的 css/{page}-config.css 与 js/{page}-content.js，实时预览对应页面效果。
 */

const pages = [
  { id: "home", label: "首页", file: "index.html", cssPath: "css/home-config.css", contentPath: "js/home-content.js", contentVar: "HOME_CONTENT" },
  { id: "profile", label: "个人简介", file: "profile.html", cssPath: "css/profile-config.css", contentPath: "js/profile-content.js", contentVar: "PAGE_CONTENT" },
  { id: "results", label: "成果", file: "results.html", cssPath: "css/results-config.css", contentPath: "js/results-content.js", contentVar: "PAGE_CONTENT" },
  { id: "honors", label: "荣誉", file: "honors.html", cssPath: "css/honors-config.css", contentPath: "js/honors-content.js", contentVar: "PAGE_CONTENT" },
  { id: "activities", label: "学术活动", file: "activities.html", cssPath: "css/activities-config.css", contentPath: "js/activities-content.js", contentVar: "PAGE_CONTENT" },
];

let currentPageId = "home";
let originalCss = "";
let currentCssVars = {};
let currentContent = { zh: {}, en: {} };
let originalContent = { zh: {}, en: {} };
let editorMode = "desktop"; // "desktop" | "mobile"
let previewLang = "zh";
let updateTimer = null;

const fontOptions = [
  { value: "inherit", label: "继承默认" },
  { value: "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif", label: "系统无衬线" },
  { value: "\"PingFang SC\", \"Microsoft YaHei\", \"Hiragino Sans GB\", sans-serif", label: "中文优化无衬线" },
  { value: "Georgia, \"Times New Roman\", serif", label: "Georgia 衬线" },
  { value: "\"Times New Roman\", Times, serif", label: "Times New Roman" },
  { value: "\"SF Mono\", Menlo, Monaco, monospace", label: "等宽字体" },
];

const alignOptions = [
  { value: "left", label: "左对齐" },
  { value: "center", label: "居中" },
  { value: "right", label: "右对齐" },
];

const displayOptions = [
  { value: "none", label: "隐藏" },
  { value: "block", label: "显示" },
];

function group(title, fields) {
  return { title, fields };
}

function clampField(name, label, min, max, step, preferred, clampMin, clampMax, mobileName) {
  return {
    name,
    label,
    type: "clamp",
    min,
    max,
    step,
    preferredUnit: preferred,
    clampMin: clampMin || `${min}rem`,
    clampMax: clampMax || `${max}rem`,
    mobileName: mobileName || null,
  };
}

function rangeField(name, label, min, max, step, unit, mobileName) {
  return { name, label, type: "range", min, max, step, unit, mobileName: mobileName || null };
}

function selectField(name, label, options) {
  return { name, label, type: "select", options };
}

function textField(name, label) {
  return { name, label, type: "text" };
}

function colorField(name, label) {
  return { name, label, type: "color" };
}

const pageSchemas = {
  home: {
    contentGroupTitles: {
      hero: "首屏 Hero",
      frame: "研究亮点",
      news: "新闻动态",
      bento: "快速导航卡片",
    },
    contentKeys: {
      hero: [
        ["homeEyebrow", "眉标", false],
        ["homeTitle", "主标题", true],
        ["homeSubtitle", "副标题", false],
      ],
      frame: [
        ["homeFrameKicker", "小标签", false],
        ["homeFrameTitle", "标题", false],
      ],
      news: [
        ["newsKicker", "小标签", false],
        ["news", "标题", false],
        ["publications", "链接文字", false],
      ],
      bento: [
        ["quickNavKicker", "小标签", false],
        ["quickNav", "标题", false],
        ["quickProfileTitle", "卡片标题", false],
        ["quickProfileText", "卡片描述", false],
        ["quickResultsTitle", "卡片标题", false],
        ["quickResultsText", "卡片描述", false],
        ["quickHonorsTitle", "卡片标题", false],
        ["quickHonorsText", "卡片描述", false],
        ["quickActivitiesTitle", "卡片标题", false],
        ["quickActivitiesText", "卡片描述", false],
        ["quickNewsTitle", "卡片标题", false],
        ["quickNewsText", "卡片描述", false],
      ],
    },
    cssGroups: [
      group("主标题", [
        clampField("--hero-title-font-size-zh", "中文标题字号 (vw)", 2, 14, 0.1, "vw", "3rem", "7rem", "--hero-title-font-size-zh-mobile"),
        clampField("--hero-title-font-size-en", "英文标题字号 (vw)", 2, 14, 0.1, "vw", "2.8rem", "6.5rem", "--hero-title-font-size-en-mobile"),
        rangeField("--hero-title-line-height", "行高", 0.9, 1.6, 0.01, ""),
        rangeField("--hero-title-letter-spacing", "字间距", -0.05, 0.2, 0.001, "em"),
        rangeField("--hero-title-gap", "分行间距", 0, 0.3, 0.001, "em"),
        rangeField("--hero-title-font-weight", "字重", 300, 900, 100, ""),
        selectField("--hero-title-font-family", "字体", fontOptions),
        textField("--hero-title-margin", "外边距"),
      ]),
      group("副标题", [
        clampField("--hero-subtitle-font-size", "字号 (vw)", 0.5, 4, 0.1, "vw", "0.7rem", "2rem", "--hero-subtitle-font-size-mobile"),
        colorField("--hero-subtitle-color", "颜色"),
        rangeField("--hero-subtitle-margin-top", "上边距", 0, 40, 1, "px", "--hero-subtitle-margin-top-mobile"),
        selectField("--hero-subtitle-font-family", "字体", fontOptions),
      ]),
      group("眉标", [
        selectField("--hero-eyebrow-display", "显示", displayOptions),
        colorField("--hero-eyebrow-color", "颜色"),
        clampField("--hero-eyebrow-font-size", "字号 (vw)", 0.5, 3, 0.1, "vw", "0.6rem", "1.5rem", "--hero-eyebrow-font-size-mobile"),
        rangeField("--hero-eyebrow-margin-bottom", "下边距", 0, 40, 1, "px", "--hero-eyebrow-margin-bottom-mobile"),
        rangeField("--hero-eyebrow-letter-spacing", "字间距", 0, 0.5, 0.01, "em", "--hero-eyebrow-letter-spacing-mobile"),
      ]),
      group("容器与效果", [
        selectField("--hero-text-align", "水平对齐", alignOptions),
        rangeField("--hero-vertical-offset", "垂直偏移", -200, 200, 1, "px"),
        textField("--hero-text-shadow", "文字阴影"),
      ]),
      group("其他模块标题", [
        clampField("--home-frame-heading-size", "研究亮点标题 (vw)", 2, 8, 0.1, "vw", "3rem", "5.7rem", "--home-frame-heading-size-mobile"),
        clampField("--news-heading-size", "新闻标题 (vw)", 2, 8, 0.1, "vw", "3rem", "5.7rem", "--news-heading-size-mobile"),
        clampField("--home-bento-heading-size", "快速导航标题 (vw)", 2, 8, 0.1, "vw", "3rem", "5.7rem", "--home-bento-heading-size-mobile"),
        clampField("--section-kicker-font-size", "小标签字号 (vw)", 0.5, 2.5, 0.05, "vw", "0.8rem", "1.2rem"),
      ]),
      group("快速导航卡片", [
        clampField("--home-bento-card-title-font-size", "卡片标题 (vw)", 1, 5, 0.1, "vw", "2rem", "4.25rem", "--home-bento-card-title-font-size-mobile"),
        clampField("--home-bento-card-text-font-size", "卡片描述 (vw)", 0.5, 2, 0.05, "vw", "0.8rem", "1.1rem", "--home-bento-card-text-font-size-mobile"),
      ]),
    ],
  },
  profile: {
    contentGroupTitles: {
      intro: "页面标题",
      research: "研究内容",
      experience: "学习工作经历",
      selectedWork: "代表论文",
      appointments: "学术任职",
      links: "链接文字",
    },
    contentKeys: {
      intro: [
        ["introKicker", "小标签", false],
        ["introTitle", "标题", false],
      ],
      research: [
        ["researchKicker", "小标签", false],
        ["researchTitle", "标题", false],
      ],
      experience: [
        ["experienceKicker", "小标签", false],
        ["experienceTitle", "标题", false],
      ],
      selectedWork: [
        ["selectedWorkKicker", "小标签", false],
        ["selectedWorkTitle", "标题", false],
      ],
      appointments: [
        ["appointmentsKicker", "小标签", false],
        ["appointmentsTitle", "标题", false],
      ],
      links: [
        ["detailsSee", "前缀文字", false],
        ["allResults", "链接文字", false],
      ],
    },
    cssGroups: [
      group("页面大标题", [
        clampField("--profile-intro-title-size", "字号 (vw)", 2, 8, 0.1, "vw", "2.8rem", "5rem", "--profile-intro-title-size-mobile"),
        rangeField("--profile-intro-title-line-height", "行高", 0.9, 1.6, 0.01, ""),
        rangeField("--profile-intro-title-letter-spacing", "字间距", -0.05, 0.2, 0.001, "em"),
        colorField("--profile-intro-title-color", "颜色"),
      ]),
      group("Section 小标签", [
        clampField("--profile-kicker-font-size", "字号 (vw)", 0.5, 2.5, 0.05, "vw", "0.8rem", "1.2rem", "--profile-kicker-font-size-mobile"),
        rangeField("--profile-kicker-letter-spacing", "字间距", 0, 0.5, 0.01, "em"),
        colorField("--profile-kicker-color", "颜色"),
        rangeField("--profile-kicker-margin-bottom", "下边距", 0, 40, 1, "px"),
      ]),
      group("Section 标题", [
        clampField("--profile-title-font-size", "字号 (vw)", 2, 8, 0.1, "vw", "2.2rem", "4rem", "--profile-title-font-size-mobile"),
        rangeField("--profile-title-line-height", "行高", 0.9, 1.6, 0.01, ""),
        rangeField("--profile-title-letter-spacing", "字间距", -0.05, 0.2, 0.001, "em"),
        colorField("--profile-title-color", "颜色"),
      ]),
      group("容器与间距", [
        rangeField("--profile-section-padding", "Section 上下间距", 20, 200, 1, "px", "--profile-section-padding-mobile"),
        rangeField("--profile-first-section-padding-top", "首 Section 上间距", 40, 240, 1, "px", "--profile-first-section-padding-top-mobile"),
        rangeField("--profile-bio-font-size", "简介正文字号", 0.8, 2, 0.05, "rem"),
        rangeField("--profile-bio-line-height", "简介正文行高", 1.2, 2.5, 0.05, ""),
      ]),
    ],
  },
  results: {
    contentGroupTitles: {
      papers: "全部论文",
      patents: "专利",
      projects: "项目",
    },
    contentKeys: {
      papers: [
        ["allPapersKicker", "小标签", false],
        ["allPublications", "标题", false],
      ],
      patents: [
        ["patentsKicker", "小标签", false],
        ["patents", "标题", false],
      ],
      projects: [
        ["projectsKicker", "小标签", false],
        ["projects", "标题", false],
      ],
    },
    cssGroups: [
      group("Section 小标签", [
        clampField("--results-kicker-font-size", "字号 (vw)", 0.5, 2.5, 0.05, "vw", "0.8rem", "1.2rem", "--results-kicker-font-size-mobile"),
        rangeField("--results-kicker-letter-spacing", "字间距", 0, 0.5, 0.01, "em"),
        colorField("--results-kicker-color", "颜色"),
        rangeField("--results-kicker-margin-bottom", "下边距", 0, 40, 1, "px"),
      ]),
      group("Section 标题", [
        clampField("--results-title-font-size", "字号 (vw)", 2, 8, 0.1, "vw", "2.2rem", "4rem", "--results-title-font-size-mobile"),
        rangeField("--results-title-line-height", "行高", 0.9, 1.6, 0.01, ""),
        rangeField("--results-title-letter-spacing", "字间距", -0.05, 0.2, 0.001, "em"),
        colorField("--results-title-color", "颜色"),
      ]),
      group("容器与间距", [
        rangeField("--results-section-padding", "Section 上下间距", 20, 200, 1, "px", "--results-section-padding-mobile"),
        rangeField("--results-first-section-padding-top", "首 Section 上间距", 40, 240, 1, "px", "--results-first-section-padding-top-mobile"),
        rangeField("--results-list-gap", "列表项间距", 8, 48, 1, "px"),
      ]),
    ],
  },
  honors: {
    contentGroupTitles: {
      awards: "奖励",
      innovation: "创新创业",
    },
    contentKeys: {
      awards: [
        ["awardsKicker", "小标签", false],
        ["awards", "标题", false],
      ],
      innovation: [
        ["innovationKicker", "小标签", false],
        ["innovation", "标题", false],
      ],
    },
    cssGroups: [
      group("Section 小标签", [
        clampField("--honors-kicker-font-size", "字号 (vw)", 0.5, 2.5, 0.05, "vw", "0.8rem", "1.2rem", "--honors-kicker-font-size-mobile"),
        rangeField("--honors-kicker-letter-spacing", "字间距", 0, 0.5, 0.01, "em"),
        colorField("--honors-kicker-color", "颜色"),
        rangeField("--honors-kicker-margin-bottom", "下边距", 0, 40, 1, "px"),
      ]),
      group("Section 标题", [
        clampField("--honors-title-font-size", "字号 (vw)", 2, 8, 0.1, "vw", "2.2rem", "4rem", "--honors-title-font-size-mobile"),
        rangeField("--honors-title-line-height", "行高", 0.9, 1.6, 0.01, ""),
        rangeField("--honors-title-letter-spacing", "字间距", -0.05, 0.2, 0.001, "em"),
        colorField("--honors-title-color", "颜色"),
      ]),
      group("容器与间距", [
        rangeField("--honors-section-padding", "Section 上下间距", 20, 200, 1, "px", "--honors-section-padding-mobile"),
        rangeField("--honors-first-section-padding-top", "首 Section 上间距", 40, 240, 1, "px", "--honors-first-section-padding-top-mobile"),
        rangeField("--honors-list-gap", "列表项间距", 8, 48, 1, "px"),
      ]),
    ],
  },
  activities: {
    contentGroupTitles: {
      talks: "国内外会议",
      service: "学术服务",
      reviews: "审稿服务",
    },
    contentKeys: {
      talks: [
        ["talksKicker", "小标签", false],
        ["conferenceTalks", "标题", false],
      ],
      service: [
        ["serviceKicker", "小标签", false],
        ["service", "标题", false],
      ],
      reviews: [
        ["reviewsKicker", "小标签", false],
        ["reviews", "标题", false],
      ],
    },
    cssGroups: [
      group("Section 小标签", [
        clampField("--activities-kicker-font-size", "字号 (vw)", 0.5, 2.5, 0.05, "vw", "0.8rem", "1.2rem", "--activities-kicker-font-size-mobile"),
        rangeField("--activities-kicker-letter-spacing", "字间距", 0, 0.5, 0.01, "em"),
        colorField("--activities-kicker-color", "颜色"),
        rangeField("--activities-kicker-margin-bottom", "下边距", 0, 40, 1, "px"),
      ]),
      group("Section 标题", [
        clampField("--activities-title-font-size", "字号 (vw)", 2, 8, 0.1, "vw", "2.2rem", "4rem", "--activities-title-font-size-mobile"),
        rangeField("--activities-title-line-height", "行高", 0.9, 1.6, 0.01, ""),
        rangeField("--activities-title-letter-spacing", "字间距", -0.05, 0.2, 0.001, "em"),
        colorField("--activities-title-color", "颜色"),
      ]),
      group("容器与间距", [
        rangeField("--activities-section-padding", "Section 上下间距", 20, 200, 1, "px", "--activities-section-padding-mobile"),
        rangeField("--activities-first-section-padding-top", "首 Section 上间距", 40, 240, 1, "px", "--activities-first-section-padding-top-mobile"),
        rangeField("--activities-list-gap", "列表项间距", 8, 48, 1, "px"),
      ]),
    ],
  },
};

const elStatus = document.getElementById("status");
const elForm = document.getElementById("editor-form");
const elPreview = document.getElementById("preview-frame");
const btnSave = document.getElementById("btn-save");
const btnReset = document.getElementById("btn-reset");
const btnReload = document.getElementById("btn-reload-preview");
const langButtons = document.querySelectorAll("[data-preview-lang]");
const pageSelect = document.getElementById("page-select");

function getCurrentPage() {
  return pages.find((p) => p.id === currentPageId) || pages[0];
}

function getCurrentSchema() {
  return pageSchemas[currentPageId] || pageSchemas.home;
}

function updatePreviewHint() {
  const hint = document.getElementById("preview-hint");
  if (!hint) return;
  const page = getCurrentPage();
  hint.textContent = `${page.label} ${page.file}`;
}

function setStatus(message, type = "info") {
  if (!elStatus) return;
  elStatus.textContent = message;
  elStatus.dataset.type = type;
  window.clearTimeout(elStatus._timer);
  if (message) {
    elStatus._timer = window.setTimeout(() => {
      elStatus.textContent = "";
      elStatus.dataset.type = "info";
    }, 4000);
  }
}

async function api(path, options = {}) {
  const res = await fetch(path, { ...options, headers: { Accept: "application/json", ...(options.headers || {}) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.message || `请求失败 (${res.status})`);
  }
  return data;
}

/* ═══════════════════════════════════════════════════════════════
   CSS 解析与构建
   ═══════════════════════════════════════════════════════════════ */

function parseCssVariables(css) {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const rootMatch = noComments.match(/:root\s*\{([^}]+)\}/s);
  const vars = {};
  if (rootMatch) {
    rootMatch[1].split(";").forEach((part) => {
      const colonIndex = part.indexOf(":");
      if (colonIndex === -1) return;
      const name = part.slice(0, colonIndex).trim();
      const value = part.slice(colonIndex + 1).trim();
      if (name.startsWith("--")) vars[name] = value;
    });
  }
  return vars;
}

function buildCss(variables) {
  return originalCss.replace(/:root\s*\{([^}]+)\}/s, (match, content) => {
    let newContent = content;
    Object.entries(variables).forEach(([name, value]) => {
      const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedName}\\s*:\\s*)[^;]+`, "g");
      newContent = newContent.replace(regex, `$1${value}`);
    });
    return `:root {${newContent}}`;
  });
}

function parseClamp(value) {
  const match = String(value).match(/clamp\(([^,]+),\s*([\d.]+)([a-z%]+),\s*([^)]+)\)/i);
  if (!match) return null;
  return { min: match[1].trim(), value: parseFloat(match[2]), unit: match[3], max: match[4].trim() };
}

function buildClamp(value, field) {
  return `clamp(${field.clampMin}, ${value}${field.preferredUnit}, ${field.clampMax})`;
}

/* ═══════════════════════════════════════════════════════════════
   文案内容解析与构建
   ═══════════════════════════════════════════════════════════════ */

function parsePageContent(js) {
  // 优先解析 window.PAGE_CONTENT；首页历史文件可能只定义 window.HOME_CONTENT
  let match = js.match(/window\.PAGE_CONTENT\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    match = js.match(/window\.HOME_CONTENT\s*=\s*(\{[\s\S]*?\});/);
  }
  if (!match) return { zh: {}, en: {} };
  try {
    return new Function(`return ${match[1]};`)();
  } catch {
    return { zh: {}, en: {} };
  }
}

function buildPageContent(page, content) {
  const pageLabel = page.label;
  const varName = page.contentVar;
  const body = JSON.stringify(content, null, 2);
  if (page.id === "home") {
    return `/**\n * home-content.js — 首页各模块文案配置\n * 通过 hero-editor.html 读取/编辑。\n * 加载后会被 script.js 的 applyLanguage 读取，覆盖 translations 中的对应键。\n */\nwindow.HOME_CONTENT = ${body};\nwindow.PAGE_CONTENT = window.HOME_CONTENT;\n`;
  }
  return `/**\n * ${page.id}-content.js — ${pageLabel}页文案配置\n * 通过 hero-editor.html 读取/编辑。\n * 加载后会被 script.js 的 applyLanguage 读取，覆盖 translations 中的对应键。\n */\nwindow.${varName} = ${body};\n`;
}

/* ═══════════════════════════════════════════════════════════════
   表单渲染
   ═══════════════════════════════════════════════════════════════ */

function createLabel(text, htmlFor) {
  const label = document.createElement("label");
  label.htmlFor = htmlFor;
  label.textContent = text;
  return label;
}

function createRangeControl(field, value, activeName) {
  const name = activeName || field.name;
  const wrapper = document.createElement("div");
  wrapper.className = "range-control";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = field.min;
  slider.max = field.max;
  slider.step = field.step;
  slider.value = value;
  slider.dataset.var = name;
  slider.dataset.control = "range";
  slider.className = "slider";

  const number = document.createElement("input");
  number.type = "number";
  number.min = field.min;
  number.max = field.max;
  number.step = field.step;
  number.value = value;
  number.dataset.var = name;
  number.dataset.control = "number";
  number.className = "number-input";

  const unit = document.createElement("span");
  unit.className = "unit";
  unit.textContent = field.unit || "";

  slider.addEventListener("input", () => {
    number.value = slider.value;
    handleCssInput(name, slider.value, field);
  });
  number.addEventListener("input", () => {
    slider.value = number.value;
    handleCssInput(name, number.value, field);
  });

  wrapper.appendChild(slider);
  wrapper.appendChild(number);
  wrapper.appendChild(unit);
  return wrapper;
}

function createClampControl(field, value, activeName) {
  const name = activeName || field.name;
  const parsed = parseClamp(value);
  const numericValue = parsed ? parsed.value : parseFloat(value) || (field.min + field.max) / 2;

  const wrapper = document.createElement("div");
  wrapper.className = "clamp-control";

  const rangeWrapper = document.createElement("div");
  rangeWrapper.className = "range-control";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = field.min;
  slider.max = field.max;
  slider.step = field.step;
  slider.value = numericValue;
  slider.dataset.var = name;
  slider.className = "slider";

  const number = document.createElement("input");
  number.type = "number";
  number.min = field.min;
  number.max = field.max;
  number.step = field.step;
  number.value = numericValue;
  number.dataset.var = name;
  number.className = "number-input";

  slider.addEventListener("input", () => {
    number.value = slider.value;
    handleCssInput(name, buildClamp(slider.value, field), field);
  });
  number.addEventListener("input", () => {
    slider.value = number.value;
    handleCssInput(name, buildClamp(number.value, field), field);
  });

  rangeWrapper.appendChild(slider);
  rangeWrapper.appendChild(number);

  const raw = document.createElement("input");
  raw.type = "text";
  raw.value = value;
  raw.dataset.var = name;
  raw.dataset.control = "raw";
  raw.className = "raw-input";
  raw.addEventListener("input", () => handleCssInput(name, raw.value, field));

  const hint = document.createElement("span");
  hint.className = "clamp-hint";
  hint.textContent = `完整值`;

  const rawRow = document.createElement("div");
  rawRow.className = "raw-row";
  rawRow.appendChild(hint);
  rawRow.appendChild(raw);

  wrapper.appendChild(rangeWrapper);
  wrapper.appendChild(rawRow);
  return wrapper;
}

function createSelectControl(field, value, activeName) {
  const name = activeName || field.name;
  const select = document.createElement("select");
  select.dataset.var = name;
  field.options.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.value;
    option.textContent = opt.label;
    if (opt.value === value) option.selected = true;
    select.appendChild(option);
  });
  select.addEventListener("change", () => handleCssInput(name, select.value, field));
  return select;
}

function createTextControl(field, value, activeName) {
  const name = activeName || field.name;
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.dataset.var = name;
  input.addEventListener("input", () => handleCssInput(name, input.value, field));
  return input;
}

function createColorControl(field, value, activeName) {
  const name = activeName || field.name;
  const wrapper = document.createElement("div");
  wrapper.className = "color-control";

  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.dataset.var = name;
  input.className = "color-text";
  input.addEventListener("input", () => {
    preview.style.background = input.value;
    handleCssInput(field.name, input.value, field);
  });

  const preview = document.createElement("span");
  preview.className = "color-preview";
  preview.style.background = value;
  preview.title = value;

  wrapper.appendChild(input);
  wrapper.appendChild(preview);
  return wrapper;
}

function createCssFieldRow(field, value, activeName) {
  const name = activeName || field.name;
  const row = document.createElement("div");
  row.className = "field-row";
  const id = `field-${name.replace(/^--/, "")}`;
  row.appendChild(createLabel(field.label, id));

  let control;
  if (field.type === "range") control = createRangeControl(field, parseFloat(value) || 0, name);
  else if (field.type === "clamp") control = createClampControl(field, value, name);
  else if (field.type === "select") control = createSelectControl(field, value, name);
  else if (field.type === "color") control = createColorControl(field, value, name);
  else control = createTextControl(field, value, name);

  control.id = id;
  row.appendChild(control);
  return row;
}

function renderContentField(lang, key, label, value, multiline) {
  const row = document.createElement("div");
  row.className = "field-row";
  const id = `content-${lang}-${key}`;
  row.appendChild(createLabel(`${label}（${lang === "zh" ? "中" : "EN"）`, id));

  const input = document.createElement(multiline ? "textarea" : "input");
  if (!multiline) input.type = "text";
  input.id = id;
  input.dataset.contentLang = lang;
  input.dataset.contentKey = key;
  input.value = value;
  input.className = multiline ? "content-textarea" : "content-input";
  input.addEventListener("input", () => {
    currentContent[lang][key] = input.value;
    schedulePreviewUpdate();
  });

  row.appendChild(input);
  return row;
}

function renderForm() {
  elForm.innerHTML = "";
  const schema = getCurrentSchema();

  // 各模块文案组
  Object.entries(schema.contentKeys).forEach(([groupKey, keys]) => {
    const contentGroup = document.createElement("fieldset");
    contentGroup.className = "editor-group";
    const contentLegend = document.createElement("legend");
    contentLegend.textContent = schema.contentGroupTitles[groupKey] || groupKey;
    contentGroup.appendChild(contentLegend);

    keys.forEach(([key, label, multiline]) => {
      contentGroup.appendChild(renderContentField("zh", key, `${label}（中）`, currentContent.zh[key] || "", multiline));
      contentGroup.appendChild(renderContentField("en", key, `${label}（EN）`, currentContent.en[key] || "", multiline));
    });

    elForm.appendChild(contentGroup);
  });

  const hint = document.createElement("p");
  hint.className = "editor-hint";
  hint.innerHTML = "提示：主标题输入多行文字即可分行显示；修改后右侧预览实时更新，点右上角「EN」可切换查看英文效果。";
  elForm.appendChild(hint);

  // 桌面/手机端切换
  const modeToggle = document.createElement("div");
  modeToggle.className = "mode-toggle";
  const modeLabel = document.createElement("span");
  modeLabel.textContent = "样式适配：";
  modeToggle.appendChild(modeLabel);
  ["desktop", "mobile"].forEach((mode) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `mode-btn ${editorMode === mode ? "active" : ""}`;
    btn.textContent = mode === "desktop" ? "桌面端" : "手机端";
    btn.addEventListener("click", () => {
      editorMode = mode;
      renderForm();
      updatePreviewModeClass();
      updatePreview();
    });
    modeToggle.appendChild(btn);
  });
  elForm.appendChild(modeToggle);

  // CSS 变量组
  schema.cssGroups.forEach((group) => {
    const fields = editorMode === "mobile" ? group.fields.filter((f) => f.mobileName) : group.fields;
    if (fields.length === 0) return;

    const section = document.createElement("fieldset");
    section.className = "editor-group";
    const legend = document.createElement("legend");
    legend.textContent = group.title;
    section.appendChild(legend);

    fields.forEach((field) => {
      const activeName = editorMode === "mobile" && field.mobileName ? field.mobileName : field.name;
      const value = currentCssVars[activeName] ?? "";
      section.appendChild(createCssFieldRow(field, value, activeName));
    });

    elForm.appendChild(section);
  });
}

/* ═══════════════════════════════════════════════════════════════
   事件处理与预览
   ═══════════════════════════════════════════════════════════════ */

function handleCssInput(name, value, field) {
  currentCssVars[name] = value;
  syncRelatedControls(name, value, field);
  schedulePreviewUpdate();
}

function syncRelatedControls(name, value, field) {
  const rows = elForm.querySelectorAll(`[data-var="${name}"]`);
  rows.forEach((el) => {
    if (field.type === "clamp") {
      const parsed = parseClamp(value);
      if (!parsed) return;
      if (el.dataset.control === "raw") {
        el.value = value;
      } else {
        el.value = parsed.value;
      }
    }
  });
}

function schedulePreviewUpdate() {
  window.clearTimeout(updateTimer);
  updateTimer = window.setTimeout(updatePreview, 80);
}

function updatePreviewModeClass() {
  if (!elPreview) return;
  elPreview.classList.toggle("mobile-preview", editorMode === "mobile");
}

function updatePreview() {
  const css = buildCss(currentCssVars);
  injectCssIntoPreview(css);
  injectContentIntoPreview();
}

function injectCssIntoPreview(css) {
  if (!elPreview || !elPreview.contentDocument) return;
  const doc = elPreview.contentDocument;
  let style = doc.getElementById("hero-editor-live-style");
  if (!style) {
    style = doc.createElement("style");
    style.id = "hero-editor-live-style";
    doc.head.appendChild(style);
  }
  style.textContent = css;
}

function injectContentIntoPreview() {
  if (!elPreview || !elPreview.contentWindow) return;
  const win = elPreview.contentWindow;
  const page = getCurrentPage();
  // 首页同时注入 HOME_CONTENT 与 PAGE_CONTENT 以保持兼容；其他页面注入 PAGE_CONTENT
  if (page.id === "home") {
    win.HOME_CONTENT = JSON.parse(JSON.stringify(currentContent));
    win.PAGE_CONTENT = win.HOME_CONTENT;
  } else {
    win.PAGE_CONTENT = JSON.parse(JSON.stringify(currentContent));
  }
  if (typeof win.applyLanguage === "function") {
    win.applyLanguage();
  }
}

function switchPreviewLang(lang) {
  previewLang = lang;
  langButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.previewLang === lang));
  if (!elPreview || !elPreview.contentWindow) return;
  try {
    elPreview.contentWindow.localStorage.setItem("academicSiteLanguage", lang);
    elPreview.contentWindow.location.reload();
  } catch {
    // 忽略跨域或安全限制
  }
}

/* ═══════════════════════════════════════════════════════════════
   加载与保存
   ═══════════════════════════════════════════════════════════════ */

async function loadConfig() {
  setStatus("正在加载配置...");
  const page = getCurrentPage();
  try {
    const [cssData, contentData] = await Promise.all([
      api(`/api/read-file?path=${encodeURIComponent(page.cssPath)}`),
      api(`/api/read-file?path=${encodeURIComponent(page.contentPath)}`),
    ]);
    originalCss = cssData.content;
    currentCssVars = parseCssVariables(originalCss);
    originalContent = parsePageContent(contentData.content);
    currentContent = JSON.parse(JSON.stringify(originalContent));
    renderForm();
    updatePreview();
    updatePreviewHint();
    setStatus(`${page.label} 配置已加载`, "success");
  } catch (error) {
    setStatus(`加载失败：${error.message}`, "error");
  }
}

async function saveConfig() {
  setStatus("正在保存...");
  const page = getCurrentPage();
  const css = buildCss(currentCssVars);
  const contentJs = buildPageContent(page, currentContent);
  try {
    await Promise.all([
      api("/api/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: page.cssPath, content: css }),
      }),
      api("/api/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: page.contentPath, content: contentJs }),
      }),
    ]);
    originalCss = css;
    originalContent = JSON.parse(JSON.stringify(currentContent));
    setStatus(`${page.label} 已保存`, "success");
  } catch (error) {
    setStatus(`保存失败：${error.message}`, "error");
  }
}

function reloadPreview() {
  if (!elPreview) return;
  const page = getCurrentPage();
  elPreview.src = `${page.file}?t=${Date.now()}`;
  elPreview.onload = () => {
    try {
      elPreview.contentWindow.localStorage.setItem("academicSiteLanguage", previewLang);
    } catch {
      // ignore
    }
    updatePreview();
  };
}

function switchPage(pageId) {
  currentPageId = pageId;
  if (pageSelect) pageSelect.value = pageId;
  updatePreviewHint();
  const page = getCurrentPage();
  if (elPreview) {
    elPreview.src = `${page.file}?t=${Date.now()}`;
    elPreview.onload = () => {
      try {
        elPreview.contentWindow.localStorage.setItem("academicSiteLanguage", previewLang);
      } catch {
        // ignore
      }
      loadConfig();
    };
  } else {
    loadConfig();
  }
}

function initPageSelector() {
  if (!pageSelect) return;
  pages.forEach((page) => {
    const option = document.createElement("option");
    option.value = page.id;
    option.textContent = page.label;
    pageSelect.appendChild(option);
  });
  pageSelect.value = currentPageId;
  pageSelect.addEventListener("change", () => switchPage(pageSelect.value));
}

function init() {
  initPageSelector();
  if (btnSave) btnSave.addEventListener("click", saveConfig);
  if (btnReset) btnReset.addEventListener("click", loadConfig);
  if (btnReload) btnReload.addEventListener("click", reloadPreview);
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => switchPreviewLang(btn.dataset.previewLang));
  });
  if (elPreview) {
    elPreview.onload = () => {
      updatePreviewModeClass();
      updatePreview();
    };
  }
  loadConfig();
}

init();
