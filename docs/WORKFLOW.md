# 个人学术网站稳定维护流程

> 网站是纯静态站点，内容和公开素材全部随项目一起由 Vercel 托管。

**项目目录**: `/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站`  
**生产环境**: https://xyfoptics.xyz  
**Vercel 项目**: `xyfoptics/yxiong-profile`  
**当前版本**: `v1.5.113`  
**最后更新**: 2026-07-03

---

## 1. 核心逻辑

- `data.js` 是网站内容数据库。
- `assets/` 存放图片。
- `papers/` 存放论文 PDF。
- `admin.html` 只在本地维护使用。
- `scripts/admin-server.mjs` 负责把后台修改写入本地项目，并调用 Vercel 发布。
- 线上网站不连接数据库。

---

## 2. 日常维护流程

1. 双击 `快捷命令/启动后台.command`。
2. 浏览器打开 `http://localhost:8787/admin.html`。
3. 上传需要的图片或 PDF。
4. 编辑对应栏目内容。
5. 点击“保存当前条目”。
6. 点击“保存到本地”。
7. 本地预览确认无误。
8. 点击“发布到 Vercel”。

这就是完整流程。

---

## 3. 文件路径规则

图片路径写成：

```text
assets/example.webp
```

论文路径写成：

```text
papers/example.pdf
```

不要使用本机绝对路径，例如 `/Users/...`。线上网站只能访问项目里的相对路径。

---

## 4. 手动命令

进入项目目录：

```bash
cd /Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站
```

启动后台：

```bash
npm run admin
```

本地检查：

```bash
npm run check
```

升版本：

```bash
npm run bump -- 1.5.51
```

手动发布：

```bash
vercel deploy --prod --yes
```

---

## 5. 每次迭代

每次修改都要递增版本号，例如 `v1.5.50` -> `v1.5.51`。版本脚本会统一更新 HTML 引用、页脚和 `package.json`。

发布前建议检查：

- 首页、简介、成果、荣誉、会议页面可以打开。
- 中文默认显示正常。
- 英文切换正常。
- 图片和 PDF 链接可以打开。
- 手机端菜单可以展开。

---

## 6. 维护原则

公开内容、图片和 PDF 都随项目一起托管。维护时只更新 `data.js`、`assets/`、`papers/` 和相关页面文件，保持部署链路简单清楚。
