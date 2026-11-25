import { useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, PageHeader, useDocumentTitle } from "../../components/ui";
import { DEMO_USER_NAME } from "../../fixtures/demo";
import { buildSharePayload, shareFileBase } from "../../share/export";
import { useDemoStore } from "../../store/demoStore";
import { CATEGORY_LABELS } from "../../types";
import type { PassportCategory, ShareConfig } from "../../types";

const RECIPIENTS = [
  { id: "coach", label: "就业辅导员", detail: "陈老师（虚构）" },
  { id: "mentor", label: "岗位导师", detail: "王师傅（虚构）" },
  { id: "family", label: "家人或可信赖的支持者", detail: "" },
  { id: "other", label: "其他人", detail: "" },
];

const PURPOSES = ["了解我的支持需要", "上岗准备", "遇到困难时参考", "其他"];

const ORDER: PassportCategory[] = ["goal", "explain", "format", "help"];

function nowLabel(): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function printHtml(html: string) {
  const frame = document.createElement("iframe");
  frame.title = "打印预览";
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "0";
  frame.style.height = "0";
  frame.style.border = "0";
  frame.srcdoc = html;
  document.body.appendChild(frame);
  frame.addEventListener("load", () => {
    frame.contentWindow?.focus();
    frame.contentWindow?.print();
    window.setTimeout(() => frame.remove(), 60000);
  });
}

