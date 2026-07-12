# 更新日志

# v1.14.35 - 2026-07-12
- 类型：修复
- 变更：手机端点击 glow 的峰值亮度改为满亮度，不再把强度折半。
- 检查：`node --check js/border-glow.js` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.34 - 2026-07-12
- 类型：修复
- 变更：桌面端 hover 不再按鼠标到边框的距离计算亮度，只要悬停进入卡片就直接使用最大亮度。
- 检查：`node --check js/border-glow.js` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.33 - 2026-07-12
- 类型：修复
- 变更：桌面端 glow 改成边缘-only 表现，去掉内部 inset 阴影，避免卡片整块发亮。
- 变更：手机端沿用原有触摸 glow 参数与行为，不受桌面重写影响。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.32 - 2026-07-12
- 类型：修复
- 变更：禁用电脑端的入场 glow sweep，避免卡片在进入视口时自动扫亮。
- 变更：将 glow 强度下调到 `1`，让桌面端悬停不再过亮。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.31 - 2026-07-12
- 类型：修复
- 变更：将所有进入 glow 体系的卡片统一切到原生背景模式，保留各自原有 background / backdrop-filter，不再被 `border-glow-card` 压黑。
- 变更：手机端仍保留点击 glow，桌面端仍保留悬停 glow，入场 sweep 只在桌面端播放。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.30 - 2026-07-12
- 类型：修复
- 变更：保留手机端专利/详情卡片的 glow 触发，但将 `detail-item` 切换为原生背景模式，避免 `border-glow-card` 的伪层把卡片压黑。
- 变更：手机端的入场 sweep 不再对 glow 卡片播放，保留点击/悬停时的淡入淡出效果。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.29 - 2026-07-12
- 类型：修复
- 变更：将手机端的专利/详情卡片从 glow 目标中排除，避免 `detail-item` 套用 `border-glow-card` 后把原生卡片背景压成深色。
- 变更：将前台静态资源版本戳统一升到 `v1.14.29`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.28 - 2026-07-12
- 类型：修复
- 变更：修正手机端点击 glow 时卡片背景变黑的问题。touch 状态现在保留一层稳定的 `--touch-base-opacity`，不再把 `::before` 直接压成 0。
- 变更：将前台静态资源版本戳统一升到 `v1.14.28`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.27 - 2026-07-12
- 类型：调整
- 变更：将手机端 glow 默认强度调整为 `1`，淡出调整为 `500ms`，并同步前台站点与 `glow-lab.html` 的默认参数。
- 变更：将前台静态资源版本戳统一升到 `v1.14.27`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.26 - 2026-07-12
- 类型：修复
- 变更：修正手机端点击 glow 仍会压黑卡片背景的问题。手机端现在只动画独立的 `--touch-glow-opacity`，不再驱动 `--edge-proximity`，因此不会再把 `::before` 面层一起点亮或压暗。
- 变更：将前台静态资源版本戳统一升到 `v1.14.26`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.25 - 2026-07-12
- 类型：调整
- 变更：将手机端 glow 默认淡入调整为 `200ms`、淡出调整为 `1000ms`，并同步前台站点与 `glow-lab.html` 的默认参数。
- 变更：将前台静态资源版本戳统一升到 `v1.14.25`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.24 - 2026-07-12
- 类型：调整
- 变更：将手机端 glow 的默认淡出调整为 `2000ms`，并同步前台站点与 `glow-lab.html` 的参数默认值。
- 变更：将前台静态资源版本戳统一升到 `v1.14.24`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.23 - 2026-07-12
- 类型：调整
- 变更：将手机端 glow 的默认淡出统一拉长到 `5000ms`，并同步前台站点与 `glow-lab.html` 的扫光参数，方便直接观察参数变化。
- 变更：将前台静态资源版本戳统一升到 `v1.14.23`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.22 - 2026-07-12
- 类型：修复
- 变更：将手机端点击 glow 拆成独立时间线，去掉对 `sweepSpeed` 的继承缩放，并在播放期间禁用 CSS opacity 过渡，避免时间被样式层拖慢。
- 变更：将前台静态资源版本戳统一升到 `v1.14.22`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.21 - 2026-07-12
- 类型：修复
- 变更：修正手机端点击卡片的 glow 扫光速度缩放，点击入口不再继承整体 `sweepSpeed` 压缩，淡入淡出参数可以按 `500 / 1500` 正常生效。
- 变更：将前台静态资源版本戳统一升到 `v1.14.21`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 待复跑
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.14.20 - 2026-07-12
- 类型：调整
- 变更：更新 `glow-lab.html` 的边框发光交互，桌面端保持悬停触发，手机端点击现在复用入场扫光动画，使用 `fadeIn 500`、`fadeOut 1500`、`intensity 2`。
- 变更：将前台静态资源版本戳统一升到 `v1.14.20`，避免 Cloudflare Pages 继续命中旧缓存。
- 检查：`node scripts/check-site.mjs` 通过
- 部署：待推送到 GitHub 后由 Cloudflare Pages 自动部署

