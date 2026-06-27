# Kimi Work 交接摘要 — yxiong-profile 网站

> 本文档是熊毅丰（xyf1231）个人学术网站项目的详细交接说明，供 Kimi Work 接手后继续优化和维护。
>
> 文档日期：2026-06-27
> 当前版本：v1.5.14
> 最后部署：https://xyfoptics.xyz

---

## 一、项目概述

这是一个**纯静态 HTML/CSS/JS 个人学术网站**，展示研究方向、论文成果、项目经历、专利、会议、荣誉和联系方式。

### 核心信息

| 项目 | 详情 |
|------|------|
| **网站地址** | https://xyfoptics.xyz / https://www.xyfoptics.xyz |
| **GitHub 仓库** | https://github.com/xyf1231/yxiong-profile |
| **部署平台** | Vercel（自动从 GitHub main 分支部署） |
| **数据库** | Supabase (PostgreSQL) |
| **域名服务商** | 阿里云（已配置 DNS 指向 Vercel） |
| **网站所有者** | 熊毅丰（xyf1231） |
| **当前版本** | v1.5.14 |

### 技术栈

- **纯静态网站**：无框架，无打包工具，无 React/Vue
- **语言**：HTML5 + CSS3 + Vanilla JavaScript
- **数据层**：Supabase（动态加载）+ data.js（静态备份）
- **图片格式**：WebP（主格式）+ PNG（浏览器兼容）
- **部署方式**：GitHub → Vercel 自动部署（10-30 秒）
- **字体/图标**：系统字体，无外部图标库依赖

---

## 二、当前状态：已完成 vs 待完成

### ✅ 已完成

1. **Vercel + GitHub 连接**：自动部署已打通，push 即部署
2. **Supabase 数据库**：
   - 11 张表已创建（profiles, metrics, research_areas, news_items, publications, all_publications, projects, achievements, experiences, contacts）
   - 数据已全部导入（achievements 35 条，publications 10 条，all_publications 24 条等）
   - RLS（行级安全）已启用，读取权限开放
3. **Storage Buckets**：已创建 `assets`（public）和 `papers`（public）两个 bucket
4. **域名配置**：xyfoptics.xyz 和 www.xyfoptics.xyz 已绑定 Vercel
5. **环境变量**：SUPABASE_URL 和 SUPABASE_ANON_KEY 已配置在 Vercel
6. **移动端导航菜单**：
   - 620px 以下显示 "Menu" 按钮
   - 点击展开全屏导航菜单
   - 子菜单（Results / Honors / Conferences）支持折叠/展开
   - 菜单支持滚动（内容超出时）
   - 链接颜色正确（白色，非蓝色）

### ⚠️ 已知问题（待修复）

1. **移动端图片不显示**
   - 现象：在手机上浏览网站时，论文封面图、新闻配图等图片无法显示
   - 线索：`data.js` 中 `pictureTag()` 函数生成 `<picture>` + `<source>` + `<img>` 结构，但移动端可能 WebP 支持问题或路径问题
   - 检查方向：确认 `assets/` 目录下 `.png` 和 `.webp` 文件是否都存在，以及 `pictureTag()` 的 fallback 逻辑

2. **导航菜单子项显示不全（可能已修复）**
   - 现象：之前菜单内容超出屏幕时无法滚动，已添加 `max-height: calc(100vh - 72px)` 和 `overflow-y: auto`
   - 需确认：在 iPhone 等小屏设备上是否能正常滚动

3. **中文乱码风险**
   - 现象：之前部署后出现中文乱码，原因是 Git 提交编码问题
   - 根因：本地文件是 UTF-8，但某次部署后线上中文变成乱码
   - 当前状态：已恢复，但需保持文件编码为 UTF-8，不要修改 `.gitattributes`

4. **缓存问题**
   - Vercel 对静态文件有缓存，修改后可能需要等待几分钟或刷新浏览器
   - 建议：每次修改后更新版本号 `v1.5.x` → `v1.5.x+1`，确保浏览器加载新文件

5. **未测试项**
   - 多语言切换（中英文）在移动端的体验
   - 后台管理页面（admin.html）在移动端的适配
   - 表单提交功能（如果存在）

---

## 三、文件结构详解

