# 自己修改月历：保存代码，立即看到界面变化

你这台电脑已经有 VS Code 和 Node.js，不用再安装。项目依赖也已准备好。

## 打开项目

1. 打开 VS Code，选择“文件 → 打开文件夹”。
2. 选择 `D:\02_agent\CodexPro\workspace\sites\rest-calendar`。
3. 在 VS Code 选择“终端 → 新建终端”，输入：

```powershell
npm.cmd run dev
```

终端显示 `http://127.0.0.1:5173/` 后，用浏览器打开这个地址。也可以在项目文件夹双击 `start-preview.cmd` 启动，再打开该地址。结束预览时，在终端按 Ctrl+C。

预览启动后，改文件并按 Ctrl+S 保存，浏览器会自动更新。可以把 VS Code 放左边、浏览器放右边。这里只改本地预览，朋友访问的正式网站要发布之后才会变化。

## 最适合从这里开始：给朋友留一句话

打开 `app/personal-message.ts`，它现在是：

```ts
export const personalMessage = ``;
```

在两个反引号之间输入文字，可以直接换行：

```ts
export const personalMessage = `今天辛苦啦。
下次休息，一起去吃好吃的！`;
```

保存后，点网页右上角的问号，就能看到留言。留言留空时，问号里只显示导出、恢复。

这是公开网页的统一留言，发布后所有访客都能看到，不是只给某个特定朋友的私信。网页以普通文字显示内容，不需要写 HTML。

## 哪个文件改什么

| 想修改 | 文件 |
| --- | --- |
| 给朋友的留言 | `app/personal-message.ts` |
| 月历、按钮、弹窗中的文字和布局 | `app/manual-calendar-client.tsx` |
| 颜色、字号、间距、圆角 | `app/calendar.css` |

颜色例子：在 `app/calendar.css` 顶部，`--work` 是上班文字红色，`--rest` 是休息文字绿色；`--work-bg` 和 `--rest-bg` 是对应底色。改值、保存后即可预览。

iPhone 字体使用系统默认字体，不加载网络字体。

## 预览和正式网站的区别

- `127.0.0.1:5173`：你电脑上的开发预览，可以实时看修改；电脑关掉后预览停止。
- `zhupoxixixi.github.io/rest-calendar`：朋友使用的正式网址，云端托管，与电脑是否开机无关。
- 两个网址的本地日历数据相互独立。预览里的测试日程不会自动进入正式网址，也不会覆盖朋友的记录。
- 本地预览主要用来改界面。通知请在正式网址的 iPhone 主屏幕应用中测试。

改完后，可以直接让我“把现在的月历修改发布到 GitHub”，我会构建并同步正式网页。不要直接把这个 Sites 开发目录的旧 Git 历史推到公共仓库；公开仓库此前清理过测试快照历史。

提醒继续使用现有 FactChat API、`gpt-6-luna`、云端推送订阅和 GitHub 每日任务。改界面或留言不需要修改密钥，也不需要把密钥放进网页。

开发工具原理参考：[Vite 的热更新](https://vite.dev/guide/features#hot-module-replacement)、[VS Code 官方说明](https://code.visualstudio.com/docs/getstarted/userinterface)。