# v1.13.14 - 2026-07-11
- 类型：修复
- 变更：修复首页和内容页页脚访客统计在正式站点仍显示 `--` 的问题。`js/script.js` 现在会先用 `GET /api/counter` 读取当前计数，再用 `POST /api/counter` 做访问递增；两次请求都使用 `cache: "no-store"`，并且不会因为一次失败直接把已拿到的计数清空。
- 变更：将前台静态资源版本戳统一升到 `v1.13.14`，确保线上发布后浏览器和 CDN 会拉取到新的脚本与页面引用。
- 检查：`node --check js/script.js` 通过
- 部署：未部署

## v1.12.15 - 2026-07-10
- 类型：调整
- 变更：将公开站点的发布说明、后台入口、启动提示和资源源默认值统一切换为 Cloudflare Pages，并新增 Cloudflare Pages 的 `_redirects` 路由文件。
- 变更：访问量统计从 Upstash/Node 版本迁移为 Cloudflare Pages Function `functions/api/counter.js`，保留 `/api/counter` 接口不变。
- 变更：后台里的资源分发标签统一改为 Cloudflare，同域资源默认值也同步迁移到 `cloudflare`。
- 检查：未运行
- 部署：未部署

## v1.11.9 - 2026-07-07
- 类型：功能
- 变更：在 editor「成果 → 论文卡片」与「个人简介 → 代表论文卡片」控制组中新增「中文标题字号」与「期刊年份字号」调节参数（均区分电脑端与手机端）。
- 变更：`css/results-config.css` 与 `css/profile-config.css` 新增 `--results/profile-publication-subtitle-font-size`、`-meta-font-size` 等变量，并覆盖 `.publication-subtitle` 与 `.publication-meta` 的 `font-size`。
- 检查：`node --check js/hero-editor.js`、`python3 scripts/check_braces.py css/profile-config.css css/results-config.css` 与 `node scripts/check-site.mjs` 通过（v1.11.9）
- 部署：未部署

## v1.11.8 - 2026-07-07
- 类型：修复
- 变更：修复成果页（`results.html`）点击「展开全部论文」后新增的卡片不显示的问题。原因是 `setupRevealAnimations()` 只在初始渲染时执行一次，新加入的 `.publication-item` 没有获得 `is-revealed` 类，导致 `opacity: 0`。已在 `js/script.js` 与 `js/global.js` 的 `renderAllPublications()` 中，展开后为所有卡片直接添加 `is-revealed`。
- 类型：修复
- 变更：修复简介页「全部论文」链接跳转到成果页后没有定位到全部论文模块的问题。`js/script.js` 与 `js/global.js` 的加载门 `finish()` 在页面就绪后，若 URL 存在 hash（如 `#papers`），则调用 `scrollIntoView` 滚动到对应模块。
- 检查：`node --check js/script.js`、`node --check js/global.js` 通过
- 部署：未部署
- 类型：功能
- 变更：在 editor「成果 → 论文卡片」与「个人简介 → 代表论文卡片」控制组中新增三项可调参数（均区分电脑端与手机端）：
  - 英文标题字号（`--results/profile-publication-title-font-size`）
  - 作者名字号（`--results/profile-publication-authors-font-size`）
  - 期刊与 PDF 间距（`--results/profile-publication-meta-gap`，手机端映射到 `--results/profile-publication-meta-pdf-gap-mobile`）
- 变更：`css/results-config.css` 与 `css/profile-config.css` 新增对应 CSS 变量及覆盖规则，通过高特异性选择器覆盖 `css/styles.css` 中 `.publication-copy > h3`、`.publication-authors`、`.publication-meta`、`.pdf-actions` 的默认样式。
- 检查：`node --check js/hero-editor.js`、`python3 scripts/check_braces.py css/profile-config.css css/results-config.css` 与 `node scripts/check-site.mjs` 通过（v1.11.8）
- 部署：未部署

## v1.11.7 - 2026-07-07
- 类型：功能
- 变更：在 editor「成果」页面新增「论文卡片」控制组，提供电脑端与手机端的论文卡片上/下边距调节选项（`--results-publication-padding-top` / `--results-publication-padding-bottom` 及其移动端变量）。
- 变更：`css/results-config.css` 新增论文卡片上下边距变量与覆盖规则，通过更高特异性的 `.results-page .all-publication-list .publication-item` 选择器覆盖 `css/styles.css` 中的默认 `padding`，方便在 editor 中实时调节论文卡片留白。
- 检查：`node --check js/hero-editor.js`、`python3 scripts/check_braces.py css/results-config.css` 与 `node scripts/check-site.mjs` 通过（v1.11.7）
- 部署：未部署

