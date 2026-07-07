# 更新日志

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

