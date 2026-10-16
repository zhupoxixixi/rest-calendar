# 休班 · 我的月历

GitHub Pages：https://zhupoxixixi.github.io/rest-calendar/

点击日期后选择三个卡片：红色上班、绿色休息、自定义输入。输入自定义内容后保存；只修改这一天。未设置日期留空，旧班表和往期月份保留。支持离线查看与编辑、逐日清除、导出全部月份和恢复备份。

图片识别已移除，旧识别接口返回410并提示刷新网页。日历编辑不调用API、不需要姓名或设备凭据。之前识别保存的班表继续兼容。

## 本地数据

所有逐日安排与历史月份保存在原来的 IndexedDB `rest-calendar-local-v1`，不更换存储位置、不删除旧记录。自定义类型独立保存，通知不会将它误报成上班。每个月独立保存；更换手机、卸载主屏幕应用或清除网站数据前，应先导出备份。数据不会自动跨设备同步。

云端仍保存通知所需的匿名设备凭据散列、推送地址和发送去重记录；旧的上传计数保留，新的手动编辑不产生上传记录。服务器不保存个人班表。

## 每日通知

GitHub Actions `daily-reminder.yml` 每天UTC11:00（韩国20:00、中国19:00）调用云端提醒入口，不依赖个人电脑开机。计划任务可能延迟，不是精确闹钟。每月运行标记按已有授权保持计划任务活跃。

通知由手机的 Service Worker 读取本地次日安排，显示上班、休息或原样的自定义内容。未设置时提醒补充安排。通用短句仍通过用户配置的 FactChat API 和 `gpt-6-luna` 每天最多调用一次，失败使用固定文案，不上传个人班表。

iPhone：Safari打开 → 添加到主屏幕 → 从图标打开 → 设置日程 → 提醒 → 允许通知 → 发送测试通知。需要iOS16.4+。通知受网络、系统权限、专注模式影响，真实手机送达需本人确认。

## 发布

`docs/`由GitHub Pages发布。Sites后端提供设备注册、推送订阅和受`X-Reminder-Key`保护的提醒执行入口。FactChat密钥、VAPID私钥仅在后端加密环境变量，GitHub Actions只保存提醒执行专用Secret。

前端：`app/manual-calendar-client.tsx`、`lib/local-client.ts`、`public/sw.js`。旧入口`app/calendar-client.tsx`仅转发到新版。

```
node scripts/build-pages.mjs
node node_modules/typescript/bin/tsc --noEmit
node --test tests/calendar.test.mjs tests/reminder-copy.test.mjs tests/local-notification.test.mjs
node scripts/run-framework.mjs build
```

`.dev.vars`、`output/`、`.playwright-cli/`与运行数据不得提交。GitHub发布须以GitHub当前main为基底，不能合并早期已清理的Sites私有源仓库提交历史。
