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
  { id: "loading", label: "加载页", file: "index.html", cssPath: "css/loading-config.css", contentPath: "js/loading-content.js", contentVar: "LOADING_CONTENT" },
  { id: "global", label: "全局 Section", file: "profile.html", cssPath: "css/global-section-config.css", contentPath: null, contentVar: null },
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
        clampField("--hero-title-font-size-zh", "中文标题字号 (vw)", 2, 14, 0.1, "vw", "3rem", "10rem", "--hero-title-font-size-zh-mobile"),
        clampField("--hero-title-font-size-en", "英文标题字号 (vw)", 2, 14, 0.1, "vw", "2.8rem", "10rem", "--hero-title-font-size-en-mobile"),
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
        clampField("--hero-eyebrow-font-size", "字号 (vw)", 0.5, 5, 0.1, "vw", "0.6rem", "2.5rem", "--hero-eyebrow-font-size-mobile"),
        rangeField("--hero-eyebrow-margin-bottom", "下边距", 0, 40, 1, "px", "--hero-eyebrow-margin-bottom-mobile"),
        rangeField("--hero-eyebrow-letter-spacing", "字间距", 0, 0.5, 0.01, "em", "--hero-eyebrow-letter-spacing-mobile"),
      ]),
      group("容器与效果", [
        selectField("--hero-text-align", "水平对齐", alignOptions),
        rangeField("--hero-vertical-offset", "垂直偏移", -200, 200, 1, "px"),
        textField("--hero-text-shadow", "文字阴影"),
      ]),
      group("其他模块标题", [
        clampField("--home-frame-heading-size", "研究亮点标题 (vw)", 2, 12, 0.1, "vw", "2rem", "8rem", "--home-frame-heading-size-mobile"),
        clampField("--news-heading-size", "新闻标题 (vw)", 2, 12, 0.1, "vw", "2rem", "8rem", "--news-heading-size-mobile"),
        clampField("--home-bento-heading-size", "快速导航标题 (vw)", 2, 12, 0.1, "vw", "2rem", "8rem", "--home-bento-heading-size-mobile"),
      ]),
      group("快速导航卡片", [
        clampField("--home-bento-card-title-font-size", "卡片标题 (vw)", 1, 8, 0.1, "vw", "1.5rem", "6rem", "--home-bento-card-title-font-size-mobile"),
        clampField("--home-bento-card-text-font-size", "卡片描述 (vw)", 0.4, 3, 0.05, "vw", "0.7rem", "1.5rem", "--home-bento-card-text-font-size-mobile"),
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
    },
    cssGroups: [
      group("个人名片", [
        rangeField("--profile-card-padding", "卡片内边距", 12, 80, 1, "px", "--profile-card-padding-mobile"),
        rangeField("--profile-card-gap", "照片与简介间距", 12, 120, 1, "px", "--profile-card-gap-mobile"),
        rangeField("--profile-card-min-height", "卡片最小高度", 0, 600, 1, "px", "--profile-card-min-height-mobile"),
        rangeField("--profile-photo-size", "照片尺寸", 80, 320, 1, "px", "--profile-photo-size-mobile"),
        rangeField("--profile-name-size", "姓名字号", 1, 3, 0.05, "rem", "--profile-name-size-mobile"),
        rangeField("--profile-en-name-size", "英文名字号", 0.7, 2, 0.05, "rem", "--profile-en-name-size-mobile"),
      ]),
      group("容器与间距", [
        rangeField("--profile-first-section-gap", "首 Section 与后续间距", 0, 300, 1, "px", "--profile-first-section-gap-mobile"),
      ]),
      group("名片文字", [
        rangeField("--profile-bio-font-size", "简介正文字号", 0.7, 3, 0.05, "rem", "--profile-bio-font-size-mobile"),
        rangeField("--profile-bio-line-height", "简介正文行高", 1.2, 2.5, 0.05, "", "--profile-bio-line-height-mobile"),
      ]),
      group("研究内容卡片", [
        (() => {
          const f = rangeField("--profile-research-gap-mobile", "卡片间距（手机端）", 4, 80, 1, "px");
          f.mobileOnly = true;
          return f;
        })(),
      ]),
      group("代表论文卡片", [
        rangeField("--profile-publication-title-font-size", "英文标题字号", 0.7, 2.5, 0.01, "rem", "--profile-publication-title-font-size-mobile"),
        rangeField("--profile-publication-subtitle-font-size", "中文标题字号", 0.6, 1.5, 0.01, "rem", "--profile-publication-subtitle-font-size-mobile"),
        rangeField("--profile-publication-authors-font-size", "作者名字号", 0.6, 1.5, 0.01, "rem", "--profile-publication-authors-font-size-mobile"),
        rangeField("--profile-publication-meta-font-size", "期刊年份字号", 0.6, 1.5, 0.01, "rem", "--profile-publication-meta-font-size-mobile"),
        rangeField("--profile-publication-meta-gap", "期刊与 PDF 间距", 0, 60, 1, "px", "--profile-publication-meta-pdf-gap-mobile"),
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
      group("容器与间距", [
        rangeField("--results-first-section-gap", "首 Section 与后续间距", 0, 300, 1, "px", "--results-first-section-gap-mobile"),
      ]),
      group("论文卡片", [
        rangeField("--results-publication-padding-top", "上边距", 0, 120, 1, "px", "--results-publication-padding-top-mobile"),
        rangeField("--results-publication-padding-bottom", "下边距", 0, 120, 1, "px", "--results-publication-padding-bottom-mobile"),
        rangeField("--results-publication-title-font-size", "英文标题字号", 0.7, 2.5, 0.01, "rem", "--results-publication-title-font-size-mobile"),
        rangeField("--results-publication-subtitle-font-size", "中文标题字号", 0.6, 1.5, 0.01, "rem", "--results-publication-subtitle-font-size-mobile"),
        rangeField("--results-publication-authors-font-size", "作者名字号", 0.6, 1.5, 0.01, "rem", "--results-publication-authors-font-size-mobile"),
        rangeField("--results-publication-meta-font-size", "期刊年份字号", 0.6, 1.5, 0.01, "rem", "--results-publication-meta-font-size-mobile"),
        rangeField("--results-publication-meta-gap", "期刊与 PDF 间距", 0, 60, 1, "px", "--results-publication-meta-pdf-gap-mobile"),
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
      group("容器与间距", [
        rangeField("--honors-first-section-gap", "首 Section 与后续间距", 0, 300, 1, "px", "--honors-first-section-gap-mobile"),
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
    cssGroups: [],
  },
  global: {
    contentGroupTitles: {},
    contentKeys: {},
    cssGroups: [
      group("Section 小标签", [
        clampField("--global-section-kicker-font-size", "字号 (vw)", 0.3, 4, 0.05, "vw", "0.5rem", "2rem", "--global-section-kicker-font-size-mobile"),
        rangeField("--global-section-kicker-letter-spacing", "字间距", 0, 0.5, 0.01, "em", "--global-section-kicker-letter-spacing-mobile"),
        colorField("--global-section-kicker-color", "颜色"),
        rangeField("--global-section-kicker-margin-bottom", "下边距", 0, 40, 1, "px", "--global-section-kicker-margin-bottom-mobile"),
      ]),
      group("Section 标题", [
        clampField("--global-section-title-font-size", "字号 (vw)", 1.5, 10, 0.1, "vw", "1.5rem", "6rem", "--global-section-title-font-size-mobile"),
        rangeField("--global-section-title-line-height", "行高", 0.9, 1.6, 0.01, ""),
        rangeField("--global-section-title-letter-spacing", "字间距", -0.05, 0.2, 0.001, "em"),
        colorField("--global-section-title-color", "颜色"),
      ]),
      group("容器与间距", [
        rangeField("--global-section-padding", "Section 上下间距", 10, 300, 1, "px", "--global-section-padding-mobile"),
        rangeField("--global-first-section-padding-top", "首 Section 上间距", 20, 320, 1, "px", "--global-first-section-padding-top-mobile"),
        rangeField("--global-section-heading-gap", "标题与内容间距", 0, 120, 1, "px", "--global-section-heading-gap-mobile"),
        rangeField("--global-list-gap", "列表项间距", 4, 80, 1, "px", "--global-list-gap-mobile"),
      ]),
    ],
  },
  loading: {
    contentGroupTitles: {
      greeting: "加载文案",
      animation: "手写文字动画",
    },
    contentKeys: {
      greeting: [
        ["greeting", "欢迎语", false, true],
      ],
      animation: [
        ["words", "单词列表（逗号分隔）", false, true],
        ["presets", "配色预设（逗号分隔）", false, true],
        ["interval", "切换间隔（毫秒）", false, true],
        ["duration", "单次绘制时长（秒）", false, true],
        ["erase", "启用擦除效果", false, true, "boolean"],
        ["strokeWidth", "描边宽度", false, true],
        ["brightness", "亮度", false, true],
        ["saturation", "饱和度", false, true],
      ],
    },
    cssGroups: [
      group("遮罩层", [
        textField("--loading-overlay-bg", "背景渐变"),
        rangeField("--loading-overlay-backdrop-blur", "背景模糊", 0, 40, 1, "px"),
        rangeField("--loading-overlay-backdrop-saturate", "饱和度", 0.5, 3, 0.05, ""),
      ]),
      group("内容卡片", [
        textField("--loading-card-width", "卡片宽度"),
        rangeField("--loading-card-gap", "内容间距", 0, 60, 1, "px", "--loading-card-gap-mobile"),
        textField("--loading-card-padding", "内边距"),
      ]),
      group("手写文字", [
        textField("--loading-letters-width", "容器宽度"),
        rangeField("--loading-letters-height", "容器高度", 40, 240, 1, "px", "--loading-letters-height-mobile"),
        textField("--loading-letters-margin", "外边距"),
      ]),
      group("百分比数字", [
        colorField("--loading-percent-color", "颜色"),
        clampField("--loading-percent-font-size", "字号 (vw)", 1, 10, 0.1, "vw", "1.5rem", "8rem", "--loading-percent-font-size-mobile"),
        rangeField("--loading-percent-margin-top", "上边距", 0, 80, 1, "px"),
        textField("--loading-percent-text-shadow", "文字阴影"),
      ]),
      group("进度条", [
        rangeField("--loading-track-height", "轨道高度", 4, 40, 1, "px", "--loading-track-height-mobile"),
        textField("--loading-track-bg", "轨道背景"),
        rangeField("--loading-track-margin-top", "轨道上边距", 0, 80, 1, "px"),
        textField("--loading-bar-bg", "填充渐变"),
        textField("--loading-bar-shadow", "填充阴影"),
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
  // 优先解析 window.PAGE_CONTENT；首页历史文件可能只定义 window.HOME_CONTENT；加载页定义 window.LOADING_CONTENT
  let match = js.match(/window\.PAGE_CONTENT\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    match = js.match(/window\.HOME_CONTENT\s*=\s*(\{[\s\S]*?\});/);
  }
  if (!match) {
    match = js.match(/window\.LOADING_CONTENT\s*=\s*(\{[\s\S]*?\});/);
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
  if (page.id === "loading") {
    return `/**\n * loading-content.js — 站点加载遮罩文案与动画配置\n * 通过 hero-editor.html 读取/编辑。\n * 所有页面共用同一套加载页配置。\n */\nwindow.${varName} = ${body};\n`;
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

  // 使用 text 而非 number，避免输入小数点时被浏览器提前解析截断
  const number = document.createElement("input");
  number.type = "text";
  number.inputMode = "decimal";
  number.pattern = "[-+]?[0-9]*\\.?[0-9]*";
  number.value = value;
  number.dataset.var = name;
  number.dataset.control = "number";
  number.className = "number-input";

  const unit = document.createElement("span");
  unit.className = "unit";
  unit.textContent = field.unit || "";

  function toCssValue(raw) {
    const num = parseFloat(raw);
    if (Number.isNaN(num)) return null;
    const clamped = Math.max(field.min, Math.min(field.max, num));
    return field.unit ? `${clamped}${field.unit}` : String(clamped);
  }

  slider.addEventListener("input", () => {
    const cssValue = toCssValue(slider.value);
    if (!cssValue) return;
    number.value = parseFloat(slider.value);
    handleCssInput(name, cssValue, field);
  });
  number.addEventListener("input", () => {
    const cssValue = toCssValue(number.value);
    if (!cssValue) return;
    slider.value = parseFloat(number.value);
    handleCssInput(name, cssValue, field);
  });
  number.addEventListener("blur", () => {
    const num = parseFloat(number.value);
    if (!Number.isNaN(num)) {
      number.value = num;
    }
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

  // 使用 text 而非 number，避免输入小数点时被浏览器提前解析截断
  const number = document.createElement("input");
  number.type = "text";
  number.inputMode = "decimal";
  number.pattern = "[-+]?[0-9]*\\.?[0-9]*";
  number.value = numericValue;
  number.dataset.var = name;
  number.className = "number-input";

  function toSliderNumber(raw) {
    const num = parseFloat(raw);
    if (Number.isNaN(num)) return null;
    return Math.max(field.min, Math.min(field.max, num));
  }

  slider.addEventListener("input", () => {
    const num = toSliderNumber(slider.value);
    if (num === null) return;
    number.value = num;
    handleCssInput(name, buildClamp(num, field), field);
  });
  number.addEventListener("input", () => {
    const num = toSliderNumber(number.value);
    if (num === null) return;
    slider.value = num;
    handleCssInput(name, buildClamp(num, field), field);
  });
  number.addEventListener("blur", () => {
    const num = parseFloat(number.value);
    if (!Number.isNaN(num)) {
      number.value = num;
    }
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

function renderContentField(lang, key, label, value, multiline, shared, fieldType) {
  const row = document.createElement("div");
  row.className = "field-row";
  const id = shared ? `content-shared-${key}` : `content-${lang}-${key}`;
  row.appendChild(createLabel(shared ? label : `${label}（${lang === "zh" ? "中" : "EN"}）`, id));

  let input;
  if (fieldType === "boolean") {
    const wrapper = document.createElement("label");
    wrapper.className = "boolean-control";
    input = document.createElement("input");
    input.type = "checkbox";
    input.checked = String(value).trim().toLowerCase() === "true";
    const span = document.createElement("span");
    span.textContent = input.checked ? "开启" : "关闭";
    input.addEventListener("change", () => {
      span.textContent = input.checked ? "开启" : "关闭";
    });
    wrapper.appendChild(input);
    wrapper.appendChild(span);
    row.appendChild(wrapper);
    input.id = id;
    if (shared) {
      input.dataset.contentShared = "true";
    } else {
      input.dataset.contentLang = lang;
    }
    input.dataset.contentKey = key;
    input.dataset.contentType = "boolean";
    input.addEventListener("change", () => {
      if (shared) {
        currentContent.shared = currentContent.shared || {};
        currentContent.shared[key] = input.checked ? "true" : "false";
      } else {
        currentContent[lang][key] = input.checked ? "true" : "false";
      }
      schedulePreviewUpdate();
    });
    return row;
  }

  input = document.createElement(multiline ? "textarea" : "input");
  if (!multiline) input.type = "text";
  input.id = id;
  if (shared) {
    input.dataset.contentShared = "true";
  } else {
    input.dataset.contentLang = lang;
  }
  input.dataset.contentKey = key;
  input.value = value;
  input.className = multiline ? "content-textarea" : "content-input";
  input.addEventListener("input", () => {
    if (shared) {
      currentContent.shared = currentContent.shared || {};
      currentContent.shared[key] = input.value;
    } else {
      currentContent[lang][key] = input.value;
    }
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

    keys.forEach(([key, label, multiline, shared, fieldType]) => {
      if (shared) {
        const sharedValue = (currentContent.shared && currentContent.shared[key]) || "";
        contentGroup.appendChild(renderContentField("shared", key, label, sharedValue, multiline, true, fieldType));
      } else {
        contentGroup.appendChild(renderContentField("zh", key, label, currentContent.zh[key] || "", multiline, false, fieldType));
        contentGroup.appendChild(renderContentField("en", key, label, currentContent.en[key] || "", multiline, false, fieldType));
      }
    });

    elForm.appendChild(contentGroup);
  });

  const hint = document.createElement("p");
  hint.className = "editor-hint";
  if (currentPageId === "loading") {
    hint.innerHTML = "提示：加载页配置为全站共用；右侧预览会冻结加载遮罩以便调整样式与动画。";
  } else if (currentPageId === "global") {
    hint.innerHTML = "提示：全局 Section 样式会同步影响 profile / results / honors / activities 四页以及首页 Section 小标签；右侧预览使用个人简介页。";
  } else {
    hint.innerHTML = "提示：主标题输入多行文字即可分行显示；修改后右侧预览实时更新，点右上角「EN」可切换查看英文效果。";
  }
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
    const fields = editorMode === "mobile"
      ? group.fields.filter((f) => f.mobileName && !f.desktopOnly)
      : group.fields.filter((f) => !f.mobileOnly);
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
      } else if (el !== document.activeElement) {
        // 正在输入的数字框不同步，避免小数点被吞掉
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
  // 全局 Section 仅调整样式，不覆盖页面文案
  if (page.id === "global") return;
  // 首页同时注入 HOME_CONTENT 与 PAGE_CONTENT 以保持兼容；其他页面注入 PAGE_CONTENT
  if (page.id === "home") {
    win.HOME_CONTENT = JSON.parse(JSON.stringify(currentContent));
    win.PAGE_CONTENT = win.HOME_CONTENT;
  } else if (page.id === "loading") {
    win.LOADING_CONTENT = JSON.parse(JSON.stringify(currentContent));
    if (typeof win.showLoadingPreview === "function") {
      win.showLoadingPreview();
    }
    return;
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
    const requests = [api(`/api/read-file?path=${encodeURIComponent(page.cssPath)}`)];
    if (page.contentPath) {
      requests.push(api(`/api/read-file?path=${encodeURIComponent(page.contentPath)}`));
    }
    const [cssData, contentData] = await Promise.all(requests);
    originalCss = cssData.content;
    currentCssVars = parseCssVariables(originalCss);
    originalContent = page.contentPath ? parsePageContent(contentData.content) : { zh: {}, en: {} };
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
  const contentJs = page.contentPath ? buildPageContent(page, currentContent) : null;
  try {
    const requests = [
      api("/api/save-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: page.cssPath, content: css }),
      }),
    ];
    if (page.contentPath) {
      requests.push(
        api("/api/save-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: page.contentPath, content: contentJs }),
        })
      );
    }
    await Promise.all(requests);
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
