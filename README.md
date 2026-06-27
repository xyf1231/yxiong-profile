# xyfoptics 个人学术网站

熊毅丰（Yifeng Xiong）的个人学术主页，南京大学现代工程与应用科学学院。

🔗 **在线访问**: [https://xyfoptics.xyz](https://xyfoptics.xyz)

## 技术栈

- **前端**: 纯静态 HTML/CSS/JS，无框架依赖
- **动画**: Canvas 2D 粒子系统
- **数据**: Supabase (PostgreSQL + Storage)
- **部署**: Vercel (自动部署)
- **域名**: xyfoptics.xyz

## 数据架构

| 来源 | 用途 | 说明 |
|------|------|------|
| Supabase Database | 论文、项目、新闻、荣誉等结构化数据 | 在线模式 |
| Supabase Storage | 图片、PDF 等静态资源 | CDN 加速 |
| data.js | 离线备用数据 | file:// 或 localhost 模式 |

## 开发

```bash
# 本地预览
python3 -m http.server 8080

# 备份
./backup.sh
```

## 版本历史

- v1.6.0 — Supabase 数据迁移 + Vercel 部署
- v1.5.11 — 导航优化 + i18n 修复
- v1.5.7 — 导航高亮修复
- v1.5.5 — i18n 修复
- v1.5.4 — 优化版本
- v1.5.3 — 优化版本
- v1.5.2 — 优化版本
- v1.5.1 — 优化版本
- v1.4 — 初始版本

## 备份

每次修改自动备份到 `../个人简历网站备份/`，保留最近 20 个版本。

---

© 2026 Yifeng Xiong | yfxiong@nju.edu.cn

