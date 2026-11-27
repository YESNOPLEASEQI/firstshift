import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../../components/ui";
import { EmptyCard } from "../../components/v3";
import { DEMO_USER_NAME } from "../../fixtures/demo";
import { buildSharePayload, shareFileBase } from "../../share/export";
import { useDemoStore } from "../../store/demoStore";
import type { ShareConfig } from "../../types";

const DRAFT_KEY = "firstshift.share-draft";

const TARGETS = [
  {
    id: "coach",
    label: "就业辅导员 · 工作支持",
    recipientLabel: "就业辅导员",
    recipientDetail: "陈老师（虚构）",
    purpose: "工作支持",
  },
  {
    id: "mentor",
    label: "岗位导师 · 工作指导",
    recipientLabel: "岗位导师",
    recipientDetail: "王师傅（虚构）",
    purpose: "工作指导",
  },
  {
    id: "family",
    label: "家人或可信赖的支持者 · 了解我的支持",
    recipientLabel: "家人或可信赖的支持者",
    recipientDetail: "",
    purpose: "了解我的支持",
  },
];

interface ShareDraft {
  itemIds: string[];
  recipientLabel: string;
  recipientDetail: string;
  purpose: string;
}

function nowLabel(): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function shortDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${Number(match[2])}月${Number(match[3])}日`;
}

function readDraft(): ShareDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShareDraft;
    return Array.isArray(parsed.itemIds) && parsed.itemIds.length > 0 ? parsed : null;
  } catch {
    return null;
  }
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

function ShareSelect() {
  useDocumentTitle("选择分享内容");
  const navigate = useNavigate();
  const items = useDemoStore((state) => state.passportItems);
  const [initialDraft] = useState(() => {
    const draft = readDraft();
    if (!draft) return null;
    return {
      itemIds: draft.itemIds.filter((id) => items.some((item) => item.id === id)),
      targetId:
        TARGETS.find(
          (target) =>
            target.recipientLabel === draft.recipientLabel && target.purpose === draft.purpose,
        )?.id ?? "",
    };
  });
  const [selectedIds, setSelectedIds] = useState<string[]>(initialDraft?.itemIds ?? []);
  const [targetId, setTargetId] = useState(initialDraft?.targetId ?? "");
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <EmptyCard
        action={
          <Link className="fs-btn fs-btn--primary" to="/firstshift/passport/edit">
            先填写支持信息
          </Link>
        }
      >
        还没有可以分享的内容。
      </EmptyCard>
    );
  }

  function toggleItem(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
    setError(null);
  }

  function goPreview() {
    const target = TARGETS.find((entry) => entry.id === targetId);
    if (selectedIds.length === 0) {
      setError("请先选择要分享的内容。");
      return;
    }
    if (!target) {
      setError("请选择分享对象。");
      return;
    }
    const draft: ShareDraft = {
      itemIds: selectedIds,
      recipientLabel: target.recipientLabel,
      recipientDetail: target.recipientDetail,
      purpose: target.purpose,
    };
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    navigate("/firstshift/passport/share/preview");
  }

  return (
    <div className="v3-stack">
      <fieldset className="v3-fieldset v3-fieldset--bare">
        <legend className="v3-share-legend">你愿意让别人看到什么？</legend>
        <div className="v3-share-list">
          {items.map((item) => (
            <label key={item.id} className="v3-check">
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

      <fieldset className="v3-fieldset v3-fieldset--bare">
        <legend className="v3-share-legend">分享对象与用途</legend>
        <div className="v3-share-list">
          {TARGETS.map((target) => (
            <label key={target.id} className="v3-check">
              <input
                type="radio"
                name="share-target"
                checked={targetId === target.id}
                onChange={() => {
                  setTargetId(target.id);
                  setError(null);
                }}
              />
              <span>{target.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="fs-error" role="alert">
          {error}
        </p>
      )}

      <button type="button" className="fs-btn fs-btn--primary fs-btn--block" onClick={goPreview}>
        预览
      </button>
    </div>
  );
}

function SharePreview() {
  useDocumentTitle("分享预览");
  const navigate = useNavigate();
  const draft = readDraft();
  const items = useDemoStore((state) => state.passportItems);
  const recordShare = useDemoStore((state) => state.recordShare);
  const [status, setStatus] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [config, setConfig] = useState<ShareConfig | null>(null);

  if (!draft) {
    return <Navigate to="/firstshift/passport/share" replace />;
  }
  const draftData = draft;

  const selectedItems = items.filter((item) => draftData.itemIds.includes(item.id));

  function saveShare(): ShareConfig {
    const next: ShareConfig = {
      recipientLabel: draftData.recipientLabel,
      recipientDetail: draftData.recipientDetail,
      purpose: draftData.purpose,
      itemIds: draftData.itemIds,
      exportedAt: nowLabel(),
    };
    const result = recordShare(next);
    if (!result.ok) {
      setWarning("副本可以生成，但这台设备无法记录这次分享。");
    } else {
      setWarning(null);
    }
    setConfig(next);
    return next;
  }

  function exportCopy(kind: "html" | "text") {
    const current = config ?? saveShare();
    const payload = buildSharePayload(items, current, DEMO_USER_NAME);
    const base = shareFileBase(new Date());
    if (kind === "html") {
      downloadFile(`${base}.html`, payload.html, "text/html;charset=utf-8");
      setStatus("已生成网页副本。");
    } else {
      downloadFile(`${base}.txt`, payload.text, "text/plain;charset=utf-8");
      setStatus("已生成文本副本。");
    }
  }

  function printCopy() {
    const current = config ?? saveShare();
    const payload = buildSharePayload(items, current, DEMO_USER_NAME);
    printHtml(payload.html);
    setStatus("已打开打印预览。");
  }

  return (
    <div className="v3-stack">
      <section className="v3-card v3-preview">
        <div className="v3-preview__meta">
          <p>分享给：{draftData.recipientLabel}</p>
          <p>用途：{draftData.purpose}</p>
        </div>
        <h2>我的支持</h2>
        {selectedItems.map((item) => (
          <p key={item.id}>{item.value}</p>
        ))}
      </section>

      <p className="v3-demo-note">已经发送或打印的副本不能远程收回。</p>

      {status ? (
        <>
          <p className="fs-success" role="status">
            {status}
          </p>
          <div className="v3-actions-stack">
            <button type="button" className="fs-btn fs-btn--secondary fs-btn--block" onClick={() => exportCopy("text")}>
              导出文本
            </button>
            <button type="button" className="fs-btn fs-btn--secondary fs-btn--block" onClick={printCopy}>
              打印
            </button>
            <button
              type="button"
              className="fs-btn fs-btn--ghost fs-btn--block"
              onClick={() => navigate("/firstshift/passport/share/history")}
            >
              查看分享记录
            </button>
          </div>
        </>
      ) : (
        <div className="v3-actions-stack">
          <button type="button" className="fs-btn fs-btn--primary fs-btn--block" onClick={() => exportCopy("html")}>
            确认并导出
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--secondary fs-btn--block"
            onClick={() => navigate("/firstshift/passport/share")}
          >
            返回修改
          </button>
        </div>
      )}

      {warning && (
        <p className="fs-warn" role="status">
          {warning}
        </p>
      )}
    </div>
  );
}

function ShareHistory() {
  useDocumentTitle("分享记录");
  const items = useDemoStore((state) => state.passportItems);
  const history = useDemoStore((state) => state.shareHistory);

  if (history.length === 0) {
    return <EmptyCard>还没有分享记录。</EmptyCard>;
  }

  return (
    <div className="v3-stack">
      {history.map((entry, index) => {
        const values = items.filter((item) => entry.itemIds.includes(item.id));
        return (
          <article className="v3-card v3-history" key={`${entry.exportedAt}-${index}`}>
            <h2>{entry.purpose}</h2>
            <p className="v3-history__meta">
              {entry.recipientLabel} · {shortDate(entry.exportedAt)}
            </p>
            <p>{values.map((item) => item.value).join(" ")}</p>
            <p className="v3-demo-note">本地导出</p>
          </article>
        );
      })}
    </div>
  );
}

export default function PassportShare() {
  const location = useLocation();
  if (location.pathname.endsWith("/preview")) return <SharePreview />;
  if (location.pathname.endsWith("/history")) return <ShareHistory />;
  return <ShareSelect />;
}
