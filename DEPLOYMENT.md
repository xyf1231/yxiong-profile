# 部署清单

## 1. GitHub 仓库（等待用户完成）
- [ ] 创建 GitHub 仓库
- [ ] 推送本地代码到 GitHub
- [ ] 确认仓库地址

## 2. Vercel 连接
- [ ] 在 Vercel Dashboard 导入 GitHub 仓库
- [ ] 或连接现有项目 yxiong-profile 到 GitHub
- [ ] 设置环境变量：SUPABASE_URL, SUPABASE_ANON_KEY
- [ ] 触发首次部署

## 3. Supabase 数据（需要用户手动执行）
- [ ] 在 SQL Editor 执行 `supabase-schema.sql`
- [ ] 在 SQL Editor 执行 `supabase-data.sql`
- [ ] 在 Storage 创建 `assets` bucket（public）
- [ ] 在 Storage 创建 `papers` bucket（public）
- [ ] 运行 `SUPABASE_ANON_KEY=xxx node supabase-upload.js` 上传文件

## 4. 自定义域名
- [ ] 在 Vercel Dashboard 添加域名 xyfoptics.xyz
- [ ] 在域名服务商配置 DNS 记录（Vercel 会提供）
- [ ] 验证域名解析

## 5. 验证
- [ ] 访问 https://xyfoptics.xyz 确认正常
- [ ] 检查图片加载
- [ ] 检查论文列表
- [ ] 检查移动端适配
