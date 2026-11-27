import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, Icon, useDocumentTitle } from "../../components/ui";
import { useDemoStore } from "../../store/demoStore";
import { CATEGORY_LABELS } from "../../types";
import type { PassportCategory, PassportItem } from "../../types";

interface Question {
  category: PassportCategory;
  title: string;
  options: string[];
  multi?: boolean;
}

const GOAL_NONE = "暂时不设定目标。";

const QUESTIONS: Question[] = [
  {
    category: "explain",
    title: "你希望别人怎样解释任务？",
    options: ["每次告诉我一个步骤。", "先说目的，再说怎么做。", "用简单短句，先说最重要的。"],
    multi: true,
  },
  {
    category: "format",
    title: "你更容易理解哪些说明方式？",
    options: ["给我看照片。", "给我看简短文字。", "先给我演示一遍。", "文字清单", "语音说明（仅记录偏好）"],
    multi: true,
  },
  {
    category: "help",
    title: "遇到困难时，你希望怎样获得帮助？",
    options: ["让我重新看一遍说明。", "请同事给我演示。", "直接告诉我该找谁。"],
    multi: true,
  },
  {
    category: "goal",
    title: "你现在希望达成什么工作目标？",
    options: ["尝试超市理货工作。", "试试社区零售岗位。", "找到适合自己的支持方式。", GOAL_NONE],
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

const GROUPS: { key: string; title: string; categories: PassportCategory[] }[] = [
  { key: "explain", title: "我喜欢的工作说明", categories: ["explain", "format"] },
  { key: "help", title: "我希望得到的帮助", categories: ["help"] },
  { key: "goal", title: "我的工作目标", categories: ["goal"] },
];

export default function PassportEdit() {
  useDocumentTitle("编辑我的支持");
  const navigate = useNavigate();
  const items = useDemoStore((state) => state.passportItems);
  const replacePassportItems = useDemoStore((state) => state.replacePassportItems);
  const [draft, setDraft] = useState(() => initDraft(items));
  const [touched, setTouched] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(category: PassportCategory, next: Partial<DraftEntry>) {
    setDraft((current) => ({
      ...current,
      [category]: { ...current[category], ...next },
    }));
    setTouched(true);
    setError(null);
  }

  function toggleOption(question: Question, option: string) {
    const entry = draft[question.category];
    if (question.multi) {
      const selected = entry.selected.includes(option)
        ? entry.selected.filter((value) => value !== option)
        : [...entry.selected, option];
      update(question.category, { selected });
    } else {
      update(question.category, { selected: entry.selected[0] === option ? [] : [option] });
    }
  }

  function save() {
    const next: PassportItem[] = [];
    for (const current of QUESTIONS) {
      const entry = draft[current.category];
      const label = CATEGORY_LABELS[current.category];
      entry.selected
        .filter((value) => value !== GOAL_NONE)
        .forEach((value, index) => {
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
    <div className="v3-stack">
      {GROUPS.map((group) => (
        <section key={group.key} className="v3-card v3-edit-card" aria-labelledby={`edit-${group.key}`}>
          <h2 className="v3-section-title" id={`edit-${group.key}`}>
            {group.title}
          </h2>
          {group.categories.map((category) => {
            const question = QUESTIONS.find((entry) => entry.category === category);
            if (!question) return null;
            const entry = draft[category];
            return (
              <fieldset key={category} className="v3-fieldset">
                <legend>{question.title}</legend>
                <div className="v3-check-list">
                  {question.options.map((option) => (
                    <label key={option} className="v3-check">
                      <input
                        type={question.multi ? "checkbox" : "radio"}
                        name={`fs-${category}`}
                        checked={entry.selected.includes(option)}
                        onChange={() => toggleOption(question, option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <label className="v3-other-field">
                  <span>其他</span>
                  <input
                    className="fs-input"
                    value={entry.other}
                    maxLength={120}
                    onChange={(event) => update(category, { other: event.target.value })}
                  />
                </label>
              </fieldset>
            );
          })}
        </section>
      ))}

      {error && (
        <p className="fs-error" role="alert">
          {error}
        </p>
      )}

      <div className="v3-actions-stack">
        <button type="button" className="fs-btn fs-btn--primary fs-btn--block" onClick={save}>
          <Icon name="check" size={20} />
          保存
        </button>
        <button type="button" className="fs-btn fs-btn--secondary fs-btn--block" onClick={requestCancel}>
          取消
        </button>
      </div>

      <p className="v3-demo-note">保存后只有你可以看到。分享需要单独选择要分享的内容。</p>

      <Dialog open={cancelOpen} title="放弃这次修改？" onClose={() => setCancelOpen(false)}>
        <p className="fs-body">刚才的改动还没有保存。</p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setCancelOpen(false)}>
            继续编辑
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--danger"
            onClick={() => navigate("/firstshift/passport")}
          >
            放弃修改
          </button>
        </div>
      </Dialog>
    </div>
  );
}