## v1.11.6 - 2026-07-07
- 类型：调整
- 变更：删除简介页（profile.html）代表论文标题右侧的「详情请见 全部成果」文字链接。
- 变更：在代表论文列表下方新增「全部论文」按钮，链接到成果页全部论文模块（`results.html#papers`）。按钮使用 `.button.secondary` 样式并居中显示。
- 变更：将 `results.html` 全部论文区的 `id` 从 `all-publications` 改为 `papers`，并同步更新 `css/results-config.css` 中的选择器，使现有所有 `results.html#papers` 链接（导航、首页、简介页等）都能正确跳转到全部论文模块。
- 变更：`js/script.js` 与 `js/global.js` 的多语言字典新增 `viewAllPapers` 键（中文「全部论文」/ 英文 "All Papers"）。
- 变更：清理 `js/profile-content.js` 与 `js/hero-editor.js` 中不再使用的 `detailsSee` / `allResults` 文案配置及编辑器控件组，避免 editor 中保留无效入口。
- 检查：`node --check js/script.js`、`node --check js/global.js`、`node --check js/hero-editor.js`、`node --check js/profile-content.js`、`python3 scripts/check_braces.py css/profile-config.css css/results-config.css` 与 `node scripts/check-site.mjs` 通过（v1.11.6）
- 部署：未部署

## v1.11.5 - 2026-07-07
- 类型：样式
- 变更：根据需求，手机端（`@media (max-width: 860px)`）页面底部信息栏目统一改为左对齐。将 `css/styles.css` 中 `.site-footer` 的 `align-items: center` 改回 `align-items: flex-start`，`text-align: center` 改回 `text-align: left`；`.footer-address` 也改回 `text-align: left`。
- 检查：`python3 scripts/check_braces.py css/styles.css` 与 `node scripts/check-site.mjs` 通过（v1.11.5）
- 部署：未部署

## v1.11.4 - 2026-07-07
- 类型：修复
- 变更：修复首页 Hero 英文标题 `homeTitle` 出现串行/分行不正常的问题。`js/script.js` 与 `js/global.js` 的 `applyLanguage` 在渲染 `homeTitle` 时，若文本包含换行符，则将其拆分为多个 `<span class="home-title-line">`，避免 `flex` 布局与 `white-space` 规则导致三行文字连成一行或分行异常。中文标题同样会生成 `.home-title-line` 结构，保持中英文渲染一致。
- 检查：`node --check js/script.js`、`node --check js/global.js` 与 `node scripts/check-site.mjs` 通过（v1.11.4）
- 部署：未部署

## v1.11.3 - 2026-07-07
- 类型：修复
- 变更：修复手机端英文版页面底部地址（`.footer-address`）左对齐的问题。`css/styles.css` 中 `@media (max-width: 860px)` 下 `.site-footer` 使用 `align-items: flex-start`，导致地址在英文长文本换行时显得偏左。改为 `align-items: center` 并将 `.footer-address` 设为 `text-align: center`，使页脚在移动端整体居中显示。
- 检查：`python3 scripts/check_braces.py css/styles.css` 与 `node scripts/check-site.mjs` 通过（v1.11.3）
- 部署：未部署

## v1.11.2 - 2026-07-07
- 类型：修复
- 变更：禁用点击 PDF 后出现的 "正在加载 PDF... / PDF 文件较大，正在打开下载链接。" toast 提示。`js/script.js` 与 `js/global.js` 中的 `showPdfLoading()` 不再创建或显示提示浮层，仅保留链接的 `is-loading` 状态 4.2 秒后自动清除。
- 检查：`node --check js/script.js` 与 `node --check js/global.js` 均通过
- 部署：未部署

## v1.11.1 - 2026-07-07
- 类型：功能
- 变更：在 editor「个人简介」页面新增「研究内容卡片 → 卡片间距（手机端）」独立控制项。新增 CSS 变量 `--profile-research-gap-mobile`，仅作用于手机端 `.section-wrap#research .feature-grid`，桌面端仍继承 `--global-list-gap`。
- 变更：`js/hero-editor.js` 的 `renderForm` 增加 `mobileOnly` 字段支持，使仅手机端生效的控件在桌面模式下自动隐藏。
- 检查：`node --check js/hero-editor.js`、`python3 scripts/check_braces.py css/profile-config.css js/hero-editor.js` 与 `node scripts/check-site.mjs` 通过（v1.11.1）
- 部署：未部署

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
