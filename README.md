# xyfoptics 个人学术网站维护手册

熊毅丰（Yifeng Xiong）个人学术网站。当前稳定方案是：**纯静态网站 + 本地后台维护 + Vercel 托管公开页面和公开素材**。

- 线上地址：https://xyfoptics.xyz
- 项目目录：`/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站`
- 本地后台：`http://localhost:8787/admin.html`
- 当前版本：`v1.5.72`
- 稳定流程：`docs/WORKFLOW.md`
- 更新日志：`docs/CHANGELOG.md`

## 给接手 AI 的快速说明

这是原生 HTML/CSS/JavaScript 静态站，不是 React、Vue 或 Next 项目。内容主要维护在 `data.js`，样式在 `styles.css`，前台交互在 `script.js`，后台编辑逻辑在 `admin.js` 和 `scripts/admin-server.mjs`。

每次修改必须：同步中英文内容、更新版本号、写入 `docs/CHANGELOG.md`、运行检查。只有用户明确要求发布时再部署。

## 项目结构

```text
个人简历网站/
├── index.html              # 主页：首屏动效、新闻动态、快速导航
├── profile.html            # 简介：个人简介、研究内容、经历、代表论文、学术任职
├── results.html            # 成果：论文、全部论文、专利、项目
├── honors.html             # 荣誉：奖励、创新创业
├── conferences.html        # 学术活动：会议、学术服务、审稿服务
├── admin.html              # 本地后台维护界面
├── data.js                 # 网站内容数据库，最核心
├── script.js               # 前台渲染、语言、导航、轮播、交互
├── admin.js                # 后台编辑界面逻辑
├── styles.css              # 全站样式
├── assets/                 # 图片、头像、论文主图、新闻图、研究图
├── papers/                 # 公开论文 PDF
├── scripts/
│   ├── admin-server.mjs    # 本地后台服务，负责保存 data.js 和上传文件
│   ├── check-site.mjs      # 静态检查
│   ├── bump-version.mjs    # 版本号更新
│   ├── optimize-images.py  # 图片压缩为 WebP
│   └── backup.sh           # 本地备份脚本
├── docs/                   # 维护文档、部署清单、交接说明、更新日志
├── 快捷命令/               # 双击启动、预览、压缩图片、部署入口
├── package.json            # 项目命令
└── vercel.json             # Vercel 配置
```

## 日常维护流程

1. 进入项目目录。
2. 启动后台：`npm run admin`，或双击 `快捷命令/启动后台.command`。
3. 打开 `http://localhost:8787/admin.html`。
4. 上传图片到 `assets/`，上传 PDF 到 `papers/`。
5. 在后台编辑对应栏目内容。
6. 点击条目内的保存按钮，再点击“保存到本地”。
7. 预览页面。
8. 运行 `npm run check`。
9. 更新版本号和 `docs/CHANGELOG.md`。
10. 用户要求发布时执行 `vercel deploy --prod --yes`。

## 常用命令

```bash
cd /Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站
npm run admin
npm run check
npm run bump -- 1.5.72
vercel deploy --prod --yes
```

如果系统找不到 `node`，可以使用当前 Codex 环境里的 Node：

```bash
/Users/xiongyifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-site.mjs
```

## 内容维护规则

- `data.js` 是公开内容数据库，修改内容优先看这里。
- 图片路径必须是仓库内相对路径，例如 `assets/example.jpg`。
- PDF 路径必须是仓库内相对路径，例如 `papers/example.pdf`。
- 不要把 `/Users/...` 这种本机路径写进公开页面。
- 中文和英文字段都要补齐，不能只改一种语言。
- 网站默认中文打开；切换英文后，切换页面仍应保持英文。
- 作者列表中 `Xiong, Y.` 或中文姓名需要加粗强调。

## 主要文件怎么改

### 改文字和条目

优先改 `data.js`。常见内容包括：

- `profile`：简介、研究内容、经历、代表论文、学术任职。
- `publications`：代表论文和全部论文。
- `patents`：专利，包含申请人字段。
- `projects`：项目。
- `honors` / `achievements`：奖励和创新创业。
- `conferences`：会议、学术服务、审稿服务。
- `news`：新闻动态。

### 改样式

优先改 `styles.css`。重点检查：

- 电脑端 1440px 左右宽度。
- 手机端 390px 左右宽度。
- 英文长标题是否正常换行。
- 卡片序号是否遮挡文字。
- PDF 下载按钮是否漂移。
- 页面是否出现左右横向滑动。

### 改交互

优先改 `script.js`。常见交互包括：语言切换、导航当前状态、移动端菜单、新闻轮播、锚点跳转、PDF 加载提示。

### 改后台

优先改 `admin.js` 和 `scripts/admin-server.mjs`。后台是本地维护工具，不应放进公开导航。保存和上传必须给用户明确反馈。

## 视觉规范

### 全局

- 酷黑背景，深色玻璃卡片，少量蓝色高亮。
- 圆角矩形风格，避免尖锐边框。
- 标题字号全站统一，不要一个模块特别大、另一个模块特别小。
- 移动端不能横向溢出。

### 首页首屏

固定分行：

中文：

```text
光纤集成智能
光电子芯片
```

英文：

```text
Fiber
Integrated
Intelligence
```

标题必须居中，行高要足够，避免英文 `g`、`y` 等下缘被裁切。

### 栏目

当前主栏目：主页、简介、成果、荣誉、学术活动。`学术活动` 比 `会议` 更贴切，因为里面包含会议、学术服务和审稿服务。

### 新闻轮播

主页新闻是水平滚动切换。每张卡片切换后都要居中，第三张尤其容易卡在边缘。新闻图建议接近 16:9 或 4:3。标题浮在图片上时不要压满整张图。

### 论文卡片

成果页代表论文保留 PDF 下载按钮。简介页代表论文只做快速展示，原则上不放下载按钮。论文主图上下方向要和右侧文字区域接近齐平。

## 发布前检查清单

- `npm run check` 通过。
- 首页默认中文，不出现先英文后中文闪烁。
- 中英文切换后，跳转页面仍保持当前语言。
- 首页首屏标题居中，英文不裁切。
- 新闻 01、02、03 都能居中显示。
- 手机端无横向滑移。
- PDF 下载路径是 `papers/...`。
- 图片路径是 `assets/...`。
- `docs/CHANGELOG.md` 已新增记录。
- `docs/WORKFLOW.md` 当前版本正确。

## 交给其他 AI 的提示词

```text
请维护这个静态个人学术网站：
/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站

先阅读 README.md、docs/WORKFLOW.md、docs/CHANGELOG.md。
这是原生 HTML/CSS/JS 项目，不是 React/Next。
内容主要在 data.js，样式在 styles.css，交互在 script.js，本地后台在 admin.html/admin.js/scripts/admin-server.mjs。
当前稳定流程是本地维护 data.js、assets/、papers/，再由 Vercel 托管。
每次迭代必须更新版本号、写 docs/CHANGELOG.md、运行 npm run check。
只有用户明确要求发布时才部署。
```
