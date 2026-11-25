# FirstShift 岗伴 · 工程美术资产包

本包按用户提供的 P0/P1 清单与 V4 正式开发包制作。品牌配色沿用 V4 tokens：主色 #235C50、强调 #E9B950、背景 #F5F4EF。标志为新绘制的 F + 两级台阶方向提案，表达第一步与支持，不采用此前扫描框/链条标记。当前未进行商标相似性审查，不作为已注册品牌。请团队确认后替换。

## 文件目录
- `brand/logo.svg`：40×40 主标记；顶部与现有文字字标配合使用。
- `brand/logo-mono.svg`、`logo-reverse.svg`：黑白打印和深色底版本。
- `brand/favicon.svg`、`favicon-32.svg`、`favicon-180.svg`：矢量站标。
- `brand/favicon-32.png`、`apple-touch-icon.png`、`firstshift-favicon.ico`：32、180 及 ICO（16/32）。
- `brand/passport-header.html`：不联网的单色打印页头片段，可移入 export.ts。
- `icons/*.svg`：指定的 25 个独立线性 SVG（24×24，描边 2px，圆头圆角，无填充，currentColor）。`icon-paths.json` 为静态设计源数据；建议 Qoder 转为受控 TSX 组件，不把外部字符串动态注入 HTML。
- `photos/PHOTO_SOURCES.md`：真实照片候选、原始来源/CC0 许可、拍摄构图、alt 候选和审核门槛。**真实照片原文件未下载成功，不在包内。P0 未完成。**
- `photos/shelf-labels-print.svg`：A1/A2/B1/B2 可打印标签，A5 纸；实体拍摄用，非真实照片。
- `preview/brand-icons-preview.png`：全部标志及图标的渲染总览。
- `ASSET_MANIFEST.csv`：来源、用途和状态记录。
- `QODER_INTEGRATION.md`：接入与验收指令。

## 设计资产使用
标志、图标、标签和打印页头为本次原创矢量/代码设计，没有复制或打包第三方图标集或字体文件；线性图标遵循常规 24px 图标规范（参考 https://lucide.dev/contribute/icons/figma-guide ），不是 Lucide 图标的授权包。可作为团队项目资产使用；通用图形不保证独占权，标志需查重。预览图片使用系统安装字体进行渲染，不包含字体文件。

## 检查结果
全部 SVG 已解析为有效 XML；25 个图标名称及根节点规格验证通过；32/180 PNG 像素尺寸已核对；设计总览已人工查看。未在当前正式代码库测试替换效果；未获得真实照片文件；未修改 public/logo.ico、导出实现或工作模拟。所有 SVG 均无需 GSAP。