```
/
├── index.html              # 首页：新闻动态 + 简介入口
├── profile.html            # 个人简介：头像、教育背景、研究领域
├── results.html            # 成果：代表论文 + 专利 + 项目
├── honors.html             # 荣誉：奖励 + 创新创业
├── conferences.html        # 会议：国内外报告 + 学术服务 + 审稿
├── contact.html            # 联系方式：邮箱、电话、地址
├── admin.html              # 后台管理：编辑数据（需要 Supabase 权限）
│
├── data.js                 # 静态数据备份（当 Supabase 不可用时回退）
│                           # 包含：profile, metrics, research_areas, news, publications, projects, achievements, experiences, contacts
│
├── script.js               # 核心逻辑（约 730 行）
│                           # - 多语言切换（zh/en）
│                           # - 导航菜单交互（桌面端 hover + 移动端 click）
│                           # - 数据渲染（从 Supabase 或 data.js 加载）
│                           # - 页面滚动动画、Canvas 特效
│                           # - 新闻详情页动态渲染
│                           # - pictureTag()：WebP/PNG 双格式图片生成
│
├── styles.css              # 所有样式（约 3000 行）
│                           # - 全局变量、动画关键帧
│                           # - 桌面端布局（> 860px）
│                           # - 平板布局（861px - 1180px）
│                           # - 小屏布局（<= 620px）← 导航菜单在此修复
│                           # - 超小屏布局（<= 480px）
│                           # - 各页面组件样式
│
├── supabase-client.js      # Supabase SDK 封装（约 7.5KB）
│                           # - 初始化 Supabase 客户端
│                           # - 数据查询函数（fetchProfiles, fetchPublications 等）
│                           # - 如果 Supabase 失败，自动回退到 data.js
│
├── supabase-upload.js      # Supabase Storage 上传工具
│                           # - 上传图片/文件到 Supabase Storage
│
├── supabase-schema.sql     # 数据库建表脚本（备份，不部署）
├── supabase-data.sql       # 数据库数据导入脚本（备份，不部署）
│
├── vercel.json             # Vercel 部署配置（极简，不要改）
│                           # 注意：之前加了 builds 过滤器导致 CSS/JS 404，已删除
│
├── .vercelignore           # 不上传到部署的文件列表
│                           # 排除：node_modules, .env, *.sql, backup.sh 等
│
├── .gitignore              # Git 忽略列表
│
├── assets/                 # 图片资源（webp + png 双格式）
│   ├── profile.png/.webp    # 个人头像
│   ├── news-light-fingerprint.png/.webp
│   ├── light-fingerprint-main.png/.webp
│   └── 2020-2026 年论文封面图（各论文对应一对 png+webp）
│
├── papers/                 # 论文 PDF 文件
│   └── 各论文 PDF（文件名与 data.js 中对应）
│
└── optimize-images.py      # 图片批量转换脚本（webp + 压缩）
```

---

## 四、关键文件说明

### 1. `data.js` — 静态数据备份

当 Supabase 不可用时，网站自动使用 `data.js` 中的数据。数据结构必须和数据库表结构一致。

关键数据结构：
- `profile`：姓名、职位、邮箱、照片、Google Scholar、GitHub 链接
- `metrics`：统计数字（论文数、引用数、h-index）
- `research_areas`：3 个研究方向
- `news`：新闻列表（每个新闻有 title, date, summary, image）
- `publications`：代表论文（10 篇，用于首页和 results 页面）
- `all_publications`：全部论文（24 篇，用于 publications 页面）
- `projects`：项目（8 个）
- `achievements`：奖励、专利、学术服务、审稿、会议报告（35 条）
- `experiences`：教育经历（3 段：本科、硕士、博士）
- `contacts`：联系方式（4 条：Email, Phone, Google Scholar, GitHub）

### 2. `script.js` — 核心逻辑

最复杂的函数：

| 函数 | 说明 |
|------|------|
| `pictureTag(webpSrc, alt, cls, priority)` | 生成 `<picture>` + `<source>` + `<img>`，支持 WebP/PNG 双格式 |
| `setupNavigation()` | 导航菜单交互：桌面 hover + 移动端 click + 导航指示器动画 |
| `isCompactNav()` | 判断是否为紧凑型导航（<= 860px 或触屏设备） |
| `renderNews()` | 渲染新闻列表到首页 |
| `renderPublications()` | 渲染论文列表 |
| `renderNewsDetail()` | 渲染新闻详情页（动态插入 HTML 内容） |
| `switchLanguage()` | 中英文切换，切换 `html[lang]` 并更新所有文本 |
| `fetchFromSupabase()` | 从 Supabase 获取数据，失败时回退到 data.js |

