# P0 · 货架真实摄影待验收

**当前状态：BLOCKED（未交付已审核的真实照片）。** 本次联网检索确认下列候选的 CC0 许可，但文件运行环境不能解析/下载 Wikimedia 图像原文件，故无法进行原图逐像素检查。禁止把候选照片直接放入正式网页。候选来源、拟用 alt 和拍摄要求如下。不要用 AI 生成图冒充真实照片。

## 候选真实照片（待人工查看）

| 候选 | 原始资料 | 许可 | 审核状态 |
|---|---|---|---|
| Empty-Shelves-P1630832.jpg | citytransportinfo；2020-04-17；4320×3240；[Commons 页面](https://commons.wikimedia.org/wiki/File:Empty-Shelves-P1630832.jpg)；[原图](https://upload.wikimedia.org/wikipedia/commons/3/3f/Empty-Shelves-P1630832.jpg)；[Flickr 原始来源](https://www.flickr.com/photos/47739225@N08/49811567082/) | CC0 1.0；Commons 2020-04-29 许可审核 | 原图未下载，禁止直接上架；需检查品牌、人员、价签及构图 |
| Empty shelves at Yonghui Supermarket before closing.jpg | 2024-09-09；4000×3000；[Commons 页面](https://commons.wikimedia.org/wiki/File:Empty_shelves_at_Yonghui_Supermarket_before_closing.jpg) | 页面检索显示 CC0 1.0，仍须下载时复核署名与许可 | 原图未下载，禁止直接上架；门店名称仅为来源，不作为产品内文案 |

许可文本：https://creativecommons.org/publicdomain/zero/1.0/ 。CC0 不意味着商标、隐私或肖像权也自动清除。候选只供选图，无法保证与 A1/A2/B1/B2 场景一致。若不能通过审核，应自行拍摄；不可直接把图片提示称为真实岗位照片。

## 推荐最终方案：自摄 2 张（同一货架）

使用两层、两列、浅灰或白色层板的实体货架，背景简洁，所有商品为无字纯色包装。清除价签及商标。打印附带 `shelf-labels-print.svg`，裁切四张标签后贴在对应货位正面：上左 A1，上右 A2，下左 B1，下右 B2。绿色底、白色大字与现有项目配色一致。如果正式代码的货位布局不同，按实际 fixture 核对后拍摄，不能硬改业务数据适配照片。

- `shelf-overview.jpg`：横向 3:2，建议 1800×1200 或以上。镜头正对货架，不使用广角畸变；完整展示两行两列和四张标签，标签不遮挡。预期 alt（仅照片实际一致时使用）：`两层货架，每层两个货位。上层左边是 A1，右边是 A2；下层左边是 B1，右边是 B2。`
- `shelf-a2-closeup.jpg`：横向 3:2，建议 1800×1200 或以上。拍上层右侧 A2 货位近景，标签清晰、空位可见；不是另一种货架。预期 alt（仅照片实际一致时使用）：`货架上层右侧的 A2 标签及其后方可放置商品的空位。`

光线：柔和自然光或普通室内均匀照明，画面真实，避免景深过浅、镜面反光、人物倒影、可识别品牌、数字价格签和杂乱背景。保留标签和真实层板；无需美术滤镜或 AI 修改。原始文件单独存档，网页可用导出的 JPG/WebP；删除 EXIF 中精确位置等不必要元数据。若要同时支持 A2→B1 变化，第二张也可改拍 B1，但文件名和 alt 必须同步修改。

## 发布门槛

1. 记录摄影者、拍摄日期、授权类型、原图来源、改动方式、确认人。
2. 确认文件真实摄影、尺寸 ≥1200×800、无可识别真人、商标及数字价签。
3. 确认货位文字与当前任务版本一致，图片 alt 与实际内容一致。
4. 未通过不得替代生产图片提示；保持现有示意图并清楚标明「货架示意」。

W3C informative images: https://www.w3.org/WAI/tutorials/images/informative/ 。
