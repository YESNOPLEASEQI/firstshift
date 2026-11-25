import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import { useDemoStore } from "../../store/demoStore";
import { CATEGORY_LABELS } from "../../types";
import type { PassportCategory, PassportItem } from "../../types";

interface Question {
  category: PassportCategory;
  title: string;
  help: string;
  options: string[];
  multi?: boolean;
}

const QUESTIONS: Question[] = [
  {
    category: "explain",
    title: "你希望别人怎样解释任务？",
    help: "选一个最接近的说法。以后可以随时修改。",
    options: ["一次只给我一个步骤。", "先说目的，再说怎么做。", "用简单短句，先说最重要的。"],
  },
  {
    category: "format",
    title: "你更容易理解哪些说明方式？",
    help: "可以多选。语音说明只记录为你的偏好。",
    options: ["真实照片", "图片加文字", "现场示范", "文字清单", "语音说明（仅记录偏好）"],
    multi: true,
  },
  {
    category: "help",
    title: "遇到困难时，你希望怎样获得帮助？",
    help: "这不代表你需要被监督，只说明哪种帮助方式更适合你。",
    options: ["先让我自己重看说明。", "请人示范一遍。", "直接告诉我该找谁。"],
  },
  {
    category: "goal",
    title: "你现在希望达成什么工作目标？",
    help: "目标只保存在你的支持说明里，默认不分享。",
    options: ["熟悉理货工作。", "试试社区零售岗位。", "找到适合自己的支持方式。"],
  },
];

interface DraftEntry {
  selected: string[];
  other: string;
}

function initDraft(items: PassportItem[]): Record<PassportCategory, DraftEntry> {
  const draft = {} as Record<PassportCategory, DraftEntry>;
  for (const question of QUESTIONS) {
    const rows = items.filter((item) => item.category === question.category);
    draft[question.category] = {
      selected: rows.map((row) => row.value).filter((value) => question.options.includes(value)),
      other: rows
        .map((row) => row.value)
        .filter((value) => !question.options.includes(value))
        .join("；"),
    };
  }
  return draft;
}

export default function PassportEdit() {
  useDocumentTitle("编辑支持说明");
  const navigate = useNavigate();
  const items = useDemoStore((state) => state.passportItems);
  const replacePassportItems = useDemoStore((state) => state.replacePassportItems);
  const [draft, setDraft] = useState(() => initDraft(items));
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = QUESTIONS[step];
  const entry = draft[question.category];
  const percent = Math.round(((step + 1) / QUESTIONS.length) * 100);

  function update(next: Partial<DraftEntry>) {
    setDraft((current) => ({
      ...current,
      [question.category]: { ...current[question.category], ...next },
    }));
    setTouched(true);
    setError(null);
  }

  function toggleOption(option: string) {
    if (question.multi) {
      const selected = entry.selected.includes(option)
        ? entry.selected.filter((value) => value !== option)
        : [...entry.selected, option];
      update({ selected });
    } else {
      update({ selected: entry.selected[0] === option ? [] : [option] });
    }
  }

  function save() {
    const next: PassportItem[] = [];
    for (const current of QUESTIONS) {
      const entry = draft[current.category];
      const label = CATEGORY_LABELS[current.category];
      entry.selected.forEach((value, index) => {
        next.push({
          id: `p-${current.category}-${Date.now()}-${index}`,
          category: current.category,
          label,
          value,
        });
      });
      const other = entry.other.trim();
      if (other) {
        next.push({
          id: `p-${current.category}-${Date.now()}-custom`,
          category: current.category,
          label,
          value: other,
        });
      }
    }
    const result = replacePassportItems(next);
    if (!result.ok) {
      setError("这台设备的本地存储暂时不可用，修改没有保存。请检查浏览器设置后重试。");
      return;
    }
    navigate("/firstshift/passport");
  }

  function requestCancel() {
    if (touched) {
      setCancelOpen(true);
    } else {
      navigate("/firstshift/passport");
    }
  }

  return (
    <div className="fs-stack">
      <button type="button" className="fs-backlink" onClick={requestCancel} style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}>
        <Icon name="back" size={20} />
        返回支持说明
      </button>
      <PageHeader
        title="编辑支持说明"
        titleId="fs-passport-edit-title"
      />

      <div className="fs-wizard">
        <div className="fs-wizard__progress">
          <span>
            第 {step + 1} 题，共 {QUESTIONS.length} 题
          </span>
          <span className="fs-wizard__bar" aria-hidden="true">
            <span style={{ width: `${percent}%` }} />
          </span>
        </div>

        <section className="fs-card" aria-labelledby="fs-question-title">
          <h2 className="fs-h2" id="fs-question-title" style={{ fontSize: "1.5rem" }}>
            {question.title}
          </h2>
          <p className="fs-caption" style={{ marginTop: 6 }}>
            {question.help}
          </p>

          <div className="fs-choicegroup" style={{ marginTop: 16 }} role={question.multi ? "group" : "radiogroup"} aria-label={question.title}>
            {question.options.map((option) => (
              <label key={option} className="fs-choice">
                <input
                  type={question.multi ? "checkbox" : "radio"}
                  name={`fs-${question.category}`}
                  checked={entry.selected.includes(option)}
                  onChange={() => toggleOption(option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <div className="fs-field" style={{ marginTop: 18 }}>
            <label htmlFor="fs-passport-other">其他（可以写下你自己的说法，也可以留空）</label>
            <input
              id="fs-passport-other"
              className="fs-input"
              value={entry.other}
              maxLength={120}
              placeholder="例如：请先给我看一遍，再让我自己做"
              onChange={(event) => update({ other: event.target.value })}
            />
          </div>
        </section>

        {error && (
          <p className="fs-error" role="alert">
            {error}
          </p>
        )}

        <div className="fs-actions fs-actions--split">
          <button
            type="button"
            className="fs-btn fs-btn--secondary"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
          >
            上一步
          </button>
          <div className="fs-actions">
            <button type="button" className="fs-btn fs-btn--ghost" onClick={requestCancel}>
              取消
            </button>
            {step < QUESTIONS.length - 1 ? (
              <button
                type="button"
                className="fs-btn fs-btn--primary"
                onClick={() => setStep((value) => Math.min(QUESTIONS.length - 1, value + 1))}
              >
                下一步
              </button>
            ) : (
              <button type="button" className="fs-btn fs-btn--primary" onClick={save}>
                保存到支持说明
              </button>
            )}
          </div>
        </div>

        <p className="fs-note">
          保存后仍然只有你能看到。分享是单独的一步，需要你逐项选择要分享的内容。
        </p>
      </div>

      <Dialog open={cancelOpen} title="放弃这次修改？" onClose={() => setCancelOpen(false)}>
        <p className="fs-body">刚才的改动还没有保存。放弃后，支持说明保持原样。</p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setCancelOpen(false)}>
            继续编辑
          </button>
          <button type="button" className="fs-btn fs-btn--danger" onClick={() => navigate("/firstshift/passport")}>
            放弃修改
          </button>
        </div>
      </Dialog>
    </div>
  );
}
