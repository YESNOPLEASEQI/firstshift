import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { gsap } from "gsap";
import { Icon } from "../../components/ui";
import { celebrate, motionAllowed, reorderWithFlip } from "../../coach/motion";
import {
  activeVersion,
  pickTask,
  publishedVersion,
  SHELF_IMAGE,
  SUPPLY_TARGETS,
  useCoachStore,
  validatePractice,
  type CoachStep,
  type PracticeConfig,
} from "../../coach/store";
import {
  CoachDialog,
  CoachHeading,
  ErrorList,
  VersionPill,
  useCoachToast,
  useDocumentTitle,
} from "../../coach/ui";

export default function Editor() {
  useDocumentTitle("指导编辑 · 辅导员端");
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { setMessage, node } = useCoachToast();

  const tasks = useCoachStore((state) => state.tasks);
  const activeTaskId = useCoachStore((state) => state.activeTaskId);
  const setActiveTask = useCoachStore((state) => state.setActiveTask);
  const updateStep = useCoachStore((state) => state.updateStep);
  const addStep = useCoachStore((state) => state.addStep);
  const removeStep = useCoachStore((state) => state.removeStep);
  const moveStep = useCoachStore((state) => state.moveStep);
  const saveDraft = useCoachStore((state) => state.saveDraft);
  const submitReview = useCoachStore((state) => state.submitReview);
  const withdrawReview = useCoachStore((state) => state.withdrawReview);
  const createDraft = useCoachStore((state) => state.createDraft);
  const practice = useCoachStore((state) => state.practice);
  const savePractice = useCoachStore((state) => state.savePractice);

  const task = useCoachStore((state) =>
    taskId ? state.tasks.find((entry) => entry.id === taskId) ?? pickTask(state) : pickTask(state),
  );

  useEffect(() => {
    if (task.id !== activeTaskId) setActiveTask(task.id);
  }, [task.id, activeTaskId, setActiveTask]);

  const version = activeVersion(task);
  const published = publishedVersion(task);
  const steps = (version ?? published)?.steps ?? [];
  const canEdit = version?.status === "draft";

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"steps" | "edit" | "preview">("edit");
  const [errors, setErrors] = useState<string[]>([]);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceForm, setPracticeForm] = useState<PracticeConfig>(practice);
  const [practiceErrors, setPracticeErrors] = useState<string[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string[]>([]);

  const current: CoachStep | undefined =
    steps.find((step) => step.stepId === selectedId) ?? steps[0];
  const currentIndex = current ? steps.findIndex((step) => step.stepId === current.stepId) : -1;

  const stepsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previousCount = useRef(steps.length);

  useEffect(() => {
    if (steps.length > previousCount.current && stepsRef.current) {
      const last = stepsRef.current.lastElementChild as HTMLElement | null;
      if (last && motionAllowed(last)) {
        gsap.fromTo(
          last,
          { autoAlpha: 0, y: -8, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.35, ease: "power2.out", clearProps: "all" },
        );
      }
    }
    previousCount.current = steps.length;
  }, [steps.length]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el || !motionAllowed(el)) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0.35, y: 8 },
      { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "all" },
    );
  }, [current?.stepId]);

  if (tasks.length === 0) return <Navigate to="/firstshift/coach/tasks" replace />;

  const patch = (value: Partial<CoachStep>) => {
    if (!current || !canEdit) return;
    updateStep(current.stepId, value);
  };

  const onSave = () => {
    const result = saveDraft();
    if (result.ok) {
      setErrors([]);
      setMessage("草稿已保存");
    } else {
      setErrors(result.errors);
    }
  };

  const onSubmit = () => {
    const result = submitReview();
    if (result.ok) {
      celebrate();
      navigate(`/firstshift/coach/reviews/${task.id}`);
      return;
    }
    setErrors(result.errors);
  };

  const openPractice = () => {
    setPracticeForm(practice);
    setPracticeErrors([]);
    setPracticeOpen(true);
  };

  const onSavePractice = () => {
    const result = savePractice(practiceForm);
    if (result.ok) {
      setPracticeOpen(false);
      setMessage("练习配置已保存");
      return;
    }
    setPracticeErrors(result.errors);
  };

  const onDelete = () => {
    if (!current) return;
    const result = removeStep(current.stepId);
    if (result.ok) {
      setDeleteOpen(false);
      setSelectedId(null);
      setMessage("步骤已删除");
      return;
    }
    setDeleteError(result.errors);
  };

  const previewPracticeErrors = validatePractice(steps, practice);

  return (
    <div className="fsc-editorpage">
      <CoachHeading
        title="指导编辑"
        titleId="fsc-editor-title"
        aside={
          <div className="fsc-actions">
            {version ? <VersionPill status={version.status} /> : published && <VersionPill status="published" />}
            {canEdit && (
              <span className="fsc-editorstatus">草稿 {version?.versionId}</span>
            )}
            <Link className="fsc-link" to={`/firstshift/coach/reviews/${task.id}`}>
              版本记录
            </Link>
            {canEdit && (
              <>
                <button type="button" className="fsc-btn" onClick={openPractice}>
                  <Icon name="try" size={16} />
                  练习配置
                </button>
                <button type="button" className="fsc-btn" onClick={onSave}>
                  保存草稿
                </button>
                <button type="button" className="fsc-btn primary" onClick={onSubmit}>
                  提交审核
                </button>
              </>
            )}
            {version?.status === "review" && (
              <>
                <Link className="fsc-btn primary" to={`/firstshift/coach/reviews/${task.id}`}>
                  去审核
                </Link>
                <button
                  type="button"
                  className="fsc-btn"
                  onClick={() => {
                    const result = withdrawReview();
                    if (result.ok) setMessage("已撤回审核，可以继续修改");
                    else setErrors(result.errors);
                  }}
                >
                  撤回审核
                </button>
              </>
            )}
            {!version && published && (
              <button
                type="button"
                className="fsc-btn primary"
                onClick={() => {
                  const result = createDraft();
                  if (!result.ok) setErrors(result.errors);
                }}
              >
                新建草稿
              </button>
            )}
          </div>
        }
      />

      {errors.length > 0 && (
        <div className="mb">
          <ErrorList errors={errors} />
        </div>
      )}

      {!canEdit && (
        <div className="fsc-callout amber mb">
          {version?.status === "review"
            ? "这个版本正在审核，内容只能查看。撤回审核后才能继续修改。"
            : "已发布版本不能直接修改。请新建草稿，审核通过后再发布。"}
        </div>
      )}

      <div className="fsc-mobiletabs fsc-tabs" role="tablist" aria-label="编辑视图">
        {(
          [
            ["steps", "步骤"],
            ["edit", "编辑"],
            ["preview", "预览"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={mobileTab === key}
            className={mobileTab === key ? "active" : ""}
            onClick={() => setMobileTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="fsc-editorgrid" data-mobile={mobileTab}>
        <div className="fsc-stepcol">
          <div className="fsc-colhead">
            <span>步骤</span>
            <span className="fsc-quiet fsc-small">{steps.length}</span>
          </div>
          <div className="fsc-steplist" ref={stepsRef}>
            {steps.map((step, index) => (
              <button
                key={step.stepId}
                type="button"
                className={`fsc-step${step.stepId === current?.stepId ? " active" : ""}`}
                onClick={() => {
                  setSelectedId(step.stepId);
                  setMobileTab("edit");
                }}
                aria-current={step.stepId === current?.stepId ? "true" : undefined}
              >
                <span className="num" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="grow">{step.title || "未命名步骤"}</span>
                <Icon name="chevronRight" size={15} />
              </button>
            ))}
            {steps.length === 0 && <p className="fsc-quiet fsc-small">还没有步骤。</p>}
          </div>
          <div className="fsc-stepfoot">
            <button type="button" onClick={addStep} disabled={!canEdit}>
              <Icon name="plus" size={16} />
              添加步骤
            </button>
            <button type="button" onClick={openPractice} disabled={!canEdit}>
              <Icon name="settings" size={16} />
              练习配置
            </button>
          </div>
        </div>

        <div className="fsc-editbody">
          {current ? (
            <>
              <div className="fsc-field">
                <label htmlFor="step-title">步骤名称</label>
                <input
                  id="step-title"
                  value={current.title}
                  disabled={!canEdit}
                  onChange={(event) => patch({ title: event.target.value })}
                />
              </div>

              <div className="fsc-field">
                <label htmlFor="step-instruction">易读指导</label>
                <textarea
                  id="step-instruction"
                  value={current.instruction}
                  disabled={!canEdit}
                  onChange={(event) => patch({ instruction: event.target.value })}
                />
              </div>

              <div className="fsc-field">
                <span className="fsc-label">步骤图片</span>
                <div className="fsc-photo">
                  {current.image ? (
                    <>
                      <img src={current.image} alt={current.alt || "步骤示意图"} />
                      <div className="fsc-photofoot">
                        <span>教学示意图</span>
                        <span className="fsc-photoactions">
                          <button
                            type="button"
                            disabled={!canEdit}
                            onClick={() => patch({ image: SHELF_IMAGE, alt: current.alt || "两层货架，上层 A1、A2，下层 B1、B2。" })}
                          >
                            使用货架示意图
                          </button>
                          <button
                            type="button"
                            className="remove"
                            disabled={!canEdit}
                            onClick={() => patch({ image: null })}
                          >
                            移除图片
                          </button>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="fsc-photofoot">
                      <span>这一步没有图片</span>
                      <span className="fsc-photoactions">
                        <button type="button" disabled={!canEdit} onClick={() => patch({ image: SHELF_IMAGE })}>
                          使用货架示意图
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {current.image && (
                <div className="fsc-field">
                  <label htmlFor="step-alt">图片替代文本</label>
                  <input
                    id="step-alt"
                    value={current.alt}
                    disabled={!canEdit}
                    onChange={(event) => patch({ alt: event.target.value })}
                  />
                </div>
              )}

              <div className="fsc-fieldrow">
                <div className="fsc-field">
                  <label htmlFor="step-target">目标货位</label>
                  <select
                    id="step-target"
                    value={current.target}
                    disabled={!canEdit}
                    onChange={(event) => patch({ target: event.target.value })}
                  >
                    <option value="">不涉及</option>
                    {SUPPLY_TARGETS.map((target) => (
                      <option key={target} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="fsc-field">
                  <label htmlFor="step-depends">依赖步骤</label>
                  <select
                    id="step-depends"
                    value={current.dependsOn}
                    disabled={!canEdit}
                    onChange={(event) => patch({ dependsOn: event.target.value })}
                  >
                    <option value="">不依赖</option>
                    {steps
                      .filter((step) => step.stepId !== current.stepId)
                      .map((step) => (
                        <option key={step.stepId} value={step.title}>
                          {step.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="fsc-field">
                <label htmlFor="step-help">求助方式</label>
                <textarea
                  id="step-help"
                  value={current.help}
                  disabled={!canEdit}
                  onChange={(event) => patch({ help: event.target.value })}
                />
              </div>

              <details className="fsc-details">
                <summary>备注</summary>
                <textarea
                  aria-label="步骤备注"
                  value={current.notes}
                  disabled={!canEdit}
                  onChange={(event) => patch({ notes: event.target.value })}
                />
              </details>

              <div className="fsc-stepactions mt">
                <button
                  type="button"
                  className="fsc-btn"
                  disabled={!canEdit || currentIndex <= 0}
                  onClick={() =>
                    reorderWithFlip(stepsRef.current, () => {
                      moveStep(current.stepId, -1);
                    })
                  }
                >
                  <Icon name="arrowUp" size={16} />
                  上移
                </button>
                <button
                  type="button"
                  className="fsc-btn"
                  disabled={!canEdit || currentIndex >= steps.length - 1}
                  onClick={() =>
                    reorderWithFlip(stepsRef.current, () => {
                      moveStep(current.stepId, 1);
                    })
                  }
                >
                  <Icon name="arrowDown" size={16} />
                  下移
                </button>
                <button
                  type="button"
                  className="fsc-btn danger right"
                  disabled={!canEdit}
                  onClick={() => {
                    setDeleteError([]);
                    setDeleteOpen(true);
                  }}
                >
                  <Icon name="trash" size={16} />
                  删除步骤
                </button>
              </div>
            </>
          ) : (
            <div className="fsc-empty">
              <p>这个版本还没有步骤。</p>
            </div>
          )}
        </div>

        <div className="fsc-previewcol">
          <div className="fsc-colhead">
            <span>本人端预览</span>
            <span className="fsc-quiet fsc-small">
              {currentIndex + 1}/{steps.length}
            </span>
          </div>
          <div className="fsc-previewpad">
            <div className="fsc-phone" ref={previewRef}>
              <div className="bar">
                <span>{task.title}</span>
                <span>一次一步</span>
              </div>
              {current ? (
                <>
                  <h2>{current.title || "未命名步骤"}</h2>
                  {current.image && <img src={current.image} alt={current.alt || "步骤示意图"} />}
                  <p>{current.instruction || "这一步还没有写指导。"}</p>
                  <button type="button" className="fsc-btn primary" disabled>
                    我完成了
                  </button>
                  <span className="fsc-link">需要帮助？</span>
                </>
              ) : (
                <p className="fsc-quiet">选择左侧步骤后在这里预览。</p>
              )}
            </div>
            {previewPracticeErrors.length > 0 && canEdit && (
              <p className="fsc-small fsc-quiet" style={{ marginTop: 12 }}>
                练习配置待完善：{previewPracticeErrors[0]}
              </p>
            )}
          </div>
        </div>
      </div>

      <CoachDialog
        open={practiceOpen}
        title="练习配置"
        onClose={() => setPracticeOpen(false)}
        footer={
          <>
            <button type="button" className="fsc-btn" onClick={() => setPracticeOpen(false)}>
              取消
            </button>
            <button type="button" className="fsc-btn primary" onClick={onSavePractice}>
              保存配置
            </button>
          </>
        }
      >
        <ErrorList errors={practiceErrors} />
        <p className="fsc-small fsc-quiet" style={{ marginBottom: 14 }}>
          练习与指导分开配置，修改指导步骤不会自动改动练习。
        </p>
        <div className="field">
          <label htmlFor="practice-count">商品数量</label>
          <input
            id="practice-count"
            type="number"
            min={1}
            max={8}
            value={practiceForm.itemCount}
            onChange={(event) =>
              setPracticeForm({ ...practiceForm, itemCount: Number(event.target.value) })
            }
          />
        </div>
        <div className="field">
          <span className="fsc-label">练习需要覆盖的货位</span>
          <div style={{ display: "grid", gap: 8 }}>
            {SUPPLY_TARGETS.map((target) => (
              <label key={target} className="fsc-checklabel">
                <input
                  type="checkbox"
                  checked={practiceForm.targets.includes(target)}
                  onChange={(event) =>
                    setPracticeForm({
                      ...practiceForm,
                      targets: event.target.checked
                        ? [...practiceForm.targets, target]
                        : practiceForm.targets.filter((entry) => entry !== target),
                    })
                  }
                />
                {target}
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="practice-initial">初始状态说明</label>
          <textarea
            id="practice-initial"
            value={practiceForm.initial}
            onChange={(event) => setPracticeForm({ ...practiceForm, initial: event.target.value })}
          />
        </div>
      </CoachDialog>

      <CoachDialog open={deleteOpen} title="删除这个步骤？" onClose={() => setDeleteOpen(false)}>
        <p>删除后，依赖它的步骤需要重新设置依赖。</p>
        <ErrorList errors={deleteError} />
        <div className="mt fsc-actions">
          <button type="button" className="fsc-btn" onClick={() => setDeleteOpen(false)}>
            取消
          </button>
          <button type="button" className="fsc-btn danger" onClick={onDelete}>
            删除步骤
          </button>
        </div>
      </CoachDialog>

      {node}
    </div>
  );
}
