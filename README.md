# 休班 · 我的月历

GitHub Pages 前端：https://zhupoxixixi.github.io/rest-calendar/

无需登录，适合朋友在 iPhone 用 Safari 添加到主屏幕。指定姓名导入完整月度排班，核对后保存；“正”和“值班”均为上班，“休”为休班。支持上下半月分段表格。

## 数据在哪里

- 姓名、逐日班次、历史月份、图片识别缓存：仅存在浏览器 IndexedDB。
- 云端：匿名设备令牌的散列、上传次数与图片指纹、匿名网络来源散列、推送订阅和发送去重记录。
- 图片经云端转发给用户配置的 FactChat `gpt-6-luna` 识别；不保存原图、姓名或识别结果。第三方识别服务的数据政策不由本项目控制。
- 不自动跨设备同步。11 月导入不会覆盖 10 月。清除浏览器数据、更换手机或移除主屏幕应用前，应从“使用帮助”导出全部月份备份，再在新设备恢复。

## 每日通知

GitHub Actions 的 `daily-reminder.yml` 在 UTC 11:00（韩国20:00、中国19:00）触发云端后台。GitHub 定时任务可能延迟，不应作为精确闹钟或唯一的考勤保障。用户已授权每月自动提交一条不含用户数据的运行月份标记，避免公共仓库60天无活动导致计划任务停用。

云端不读取个人班表，只发送目标日期和通用短句。iPhone Service Worker 从同源 IndexedDB 读取本地班表，显示“明天上班 / 值班 / 休班”。没导入目标月份时显示待导入提示。每次 push 都显示可见通知，符合 Safari 要求。浏览器不需要保持打开，电脑也不需要开机。

iPhone：Safari 打开 Pages → 分享 → 添加到主屏幕 → 从图标打开 → 提醒 → 开启通知。需要 iOS 16.4+。网页数据保存和推送订阅均与来源绑定，建议先添加到主屏幕后再正式导入、订阅。允许通知后可发送测试通知；真实手机的收件仍需本人确认。

后台每天至多调用 Luna 一次生成适用于工作或休班的通用短句，不向模型发送个人排班。失败时使用固定短句。通知受网络、系统权限和专注模式影响。

## 上传额度

朋友版不要求账号，因此按设备身份（不是自然人）每自然月最多识别10次。失败也计次，相同图片的本地缓存不计次。清除设备数据可能产生新身份，无法声称严格的“每人10次”。服务端另设网络来源与全站额度保护：每来源每月最多50次，全站每月最多300次新识别；最多20个新设备/来源/月、500个新设备/站点/月。共享出口可能共用保护限额。

## 发布与密钥

`docs/` 是预构建前端，由 GitHub Pages 工作流发布；不需要在浏览器配置 API 密钥。后端托管在 Sites，提供公开但有设备认证和额度限制的识别、订阅接口。

FactChat API 密钥和 VAPID 私钥仅保存在后端加密环境变量。后台执行密钥 `CRON_TOKEN` 同时保存为 GitHub Actions 的 `REMINDER_CRON_TOKEN` Secret。它不包含模型密钥或班表。

`POST /api/reminders` 只有 `X-Reminder-Key` 匹配时才会执行。未提供密钥只返回无操作结果，兼容停用的旧任务；错误密钥403。旧 `/mcp` 维护入口与云端班表写入接口已停用。

开发：

```
node scripts/build-pages.mjs
node node_modules/typescript/bin/tsc --noEmit
node --test tests/calendar.test.mjs tests/reminder-copy.test.mjs tests/local-notification.test.mjs
node scripts/run-framework.mjs build
```

前端源码在 `pages-src/`、`app/calendar-client.tsx`、`lib/local-client.ts` 和 `public/sw.js`。后端与生成的数据库迁移保留在同一仓库。`.dev.vars`、`output/`、`.wrangler/` 永远不能提交。部署后端使用 `.openai/hosting.json` 的既有站点身份，不重新创建站点。
