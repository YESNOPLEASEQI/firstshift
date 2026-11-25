import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import { scenarioV1, scenarioV2 } from "../../fixtures/demo";
import { outcomeLabel, placedItems } from "../../simulation/model";
import { hintSummary } from "../../simulation/model";
import { useDemoStore } from "../../store/demoStore";
import type { PassportCategory } from "../../types";

const PREFERENCE_OPTIONS: { value: string; category: PassportCategory }[] = [
  { value: "一次只给我一个步骤。", category: "explain" },
  { value: "希望配一张真实货架照片。", category: "format" },
  { value: "换位置时，先给我看新旧位置对照。", category: "format" },
  { value: "不明白时，先让我自己重看说明，再请人示范。", category: "help" },
];

export default function PracticeFeedback() {
  useDocumentTitle("练习记录");
  const navigate = useNavigate();
  const practice = useDemoStore((state) => state.practice);
  const saveFeedbackItems = useDemoStore((state) => state.saveFeedbackItems);
  const startPractice = useDemoStore((state) => state.startPractice);
  const [selected, setSelected] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!practice) {
    return <Navigate to="/firstshift/practice" replace />;
  }
  if (practice.session.status !== "ended") {
    return <Navigate to="/firstshift/practice/demo-stock" replace />;
  }

  const scenario = practice.scenarioVersion === "v2" ? scenarioV2 : scenarioV1;
  const scenarioVersion = practice.scenarioVersion;
  const session = practice.session;
  const placed = placedItems(session, scenario);
  const hints = hintSummary(session);
  const outcome = outcomeLabel(session.outcome);

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
    startPractice(scenarioVersion, true);
    navigate("/firstshift/practice/demo-stock");
  }

  return (
    <div className="fs-stack">
      <PageHeader
        backTo="/firstshift"
        backLabel="回到首页"
        title="练习记录"
        aside={<span className="fs-badge fs-badge--demo">合成练习</span>}
        titleId="fs-feedback-title"
      />

      <div className="fs-work-grid">
        <div className="fs-stack">
          <section className="fs-card" aria-labelledby="fs-feedback-choice">
            <h2 className="fs-h3" id="fs-feedback-choice">
              结束方式
            </h2>
            <p className="fs-body" style={{ marginTop: 8, fontSize: "1.125rem" }}>
              你选择了「<strong>{outcome}</strong>」。
            </p>
          </section>

          <section className="fs-card" aria-labelledby="fs-feedback-placed">
            <h2 className="fs-h3" id="fs-feedback-placed">
              商品位置
            </h2>
            <div className="fs-stack fs-stack--tight" style={{ marginTop: 12 }}>
              {placed.map((item) => (
                <div key={item.id} className="fs-resultrow">
                  <strong>{item.name}</strong>
                  <span className="fs-badge fs-badge--primary">
                    {item.location ? `放在 ${item.location}` : "还在备货台，未放置"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="fs-card" aria-labelledby="fs-feedback-hints">
            <h2 className="fs-h3" id="fs-feedback-hints">
              使用过的提示
            </h2>
            {hints.length > 0 ? (
              <div className="fs-pillgrid" style={{ marginTop: 12 }}>
                {hints.map((hint) => (
                  <span key={hint} className="fs-pill">
                    {hint}
                  </span>
                ))}
              </div>
            ) : (
              <p className="fs-caption" style={{ marginTop: 8 }}>
                这次没有查看提示。需要时随时可以再看，不会扣分。
              </p>
            )}
          </section>

          <section className="fs-card" aria-labelledby="fs-feedback-prefs">
            <h2 className="fs-h3" id="fs-feedback-prefs">
              说明方式偏好
            </h2>
            <div className="fs-choicegroup" style={{ marginTop: 14 }}>
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
              <p className="fs-error" role="alert" style={{ marginTop: 14 }}>
                {error}
              </p>
            )}
            {saved && (
              <p className="fs-success" role="status" style={{ marginTop: 14 }}>
                已保存到「支持说明」，只有你能看到。
              </p>
            )}

            <div className="fs-actions" style={{ marginTop: 18 }}>
              <button
                type="button"
                className="fs-btn fs-btn--primary"
                onClick={save}
                disabled={selected.length === 0}
              >
                保存到支持说明
              </button>
              {saved ? (
                <Link className="fs-btn fs-btn--secondary" to="/firstshift/passport">
                  查看支持说明
                </Link>
              ) : (
                <button type="button" className="fs-btn fs-btn--ghost" onClick={() => navigate("/firstshift")}>
                  暂不保存
                </button>
              )}
            </div>
            {selected.length === 0 && !saved && (
              <p className="fs-help" style={{ marginTop: 8 }}>
                没有选择也可以直接离开，不会自动写入任何内容。
              </p>
            )}
          </section>
        </div>

        <aside className="fs-stack">
          <section className="fs-card fs-card--soft" aria-labelledby="fs-feedback-next">
            <h2 className="fs-h3" id="fs-feedback-next">
              后续操作
            </h2>
            <div className="fs-stack fs-stack--tight" style={{ marginTop: 14 }}>
              <button type="button" className="fs-btn fs-btn--primary fs-btn--block" onClick={retry}>
                <Icon name="refresh" size={20} />
                再练一次
              </button>
              <Link className="fs-btn fs-btn--secondary fs-btn--block" to="/firstshift/help/request">
                请求帮助
              </Link>
              <Link className="fs-btn fs-btn--ghost fs-btn--block" to="/firstshift">
                回到首页
              </Link>
            </div>
          </section>
          <p className="fs-note">
            反馈不会被自动评分、排名或分享。是否保存、分享给谁，都由你决定。已保存的内容可以随时修改或删除。
          </p>
        </aside>
      </div>
    </div>
  );
}
