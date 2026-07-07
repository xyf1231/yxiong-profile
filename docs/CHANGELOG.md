# 更新日志

## v1.10.53 - 2026-07-07
- 类型：修复
- 变更：修复 profile 页移动端「研究内容」三卡片间距不跟随全局列表间距变化的问题。`css/styles.css` 中 `.section-wrap#research .feature-grid { gap: clamp(...) !important; }` 与 `css/profile-config.css` 原选择器特异性相同且都使用 `!important`，导致原配置未能稳定覆盖。将 profile-config.css 中的选择器提升为 `.profile-page .section-wrap#research .feature-grid`（特异性更高），确保 `--profile-list-gap` / `--profile-list-gap-mobile` 生效。
- 检查：`python3 scripts/check_braces.py css/profile-config.css` 与 `node scripts/check-site.mjs` 通过（v1.10.53）
- 部署：未部署

## v1.10.52 - 2026-07-07
- 类型：调整
- 变更：明确 profile 页「研究内容」三个卡片（`.feature-grid` / `#research-list`）也纳入全局列表间距控制。已在 `css/profile-config.css` 的列表间距选择器中显式添加 `#research-list.feature-grid`，与 `.timeline`、`.detail-list`、`#profile-publication-list` 统一使用 `--profile-list-gap` / `--profile-list-gap-mobile`（两者均继承 `--global-list-gap` / `--global-list-gap-mobile`）。
- 检查：`python3 scripts/check_braces.py css/profile-config.css` 与 `node scripts/check-site.mjs` 通过（v1.10.52）
- 部署：未部署

## v1.10.51 - 2026-07-07
- 类型：修复
- 变更：修复多页列表间距调节无效的问题。`css/styles.css` 在 `@media (max-width: 860px)` 等断点下使用 `gap: 24px !important` / `gap: 18px !important` 强制覆盖了 results / honors / activities 页的 `.detail-list`、`.all-publication-list` 等列表间距，而这几页的 `*-config.css` 原先未加 `!important`，导致 editor 中的列表间距变量失效。已统一为 `gap: var(--*-list-gap) !important;` 和 `gap: var(--*-list-gap-mobile) !important;`。
- 检查：`python3 scripts/check_braces.py css/profile-config.css css/results-config.css css/honors-config.css css/activities-config.css` 与 `node scripts/check-site.mjs` 通过（v1.10.51）
- 部署：未部署

## v1.10.50 - 2026-07-07
- 类型：修复
- 变更：修复首页 Hero 副标题「上边距」调节无效的问题。`css/styles.css` 中存在多条与 `css/home-config.css` 同特异性的 `margin-top: 0 !important` 规则，因后加载的配置文件未能稳定覆盖导致调节失效。将 `css/home-config.css` 中副标题选择器增加 `html` 前缀提升特异性，确保 `--hero-subtitle-margin-top` / `--hero-subtitle-margin-top-mobile` 生效。
- 检查：`python3 scripts/check_braces.py css/home-config.css` 与 `node scripts/check-site.mjs` 通过（v1.10.50）
- 部署：未部署

## v1.10.49 - 2026-07-07
- 类型：功能
- 变更：新增「全局 Section」编辑器页面，可统一调节 profile / results / honors / activities 四页以及首页的 Section 小标签、标题、标题与内容间距、Section 内边距、首 Section 上内边距和列表项间距。
- 变更：新增 `css/global-section-config.css`，所有主页面 HTML 在加载各自 `*-config.css` 前先加载该全局配置；各页 `*-config.css` 中的通用 Section 变量改为继承全局变量。
- 变更：`js/hero-editor.js` 的 editor 增加 `global` 页面，并移除各内容页重复的 Section 小标签 / 标题 / 通用间距控件，仅保留各页特有的设置（如 profile 名片、各页首 Section 与后续间距等）。
- 检查：`node --check js/hero-editor.js`、`python3 scripts/check_braces.py` 与 `node scripts/check-site.mjs` 均通过（v1.10.49）
- 部署：未部署

## v1.10.48 - 2026-07-07
- 类型：重构
- 变更：统一 profile / results / honors / activities 四页的 Section 间距控制变量。每页现在使用一致的 5 个核心变量：`{page}-section-padding`、`{page}-first-section-padding-top`、`{page}-first-section-gap`、`{page}-section-heading-gap`、`{page}-list-gap`，并在 editor 的「容器与间距」组中统一展示。
- 变更：profile 页将原本分散的 `--profile-feature-grid-gap` / `--profile-timeline-gap` / `--profile-publication-gap` / `--profile-detail-gap` 合并为单个 `--profile-list-gap`；同时移除未实际生效的 `--profile-timeline-section-gap` 控制项，避免 editor 中参数混乱。
- 变更：results 页回退 Section 上下内边距的拆分（`padding-top` / `padding-bottom`），恢复为单一 `--results-section-padding`，与其他页保持一致。
- 变更：honors / activities 页新增 `--honors-section-heading-gap` / `--activities-section-heading-gap` 变量与移动端覆盖，并补齐 `.section-heading` 的 `margin-bottom` 规则。
- 检查：`python3 scripts/check_braces.py` 与 `node --check js/hero-editor.js` 均通过；`node scripts/check-site.mjs` 通过（v1.10.48）
- 部署：未部署

