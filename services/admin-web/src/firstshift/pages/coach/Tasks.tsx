import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSoftSwap } from "../../coach/motion";
import { Icon } from "../../components/ui";
import {
  activeVersion,
  pickJob,
  publishedVersion,
  useCoachStore,
  type CoachJob,
  type CoachTask,
  type CoachVersionStatus,
} from "../../coach/store";
import {
  CoachDialog,
  CoachHeading,
  ErrorList,
  VersionPill,
  useCoachToast,
  useDocumentTitle,
} from "../../coach/ui";

type JobForm = Pick<
  CoachJob,
  | "title"
  | "category"
  | "workContent"
  | "environmentKnown"
  | "confirmed"
  | "pending"
  | "supports"
  | "source"
>;

const EMPTY_JOB: JobForm = {
  title: "",
  category: "",
  workContent: "",
  environmentKnown: "",
  confirmed: "",
  pending: "",
  supports: "",
  source: "合成演示数据",
};

const TASK_TYPES = ["图文指导", "交互练习", "图文指导 / 交互练习"];

function taskStatus(task: CoachTask): CoachVersionStatus {
  const active = activeVersion(task);
  if (active) return active.status;
  return publishedVersion(task) ? "published" : "draft";
}

function formOf(job: CoachJob): JobForm {
  return {
    title: job.title,
    category: job.category,
    workContent: job.workContent,
    environmentKnown: job.environmentKnown,
    confirmed: job.confirmed,
    pending: job.pending,
    supports: job.supports,
    source: job.source,
  };
}

const JOB_FIELDS: { key: keyof JobForm; label: string; multiline?: boolean }[] = [
  { key: "title", label: "岗位名称" },
  { key: "category", label: "岗位类别" },
  { key: "workContent", label: "工作内容", multiline: true },
  { key: "environmentKnown", label: "已知环境", multiline: true },
  { key: "confirmed", label: "已确认的条件", multiline: true },
  { key: "pending", label: "仍需现场确认", multiline: true },
  { key: "supports", label: "可用支持", multiline: true },
  { key: "source", label: "资料来源", multiline: true },
];

