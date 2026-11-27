import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Dialog, useDocumentTitle } from "../../components/ui";
import { demoChanges } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";

function ShelfPanel({ mode }: { mode: "old" | "new" }) {
  const target = mode === "old" ? "A2" : "B1";
  return (
    <>
      <div className="v3-shelf-grid" aria-hidden="true">
        {["A1", "A2", "B1", "B2"].map((slot) => {
          const hasPackage = slot === target;
          return (
            <span
              key={slot}
              data-active={hasPackage ? "true" : undefined}
              data-old={mode === "old" && hasPackage ? "true" : undefined}
              data-package={hasPackage ? "true" : undefined}
            >
              {hasPackage ? <i className="v3-parcel" /> : slot}
            </span>
          );
        })}
      </div>
      <p className="v3-compare__label">{target}</p>
    </>
  );
}

export default function WorkChange() {
  useDocumentTitle("货架位置变了");
  const { changeId } = useParams();
  const changeDecision = useDemoStore((state) => state.changeDecision);
  const acknowledgeChange = useDemoStore((state) => state.acknowledgeChange);
  const markChangeRead = useDemoStore((state) => state.markChangeRead);
  const [explainOpen, setExplainOpen] = useState(false);
  const [notApplicableOpen, setNotApplicableOpen] = useState(false);

  const change = demoChanges.find((entry) => entry.id === changeId);

  useEffect(() => {
    if (change) markChangeRead(change.id);
  }, [change, markChangeRead]);

  if (!change) {
    return <Navigate to="/firstshift/work/changes" replace />;
  }

  if (changeDecision) {
    return (
      <div className="v3-card">
        <div className="v3-record-card__head">
          <span className="v3-practice-card__title">A2 → B1</span>
          <span className="fs-caption">{changeDecision === "understood" ? "已理解" : "不适用"}</span>
        </div>
        <p className="fs-body" style={{ marginTop: 14 }}>
          {changeDecision === "understood"
            ? "以后请把商品放到 B1 货架。"
            : "已记录你的判断。旧指令仍然暂停，等待辅导员确认。"}
        </p>
        <div className="v3-actions-stack">
          {changeDecision === "understood" && (
            <Link className="fs-btn fs-btn--primary" to="/firstshift/work/demo-stock">
              查看工作指导
            </Link>
          )}
          <Link className="fs-btn fs-btn--secondary" to="/firstshift/work">
            返回我的工作
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="v3-stack">
      <div className="v3-card">
        <div className="v3-compare">
          <div className="v3-compare__panel">
            <h3>原来的位置</h3>
            <ShelfPanel mode="old" />
          </div>
          <div className="v3-compare__panel">
            <h3>现在的位置</h3>
            <ShelfPanel mode="new" />
          </div>
        </div>

        <p className="fs-body" style={{ marginTop: 18 }}>
          以后请把商品放到 B1 货架。
        </p>

        <div className="v3-actions-stack">
          <button
            type="button"
            className="fs-btn fs-btn--primary"
            onClick={() => acknowledgeChange("understood")}
          >
            我已理解
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--secondary"
            onClick={() => setExplainOpen((value) => !value)}
            aria-expanded={explainOpen}
          >
            我需要再解释一次
          </button>
          <Link className="fs-btn fs-btn--secondary" to="/firstshift/help/request?barrier=mismatch">
            我需要帮助
          </Link>
          <button
            type="button"
            className="fs-btn fs-btn--secondary"
            onClick={() => setNotApplicableOpen(true)}
          >
            这个变化不适用于我
          </button>
        </div>
      </div>

      {explainOpen && (
        <section className="v3-card" aria-live="polite">
          <h2 className="v3-practice-card__title" style={{ fontSize: "1em" }}>
            再解释一次
          </h2>
          <ul className="fs-list" style={{ marginTop: 10 }}>
            <li>以前，燕麦片放到 A2。</li>
            <li>今天开始，燕麦片放到 B1。</li>
            <li>米还是放在 A1。</li>
            <li>看商品名称、最后核对的方法没有变。</li>
          </ul>
        </section>
      )}

      <p className="v3-demo-note">
        这是合成演示变化，发布时间为 {change.publishedAt}。在确认之前，旧 A2 指令保持暂停。
      </p>

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
            }}
          >
            确认不适用
          </button>
        </div>
      </Dialog>
    </div>
  );
}
