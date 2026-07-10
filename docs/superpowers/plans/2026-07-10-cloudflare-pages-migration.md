# Cloudflare Pages 迁移实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把公开站点、访问统计和自定义域名统一收口到 Cloudflare Pages，同时保留本地后台维护流程。

**Architecture:** 公开站点仍然是静态 HTML/CSS/JS 应用，由 Cloudflare Pages 托管静态文件并接管自定义域名。`/api/counter` 使用 Cloudflare Pages Function + Cloudflare D1 维持访问统计。后台工具继续本地运行，但所有发布说明、入口链接和诊断提示都统一改成 Cloudflare。

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Cloudflare Pages, Cloudflare Pages Functions, Cloudflare D1, Node.js for local validation.

## Global Constraints

- Keep the public site as a static HTML/CSS/JavaScript app.
- Preserve the `/api/counter` endpoint path used by the homepage visitor counter.
- Keep the local admin server at `http://localhost:8787/admin.html`.
- Keep all user-facing copy in Chinese and English aligned where both already exist.
- Do not introduce framework migration work; only switch hosting and counter plumbing.

---

### Task 1: 收口站点发布配置到 Cloudflare Pages

**Files:**
- Modify: `README.md`
- Modify: `admin.html`
- Modify: `scripts/admin-server.mjs`
- Modify: `启动后台.command`
- Modify: `docs/CHANGELOG.md`
- Create: `_redirects`
**Interfaces:**
- Consumes: current deployment and admin workflow copy
- Produces: Cloudflare Pages-oriented deployment instructions and dashboard links

- [ ] **Step 1: 更新发布说明**

把 `README.md` 里的发布说明、项目摘要和部署流程统一改成 Cloudflare Pages 版本。

- [ ] **Step 2: 更新后台入口**

把 `admin.html` 和 `scripts/admin-server.mjs` 里的发布入口、说明文案和面板链接统一改成 Cloudflare 版本。

- [ ] **Step 3: 更新本地启动文案**

让 `启动后台.command` 的启动提示直接说明公开站点由 Cloudflare Pages 承载。

- [ ] **Step 4: Remove the obsolete routing config file**

保留 `_redirects` 的站点路由重写，并删除旧的路由配置文件，让仓库只保留 Cloudflare Pages 需要的部署痕迹。

- [ ] **Step 5: Add the changelog note**

补一条更新日志，说明站点已经完成 Cloudflare Pages 收口。

- [ ] **Step 6: Validate the text-only changes**

运行 `git diff --check` 并检查修改后的文件，确认公开站点相关内容不再保留旧发布措辞。

### Task 2: 把访问统计收口到 Cloudflare Pages Function

**Files:**
- Create: `functions/api/counter.js`
- Modify: `api/counter.js`
- Modify: `js/script.js`
- Modify: `README.md`

**Interfaces:**
- Consumes: the homepage `fetch('/api/counter', { method: 'POST' })` call
- Produces: a Cloudflare Pages Function response at `/api/counter` with `{ count }`

- [ ] **Step 1: Write the Cloudflare function**

Create `functions/api/counter.js` as a Pages Function that accepts `GET`, `POST`, and `OPTIONS`, returns JSON, and reads/writes the stored counter through a Cloudflare D1 binding named `VISITOR_COUNTER_DB`.

- [ ] **Step 2: Keep the front-end API stable**

Leave the homepage fetch path in `js/script.js` unchanged so the visible visitor counter still points to `/api/counter`.

- [ ] **Step 3: 处理旧统计入口**

移除或归档旧的 Node 统计入口，让仓库只保留 Cloudflare Function 作为有效实现。

- [ ] **Step 4: 记录 Cloudflare 配置**

在 `README.md` 里补一句：统计功能现在依赖 Cloudflare D1 绑定，公开站点的统计链路已经完全切换到 Cloudflare。

- [ ] **Step 5: Validate the function code**

Run `node --check` on any JavaScript files changed in this task and confirm the visitor counter fetch path still exists in `js/script.js`.

### Task 3: 收口资源源标签到 Cloudflare

**Files:**
- Modify: `data/global.js`
- Modify: `js/data.js`
- Modify: `js/admin.js`
- Modify: `js/global.js`
- Modify: `js/script.js`
- Modify: `admin.html`

**Interfaces:**
- Consumes: the `assetSource` setting already persisted in site data
- Produces: Cloudflare-aligned labels and defaults for same-origin asset loading

- [ ] **Step 1: 改默认值**

把默认 `assetSource` 统一改成 `cloudflare`，保证同域资源默认按 Cloudflare 语义显示。

- [ ] **Step 2: 更新界面文案**

把后台界面和诊断里的同域资源文案统一成 Cloudflare 版本，同时保留 CDN 选项。

- [ ] **Step 3: 更新运行时标签逻辑**

更新 `js/admin.js`、`js/global.js` 和 `js/script.js`，让同域资源分支统一走 `cloudflare` 标识，并在没有 CDN 时继续回退到相对路径资源。

- [ ] **Step 4: 验证界面字符串**

在仓库里搜索旧发布措辞，确认公开站点和后台界面都已经收口完成。
