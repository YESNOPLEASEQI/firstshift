import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Dialog, Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import { taskV2 } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";

export default function WorkTask() {
  useDocumentTitle("步骤指导");
  const { taskId } = useParams();
  const navigate = useNavigate();
  const changeDecision = useDemoStore((state) => state.changeDecision);
  const [index, setIndex] = useState(0);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [message, setMessage] = useState("");

  if (taskId !== "demo-stock") {
    return <Navigate to="/firstshift/work" replace />;
  }

  const steps = taskV2.steps;
  const step = steps[index];
  const acknowledged = changeDecision === "understood";
  const isA2Check = step.stepId === "s2" && !acknowledged;
  const isPhotoPending = step.stepId === "s3";

  return (
    <div className="fs-stack">
      <PageHeader
        backTo="/firstshift/work"
        backLabel="返回我的工作"
        title="整理货架"
        aside={<span className="fs-badge fs-badge--demo">演示指导 · 非真实岗位</span>}
        titleId="fs-worktask-title"
      />

      <div className="fs-stack fs-stack--tight fs-stepview">
        <div className="fs-stepdots" role="img" aria-label={`第 ${index + 1} 步，共 ${steps.length} 步`}>
          {steps.map((entry, entryIndex) => (
            <i
              key={entry.stepId}
              data-active={entryIndex === index}
              data-done={entryIndex < index}
            />
          ))}
        </div>

        <section className="fs-card" aria-labelledby="fs-worktask-step">
          <h2 className="fs-h2" id="fs-worktask-step" style={{ fontSize: "1.5rem" }}>
            {step.title}
          </h2>

          {isA2Check ? (
            <div className="fs-stack fs-stack--tight" style={{ marginTop: 12 }}>
              <p className="fs-warn">
                这一步正在复核：燕麦片的新位置需要你先确认今天的变化说明。旧的 A2 指令已暂停，不再作为当前操作。
              </p>
              <div className="fs-actions">
                <Link className="fs-btn fs-btn--primary" to="/firstshift/work/changes/chg-1">
                  查看变化说明
                </Link>
                <Link className="fs-btn fs-btn--secondary" to="/firstshift/help/request?barrier=mismatch">
                  请求帮助
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="fs-body" style={{ marginTop: 10, fontSize: "1.125rem" }}>
                {step.instruction}
              </p>
              {step.location && (
                <p className="fs-caption" style={{ marginTop: 6 }}>
                  当前位置：{step.location}
                </p>
              )}
              {isPhotoPending && (
                <div className="fs-warn" style={{ marginTop: 12 }}>
                  这一步依赖的新照片还在更新。暂时不要按旧照片操作；可以先跳过或请求帮助。
                </div>
              )}
              {step.stepId === "s2" && acknowledged && (
                <p className="fs-success" style={{ marginTop: 12 }}>
                  已按今天的变化说明更新为 B1。图片仍在补充，以货架文字标签为准。
                </p>
              )}
            </>
          )}

          <p className="fs-message" aria-live="polite" style={{ marginTop: 16 }}>
            {message || "可以重复查看这一步，不会催促或计时。"}
          </p>

          <div className="fs-actions" style={{ marginTop: 14 }}>
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
            <button
              type="button"
              className="fs-btn fs-btn--secondary"
              disabled={index === steps.length - 1}
              onClick={() => {
                setIndex((value) => Math.min(steps.length - 1, value + 1));
                setMessage("");
              }}
            >
              下一步
            </button>
            <button
              type="button"
              className="fs-btn fs-btn--ghost"
              onClick={() => setMessage(`已重新显示「${step.title}」的说明。`)}
            >
              <Icon name="refresh" size={20} />
              再看一次
            </button>
          </div>
        </section>

        <div className="fs-actions fs-actions--split">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setPauseOpen(true)}>
            <Icon name="pause" size={20} />
            暂停
          </button>
          <div className="fs-actions">
            <Link className="fs-btn fs-btn--ghost" to="/firstshift/help/request">
              请求帮助
            </Link>
            <Link className="fs-btn fs-btn--ghost" to="/firstshift/work">
              返回我的工作
            </Link>
          </div>
        </div>

        <p className="fs-note">
          演示版步骤是合成内容，不代表真实门店的现行指导。
        </p>
      </div>

      <Dialog open={pauseOpen} title="已暂停查看" onClose={() => setPauseOpen(false)}>
        <p className="fs-body">可以随时回来继续查看。指导内容不会因为你暂停而改变或消失。</p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setPauseOpen(false)}>
            继续查看
          </button>
          <button type="button" className="fs-btn fs-btn--primary" onClick={() => navigate("/firstshift")}>
            回到首页
          </button>
        </div>
      </Dialog>
    </div>
  );
}
