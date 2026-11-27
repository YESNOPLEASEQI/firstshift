import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "../../components/ui";
import { taskV2 } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";

function GuideShelf({ active }: { active: string | null }) {
  return (
    <div className="v3-shelf-grid" aria-hidden="true" style={{ marginTop: 14 }}>
      {["A1", "A2", "B1", "B2"].map((slot) => (
        <span
          key={slot}
          data-active={slot === active ? "true" : undefined}
          data-package={slot === active ? "true" : undefined}
        >
          {slot === active ? <i className="v3-parcel" /> : slot}
        </span>
      ))}
    </div>
  );
}

export default function WorkTask() {
  useDocumentTitle("整理货架");
  const { taskId } = useParams();
  const changeDecision = useDemoStore((state) => state.changeDecision);
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");

  if (taskId !== "demo-stock") {
    return <Navigate to="/firstshift/work/guides" replace />;
  }

  const steps = taskV2.steps;
  const step = steps[index];
  const acknowledged = changeDecision === "understood";
  const paused = (step.stepId === "s2" || step.stepId === "s3") && !acknowledged;
  const percent = Math.round(((index + 1) / steps.length) * 100);
  const activeShelf = step.location ? (step.location.includes("B1") ? "B1" : "A1") : null;

  if (paused) {
    return (
      <div className="v3-card">
        <div className="v3-record-card__head">
          <span className="fs-caption">
            第 {index + 1} 步，共 {steps.length} 步
          </span>
        </div>
        <div className="v3-progress" aria-hidden="true">
          <i style={{ width: `${percent}%` }} />
        </div>
        <p className="v3-pause-note">
          这一步的指导正在更新，请暂时不要按旧说明操作。
        </p>
        <p className="fs-body" style={{ marginTop: 14 }}>
          你可以先联系辅导员，确认新的工作方式。
        </p>
        <div className="v3-actions-stack">
          <Link className="fs-btn fs-btn--primary" to="/firstshift/help/request?barrier=mismatch">
            我需要帮助
          </Link>
          <Link className="fs-btn fs-btn--secondary" to="/firstshift/work/changes">
            查看工作变化
          </Link>
          <Link className="fs-btn fs-btn--secondary" to="/firstshift/work/guides">
            返回工作指导
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="v3-card">
      <div className="v3-record-card__head">
        <span className="fs-caption">
          第 {index + 1} 步，共 {steps.length} 步
        </span>
        <Link to="/firstshift/help/request" className="fs-caption" style={{ color: "var(--fs-primary)" }}>
          我需要帮助
        </Link>
      </div>
      <div className="v3-progress" aria-hidden="true">
        <i style={{ width: `${percent}%` }} />
      </div>

      <h2 className="fs-h2" style={{ marginTop: 4 }}>
        {step.title}
      </h2>

      {step.location && <GuideShelf active={activeShelf} />}

      <p className="fs-body" style={{ marginTop: 16 }}>
        {step.instruction}
      </p>

      {step.stepId === "s3" && (
        <p className="v3-pause-note" style={{ marginTop: 12 }}>
          这一步依赖的新照片还在更新。暂时不要按旧照片操作；可以先请求帮助。
        </p>
      )}

      <p className="fs-message" aria-live="polite" style={{ marginTop: 14 }}>
        {message}
      </p>

      <div className="v3-guide-actions">
        <button
          type="button"
          className="fs-btn fs-btn--secondary"
          disabled={index === 0}
          onClick={() => {
            setIndex((value) => Math.max(0, value - 1));
            setMessage("");
          }}
        >
          上一步
        </button>
        {index < steps.length - 1 ? (
          <button
            type="button"
            className="fs-btn fs-btn--primary"
            onClick={() => {
              setIndex((value) => Math.min(steps.length - 1, value + 1));
              setMessage("");
            }}
          >
            下一步
          </button>
        ) : (
          <Link className="fs-btn fs-btn--primary" to="/firstshift/work">
            完成查看
          </Link>
        )}
      </div>

      <div className="v3-guide-links">
        <button
          type="button"
          className="fs-btn fs-btn--ghost"
          onClick={() => setMessage(`已重新显示「${step.title}」的说明。`)}
        >
          再看一次
        </button>
        <Link className="fs-btn fs-btn--ghost" to="/firstshift/help/request?barrier=dont-understand">
          我不确定
        </Link>
      </div>

      <p className="v3-demo-note" style={{ marginTop: 16 }}>
        演示步骤是合成内容，不代表真实门店的现行指导。
      </p>
    </div>
  );
}
