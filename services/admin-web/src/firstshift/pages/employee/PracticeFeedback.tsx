import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Dialog, useDocumentTitle } from "../../components/ui";
import { outcomeStatus } from "../../simulation/model";
import { useDemoStore } from "../../store/demoStore";
import type { PassportCategory } from "../../types";

const PREFERENCE_OPTIONS: { value: string; category: PassportCategory }[] = [
  { value: "每次告诉我一个步骤。", category: "explain" },
  { value: "给我看照片。", category: "format" },
  { value: "让我重新看一遍说明。", category: "help" },
  { value: "请同事给我演示。", category: "help" },
];

function shortDate(label: string): string {
  const match = label.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return label;
  return `${Number(match[2])}月${Number(match[3])}日`;
}

export default function PracticeFeedback() {
  useDocumentTitle("练习记录");
  const navigate = useNavigate();
  const practice = useDemoStore((state) => state.practice);
  const passportItems = useDemoStore((state) => state.passportItems);
  const saveFeedbackItems = useDemoStore((state) => state.saveFeedbackItems);
  const startPractice = useDemoStore((state) => state.startPractice);
  const deletePractice = useDemoStore((state) => state.deletePractice);
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!practice) {
    return <Navigate to="/firstshift/practice" replace />;
  }
  if (practice.session.status !== "ended") {
    return <Navigate to="/firstshift/practice/demo-stock" replace />;
  }

  const version = practice.scenarioVersion;
  const helpful = passportItems.filter((item) => item.category !== "goal");

  function toggle(value: string) {
    setSelected((current) =>
      current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value],
    );
    setSaved(false);
    setError(null);
  }

  function save() {
    const items = PREFERENCE_OPTIONS.filter((option) => selected.includes(option.value)).map(
      (option) => ({
        category: option.category,
        label:
          option.category === "explain"
            ? "解释方式"
            : option.category === "format"
              ? "说明方式"
              : "求助方式",
        value: option.value,
      }),
    );
    const result = saveFeedbackItems(items);
    if (result.ok) {
      setSaved(true);
      setError(null);
    } else {
      setError("这台设备的本地存储暂时不可用，内容没有保存。可以重试，或先暂不保存。");
    }
  }

  function retry() {
    startPractice(version, true);
    navigate("/firstshift/practice/demo-stock");
  }

  return (
    <div className="v3-card">
      <div className="v3-record-card__head">
        <h2 className="v3-practice-card__title">整理货架</h2>
      </div>
      <p className="v3-record-card__date">
        {outcomeStatus(practice.session.outcome)} · {shortDate(practice.updatedAt)}
      </p>

      <hr className="fs-divider" style={{ margin: "16px 0" }} />

      <h3 className="v3-practice-card__title" style={{ fontSize: "1em" }}>
        对我有帮助的方式
      </h3>
      {helpful.length > 0 ? (
        <ul className="fs-list" style={{ marginTop: 8 }}>
          {helpful.map((item) => (
            <li key={item.id}>{item.value}</li>
          ))}
        </ul>
      ) : (
        <p className="fs-caption" style={{ marginTop: 8 }}>
          还没有记录有帮助的方式。
        </p>
      )}

      <details className="v3-record-more" style={{ marginTop: 16 }}>
        <summary>补充有帮助的方式</summary>
        <div className="fs-choicegroup" style={{ marginTop: 12 }}>
          {PREFERENCE_OPTIONS.map((option) => (
            <label key={option.value} className="fs-choice">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggle(option.value)}
              />
              <span>{option.value}</span>
            </label>
          ))}
        </div>
        {error && (
          <p className="fs-error" role="alert" style={{ marginTop: 12 }}>
            {error}
          </p>
        )}
        {saved && (
          <p className="fs-success" role="status" style={{ marginTop: 12 }}>
            已保存到「我的支持」，只有你能看到。
          </p>
        )}
        <div className="v3-actions-stack">
          <button
            type="button"
            className="fs-btn fs-btn--secondary"
            onClick={save}
            disabled={selected.length === 0}
          >
            保存到我的支持
          </button>
          {saved && (
            <Link className="fs-btn fs-btn--ghost" to="/firstshift/passport">
              查看我的支持
            </Link>
          )}
        </div>
      </details>

      <div className="v3-actions-stack">
        <button type="button" className="fs-btn fs-btn--primary" onClick={retry}>
          再练一次
        </button>
        <button type="button" className="fs-btn fs-btn--danger" onClick={() => setDeleteOpen(true)}>
          删除记录
        </button>
      </div>

      <Dialog open={deleteOpen} title="删除练习记录？" onClose={() => setDeleteOpen(false)}>
        <p className="fs-body">
          删除「整理货架」的这次练习记录？删除后不能恢复。我的支持和其他记录不会一起删除。
        </p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setDeleteOpen(false)}>
            取消
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--danger"
            onClick={() => {
              deletePractice();
              navigate("/firstshift/practice?tab=done");
            }}
          >
            确认删除
          </button>
        </div>
      </Dialog>
    </div>
  );
}
