import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { gsap } from "gsap";
import { Icon } from "../../components/ui";
import { celebrate, motionAllowed } from "../../coach/motion";
import {
  activeVersion,
  computeImpact,
  publishedVersion,
  SUPPLY_TARGETS,
  useCoachStore,
  type ImpactDecision,
} from "../../coach/store";
import {
  CoachDialog,
  CoachHeading,
  ErrorList,
  VersionPill,
  useCoachToast,
  useDocumentTitle,
} from "../../coach/ui";

const DECISION_TEXT: Record<ImpactDecision, { label: string; tone: string }> = {
  retained: { label: "保留", tone: "green" },
  review: { label: "待复核", tone: "amber" },
  paused: { label: "暂停", tone: "red" },
};

const CHECKS = [
  "已核对岗位事实和货架位置。",
  "新旧位置说明与图片一致。",
  "求助方式和暂停步骤仍然有效。",
  "已确认受影响的步骤会暂停旧指引。",
];

function Value({ text }: { text: string }) {
  if (SUPPLY_TARGETS.includes(text as (typeof SUPPLY_TARGETS)[number])) {
    return <b>{text}</b>;
  }
  return <p>{text}</p>;
}

export default function ReviewDetail() {
  useDocumentTitle("变更审核 · 辅导员端");
  const { taskId } = useParams();
  const { setMessage, node } = useCoachToast();

  const task = useCoachStore((state) => state.tasks.find((entry) => entry.id === taskId));
  const jobs = useCoachStore((state) => state.jobs);
  const publishReview = useCoachStore((state) => state.publishReview);
  const rejectReview = useCoachStore((state) => state.rejectReview);

  const [checks, setChecks] = useState<boolean[]>(CHECKS.map(() => false));
  const checklistRef = useRef<HTMLElement>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const allChecked = checks.every(Boolean);

  useEffect(() => {
    if (!allChecked) return;
    const el = checklistRef.current;
    if (!el || !motionAllowed(el)) return;
    const rest = getComputedStyle(el).borderColor;
    gsap.fromTo(
      el,
      { borderColor: "#235C50" },
      { borderColor: rest, duration: 0.9, ease: "power2.out", clearProps: "borderColor" },
    );
    celebrate(el);
  }, [allChecked]);

  if (!task) return <Navigate to="/firstshift/coach/reviews" replace />;

  const version = activeVersion(task);
  const published = publishedVersion(task);
  const job = jobs.find((entry) => entry.id === task.jobId);
  const inReview = version?.status === "review";
  const steps = (version ?? published)?.steps ?? [];
  const impact = computeImpact(published?.steps ?? [], steps);
  const counts = {
    retained: impact.filter((item) => item.decision === "retained").length,
    review: impact.filter((item) => item.decision === "review").length,
    paused: impact.filter((item) => item.decision === "paused").length,
  };
  const supports = (job?.supports ?? "")
    .split("；")
    .map((line) => line.trim())
    .filter(Boolean);

  const doPublish = () => {
    const result = publishReview(confirmPublish);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setPublishOpen(false);
    setConfirmPublish(false);
    setErrors([]);
    setMessage("新版本已发布，本人端需要重新确认这次变化");
    celebrate(document.querySelector(".fsc-reviewhead"));
  };

  const doReject = () => {
    const result = rejectReview(reason);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setRejectOpen(false);
    setReason("");
    setErrors([]);
    setMessage("已退回修改，版本回到草稿");
  };

  return (
    <div className="fsc-page">
      <CoachHeading
        title={`${task.title} · 变更审核`}
        titleId="fsc-review-title"
        aside={
          <div className="fsc-actions">
            {version ? <VersionPill status={version.status} /> : published && <VersionPill status="published" />}
            <Link className="fsc-btn" to="/firstshift/work">
              <Icon name="external" size={16} />
              本人端预览
            </Link>
          </div>
        }
      />

      {!version && !published && (
        <div className="fsc-empty">
          <p>这个任务还没有版本。</p>
          <Link className="fsc-link" to={`/firstshift/coach/editor/${task.id}`}>
            去指导编辑
          </Link>
        </div>
      )}

      {(version || published) && (
        <>
          <div className="fsc-reviewhead">
            <div>
              <span>版本</span>
              <p>
                <strong>
                  {published?.versionId ?? "—"} → {(version ?? published)?.versionId}
                </strong>
              </p>
            </div>
            <div>
              <span>{inReview ? "提交时间" : "发布时间"}</span>
              <p>
                <strong>
                  {(version?.submittedAt ?? version?.publishedAt ?? published?.publishedAt)?.slice(0, 16)}
                </strong>
              </p>
            </div>
            <div>
              <span>步骤影响</span>
              <p>
                <strong>
                  {counts.retained} 保留 · {counts.review} 复核 · {counts.paused} 暂停
                </strong>
              </p>
            </div>
          </div>

          <div className="fsc-reviewlayout">
            <div className="fsc-stack">
              <section aria-labelledby="fsc-diff-title">
                <h2 className="fsc-h2" id="fsc-diff-title" style={{ fontSize: 18, marginBottom: 14 }}>
                  步骤对比
                </h2>
                {impact.map((item) => {
                  const meta = DECISION_TEXT[item.decision];
                  return (
                    <div className="fsc-changecard" key={item.stepId}>
                      <div className="head">
                        <b>{item.stepTitle}</b>
                        <span className={`fsc-pill ${meta.tone}`}>{meta.label}</span>
                      </div>
                      <div className="fsc-diff">
                        <div className="old">
                          <p className="label">原来</p>
                          <Value text={item.from} />
                        </div>
                        <div className="new">
                          <p className="label">现在</p>
                          <Value text={item.to} />
                        </div>
                      </div>
                      <div className="foot">
                        <p className="fsc-small fsc-quiet">{item.note}</p>
                      </div>
                    </div>
                  );
                })}
                {impact.length === 0 && <p className="fsc-quiet">这个版本没有可对比的步骤。</p>}
              </section>

              <section className="fsc-panel" aria-labelledby="fsc-retained-title">
                <div className="fsc-panelhead">
                  <h2 id="fsc-retained-title">仍然有效的支持</h2>
                </div>
                {supports.length > 0 ? (
                  supports.map((line) => (
                    <div className="fsc-retained" key={line}>
                      <span>{line}</span>
                      <span className="fsc-pill green">保留</span>
                    </div>
                  ))
                ) : (
                  <div className="fsc-panelbody fsc-quiet">岗位信息里还没有填写可用支持。</div>
                )}
              </section>

              <section className="fsc-callout" aria-labelledby="fsc-after-title">
                <h3 id="fsc-after-title" style={{ fontSize: 14, marginBottom: 8 }}>
                  发布后本人端会怎样变化
                </h3>
                <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 4 }}>
                  <li>本人端改用新版本的步骤和位置说明。</li>
                  <li>旧位置的指令和旧照片暂停，不再作为当前操作依据。</li>
                  <li>「我的工作」里的变化需要本人重新确认。</li>
                </ul>
              </section>
            </div>

            <aside className="fsc-stack">
              <section className="fsc-panel" aria-labelledby="fsc-checklist-title" ref={checklistRef}>
                <div className="fsc-panelhead">
                  <h2 id="fsc-checklist-title">审核清单</h2>
                </div>
                <div className="fsc-panelbody">
                  {CHECKS.map((label, index) => (
                    <label className="fsc-checklabel" key={label}>
                      <input
                        type="checkbox"
                        checked={checks[index]}
                        disabled={!inReview}
                        onChange={(event) =>
                          setChecks((current) =>
                            current.map((value, position) =>
                              position === index ? event.target.checked : value,
                            ),
                          )
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </section>

              {inReview ? (
                <section className="fsc-panel" aria-labelledby="fsc-review-actions">
                  <div className="fsc-panelhead">
                    <h2 id="fsc-review-actions">审核操作</h2>
                  </div>
                  <div className="fsc-panelbody fsc-stack" style={{ gap: 10 }}>
                    <button
                      type="button"
                      className="fsc-btn primary w100"
                      disabled={!allChecked}
                      onClick={() => {
                        setConfirmPublish(false);
                        setErrors([]);
                        setPublishOpen(true);
                      }}
                    >
                      发布审核
                    </button>
                    <button
                      type="button"
                      className="fsc-btn w100"
                      onClick={() => {
                        setErrors([]);
                        setRejectOpen(true);
                      }}
                    >
                      退回修改
                    </button>
                    {!allChecked && (
                      <p className="fsc-small fsc-quiet">完成审核清单后才能发布。</p>
                    )}
                  </div>
                </section>
              ) : (
                <section className="fsc-callout">
                  <p>
                    {version
                      ? "这个版本还是草稿。提交审核后才能在这里发布。"
                      : "当前版本已发布，没有待审核内容。"}
                  </p>
                  <Link className="fsc-link" to={`/firstshift/coach/editor/${task.id}`}>
                    {version ? "返回指导编辑" : "基于已发布版本新建草稿"}
                  </Link>
                </section>
              )}
            </aside>
          </div>
        </>
      )}

      <CoachDialog open={publishOpen} title="发布新版本？" onClose={() => setPublishOpen(false)}>
        <p>
          {task.title} 将发布 {(version ?? published)?.versionId}，原来的
          {published ? ` ${published.versionId}` : "版本"}会停用。
        </p>
        <p className="fsc-small fsc-quiet" style={{ marginTop: 8 }}>
          本人端会收到变化提示，并需要重新确认。
        </p>
        <label className="fsc-checklabel">
          <input
            type="checkbox"
            checked={confirmPublish}
            onChange={(event) => setConfirmPublish(event.target.checked)}
          />
          我确认岗位事实和受影响的指导都已核对。
        </label>
        <ErrorList errors={errors} />
        <div className="mt fsc-actions">
          <button type="button" className="fsc-btn" onClick={() => setPublishOpen(false)}>
            取消
          </button>
          <button
            type="button"
            className="fsc-btn primary"
            disabled={!confirmPublish}
            onClick={doPublish}
          >
            确认发布
          </button>
        </div>
      </CoachDialog>

      <CoachDialog open={rejectOpen} title="退回修改" onClose={() => setRejectOpen(false)}>
        <div className="field">
          <label htmlFor="reject-reason">退回原因</label>
          <textarea
            id="reject-reason"
            data-autofocus
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </div>
        <ErrorList errors={errors} />
        <div className="mt fsc-actions">
          <button type="button" className="fsc-btn" onClick={() => setRejectOpen(false)}>
            取消
          </button>
          <button type="button" className="fsc-btn danger" onClick={doReject}>
            退回
          </button>
        </div>
      </CoachDialog>

      {node}
    </div>
  );
}
