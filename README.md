# 休班 · 我的月历

适合 iPhone 的排班图片导入、整月日历和 Web Push（网页推送）提醒。

## 使用

登录 → 上传 JPG/PNG/WebP → 指定图片中的准确姓名和月份 → 逐日核对 → 确认保存。每个账号每月保留一位人员的班表，保存会替换该月数据，其他月份保留。

iPhone 使用 Safari 打开，分享 → 添加到主屏幕 → 从桌面图标打开 → 提醒 → 开启通知。需要 iOS 16.4+。通知默认在休班前一天 20:00 Asia/Seoul（中国时间 19:00）发送。系统通知权限、网络、专注模式可能影响实际到达时间。

## 与原项目沿用的逻辑

参考食堂和公告项目的服务端 API、结构化数据校验、缓存和数据/展示分离；原项目未修改。网页打开、月份切换、查看、核对、保存不调用模型。

- FactChat 兼容 Chat Completions，默认 `gpt-6-luna`，一次请求识别整月指定人员，不自动重试。
- 图片、姓名、月份按账号做 SHA-256 缓存。不保存原图，图片会发送给配置的识别服务处理。
- 图片不清、图例不明确、空白单元格标记 `unknown`；不根据周末猜测休班，待确认日期禁止保存。
- 账号使用 Sites 平台身份头，D1 持久化记录，全部用户数据查询限定 user_id。
- 自然月按 Asia/Seoul 计算，每账号最多 10 次新识别请求（失败也计次）；单条原子 SQL 先预留额度，再调用外部服务。缓存不重复扣次。
- 推送采用 RFC 8291 aes128gcm 与 VAPID；Service Worker 处理关闭网页后的通知。无原生日历依赖。

## 配置与部署

使用 Sites 管理身份、D1 数据库、加密环境变量和托管。`.openai/hosting.json` 是唯一站点身份；禁止重新创建站点。

服务端变量：`ROSTER_API_KEY`、`ROSTER_API_ENDPOINT`、`ROSTER_MODEL`、`VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`、`VAPID_SUBJECT`。本地使用忽略的 `.dev.vars`。任何密钥都不能提交 Git。

```
node scripts/run-framework.mjs dev --hostname 127.0.0.1
node node_modules/typescript/bin/tsc --noEmit
node scripts/run-framework.mjs build
node --test tests/calendar.test.mjs
```

当前 Windows 环境中 Sites 包管理器帮助器调用 npm.cmd 有路径兼容问题；使用项目现有 `run-framework.mjs` 构建。保持 Sites Vite 集成，不手动部署到 Cloudflare。

## 后台提醒

`POST /api/reminders` 接受 `{ "dryRun": true/false }`，供后台任务通过 Sites 官方服务访问令牌调用。本站不启用平台 MCP 插件网关，以便云端任务通过官方服务访问令牌请求兼容的 JSON-RPC 维护入口。

`POST /mcp` 为已有云端任务保留 JSON-RPC 兼容入口，提供 `send_rest_reminders({dryRun?:boolean})`，经 Sites 私有访问边界保护。每天 20:00 Asia/Seoul 由关联的云任务调用。定时任务不是浏览器计时器，不依赖电脑开机。任务的实际关联和启用状态以 Sites 返回为准。

仅向订阅设备发送明日已保存的休班；日期与设备联合去重，失效订阅（404/410）自动清理。`dryRun` 只读取符合条件的订阅，不发送通知。每次最多处理 500 个订阅，当前面向个人/小规模使用。

定时触发与推送服务交付均可能有延迟。未在真实 iPhone 上授权订阅前，不能宣称已验证手机实际收件。

## 验证

真实识别使用明确标注为测试的三人、31 天合成班表，核对指定姓名的 31 天标签和类型；不代表所有图片均可准确识别。浏览器 QA 产物在忽略的 `output/playwright/`。生产数据库不导入测试班表。
