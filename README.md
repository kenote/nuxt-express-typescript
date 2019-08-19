# nuxt-express-typescript

> 基于 `Nuxt` 和 `Express` 服务端渲染实践，采用 `Typescript` 构建并集成 `Element UI` 。

## 技术栈

- `Typescript` Javascript类型的超集
- `Nuxt.js` 基于 Vue.js 的通用应用框架
- `Express` 是一个保持最小规模的灵活的Node.js Web 应用程序开发框架，为Web 和移动应用程序提供一组强大的功能。
- `Element UI` 一套为开发者、设计师和产品经理准备的基于Vue 2.0 的桌面端组件库
- `Backpack` Node.js项目的简约的构建系统，底层基于 Webpack

## 命令集

| 名称 | 类型 | 描述 | 示例 |
| ---- | ---- | --- | --- |
| dev | `npm` / `yarn` | 运行开发环境 | `yarn dev` 或 `npm run dev` |
| build | `npm` / `yarn` | 编译生产环境 | `yarn build` 或 `npm run build` |
| install | `make` | 安装所有模块 | `make install` |
| reinstall | `make` | 重新安装所有模块 | `make reinstall` |
| start | `make` | 启动生产环境，需要服务器全局安装 `PM2` 模块 | `make start` |
| restart | `make` | 重启生产环境，需要服务器全局安装 `PM2` 模块 | `make restart` |
| stop | `make` | 停止生产环境，需要服务器全局安装 `PM2` 模块 | `make stop` |
| delete | `make` | 从系统 `PM2` 队列中删除此应用 | `make delete` |