## v1.10.42 - 2026-07-07
- 类型：功能
- 变更：将 Letters 手写加载动画应用到全部前台页面（`activities.html`、`honors.html`、`profile.html`、`results.html`）。为这些页面补充 `process` shim 与 `letters-animation.umd.js`，并将 `script.js` 改为 `defer` 以确保 UMD 先加载、后执行加载门逻辑。
- 类型：功能
- 变更：同步更新 `js/global.js` 的加载层，同样把 Lottie 欢迎动画替换为手写单词列表动画，避免其他引用 `global.js` 的入口仍使用旧动画。
- 检查：`node --check js/script.js` 与 `node --check js/global.js` 均通过
- 部署：未部署

## v1.10.40 - 2026-07-07
- 类型：功能
- 变更：将 Letters 手写单词列表动画应用到主页加载页（`index.html` / `js/script.js`）。加载层原有的 Lottie `Welcome.json` 动画被替换为手写文字动画：单词列表 `["hello", "welcome", "coming", "loading"]` 每次刷新随机打乱顺序，每个单词从 `["sunrise", "rasta", "plasma", "tropical", "cyber", "fire", "lemonade", "ocean-bright", "sunset-bright", "rainbow"]` 中随机挑选渐变颜色（strokeWidth=2, brightness=15, saturation=12）。
- 类型：调整
- 变更：在 `js/script.js` 的 `finish()` 中清理 Letters 动画的 `setInterval`，避免加载层移除后继续挂载动画导致内存泄漏。
- 类型：调整
- 变更：为 `index.html` 中的 `letters-animation.umd.js` 加上 `?v=v1.10.40` 缓存戳，并补充 `process` shim，避免 UMD 在浏览器报 `process is not defined`。
- 类型：修复
- 变更：修复 `css/styles.css` 中 `.site-loading-letters { display: none; }` 以及 `.site-loading-letters .letters-animation-svg path { stroke: #ffffff; }` 导致加载页手写动画不显示的问题。改为 `display: flex` 并移除会覆盖渐变颜色的 `stroke` 规则。
- 检查：`node --check js/script.js` 通过
- 部署：未部署

## v1.10.39 - 2026-07-07
- 类型：功能
- 变更：为 `letter.html` Playground 增加“单词列表”功能。用户可在参数面板输入一组单词（用逗号/换行分隔），每次进入页面时自动将单词顺序随机打乱，并逐个播放；每个单词会从“已选预设”（未选择则使用“收藏”，否则使用当前预设）中随机挑选一个渐变颜色。
- 类型：功能
- 变更：底部代码框同步生成可随机循环播放单词列表的完整代码片段，包含单词数组、候选 preset 数组、洗牌逻辑与 `setInterval` 循环，刷新页面后每次都会重新打乱单词顺序并随机配色。
- 类型：调整
- 变更：将原来的“文字内容”单行输入替换为“单词列表”多行文本框；Playground 初始挂载配置改用 `wordList`。
- 检查：npx vite build 成功
- 部署：未部署

## v1.10.38 - 2026-07-07
- 类型：功能
- 变更：将页面底部代码框改为“每次刷新随机选色”。代码框现在会生成一个 `presets` 数组（优先来自 Playground 中“已选”预设；若未选择则使用“收藏”；否则使用当前激活预设），并通过 `presets[Math.floor(Math.random() * presets.length)]` 在每次页面刷新时随机选取一个颜色 preset。
- 类型：优化
- 变更：`generateUsageCode()` 自动读取当前页面 UMD 脚本 `?v=` 版本戳，确保生成的代码版本号与页面一致。
- 检查：npx vite build 成功
- 部署：未部署

## v1.10.34 - 2026-07-07
- 类型：功能
- 变更：将 Playground 中当前选中的渐变预设同步到页面底部「在主页加载页面使用」代码框。代码框会实时显示 `data-gradient-preset` 以及对应的 `brightness`、`saturation`、`strokeWidth` 参数。
- 类型：功能
- 变更：扩展 `mountLettersAnimation` 与 `LettersApp`，支持通过 preset key（如 `neon`、`rainbow`）直接加载渐变，兼容旧的纯色 `color` 调用方式。
- 检查：npx vite build 成功
- 部署：未部署

## v1.10.33 - 2026-07-07
- 类型：功能
- 变更：为 `letter.html` Playground 增加渐变预设收藏功能。每张渐变卡片左上角新增心形收藏按钮，点击可切换收藏状态；收藏数据持久化到 `localStorage`（key：`letters-gradient-favorites`），刷新后仍然保留。
- 类型：功能
- 变更：在渐变池分类选项卡中新增「收藏」选项卡，仅展示已收藏的预设；支持在收藏选项卡内全选/清空/随机切换。
- 检查：npx vite build 成功
- 部署：未部署