export default function PassportShare() {
  useDocumentTitle("分享支持说明");
  const items = useDemoStore((state) => state.passportItems);
  const recordShare = useDemoStore((state) => state.recordShare);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [recipientOther, setRecipientOther] = useState("");
  const [purpose, setPurpose] = useState("");
  const [purposeOther, setPurposeOther] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const groups = ORDER.map((category) => ({
    category,
    title: CATEGORY_LABELS[category],
    rows: items.filter((item) => item.category === category),
  })).filter((group) => group.rows.length > 0);

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const recipient = RECIPIENTS.find((entry) => entry.id === recipientId);
  const recipientLabel =
    recipientId === "other" ? recipientOther.trim() : recipient ? recipient.label : "";
  const recipientDetail =
    recipientId === "other" ? "" : recipient ? recipient.detail : "";
  const purposeText = purpose === "other" ? purposeOther.trim() : purpose;

  function toggleItem(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
    setStatus(null);
    setError(null);
    setWarning(null);
  }

  function validate(): ShareConfig | null {
    const missing: string[] = [];
    if (selectedIds.length === 0) missing.push("至少选择一项要分享的内容");
    if (!recipientLabel) missing.push("选择分享给谁");
    if (!purposeText) missing.push("选择用途");
    if (missing.length > 0) {
      setError(`还不能导出：${missing.join("；")}。`);
      return null;
    }
    setError(null);
    return {
      recipientLabel,
      recipientDetail,
      purpose: purposeText,
      itemIds: selectedIds,
      exportedAt: nowLabel(),
    };
  }

  function exportCopy(kind: "html" | "text") {
    const config = validate();
    if (!config) return;
    const payload = buildSharePayload(items, config, DEMO_USER_NAME);
    const result = recordShare(config);
    if (!result.ok) {
      setWarning("副本已生成，但这台设备无法记录这次分享状态。接收者拿到的内容仍然只是你选择的字段。");
    } else {
      setWarning(null);
    }
    const base = shareFileBase(new Date());
    if (kind === "html") {
      downloadFile(`${base}.html`, payload.html, "text/html;charset=utf-8");
      setStatus(`已生成网页副本：${payload.selectedCount} 项内容。网页或打印件无法远程撤回。`);
    } else {
      downloadFile(`${base}.txt`, payload.text, "text/plain;charset=utf-8");
      setStatus(`已生成文本副本：${payload.selectedCount} 项内容。网页或打印件无法远程撤回。`);
    }
  }

  function printCopy() {
    const config = validate();
    if (!config) return;
    const payload = buildSharePayload(items, config, DEMO_USER_NAME);
    const result = recordShare(config);
    setWarning(result.ok ? null : "打印已开始，但这台设备无法记录这次分享状态。");
    printHtml(payload.html);
    setStatus(`已打开打印预览：${payload.selectedCount} 项内容。打印件无法远程撤回。`);
  }

  if (items.length === 0) {
    return (
      <div className="fs-stack">
        <PageHeader backTo="/firstshift/passport" backLabel="返回支持说明" title="分享支持说明" titleId="fs-share-title" />
        <EmptyState
          title="还没有可以分享的内容"
          action={
            <Link className="fs-btn fs-btn--primary" to="/firstshift/passport/edit">
              先填写支持说明
            </Link>
          }
        >
          分享只导出你勾选的条目。可以先去创建支持说明，再回来选择。
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="fs-stack">
      <PageHeader
        backTo="/firstshift/passport"
        backLabel="返回支持说明"
        title="分享支持说明"
        aside={<span className="fs-badge fs-badge--primary">已选择 {selectedIds.length} 项</span>}
        titleId="fs-share-title"
      />

      <div className="fs-share">
        <div className="fs-stack">
          <section className="fs-card" aria-labelledby="fs-share-items">
            <h2 className="fs-h3" id="fs-share-items">
              1. 选择内容
            </h2>
            <div className="fs-stack" style={{ marginTop: 12 }}>
              {groups.map((group) => (
                <fieldset key={group.category} style={{ border: 0, padding: 0, margin: 0 }}>
                  <legend className="fs-caption" style={{ fontWeight: 700, marginBottom: 6 }}>
                    {group.title}
                  </legend>
                  <div className="fs-choicegroup">
                    {group.rows.map((item) => (
                      <label key={item.id} className="fs-choice">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                        />
                        <span>{item.value}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          </section>

          <section className="fs-card" aria-labelledby="fs-share-who">
            <h2 className="fs-h3" id="fs-share-who">
              2. 分享对象
            </h2>
            <div className="fs-choicegroup" style={{ marginTop: 12 }} role="radiogroup" aria-label="分享给谁">
              {RECIPIENTS.map((entry) => (
                <label key={entry.id} className="fs-choice">
                  <input
                    type="radio"
                    name="fs-recipient"
                    value={entry.id}
                    checked={recipientId === entry.id}
                    onChange={() => {
                      setRecipientId(entry.id);
                      setStatus(null);
                    }}
                  />
                  <span>
                    {entry.label}
                    {entry.detail && <small>{entry.detail}</small>}
                  </span>
                </label>
              ))}
            </div>
            {recipientId === "other" && (
              <div className="fs-field" style={{ marginTop: 12 }}>
                <label htmlFor="fs-recipient-other">对方怎么称呼？</label>
                <input
                  id="fs-recipient-other"
                  className="fs-input"
                  value={recipientOther}
                  maxLength={40}
                  onChange={(event) => setRecipientOther(event.target.value)}
                />
              </div>
            )}
          </section>

          <section className="fs-card" aria-labelledby="fs-share-purpose">
            <h2 className="fs-h3" id="fs-share-purpose">
              3. 分享用途
            </h2>
            <div className="fs-choicegroup" style={{ marginTop: 12 }} role="radiogroup" aria-label="分享用途">
              {PURPOSES.map((entry) => (
                <label key={entry} className="fs-choice">
                  <input
                    type="radio"
                    name="fs-purpose"
                    value={entry}
                    checked={purpose === entry}
                    onChange={() => {
                      setPurpose(entry);
                      setStatus(null);
                    }}
                  />
                  <span>{entry}</span>
                </label>
              ))}
            </div>
            {purpose === "其他" && (
              <div className="fs-field" style={{ marginTop: 12 }}>
                <label htmlFor="fs-purpose-other">写下用途</label>
                <input
                  id="fs-purpose-other"
                  className="fs-input"
                  value={purposeOther}
                  maxLength={60}
                  onChange={(event) => setPurposeOther(event.target.value)}
                />
              </div>
            )}
          </section>

          <p className="fs-warn">
            分享前请确认：网页或打印件一旦发出或打印，就无法远程撤回。
          </p>

          {error && (
            <p className="fs-error" role="alert">
              {error}
            </p>
          )}
          {warning && (
            <p className="fs-warn" role="status">
              {warning}
            </p>
          )}
          {status && (
            <p className="fs-success" role="status">
              {status}
            </p>
          )}

          <div className="fs-actions">
            <button type="button" className="fs-btn fs-btn--primary" onClick={() => exportCopy("html")}>
              确认并导出网页
            </button>
            <button type="button" className="fs-btn fs-btn--secondary" onClick={() => exportCopy("text")}>
              导出文本
            </button>
            <button type="button" className="fs-btn fs-btn--secondary" onClick={printCopy}>
              打印
            </button>
            <Link className="fs-btn fs-btn--ghost" to="/firstshift/passport">
              取消
            </Link>
          </div>
        </div>

        <aside className="fs-preview" aria-labelledby="fs-preview-title">
          <h3 id="fs-preview-title">接收者看到的内容</h3>
          <p className="fs-preview__meta">
            {DEMO_USER_NAME} · 分享给：{recipientLabel || "（还没选择）"} · 用途：
            {purposeText || "（还没选择）"}
          </p>
          {selectedItems.length === 0 ? (
            <p className="fs-preview__empty">还没有选择内容。勾选左侧条目后，这里会显示接收者看到的全部文字。</p>
          ) : (
            ORDER.filter((category) => selectedItems.some((item) => item.category === category)).map(
              (category) => (
                <div key={category}>
                  <p className="fs-caption" style={{ fontWeight: 700, marginTop: 10 }}>
                    {CATEGORY_LABELS[category]}
                  </p>
                  {selectedItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <p key={item.id} className="fs-preview__item">
                        {item.value}
                      </p>
                    ))}
                </div>
              ),
            )
          )}
          <p className="fs-help" style={{ marginTop: 12 }}>
            这个预览与导出的副本一致。不会包含未勾选的内容、练习历史或诊断信息。
          </p>
        </aside>
      </div>
    </div>
  );
}