export default function Tasks() {
  useDocumentTitle("岗位与任务 · 辅导员端");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { setMessage, node } = useCoachToast();

  const jobs = useCoachStore((state) => state.jobs);
  const tasks = useCoachStore((state) => state.tasks);
  const activeJob = useCoachStore(pickJob);
  const updateJob = useCoachStore((state) => state.updateJob);
  const addJob = useCoachStore((state) => state.addJob);
  const setActiveJob = useCoachStore((state) => state.setActiveJob);
  const addTask = useCoachStore((state) => state.addTask);

  const query = params.get("q") ?? "";
  const status = params.get("status") ?? "all";
  const tableRef = useRef<HTMLDivElement>(null);
  useSoftSwap(tableRef, status);

  const [jobOpen, setJobOpen] = useState(false);
  const [jobMode, setJobMode] = useState<"edit" | "create">("edit");
  const [form, setForm] = useState<JobForm>(EMPTY_JOB);
  const [jobErrors, setJobErrors] = useState<string[]>([]);
  const [discardOpen, setDiscardOpen] = useState(false);

  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState(TASK_TYPES[0]);
  const [taskErrors, setTaskErrors] = useState<string[]>([]);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "all") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const jobTasks = useMemo(
    () => tasks.filter((task) => task.jobId === activeJob.id),
    [tasks, activeJob.id],
  );

  const visibleTasks = jobTasks.filter((task) => {
    if (status !== "all" && taskStatus(task) !== status) return false;
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return (
      task.title.toLowerCase().includes(needle) ||
      task.type.toLowerCase().includes(needle) ||
      activeJob.title.toLowerCase().includes(needle)
    );
  });

  const jobDirty =
    jobMode === "create"
      ? JSON.stringify(form) !== JSON.stringify(EMPTY_JOB)
      : JSON.stringify(form) !== JSON.stringify(formOf(activeJob));

  const openEditJob = () => {
    setJobMode("edit");
    setForm(formOf(activeJob));
    setJobErrors([]);
    setJobOpen(true);
  };

  const openCreateJob = () => {
    setJobMode("create");
    setForm(EMPTY_JOB);
    setJobErrors([]);
    setJobOpen(true);
  };

  const closeJob = () => {
    if (jobDirty) {
      setDiscardOpen(true);
      return;
    }
    setJobOpen(false);
  };

  const saveJob = () => {
    if (!form.title.trim()) {
      setJobErrors(["请填写岗位名称。"]);
      return;
    }
    if (jobMode === "create") {
      const result = addJob(form.title, form.category);
      if (!result.ok) {
        setJobErrors(result.errors);
        return;
      }
      setJobOpen(false);
      setMessage(`已新建岗位 ${form.title.trim()}`);
      return;
    }
    updateJob(activeJob.id, form);
    setJobOpen(false);
    setMessage("岗位信息已保存");
  };

  const saveTask = () => {
    const result = addTask(taskTitle, taskType);
    if (!result.ok) {
      setTaskErrors(result.errors);
      return;
    }
    setTaskOpen(false);
    setTaskTitle("");
    setTaskType(TASK_TYPES[0]);
    setTaskErrors([]);
    setMessage(`已新建任务 ${taskTitle.trim()}（草稿）`);
    if (result.taskId) navigate(`/firstshift/coach/editor/${result.taskId}`);
  };

  return (
    <div className="fsc-page">
      <CoachHeading
        title="岗位与任务"
        titleId="fsc-tasks-title"
        aside={
          <div className="fsc-actions">
            <button type="button" className="fsc-btn" onClick={openCreateJob}>
              <Icon name="plus" size={16} />
              新建岗位
            </button>
            <button
              type="button"
              className="fsc-btn primary"
              onClick={() => {
                setTaskErrors([]);
                setTaskOpen(true);
              }}
            >
              <Icon name="plus" size={16} />
              新建任务
            </button>
          </div>
        }
      />

      <div className="fsc-toolbar">
        <label className="fsc-search">
          <Icon name="search" size={16} />
          <span className="fsc-quiet" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>
            搜索岗位或任务
          </span>
          <input
            type="search"
            placeholder="搜索岗位或任务"
            value={query}
            onChange={(event) => setParam("q", event.target.value)}
          />
        </label>
        <label>
          <span className="fsc-small fsc-quiet" style={{ marginRight: 8 }}>
            状态
          </span>
          <select
            className="fsc-select"
            value={status}
            onChange={(event) => setParam("status", event.target.value)}
            aria-label="按状态筛选任务"
          >
            <option value="all">全部状态</option>
            <option value="published">已发布</option>
            <option value="review">待审核</option>
            <option value="draft">草稿</option>
          </select>
        </label>
        {jobs.length > 1 && (
          <label className="right">
            <span className="fsc-small fsc-quiet" style={{ marginRight: 8 }}>
              岗位
            </span>
            <select
              className="fsc-select"
              value={activeJob.id}
              onChange={(event) => setActiveJob(event.target.value)}
              aria-label="选择岗位"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <section className="fsc-jobstrip" aria-labelledby="fsc-job-title">
        <img src={activeJob.cover} alt={activeJob.coverAlt} />
        <div className="grow">
          <h2 id="fsc-job-title">{activeJob.title}</h2>
          <p>
            {activeJob.category} · {jobTasks.length} 项工作任务
          </p>
          {activeJob.workContent && (
            <p style={{ marginTop: 4 }}>{activeJob.workContent}</p>
          )}
        </div>
        <button type="button" className="fsc-btn" onClick={openEditJob}>
          <Icon name="edit" size={16} />
          编辑岗位
        </button>
      </section>

      <section className="fsc-panel" aria-labelledby="fsc-task-table">
        <div className="fsc-panelhead">
          <h2 id="fsc-task-table">工作任务</h2>
        </div>
        <div className="fsc-tablewrap" ref={tableRef}>
          <table className="fsc-table">
            <thead>
              <tr>
                <th scope="col">任务名称</th>
                <th scope="col">类型</th>
                <th scope="col">已发布版本</th>
                <th scope="col">当前状态</th>
                <th scope="col">操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleTasks.map((task) => {
                const published = publishedVersion(task);
                const active = activeVersion(task);
                return (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.type}</td>
                    <td className="num">{published ? published.versionId : "—"}</td>
                    <td>
                      {active ? (
                        <VersionPill status={active.status} />
                      ) : published ? (
                        <VersionPill status="published" />
                      ) : (
                        <VersionPill status="draft" />
                      )}
                    </td>
                    <td>
                      <div className="fsc-actions">
                        <Link className="fsc-link" to={`/firstshift/coach/editor/${task.id}`}>
                          编辑
                        </Link>
                        <Link className="fsc-link" to={`/firstshift/coach/reviews/${task.id}`}>
                          版本
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visibleTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="fsc-quiet">
                    没有匹配的任务。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <CoachDialog
        open={jobOpen}
        title={jobMode === "create" ? "新建岗位" : "编辑岗位"}
        onClose={closeJob}
        wide
        footer={
          <>
            <button type="button" className="fsc-btn" onClick={closeJob}>
              取消
            </button>
            <button type="button" className="fsc-btn primary" onClick={saveJob}>
              保存岗位
            </button>
          </>
        }
      >
        <ErrorList errors={jobErrors} />
        {jobMode === "create" && (
          <p className="fsc-small fsc-quiet" style={{ marginBottom: 14 }}>
            新岗位保存为草稿，不会覆盖现有岗位。
          </p>
        )}
        <div style={{ display: "grid", gap: 0 }}>
          {JOB_FIELDS.map((field) => (
            <div className="field" key={field.key}>
              <label htmlFor={`job-${field.key}`}>{field.label}</label>
              {field.multiline ? (
                <textarea
                  id={`job-${field.key}`}
                  value={form[field.key]}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                />
              ) : (
                <input
                  id={`job-${field.key}`}
                  value={form[field.key]}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                />
              )}
            </div>
          ))}
        </div>
      </CoachDialog>

      <CoachDialog open={discardOpen} title="放弃未保存的修改？" onClose={() => setDiscardOpen(false)}>
        <p>关闭后，这次修改不会保存。</p>
        <div className="mt fsc-actions">
          <button type="button" className="fsc-btn" onClick={() => setDiscardOpen(false)}>
            继续编辑
          </button>
          <button
            type="button"
            className="fsc-btn danger"
            onClick={() => {
              setDiscardOpen(false);
              setJobOpen(false);
            }}
          >
            放弃修改
          </button>
        </div>
      </CoachDialog>

      <CoachDialog
        open={taskOpen}
        title="新建任务"
        onClose={() => setTaskOpen(false)}
        footer={
          <>
            <button type="button" className="fsc-btn" onClick={() => setTaskOpen(false)}>
              取消
            </button>
            <button type="button" className="fsc-btn primary" onClick={saveTask}>
              创建任务
            </button>
          </>
        }
      >
        <ErrorList errors={taskErrors} />
        <div className="field">
          <label htmlFor="task-title">任务名称</label>
          <input
            id="task-title"
            data-autofocus
            value={taskTitle}
            onChange={(event) => setTaskTitle(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="task-type">任务类型</label>
          <select id="task-type" value={taskType} onChange={(event) => setTaskType(event.target.value)}>
            {TASK_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </CoachDialog>

      {node}
    </div>
  );
}