### 3. `styles.css` — 样式

媒体查询断点：

| 断点 | 说明 |
|------|------|
| 默认（无媒体查询） | 桌面端布局，大屏 |
| `@media (max-width: 860px)` | 平板/小桌面，横向导航滚动 |
| `@media (min-width: 861px) and (max-width: 1180px)` | 中等宽度 |
| `@media (max-width: 620px)` | 手机横屏，**导航菜单改为全屏展开** |
| `@media (max-width: 480px)` | 手机竖屏，更小字体和间距 |

**已修复的移动端导航 CSS 在 620px 和 480px 断点中。**

### 4. `supabase-client.js` — 数据库连接

Supabase 配置：
- URL: `https://lmmkxikbhnorwliimnvc.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIs...`（已设置环境变量）

主要函数：
- `fetchProfiles()` / `fetchMetrics()` / `fetchResearchAreas()` / `fetchNews()` / `fetchPublications()` / `fetchProjects()` / `fetchAchievements()` / `fetchExperiences()` / `fetchContacts()`
- 每个函数都带 `fallback to data.js` 机制

---

## 五、数据库说明（Supabase）

### 连接方式

- **Dashboard**: https://supabase.com/dashboard/project/lmmkxikbhnorwliimnvc
- **SQL Editor**: https://supabase.com/dashboard/project/lmmkxikbhnorwliimnvc/sql/new
- **Storage**: https://supabase.com/dashboard/project/lmmkxikbhnorwliimnvc/storage/buckets

### 表结构

| 表名 | 用途 | 关键字段 | 行数 |
|------|------|---------|------|
| `profiles` | 个人基本信息 | name, name_en, title, email, photo, bio, google_scholar, github | 1 |
| `metrics` | 统计数据 | label, value, display_order | 3 |
| `research_areas` | 研究方向 | title, description, display_order | 3 |
| `news_items` | 新闻列表 | title, date, summary, image, slug, display_order | 3 |
| `news_details` | 新闻详细内容 | slug, content_html | 1 |
| `publications` | 代表论文 | title, authors, journal, year, doi, pdf, image, display_order | 10 |
| `all_publications` | 全部论文 | 同上，更多条目 | 24 |
| `projects` | 项目 | title, description, status, year, display_order | 8 |
| `achievements` | 成就/荣誉 | type, year, title, detail, display_order | 35 |
| `experiences` | 教育经历 | title, institution, period, description, display_order | 3 |
| `contacts` | 联系方式 | label, value, url, display_order | 4 |

### 已创建的 Storage Buckets

| Bucket | 权限 | 用途 |
|--------|------|------|
| `assets` | public | 图片文件（新闻配图、论文封面） |
| `papers` | public | 论文 PDF 文件 |
| `files` | public | 通用文件（已存在） |

---

## 六、部署流程（给 Kimi Work）

### 核心原则

**Push 到 GitHub → Vercel 自动部署（10-30 秒）**

无需手动操作 Vercel，只需把代码推到 GitHub 的 `main` 分支。

### 修改文件的完整流程

```bash
# 1. 进入项目目录
cd ~/Documents/02-个人/01-个人网站/个人简历网站

# 2. 修改文件（用任何编辑器：VS Code, Cursor, nano, 等）
# 修改 HTML/CSS/JS/数据

# 3. 更新版本号（所有 HTML 文件中的版本号都要改）
# 旧版本 → 新版本，例如 v1.5.14 → v1.5.15
sed -i '' 's/v1.5.14/v1.5.15/g' *.html
sed -i '' 's/Version 1.5.14/Version 1.5.15/g' *.html

# 4. 提交到 Git
git add -A
git commit -m "fix: 修改说明"
git push origin main

# 5. 等待 20-30 秒，然后验证
# 打开 https://xyfoptics.xyz 查看效果
# 或检查版本号：curl -s https://xyfoptics.xyz | grep Version
```

### 上传图片/PDF

```bash
# 1. 将文件放入对应目录
# 图片 → assets/  （需要同时提供 .webp 和 .png）
# PDF → papers/

# 2. 在 data.js 或 Supabase 中更新引用路径

# 3. 提交并推送
git add -A
git commit -m "feat: 添加新论文图片和PDF"
git push origin main
```

### 批量转换图片为 WebP

```bash
# 在项目目录运行
python3 optimize-images.py

# 这会将 PNG 转换为 WebP 并压缩，同时保留原 PNG
```

### 检查部署是否成功