## v1.10.32 - 2026-07-07
- 类型：优化
- 变更：优化 `letter.html` Playground 进度条卡顿问题。进度条由 `width` 改为 GPU 加速的 `transform: scaleX(...)`，并移除可能与逐帧更新冲突的 `transition`，使 DRAW/ERASE 阶段进度更平滑。
- 类型：功能
- 变更：将 `Gradient presets/gradient-presets.json` 中五颜六色高饱和渐变（rainbow、sunrise、rasta、plasma、aurora、heat、ice-fire、sunset、oceanic、neon）从 Classic 分类拆出，新增独立 `colorful` 分类，并在 Playground UI 增加「Colorful」选项卡。
- 类型：功能
- 变更：新增 10 种鲜艳渐变预设：bubblegum、galaxy、tropical、cyber、fire、lemonade、ocean-bright、sunset-bright、candy、northern。
- 检查：npx vite build 成功
- 部署：未部署

## v1.10.12 - 2025-07-06
- 类型：修复
- 变更：修复桌面端个人简介模块中照片和名字未水平居中的问题。根本原因：`.profile-card-left` 缺少 `align-items: center`，`.profile-photo` 使用无效的 `justify-self: center`（非 grid item），`.profile-identity h1` 和 `.profile-en-name` 缺少 `text-align: center`。修复后为 `.profile-card-left` 添加 `align-items: center`，`.profile-photo` 改用 `margin: 0 auto`，`.profile-identity h1` 和 `.profile-en-name` 添加 `text-align: center`。同时加大桌面端和手机端照片圆角，从 `clamp(24px, 2.4vw, 32px)` 调整为 `clamp(28px, 3vw, 40px)`。
- 检查：npm run check 通过
- 部署：未部署
- 类型：样式
- 变更：修复桌面端 `.profile-photo` 的 `justify-self` / `align-self` 仍为 `start` 的问题（之前修改未生效），改为 `center` 确保照片在左栏内居中。同时加大桌面端和手机端照片圆角，从 `clamp(24px, 2.4vw, 32px)` 调整为 `clamp(28px, 3vw, 40px)`。
- 检查：npm run check 通过
- 部署：未部署

## v1.10.11 - 2025-07-06
- 类型：修复
- 变更：修复桌面端个人简介模块中照片和名字未水平居中的问题。为 `.profile-card-left` 补充 `align-items: center`，为 `.profile-photo` 将 `justify-self` / `align-self` 从 `start` 改为 `center`，为 `.profile-identity` 补充 `align-items: center` 和 `text-align: center`，确保照片与姓名在桌面端左栏内相对居中。
- 检查：npm run check 通过
- 部署：未部署

## v1.10.3 - 2025-07-06

## v1.10.3 - 2025-07-06
- 类型：修复
- 变更：修复手机端（`@media (max-width: 860px)`）个人简介模块中照片和名字偏左的问题。根本原因是在多个 `@media (max-width: 860px)` 块中，`.profile-combo .profile-photo` 的 `width: min(72vw, 340px)` 规则覆盖了 `margin-inline: auto` 的居中效果，导致照片框宽度等于父元素宽度，`margin: auto` 失效。修改为 `width: 90%; max-width: 320px`，使照片框宽度小于父元素，配合 `margin-inline: auto` 实现水平居中。同时为 `.profile-combo` 补充 `grid-template-columns: 1fr` 确保手机端单列堆叠。
- 检查：npm run check 通过
- 部署：未部署

## v1.9.1 - 2025-07-06
- 类型：样式
- 变更：在手机端个人简介模块（`@media (max-width: 860px)`）中，为 `.profile-photo` 补充 `justify-self: center !important` 和 `align-self: center !important`，确保照片与姓名在手机端完全水平居中。
- 检查：npm run check 通过
- 部署：未部署

## v1.8.3 - 2025-07-05

## v1.8.3 - 2025-07-05
- 类型：回滚
- 变更：回滚 v1.8.2 中尝试的 CSS 模块化拆分（base/nav/components/home/profile/publications/admin/animations）。拆分后 `@import` 方式会增加 HTTP 请求数，且调试复杂度上升，暂不适合当前项目阶段。恢复原单文件 `styles.css` 结构。
- 检查：npm run check 通过
- 部署：未部署

## v1.8.2 - 2025-07-05

## v1.8.2 - 2025-07-05
- 类型：修复
- 变更：修复手机端个人简介卡片中照片和名字未水平居中的问题。将 `.profile-card-left` 的 `display: grid` 改为 `display: flex; flex-direction: column; align-items: center`，确保照片和姓名在 flex 容器中明确居中。
- 检查：npm run check 通过
- 部署：未部署

## v1.8.1 - 2025-07-05
- 类型：修复
- 变更：修复上一版本引入的样式问题
- 检查：npm run check 通过
- 部署：已发布

## v1.8.0 - 2025-07-04
- 类型：功能
- 变更：新增个人简介页面和研究内容板块
- 检查：npm run check 通过
- 部署：已发布

