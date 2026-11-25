import type { PassportItem, ShareConfig } from "../types";

const CATEGORY_TITLES: Record<PassportItem["category"], string> = {
  goal: "我的工作目标",
  explain: "希望怎样解释任务",
  format: "更容易理解的说明方式",
  help: "遇到困难时希望怎样获得帮助",
};

export interface SharePayload {
  html: string;
  text: string;
  selectedCount: number;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Builds the share copy from the owner's explicit selection only.
 * Unselected fields, history and diagnostics are never included.
 */
const PRINT_HEADER = `
  <header class="fs-print-header">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <path d="M7 34V13a7 7 0 0 1 7-7h20v7H15a1 1 0 0 0-1 1v5h13v7H14v8Z" fill="#202020" />
      <path d="M20 34v-5h8v-8h6v10a3 3 0 0 1-3 3Z" fill="#202020" />
    </svg>
    <div><strong>岗伴 FirstShift</strong><span>支持说明</span></div>
  </header>`;

export function buildSharePayload(
  items: PassportItem[],
  config: ShareConfig,
  ownerName: string,
): SharePayload {
  const selected = items.filter((item) => config.itemIds.includes(item.id));
  const ordered = (["goal", "explain", "format", "help"] as const)
    .map((category) => ({
      category,
      title: CATEGORY_TITLES[category],
      rows: selected.filter((item) => item.category === category),
    }))
    .filter((group) => group.rows.length > 0);

  const textLines = [
    `岗伴 FirstShift · 我的支持说明（${ownerName}）`,
    `分享给：${config.recipientLabel}${config.recipientDetail ? `（${config.recipientDetail}）` : ""}`,
    `用途：${config.purpose}`,
    `生成时间：${config.exportedAt}`,
    "",
    ...ordered.flatMap((group) => [
      `【${group.title}】`,
      ...group.rows.map((row) => `- ${row.value}`),
      "",
    ]),
    "说明：这是一份本人主动选择字段的演示副本，不是诊断、能力评价或就业资格证明。",
    "已经发送或打印的副本无法远程撤回。",
  ];

  const sections = ordered
    .map(
      (group) => `
      <section>
        <h2>${escapeHtml(group.title)}</h2>
        <ul>${group.rows.map((row) => `<li>${escapeHtml(row.value)}</li>`).join("")}</ul>
      </section>`,
    )
    .join("");

  const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>我的支持说明 · 岗伴</title>
<style>
  body{font-family:"Microsoft YaHei","PingFang SC",system-ui,sans-serif;color:#1d2925;background:#f5f4ef;margin:0;padding:32px 16px;line-height:1.65}
  main{max-width:720px;margin:0 auto;background:#fff;border:1px solid #65776d;border-radius:12px;padding:32px}
  h1{font-size:28px;margin:0 0 4px}
  .fs-print-header{display:flex;align-items:center;gap:12px;padding-bottom:12px;margin-bottom:18px;border-bottom:1px solid #333;color:#202020;break-inside:avoid;font-family:system-ui,sans-serif}
  .fs-print-header strong{display:block;font-size:15pt}
  .fs-print-header span{font-size:12pt}
  .fs-print-header svg{flex:none}
  .meta{color:#485a53;font-size:14px;border-bottom:2px solid #1d2925;padding-bottom:14px;margin-bottom:18px}
  h2{font-size:18px;color:#235c50;margin:22px 0 8px}
  ul{margin:0;padding-left:22px}
  li{margin:6px 0;font-size:17px}
  .note{margin-top:26px;padding:12px 14px;border-left:3px solid #235c50;background:#f5f4ef;font-size:14px;color:#485a53}
  @media print{body{background:#fff;padding:0}main{border:0;padding:0}}
</style>
</head>
<body>
<main>
  ${PRINT_HEADER}
  <h1>我的支持说明</h1>
  <p class="meta">${escapeHtml(ownerName)} · 分享给：${escapeHtml(config.recipientLabel)}${
    config.recipientDetail ? `（${escapeHtml(config.recipientDetail)}）` : ""
  } · 用途：${escapeHtml(config.purpose)} · ${escapeHtml(config.exportedAt)}</p>
  ${sections || "<p>本次没有选择要分享的内容。</p>"}
  <p class="note">这是本人主动选择字段的演示副本，不是诊断、能力评价或就业资格证明。已经发送或打印的副本无法远程撤回。</p>
</main>
</body>
</html>`;

  return {
    html,
    text: textLines.join("\n"),
    selectedCount: selected.length,
  };
}

export function shareFileBase(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `firstshift-support-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
    date.getHours(),
  )}${pad(date.getMinutes())}`;
}
