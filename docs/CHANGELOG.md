# 更新日志

本文件记录个人学术网站每次可追踪迭代。自 `v1.1` 起，每次修改都需要更新版本号，并在本文件顶部新增记录。

## 记录格式

```text
## vX.Y.Z - YYYY-MM-DD
- 类型：功能 / 样式 / 内容 / 修复 / 文档 / 部署
- 变更：...
- 检查：...
- 部署：...
```

## v1.5.113 - 2026-07-02

- 类型：优化 / 部署
- 变更：移动端视频源 `frame.mp4`（4.6MB）也替换为 123云盘 CDN 直链 `https://1860288107.cdn.123clouddisk.com/1860288107/%E6%88%91%E7%9A%84%E7%BD%91%E7%AB%99/frame-hq.mp4`，与桌面端统一使用同一高清视频源。移除本地 `frame.mp4` 文件引用。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (15 html files, v1.5.113)`。
- 部署：未部署。

## v1.5.112 - 2026-07-02

- 类型：优化 / 部署
- 变更：将桌面端视频源 `frame-hq.mp4`（12MB）从本地相对路径替换为 123云盘 CDN 直链 `https://1860288107.cdn.123clouddisk.com/1860288107/%E6%88%91%E7%9A%84%E7%BD%91%E7%AB%99/frame-hq.mp4`，解决国内网络从 Vercel 加载视频缓慢的问题。移动端视频 `frame.mp4`（4.6MB）保持本地源不变。
- 变更：缩短加载超时提示时间，从 6 秒调整为 3 秒，适配 CDN 直链通常更快的加载速度。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (15 html files, v1.5.112)`。
- 部署：未部署。

## v1.5.111 - 2026-07-02

- 类型：修复 / 功能
- 变更：修复加载动画结束后视频仍卡住的问题。重构 `setupHomeFrameSequence()` 的加载器状态管理：`loadedmetadata` 只更新进度不隐藏加载器；`loadeddata`/`canplay` 只尝试播放不隐藏加载器；`canplaythrough` 确认可连续播放后才隐藏加载器；新增 `playing` 事件监听器，在视频真正开始播放后隐藏加载器；`playFromStart()` 的 `playPromise.then()` 成功后才隐藏加载器，失败时保持加载器显示并触发重试。
- 变更：修复加载慢的问题。新增 `IntersectionObserver` 在视频区域进入视口边缘（`rootMargin: "200px 0px"`）时提前触发 `triggerLoad()`，不等用户滚动到视口正中间。离开视口时自动暂停视频以节省带宽。
- 变更：添加加载超时提示，6 秒后如果视频仍未开始播放，加载文字从"加载中"变为"加载较慢，请稍候"。
- 变更：视频 `error` 事件显示"加载失败"并增加重试间隔至 500ms；`waiting` 事件只在 `currentTime > 0`（已开始播放）时才显示加载器，避免播放前就显示加载器。
- 变更：加载指示器新增百分比数字动画。在加载器 DOM 中新增 `<span class="home-frame-loader-percent">0%</span>`，在 `updateProgress()` 中同步更新百分比文字；新增 `.home-frame-loader-percent` CSS 样式：大号白色字体（`clamp(1.6rem, 2.2vw, 2rem)`）、粗体、等宽数字（`tabular-nums`）、柔和发光（`text-shadow`），数字变化带过渡动画。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (15 html files, v1.5.111)`。
- 部署：未部署。

## v1.5.94 - 2026-07-02

- 类型：修复
- 变更：去掉 `<video>` 的 `poster="assets/final.webp"` 封面图，改为用 JS 动态插入加载指示器（旋转图标 + 进度条 + 文字）。
- 变更：新增 `.home-frame-loader` 及其子元素的 CSS 样式：白色旋转圆环（`animation: home-frame-spin 0.8s linear infinite`）、进度条（`transform: scaleX` 通过 `video.buffered` 实时更新）、"加载中"文字。
- 变更：`setupHomeFrameSequence()` 中：创建 `home-frame-loader` DOM 节点并插入到 `.home-frame-media` 中；`triggerLoad()` 时显示加载指示器；`progress` 事件更新进度条；`loadeddata`/`canplay`/`canplaythrough` 时隐藏加载指示器；`waiting` 时重新显示加载指示器。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (15 html files, v1.5.94)`。
- 部署：未部署。

## v1.5.93 - 2026-07-02

- 类型：修复
- 变更：视频改为滚动懒加载：`<video>` 标签 `preload` 从 `auto` 改为 `none`，首次进入页面不加载视频。
- 变更：新增 `triggerLoad()` 函数，只有在用户滚动到视频区域附近（`shouldArm()` 为 true）时才调用 `video.load()` 开始加载视频。
- 变更：视频未加载前只显示 `poster="assets/final.webp"` 封面图，不再出现空白。
- 变更：去掉 `.home-frame-video` 的深色兜底背景 `background: #0a0a12`。
- 变更：重播按钮点击时，如果视频尚未加载过，先触发 `triggerLoad()` 再播放。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (15 html files, v1.5.93)`。
- 部署：未部署。

## v1.5.92 - 2026-07-02

- 类型：修复
- 变更：视频元素添加 `poster="assets/final.webp"` 和 `fetchpriority="high"`，解决手机端首次打开时视频空白的问题。
- 变更：修复 `hasAutoPlayed` 时序 bug：原先在 `video.play()` 调用前就将 `hasAutoPlayed` 设为 `true`，导致移动端浏览器拒绝自动播放后（`NotAllowedError`）后续不再重试。现在改为在 `play()` Promise 成功回调中才设为 `true`，失败时保持 `false`，允许 `touchend` / `scroll` / `visibilitychange` 等事件后续重试。
- 变更：增强视频加载事件监听：新增 `canplaythrough`、`loadstart`、`waiting` 事件，在视频真正准备好后自动尝试播放。
- 变更：用户点击重播按钮后重置 `hasAutoPlayed = false`，允许再次进入视口时自动播放。
- 变更：给 `.home-frame-video` 添加深色兜底背景 `background: #0a0a12`，防止 poster 加载前的闪烁空白。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (15 html files, v1.5.92)`。
- 部署：未部署。

