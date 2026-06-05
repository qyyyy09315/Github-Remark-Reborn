# GithubRemarkReborn

> 基于原 [GithubRemark](https://github.com/dpy1123/GithubRemark) 插件的重制版，参考了 [refined-github](https://github.com/refined-github/refined-github) 的实现思路，针对新版 GitHub 页面结构和 Turbo 框架做了全量适配，并全面优化了 UI 交互与性能。

## ✨ 功能特性

- 🔖 给任意 GitHub 用户添加自定义备注名，类似微信备注功能
- ✎ hover 显示编辑/删除按钮，点击即可内联编辑，无需弹窗
- 📱 全场景覆盖：个人主页、动态首页、关注/粉丝列表、项目星标/关注者列表、组织成员页
- ☁️ 支持云端同步，更换设备登录同一 GitHub 账号即可恢复所有备注
- 🚀 高性能：MutationObserver + debounce 扫描，不影响页面加载速度

## 🚀 安装方法

1. 下载本项目代码到本地任意目录
2. 打开 Chrome 浏览器，进入扩展管理页面 `chrome://extensions/`
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择项目目录
5. 扩展安装完成，刷新 GitHub 页面即可使用

## 📖 使用说明

1. 点击 Chrome 工具栏中的 GithubRemark 图标，选择 `on` 开启功能
2. 所有 GitHub 用户名旁会显示备注徽章，未设置过的不显示
3. 鼠标悬停备注徽章，点击 ✎ 编辑、✕ 删除
4. 编辑时备注名直接变为输入框，输入后点击 ✓ 保存或 ✕ 取消
5. 需要登录 GitHub 账号才能使用，以 GitHub 用户名作为唯一身份标识

## 🏗️ 技术架构

**Chrome 扩展（Manifest V3）**

- Service Worker (`bg.js`)：监听页面加载，自动注入功能脚本，管理开关状态
- 内容脚本 (`ghremark.js`)：核心功能实现，适配新版 GitHub Turbo 单页导航
- 接口层 (`webapi.js`)：封装云端接口调用，异常降级与参数校验

**后端服务（可选自行部署）**

- 基于 Node.js 的轻量 HTTP 服务，源码在 `server/` 目录
- 提供 `getRemark` / `updateRemark` 两个接口
- 默认使用公共服务，也可自行部署替换 `webapi.js` 中的地址

## 👨‍💻 作者

- 作者：[qyyyy](https://github.com/qyyyy)
- 原项目：[GithubRemark](https://github.com/dpy1123/GithubRemark) by [DD](https://github.com/dpy1123)
- 设计参考：[refined-github](https://github.com/refined-github/refined-github)

## 📌 免责声明

本插件仅用于增强 GitHub 用户体验，不会收集任何用户隐私数据。所有备注数据仅与用户 GitHub 账号绑定，不会泄露给第三方。
