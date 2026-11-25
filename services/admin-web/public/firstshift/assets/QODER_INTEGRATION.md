# Qoder 资产接入指令

阅读本包 README 与照片审核状态，再定位当前工程中 FirstShift 顶栏 Logo、内联 Icon 组件、图片提示和 export.ts。不要新建脱离现有工程的页面，也不要修改共享业务状态、任务合同、已有路由或公共 FirstShift 品牌。

1. 将已确认的 brand/logo.svg 放入 FirstShift 专用静态资源目录，按现有布局显示 40×40；旁边保留真实文字「岗伴 FirstShift」。如果图标和文字同属一个首页链接，logo 使用 alt=""，链接名称由可读文字提供。独立 Logo 才使用 alt="岗伴 FirstShift"。
2. favicon 暂存为 FirstShift 专用文件。只有团队确认允许修改入口后，才更新 head 中的 rel=icon 和 apple-touch-icon 链接，考虑 Vite BASE_URL。不覆盖 FirstShift 的 public/logo.ico，不修改共享配置。ICO 文件已单独命名。
3. 逐项替换 25 个现有 Icon 名称，不改其 Props/API。SVG 内联或作为静态编译组件，保持 currentColor；不要用普通 img 期待继承父节点 currentColor。图标旁边已有文字时 aria-hidden=true、focusable=false。仅图标按钮必须具备明确 accessible name（比如 aria-label="返回"），焦点仍由按钮管理。
4. 将 brand/passport-header.html 的 header 和 CSS 合并进现有 export.ts 的模板，保持导出字段、授权选择及 escaping 行为不变。SVG 是固定常量，不插入用户数据，不联网，打印测试黑白清楚；防止页头跨页。
5. P0 图片：当前原图未下载/审核，禁止改成虚假照片或向用户展示未经确认的商标/价签。先由团队按 photos/PHOTO_SOURCES.md 取得真实原图，记录实际来源与许可，确认符合场景及 alt；再替换图片提示。若仍缺照片，现有示意保留并清楚标明示意。不要在网页自动引用远程候选或假造授权。
6. 验收：40px 标志、16/32 favicon、180 touch icon；正常/高对比度/禁用/焦点图标效果；手机窄屏；导出打印预览；图片实际尺寸与 alt；build/test 结果。禁止将 GSAP 引入模拟模块，资产替换不改变任何业务逻辑。