## v1.5.91 - 2026-07-02

- 类型：样式
- 变更：重播按钮（`.home-frame-replay`）高光质感直接复制新闻动态栏目序号（`.news-carousel-track .news-card span`）的液态玻璃高光效果：多层径向渐变（左上角高光圆点 + 右下角柔光）+ 线性渐变 + 半透明底色，白色细边框，五层 box-shadow（三层 inset + 两层 outset）。
- 变更：重播按钮字符 ↺ 颜色改为白色 `rgba(255, 255, 255, 0.98)`，与新闻序号保持一致。
- 变更：电脑端重播按钮字符 ↺ 字号从 `clamp(1.15rem, 1.65vw, 1.45rem)` 调整为 `clamp(1.5rem, 2.1vw, 2rem)`，约为新闻序号 `clamp(0.82rem, 0.9vw, 1rem)` 的两倍（大一倍）。
- 变更：手机端重播按钮字符 ↺ 字号从 `clamp(1.9rem, 7vw, 2.4rem)` 调整为 `clamp(1rem, 3.7vw, 1.33rem)`，约为电脑端的 2/3。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (15 html files, v1.5.91)`。
- 部署：未部署。

## v1.5.90 - 2026-07-02

- 类型：样式
- 变更：重播按钮高光质感从新闻模块序号复制，改为白色圆盘背景 + 深色文字。
- 变更：电脑端重播按钮字符 ↺ 字号从 `clamp(1.15rem, 1.65vw, 1.45rem)` 调整为 `clamp(2.3rem, 3.3vw, 2.9rem)`，视觉上大一倍。
- 变更：手机端重播按钮字符 ↺ 字号从 `clamp(1.9rem, 7vw, 2.4rem)` 调整为 `clamp(1.27rem, 4.67vw, 1.6rem)`，约为原来的 2/3。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (15 html files, v1.5.90)`。
- 部署：未部署。

## v1.5.74 - 2026-06-30

- 类型：交互 / 样式
- 变更：新闻轮播支持触摸与鼠标横向拖动，拖动后按距离切换或回弹，并暂停/恢复自动播放。
- 变更：移动端新闻卡片加高，增加可读区域，减少新闻栏目显示过短的问题。
- 变更：新闻标题根据中英文长度自动切换字号、文本框宽度和行数，改善桌面端长标题显示不全。
- 检查：`node --check script.js` 通过，静态检查输出 `Site check passed (14 html files, v1.5.74)`。
- 部署：未部署。

## v1.5.73 - 2026-06-30
- 类型：样式 / 内容
- 变更：首页首屏中文标题改为“光纤集成 / 智能光电子”，英文继续使用“Fiber / Integrated / Intelligence”三行展示。
- 变更：隐藏首页首屏蓝色眉标，更新中英文小标题为“光纤集成 · 异质材料 · 智能感知 / Fiber integration · Heterogeneous materials · Intelligent sensing”。
- 变更：降低首页首屏中英文字号并压缩行距，同时保留英文 descender 安全间距，避免 g 被截断。
- 检查：直接执行项目 check 脚本等价命令通过，静态检查输出 `Site check passed (14 html files, v1.5.73)`。
- 部署：未部署。

## v1.5.72 - 2026-06-30

- 类型：文档 / 流程
- 变更：新增 `docs/CHANGELOG.md`，用于从本版本开始记录每次迭代。
- 变更：重写 `README.md` 为完整交接手册，覆盖项目结构、维护流程、常用命令、内容规则、视觉规范和接手 AI 提示词。
- 变更：在 `docs/WORKFLOW.md` 中加入更新日志维护要求。
- 检查：`npm run check` 通过，静态检查输出 `Site check passed (14 html files, v1.5.72)`。
- 部署：未部署。

## v1.5.71 - 2026-06-30

- 类型：样式 / 修复 / 部署
- 变更：首页首屏标题按用户要求固定分行，中文为“光纤集成智能 / 光电子芯片”，英文为“Fiber / Integrated / Intelligence”。
- 变更：调整首屏标题行高和间距，避免英文 `g` 等字母下缘被裁切。
- 检查：`npm run check` 通过。
- 部署：已发布到 Vercel 生产环境，域名为 https://xyfoptics.xyz。

## v1.5.70 - 2026-06-30

- 类型：样式 / 修复 / 部署
- 变更：修复首页首屏偏移问题，调整首屏居中逻辑。
- 变更：调整简介页研究内容卡片布局，避免三张卡片挤在右侧。
- 变更：修复成果页“论文”标题右侧“全部论文”跳转锚点，目标为 `results.html#all-publications`。
- 检查：`npm run check` 通过。
- 部署：已发布到 Vercel 生产环境。

## v1.5.x 历史摘要

- 改为 `data.js` + `assets/` + `papers/` 随 Vercel 静态部署。
- 建立本地后台维护流程，可在本地上传文件、编辑内容并保存到仓库文件。
- 统一全站中英文切换逻辑，默认中文打开，切换页面时保持语言状态。
- 参考 Apple 官网风格，多轮优化导航栏、移动端菜单、新闻轮播、论文卡片和玻璃质感视觉。
- 为论文 PDF 增加下载入口和加载提示，以缓解国内网络打开 PDF 慢的问题。
