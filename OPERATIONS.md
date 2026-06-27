# 网站运维与部署指南

> 本指南用于交接给 Kimi Work。记录了网站部署流程、文件结构、关键配置和常见问题。

---

## 项目概览

| 项目 | 地址 |
|---|---|
| 网站 | https://xyfoptics.xyz / https://www.xyfoptics.xyz |
| GitHub 仓库 | https://github.com/xyf1231/yxiong-profile |
| 数据库 | Supabase (https://lmmkxikbhnorwliimnvc.supabase.co) |
| 部署平台 | Vercel (auto-deploy from GitHub) |
| 域名管理 | 阿里云域名服务商 |

## 技术栈

- 纯静态 HTML/CSS/JS 网站（无框架，无打包工具）
- 数据从 Supabase 动态加载（`supabase-client.js`）
- Vercel 静态托管（连接 GitHub 自动部署）
- 版本号格式：`v1.5.x`（每次修改后递增）

---

## 文件结构

```
/
├── index.html              # 首页（新闻动态）
├── profile.html            # 个人简介
├── results.html            # 成果（论文+专利+项目）
├── honors.html             # 荣誉（奖励+创业）
├── conferences.html        # 会议（报告+服务）
├── contact.html            # 联系方式
├── admin.html              # 后台管理（仅管理员）
├── data.js                 # 静态数据（备用）
├── script.js               # 页面逻辑、渲染、交互
├── styles.css              # 所有页面样式
├── supabase-client.js      # Supabase SDK 封装
├── supabase-upload.js      # Supabase Storage 上传工具
├── supabase-schema.sql     # 数据库建表脚本（备份）
├── supabase-data.sql       # 数据库数据（备份）
├── vercel.json             # Vercel 部署配置（无需修改）
├── assets/                 # 图片（论文封面、新闻配图、头像）
│   ├── profile.png/.webp   # 个人头像
│   └── ...                 # 论文封面图（webp + png 双格式）
├── papers/                 # 论文 PDF 文件
│   └── ...                 # 各论文 PDF
└── .vercelignore           # 不上传到部署的排除列表
```

---

## 部署流程

### 核心原则：Vercel 自动部署

**每次你 push 代码到 GitHub 的 `main` 分支，Vercel 会在 10-30 秒内自动重新部署网站。**

### 修改文件并部署

**方法 1：本地修改（推荐）**

```bash
# 1. 进入项目目录
cd ~/Documents/02-个人/01-个人网站/个人简历网站

# 2. 修改文件（用任意编辑器）
# 编辑 index.html, styles.css, script.js, data.js 等

# 3. 修改版本号（搜索替换所有 HTML 中的版本号）
# 旧版本 v1.5.14 → 新版本 v1.5.15
sed -i '' 's/v1.5.14/v1.5.15/g' *.html
sed -i '' 's/Version 1.5.14/Version 1.5.15/g' *.html

# 4. 提交到 Git
git add -A
git commit -m "fix: 修改内容描述"
git push origin main

# 5. 等待 20-30 秒，Vercel 自动完成部署
```

**方法 2：通过 GitHub 网页直接上传**

1. 打开 https://github.com/xyf1231/yxiong-profile
2. 点击 `Add file → Upload files`
3. 拖入要上传的文件（覆盖同名文件）
4. 填写 Commit message，如 `fix: 更新内容`
5. 点击 `Commit changes`
6. Vercel 自动部署

**方法 3：GitHub 网页在线编辑**

1. 打开 GitHub 仓库，找到要编辑的文件
2. 点击文件右侧的铅笔图标 ✏️
3. 在线修改内容
4. 填写 Commit message
5. 点击 `Commit changes`
6. Vercel 自动部署

---

## 上传文件

### 上传图片（论文封面、新闻配图）

图片需要两个格式：**`.webp`（主格式）+ `.png`（备用格式）**

**步骤：**
1. 准备图片（推荐用 webp 格式，可用 `optimize-images.py` 批量转换）
2. 将 `.webp` 和 `.png` 两个文件放入 `assets/` 目录
3. 在 `data.js` 中引用路径：`assets/文件名.webp`
4. 提交到 GitHub，Vercel 自动部署

```python
# 批量转换图片为 webp（在项目目录运行）
python3 optimize-images.py
```

### 上传论文 PDF

1. 将 PDF 文件放入 `papers/` 目录
2. 在 `data.js` 的 `publications` 数组中更新对应条目的 `pdf` 字段
3. 提交到 GitHub，Vercel 自动部署

### 上传头像

1. 替换 `assets/profile.png` 和 `assets/profile.webp`
2. 提交到 GitHub，Vercel 自动部署
3. 如果头像在数据库（Supabase）中，还需更新 `profiles` 表的 `photo` 字段

---

## 修改数据（Supabase 数据库）

### 数据库结构

| 表 | 说明 | 行数 |
|---|---|---|
| `profiles` | 个人基本信息 | 1 |
| `metrics` | 统计数据（论文数、引用数等） | 3 |
| `research_areas` | 研究领域 | 3 |
| `news_items` | 新闻列表 | 3 |
| `news_details` | 新闻详细内容 | 1 |
| `publications` | 代表论文（首页展示） | 10 |
| `all_publications` | 全部论文 | 24 |
| `projects` | 项目 | 8 |
| `achievements` | 奖励、专利、会议报告、荣誉 | 35 |
| `experiences` | 教育经历 | 3 |
| `contacts` | 联系方式 | 4 |

### 修改数据的方法

**方法 A：Supabase Dashboard 在线编辑（推荐小改动）**

1. 打开 https://supabase.com/dashboard/project/lmmkxikbhnorwliimnvc
2. 左侧 → `Table Editor`
3. 选择要修改的表
4. 直接点击行编辑，或点击 `Insert row`

**方法 B：SQL Editor 批量修改（推荐大改动）**

1. 打开 https://supabase.com/dashboard/project/lmmkxikbhnorwliimnvc/sql/new
2. 输入 SQL 语句，如 `UPDATE publications SET ... WHERE ...`
3. 点击 Run 执行

**方法 C：修改 data.js（备用）**

如果数据库不可用，网站会自动回退到 `data.js` 中的静态数据。修改 `data.js` 后提交到 GitHub 即可。

---

## 备份策略

### 自动备份（GitHub）

所有代码文件通过 GitHub 自动备份。每次提交都会永久保存历史。

### 数据库备份

```bash
# 导出数据库结构（在项目目录执行）
# 1. 导出建表 SQL
pg_dump ...

# 或直接在 Supabase Dashboard → SQL Editor → 导出
```

### 手动备份

```bash
# 创建本地备份包（包含所有文件）
cd ~/Documents/02-个人/01-个人网站/个人简历网站
tar czf ~/backup/yxiong-profile-$(date +%Y%m%d-%H%M%S).tar.gz .
```

---

## 关键配置说明

### vercel.json（不要修改）

```json
{
  "version": 2,
  "name": "yxiong-profile",
  "routes": [{"src": "/(.*)", "dest": "/$1"}]
}
```

- 纯静态部署，所有文件原样上传
- 之前配置过 `builds` 过滤器导致 CSS/JS 404，已删除

### .vercelignore（不要修改）

排除了 `node_modules/`、`.env`、`*.sql` 等不需要部署的文件。

### 环境变量（Vercel）

| 变量 | 值 |
|---|---|
| `SUPABASE_URL` | `https://lmmkxikbhnorwliimnvc.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGci...` |

> 环境变量在 `Vercel Dashboard → Settings → Environment Variables` 中设置。
> 注意：这些是前端变量，会被打包到 JS 中。如需保密，应改用 Edge Function。

---

## 已知问题 & 注意事项

1. **缓存刷新**：Vercel 对静态文件有缓存。修改后可能需要加 `?v=xxx` 或等待几分钟
2. **中文编码**：git 和文件系统必须保持 UTF-8，避免编码错误导致乱码
3. **图片格式**：务必提供 `.webp` + `.png` 双格式，兼容不同浏览器
4. **版本号**：每次部署后必须更新版本号（`v1.5.x`），确保浏览器加载新文件
5. **域名 DNS**：如果域名无法访问，检查阿里云 DNS 记录是否正确指向 Vercel

---

## 快速操作速查表

| 操作 | 命令/步骤 |
|---|---|
| 修改文件后部署 | `git add -A && git commit -m "说明" && git push origin main` |
| 只改版本号触发重部署 | 改 `README.md` 一行，然后 `git push` |
| 上传图片 | 放入 `assets/` 目录，`git push` |
| 修改数据库 | Supabase Dashboard → Table Editor |
| 查看部署状态 | 访问 https://vercel.com/xyfoptics/yxiong-profile |
| 检查线上版本 | `curl -s https://xyfoptics.xyz | grep Version` |

---

## 联系信息

- 域名：xyfoptics.xyz / www.xyfoptics.xyz
- GitHub：xyf1231/yxiong-profile
- Vercel Team：xyfoptics
- 数据库：Supabase (project: lmmkxikbhnorwliimnvc)

---

*文档版本：v1.5.14 部署后*
*最后更新：2026-06-27*
