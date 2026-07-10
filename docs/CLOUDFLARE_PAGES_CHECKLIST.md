# Cloudflare Pages 收口清单

这份清单用于确认整站已经完整切到 Cloudflare Pages。上线前建议逐项核对。

## 发布链路

- Cloudflare Pages 项目已连接到当前仓库。
- 生产分支已指向 `main`。
- 生产域名已绑定 `xyfoptics.xyz`。
- `www.xyfoptics.xyz` 只作为同站别名或跳转域之一，不要和根域互相做跳转。
- Cloudflare Pages 里只能保留一个主域，另一条域名不要再单独加一层重定向规则。
- 仓库根目录的 `_redirects` 已随最新版本发布。

## 访问统计

- 已创建 Cloudflare D1 数据库。
- Pages 项目已绑定 D1，绑定名建议用 `VISITOR_COUNTER_DB`。
- `/api/counter` 已在 Cloudflare Pages 上返回正常计数。
- 首页访客数显示正常，没有再依赖旧的 Node 统计服务。

## 资源与后台

- 后台里“资源源”默认已切到 `Cloudflare`。
- 本地后台提示、说明文案和帮助链接都已改成 Cloudflare 版本。
- `README.md` 里的发布说明和 Cloudflare Pages 配置已同步更新。
- `docs/CHANGELOG.md` 已记录这次收口。

## 迁移收尾

- 旧的路由配置文件已删除。
- 旧的发布相关路由或部署说明只保留在归档目录里。
- 公开站点和后台界面不再出现旧的发布入口措辞。
- 需要的话，再把旧 DNS 记录逐条清理，只保留 Cloudflare 需要的记录。