```bash
# 方法 1：检查版本号
curl -s https://xyfoptics.xyz | grep "Version"

# 方法 2：检查 CSS 文件是否存在
curl -s "https://xyfoptics.xyz/styles.css?v=20250809-apple-v1.5.15" | wc -c
# 应该返回大于 60000 的数字（文件大小）

# 方法 3：看 Vercel 部署状态
# 打开 https://vercel.com/xyfoptics/yxiong-profile
```

---

## 七、最近修改记录

| 日期 | 版本 | 修改内容 | 状态 |
|------|------|----------|------|
| 2026-06-27 | v1.5.14 | 修复移动端导航菜单可滚动 | ✅ 已部署 |
| 2026-06-27 | v1.5.13 | 修复 480px 下拉菜单不折叠 + 链接颜色 | ✅ 已部署 |
| 2026-06-27 | v1.5.12 | 添加移动端 "Menu" 按钮 + 全屏导航菜单 | ✅ 已部署 |
| 2026-06-27 | v1.6.0 | Supabase 数据库集成 + Vercel 部署配置 | ✅ 已部署 |
| 2026-06-27 | — | 修复 vercel.json 导致 CSS/JS 404 | ✅ 已部署 |
| 2026-06-27 | — | 添加 SUPABASE_URL / SUPABASE_ANON_KEY 环境变量 | ✅ 已完成 |
| 2026-06-27 | — | 创建 Supabase Storage buckets (assets, papers) | ✅ 已完成 |
| 2026-06-27 | — | 导入 Supabase 数据（schema + data） | ✅ 已完成 |
| 2026-06-27 | — | 域名配置 xyfoptics.xyz + www.xyfoptics.xyz | ✅ 已完成 |
| 2026-06-27 | — | GitHub 仓库连接 Vercel | ✅ 已完成 |

---

## 八、给 Kimi Work 的建议和注意事项

### 1. 修改前先确认当前版本

```bash
curl -s https://xyfoptics.xyz | grep "Version"
# 或看 footer 里的版本号
```

### 2. 修改后必须更新版本号

所有 HTML 文件中的版本号 `v1.5.x` 和页面底部的 `Version x.x.x` 都要更新。这确保浏览器加载新文件，不受缓存影响。

### 3. 测试移动端时

- 用 Chrome DevTools 的 Device Mode 模拟不同手机尺寸
- 特别关注 `<= 620px` 和 `<= 480px` 两个断点
- 在真机上测试（iPhone Safari 和 Android Chrome 可能有差异）

### 4. 图片处理

- 新图片必须同时提供 `.webp` 和 `.png` 格式
- 文件名建议小写，用连字符，无空格
- 用 `optimize-images.py` 批量转换
- 图片放入 `assets/` 目录，PDF 放入 `papers/` 目录

### 5. 数据库修改建议

- 小量修改：直接在 Supabase Dashboard 的 Table Editor 中编辑
- 批量修改：用 SQL Editor 执行 SQL
- 修改前建议导出备份（`supabase-schema.sql` 和 `supabase-data.sql`）
- 修改后同时更新 `data.js`（作为离线备份）

### 6. 安全注意事项

- `SUPABASE_ANON_KEY` 是公开 key（用于前端），不要删除或修改
- 不要在 `data.js` 或代码中硬写敏感信息
- 后台管理页面（admin.html）可能需要额外的认证机制

### 7. 常见错误排查

| 问题 | 排查方法 |
|------|----------|
| 修改后网站没变化 | 检查版本号是否更新；等待 30 秒；刷新浏览器 |
| CSS/JS 404 | 检查 `vercel.json` 不要加 `builds` 过滤器 |
| 中文乱码 | 确认文件保存为 UTF-8；检查 Git 配置 |
| 图片不显示 | 检查 `assets/` 下是否有 `.png` 和 `.webp` 双文件；检查 data.js 路径 |
| 数据库数据不加载 | 检查 Supabase 服务状态；检查 `supabase-client.js` 配置 |

---

## 九、紧急联系

如遇问题：
1. 检查 Vercel 部署状态：https://vercel.com/xyfoptics/yxiong-profile
2. 检查 GitHub 仓库：https://github.com/xyf1231/yxiong-profile
3. 检查 Supabase 状态：https://status.supabase.com
4. 检查域名 DNS：阿里云控制台

---

*本交接摘要由 OpenClaw 助手编写，基于 2026-06-27 的实际操作记录。*
*如有遗漏或错误，请根据实际情况补充。*
