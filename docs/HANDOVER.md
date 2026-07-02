# 项目交接说明

## 当前定位

这是熊毅丰个人学术网站，当前方案是原生 HTML/CSS/JavaScript 静态站。

- 生产地址：https://xyfoptics.xyz
- 项目目录：`/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站`
- 本地后台：`http://localhost:8787/admin.html`
- 数据文件：`data.js`
- 图片目录：`assets/`
- PDF 目录：`papers/`
- 发布平台：Vercel

## 主要文件

```text
个人简历网站/
├── index.html
├── profile.html
├── results.html
├── honors.html
├── conferences.html
├── admin.html
├── data.js
├── script.js
├── admin.js
├── styles.css
├── assets/
├── papers/
├── scripts/
│   ├── admin-server.mjs
│   ├── check-site.mjs
│   ├── bump-version.mjs
│   ├── optimize-images.py
│   └── backup.sh
├── docs/
│   ├── WORKFLOW.md
│   ├── CHANGELOG.md
│   ├── DEPLOYMENT.md
│   ├── OPERATIONS.md
│   └── HANDOVER.md
├── 快捷命令/
│   ├── 启动后台.command
│   ├── 预览网站.command
│   ├── 压缩图片.command
│   └── 部署到Vercel.command
├── README.md
├── package.json
└── vercel.json
```

## 日常维护

1. 双击 `快捷命令/启动后台.command`。
2. 打开 `http://localhost:8787/admin.html`。
3. 上传图片或论文 PDF。
4. 编辑对应条目。
5. 保存当前条目。
6. 点击“保存到本地”。
7. 本地预览确认。
8. 需要上线时点击“发布到 Vercel”。

## 内容规则

- 网站内容以 `data.js` 为准。
- 图片使用项目内相对路径，例如 `assets/example.webp`。
- 论文使用项目内相对路径，例如 `papers/example.pdf`。
- 不要写入 `/Users/...` 这类本机绝对路径。
- 中英文内容需要同步维护。
- 图片当前只保留 WebP，另有少量 SVG 研究图标。

## 检查命令

```bash
npm run check
```

如果系统找不到 `node`，可以使用 Codex 内置 Node：

```bash
/Users/xiongyifeng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/check-site.mjs
```

## 发布前检查

- 首页、简介、成果、荣誉、会议页面可以打开。
- 中文默认显示正常。
- 英文切换正常。
- 图片和 PDF 链接可以打开。
- 手机端菜单可以展开。
- `docs/CHANGELOG.md` 已记录本次修改。
- 版本号已按需更新。
