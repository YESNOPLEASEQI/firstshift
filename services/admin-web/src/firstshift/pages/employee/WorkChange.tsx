import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Dialog, Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import { MiniShelf } from "../../components/art";
import { demoChange } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";
import type { ImpactDecision } from "../../types";

const DECISION_META: Record<ImpactDecision, { label: string; className: string }> = {
  retained: { label: "保留", className: "fs-badge--success" },
  review: { label: "待复核", className: "fs-badge--warn" },
  paused: { label: "暂停", className: "fs-badge--danger" },
};

export default function WorkChange() {
  useDocumentTitle("工作变化");
  const { changeId } = useParams();
  const navigate = useNavigate();
  const changeDecision = useDemoStore((state) => state.changeDecision);
  const acknowledgeChange = useDemoStore((state) => state.acknowledgeChange);
  const startPractice = useDemoStore((state) => state.startPractice);
  const [explainOpen, setExplainOpen] = useState(false);
  const [notApplicableOpen, setNotApplicableOpen] = useState(false);

  if (changeId !== demoChange.id) {
    return <Navigate to="/firstshift/work" replace />;
  }

  return (
    <div className="fs-stack">
      <PageHeader
        backTo="/firstshift/work"
        backLabel="返回我的工作"
        title={demoChange.title}
        aside={
          <div className="fs-row">
            <span className="fs-badge">发布于 {demoChange.publishedAt}</span>
            {changeDecision === "understood" && <span className="fs-badge fs-badge--success">已确认</span>}
            {changeDecision === "not-applicable" && <span className="fs-badge fs-badge--warn">已标记为不适用</span>}
          </div>
        }
        titleId="fs-change-title"
      />

      <section aria-labelledby="fs-change-compare">
        <h2 className="fs-h3" id="fs-change-compare" style={{ marginBottom: 12 }}>
          位置对比
        </h2>
        <div className="fs-compare">
          <div className="fs-compare__panel">
            <h3>原来</h3>
            <MiniShelf current="A2" />
          </div>
          <div className="fs-compare__panel fs-compare__panel--new">
            <h3>现在</h3>
            <MiniShelf current="B1" />
          </div>
        </div>
      </section>

      <div className="fs-work-grid">
        <div className="fs-stack">
          <section className="fs-card" aria-labelledby="fs-change-impact">
            <h2 className="fs-h3" id="fs-change-impact">
              步骤影响
            </h2>
            <div className="fs-impact" style={{ marginTop: 12 }}>
              {demoChange.steps.map((step) => (
                <div key={step.stepId} className="fs-impact__row">
                  <span>
                    <span className={`fs-badge ${DECISION_META[step.decision].className}`}>
                      {DECISION_META[step.decision].label}
                    </span>
                  </span>
                  <span>
                    <strong>{step.stepTitle}</strong>
                    <p>
                      原来：{step.from} · 现在：{step.to}
                    </p>
                    <p>{step.note}</p>
                  </span>
                </div>
              ))}
            </div>
            <p className="fs-help" style={{ marginTop: 10 }}>
              旧 A2 指令和旧照片已暂停。指导会按变化后的内容显示。
            </p>
          </section>

          <section className="fs-card" aria-labelledby="fs-change-support">
            <h2 className="fs-h3" id="fs-change-support">
              仍然有效的支持
            </h2>
            <ul className="fs-list" style={{ marginTop: 10 }}>
              {demoChange.retainedSupport.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          {explainOpen && (
            <section className="fs-card fs-card--soft" aria-labelledby="fs-change-explain" aria-live="polite">
              <h2 className="fs-h3" id="fs-change-explain">
                简要说明
              </h2>
              <ul className="fs-list" style={{ marginTop: 10 }}>
                <li>以前，燕麦片放到 A2。</li>
                <li>今天开始，燕麦片放到 B1。</li>
                <li>米还是放在 A1。</li>
                <li>看商品名称、最后核对的方法没有变。</li>
              </ul>
            </section>
          )}
        </div>

        <aside className="fs-stack">
          <section className="fs-card" aria-labelledby="fs-change-actions">
            <h2 className="fs-h3" id="fs-change-actions">
              操作
            </h2>
            <div className="fs-stack fs-stack--tight" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="fs-btn fs-btn--primary fs-btn--block"
                onClick={() => {
                  acknowledgeChange("understood");
                  navigate("/firstshift/work");
                }}
              >
                <Icon name="check" size={20} />
                我已理解
              </button>
              <button
                type="button"
                className="fs-btn fs-btn--secondary fs-btn--block"
                onClick={() => setExplainOpen((value) => !value)}
                aria-expanded={explainOpen}
              >
                <Icon name="help" size={20} />
                再解释一次
              </button>
              <button
                type="button"
                className="fs-btn fs-btn--secondary fs-btn--block"
                onClick={() => {
                  startPractice("v2", true);
                  navigate("/firstshift/practice/demo-stock");
                }}
              >
                <Icon name="refresh" size={20} />
                用新位置重练
              </button>
              <Link className="fs-btn fs-btn--secondary fs-btn--block" to="/firstshift/help/request?barrier=mismatch">
                <Icon name="help" size={20} />
                我想请求帮助
              </Link>
              <button
                type="button"
                className="fs-btn fs-btn--ghost fs-btn--block"
                onClick={() => setNotApplicableOpen(true)}
              >
                我认为这项变化不适用
              </button>
            </div>
          </section>

          <p className="fs-note">
            再解释、重练或求助都不会被记录成能力问题。旧 A2 指令在重新确认之前一直保持暂停。
          </p>
        </aside>
      </div>

      <Dialog open={notApplicableOpen} title="标记为不适用？" onClose={() => setNotApplicableOpen(false)}>
        <p className="fs-body">
          这只会记录你的判断：你认为这项变化不适用于你的任务。旧 A2 指令仍然暂停，等待辅导员确认后再决定下一步。
        </p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setNotApplicableOpen(false)}>
            先不标记
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--primary"
            onClick={() => {
              acknowledgeChange("not-applicable");
              setNotApplicableOpen(false);
              navigate("/firstshift/work");
            }}
          >
            确认不适用
          </button>
        </div>
      </Dialog>
    </div>
  );
}
