import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useDemoStore } from "../store/demoStore";

// Synthetic coach-side demo data. Formal fields and endpoints must come from the
// shared integration contract once it exists; every action here only changes
// local demo state and never claims a server confirmation.

export type CoachVersionStatus = "draft" | "review" | "published" | "superseded";
export type ImpactDecision = "retained" | "review" | "paused";

export interface CoachStep {
  stepId: string;
  title: string;
  instruction: string;
  image: string | null;
  alt: string;
  target: string;
  dependsOn: string;
  help: string;
  notes: string;
}

export interface CoachVersion {
  versionId: string;
  status: CoachVersionStatus;
  createdAt: string;
  submittedAt?: string;
  publishedAt?: string;
  steps: CoachStep[];
}

export interface CoachTask {
  id: string;
  jobId: string;
  title: string;
  type: string;
  versions: CoachVersion[];
}

export interface CoachJob {
  id: string;
  title: string;
  category: string;
  workContent: string;
  environmentKnown: string;
  confirmed: string;
  pending: string;
  supports: string;
  cover: string;
  coverAlt: string;
  source: string;
}

export interface ImpactItem {
  stepId: string;
  stepTitle: string;
  decision: ImpactDecision;
  from: string;
  to: string;
  note: string;
}

export interface PracticeConfig {
  template: "shelf";
  itemCount: number;
  shelfCount: number;
  targets: string[];
  initial: string;
}

export interface RequestHandling {
  responsibility: string;
  note: string;
  updatedAt: string | null;
}

export interface AccessRecord {
  id: string;
  name: string;
  purpose: string;
  audience: string;
  grantedAt: string;
  expiresAt: string;
  status: "active" | "revoked";
  itemIds: string[];
}

export interface CoachEvent {
  id: string;
  at: string;
  label: string;
  note?: string;
}

export interface ActionResult {
  ok: boolean;
  errors: string[];
}

export const SUPPLY_TARGETS = ["A1", "A2", "B1", "B2"] as const;
export const SHELF_IMAGE = "/firstshift/assets/coach/shelf-overview.jpg";
const ALT = "两层货架，上层 A1、A2，下层 B1、B2。B1 在左下方。";

const baseSteps = (): CoachStep[] => [
  {
    stepId: "s1",
    title: "检查商品",
    instruction: "看手中商品的名称和包装，确认是哪一种商品。",
    image: null,
    alt: "",
    target: "",
    dependsOn: "",
    help: "",
    notes: "",
  },
  {
    stepId: "s2",
    title: "寻找货架",
    instruction: "找到 B1 货架。看看标签上的文字。",
    image: SHELF_IMAGE,
    alt: ALT,
    target: "B1",
    dependsOn: "检查商品",
    help: "请同事帮我找到 B1 货架。",
    notes: "",
  },
  {
    stepId: "s3",
    title: "放置商品",
    instruction: "把燕麦片放进 B1 的空位里。",
    image: SHELF_IMAGE,
    alt: ALT,
    target: "B1",
    dependsOn: "寻找货架",
    help: "请同事示范一次怎么放。",
    notes: "",
  },
  {
    stepId: "s4",
    title: "暂停与求助",
    instruction: "不确定时先暂停，再向同事求助。",
    image: null,
    alt: "",
    target: "",
    dependsOn: "",
    help: "举起求助卡，等同事过来。",
    notes: "暂停时不要把商品放在其他货架。",
  },
  {
    stepId: "s5",
    title: "完成检查",
    instruction: "对照当前货架标签，再检查一次位置。",
    image: null,
    alt: "",
    target: "",
    dependsOn: "放置商品",
    help: "",
    notes: "",
  },
];

const v1Steps = (): CoachStep[] =>
  baseSteps().map((step) => {
    if (step.stepId === "s2") {
      return {
        ...step,
        instruction: "找到 A2 货架。看看标签上的文字。",
        target: "A2",
        help: "请同事帮我找到 A2 货架。",
      };
    }
    if (step.stepId === "s3") {
      return { ...step, instruction: "把燕麦片放进 A2 的空位里。", target: "A2" };
    }
    return step;
  });

const seedTask = (): CoachTask => ({
  id: "demo-stock",
  jobId: "retail-store",
  title: "整理货架",
  type: "图文指导 / 交互练习",
  versions: [
    {
      versionId: "v1",
      status: "published",
      createdAt: "2026-11-22 16:30",
      publishedAt: "2026-11-24 16:30",
      steps: v1Steps(),
    },
    {
      versionId: "v2",
      status: "review",
      createdAt: "2026-11-25 09:10",
      submittedAt: "2026-11-25 09:40",
      steps: baseSteps(),
    },
  ],
});

const seedJob = (): CoachJob => ({
  id: "retail-store",
  title: "超市理货员",
  category: "零售",
  workContent: "核对商品标签，将轻量商品放到指定货架，并检查摆放结果。",
  environmentKnown: "室内门店，有货架、通道和备货台。",
  confirmed: "轻量包装，可以短时间站立。",
  pending: "工作时间、休息安排和通道宽度需要现场确认。",
  supports: "一次一个步骤；可查看货架图片；不清楚时暂停并请人示范。",
  cover: SHELF_IMAGE,
  coverAlt: "两层货架的示意图，四个货位分别标着 A1、A2、B1、B2。",
  source: "合成演示数据 · 货架图为生成的教学示意",
});

const seedPractice = (): PracticeConfig => ({
  template: "shelf",
  itemCount: 2,
  shelfCount: 4,
  targets: ["A1", "B1"],
  initial: "两件轻量商品，初始都放在备货台。",
});

const seedAccess = (): AccessRecord[] => [
  {
    id: "access-demo-1",
    name: "小林",
    purpose: "制作和调整工作指导",
    audience: "就业辅导员",
    grantedAt: "2026-11-25",
    expiresAt: "2027-11-25",
    status: "active",
    itemIds: ["p-format-1", "p-explain-1"],
  },
];

const seedEvents = (): CoachEvent[] => [
  { id: "e1", at: "2026-11-25 10:20", label: "小林提交了新的支持请求" },
  { id: "e2", at: "2026-11-25 09:40", label: "岗位导师提交了货架位置变更" },
  { id: "e3", at: "2026-11-24 16:30", label: "整理货架 v1 已发布" },
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function stamp(date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function today(): string {
  return stamp().slice(0, 10);
}

function normalizeTarget(value: string): string {
  return value.trim().toUpperCase();
}

export function validateSteps(steps: CoachStep[]): string[] {
  const errors: string[] = [];
  if (steps.length === 0) return ["至少需要一个步骤。"];
  const titles = new Set(steps.map((step) => step.title.trim()));
  steps.forEach((step, index) => {
    const label = `第 ${index + 1} 步`;
    if (!step.title.trim()) errors.push(`${label}缺少步骤名称。`);
    if (!step.instruction.trim()) errors.push(`${label}缺少易读指导。`);
    if (step.image && !step.alt.trim()) errors.push(`${label}的图片缺少替代文本。`);
    if (step.target && !SUPPLY_TARGETS.includes(step.target as (typeof SUPPLY_TARGETS)[number])) {
      errors.push(`${label}的目标货位不在当前模板支持范围内。`);
    }
    if (step.dependsOn) {
      if (step.dependsOn === step.title) errors.push(`${label}不能依赖自己。`);
      else if (!titles.has(step.dependsOn)) errors.push(`${label}依赖的步骤不存在。`);
    }
  });
  return errors;
}

export function validatePractice(steps: CoachStep[], config: PracticeConfig): string[] {
  const errors: string[] = [];
  const used = new Set(
    steps.filter((step) => step.target).map((step) => normalizeTarget(step.target)),
  );
  used.forEach((target) => {
    if (!config.targets.some((entry) => normalizeTarget(entry) === target)) {
      errors.push(`练习配置没有覆盖指导中的 ${target} 货位。`);
    }
  });
  if (config.itemCount < 1 || config.itemCount > 8) errors.push("商品数量需要在 1 到 8 之间。");
  if (config.shelfCount !== 4) errors.push("当前货架模板固定为 4 个货位。");
  return errors;
}

export function computeImpact(from: CoachStep[], to: CoachStep[]): ImpactItem[] {
  const previous = new Map(from.map((step) => [step.stepId, step]));
  const paused = new Set<string>();
  const items: ImpactItem[] = [];

  to.forEach((step) => {
    const before = previous.get(step.stepId);
    if (!before) {
      items.push({
        stepId: step.stepId,
        stepTitle: step.title,
        decision: "review",
        from: "无",
        to: step.target || step.instruction,
        note: "新增步骤，需要人工核对后再发布。",
      });
      return;
    }
    if (normalizeTarget(before.target) !== normalizeTarget(step.target)) {
      paused.add(step.title);
      items.push({
        stepId: step.stepId,
        stepTitle: step.title,
        decision: "paused",
        from: before.target || "不涉及",
        to: step.target || "不涉及",
        note: "旧位置指引已失效，需暂停使用。",
      });
      return;
    }
    items.push({
      stepId: step.stepId,
      stepTitle: step.title,
      decision: "retained",
      from: before.instruction,
      to: step.instruction,
      note: "内容保留。",
    });
  });

  const dependsOnPaused = (step: CoachStep): boolean => {
    const seen = new Set<string>();
    let current = step.dependsOn;
    while (current) {
      if (seen.has(current)) return false;
      seen.add(current);
      if (paused.has(current)) return true;
      current = to.find((entry) => entry.title === current)?.dependsOn ?? "";
    }
    return false;
  };

  return items.map((item) => {
    if (item.decision !== "retained") return item;
    const step = to.find((entry) => entry.stepId === item.stepId);
    if (step && dependsOnPaused(step)) {
      return {
        ...item,
        decision: "review",
        note: "这一步依赖已暂停的旧位置，请复核说明和图片。",
      };
    }
    return item;
  });
}

export function activeVersion(task: CoachTask): CoachVersion | undefined {
  return task.versions.find((version) => version.status === "draft" || version.status === "review");
}

export function publishedVersion(task: CoachTask): CoachVersion | undefined {
  return task.versions.find((version) => version.status === "published");
}

type TaskList = { tasks: CoachTask[]; activeTaskId: string };

export function pickTask(state: TaskList): CoachTask {
  return state.tasks.find((task) => task.id === state.activeTaskId) ?? state.tasks[0];
}

export function pickJob(state: { jobs: CoachJob[]; activeJobId: string }): CoachJob {
  return state.jobs.find((job) => job.id === state.activeJobId) ?? state.jobs[0];
}

interface CoachState {
  jobs: CoachJob[];
  activeJobId: string;
  tasks: CoachTask[];
  activeTaskId: string;
  practice: PracticeConfig;
  handling: Record<string, RequestHandling>;
  access: AccessRecord[];
  events: CoachEvent[];
  lastSavedAt: string | null;
  lastPublishedAt: string | null;

  updateJob: (jobId: string, patch: Partial<CoachJob>) => void;
  addJob: (title: string, category: string) => { ok: boolean; errors: string[]; jobId?: string };
  setActiveJob: (jobId: string) => void;
  setActiveTask: (taskId: string) => void;
  createDraft: () => ActionResult;
  addTask: (title: string, type: string) => { ok: boolean; errors: string[]; taskId?: string };
  updateStep: (stepId: string, patch: Partial<CoachStep>) => void;
  addStep: () => void;
  removeStep: (stepId: string) => ActionResult;
  moveStep: (stepId: string, direction: -1 | 1) => void;
  saveDraft: () => ActionResult;
  submitReview: () => ActionResult;
  withdrawReview: () => ActionResult;
  rejectReview: (note: string) => ActionResult;
  publishReview: (confirmed: boolean) => ActionResult;
  savePractice: (config: PracticeConfig) => ActionResult;
  saveHandling: (requestId: string, handling: RequestHandling) => ActionResult;
  confirmResponsibility: (requestId: string) => ActionResult;
  sendToReview: (requestId: string) => ActionResult;
  resetCoachData: () => void;
}

function storageAvailable(): boolean {
  try {
    const probe = "firstshift.coach-probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function nextVersionLabel(task: CoachTask): string {
  const highest = task.versions.reduce((max, version) => {
    const number = Number(version.versionId.replace(/[^0-9]/g, ""));
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);
  return `v${highest + 1}`;
}

const seedState = () => ({
  jobs: [seedJob()] as CoachJob[],
  activeJobId: "retail-store",
  tasks: [seedTask()] as CoachTask[],
  activeTaskId: "demo-stock",
  practice: seedPractice(),
  handling: {} as Record<string, RequestHandling>,
  access: seedAccess(),
  events: seedEvents(),
  lastSavedAt: null,
  lastPublishedAt: null,
});

export const useCoachStore = create<CoachState>()(
  persist(
    (set, get) => {
      const updateActive = (
        updater: (task: CoachTask) => CoachTask,
      ): void =>
        set((state) => {
          const active = pickTask(state);
          return {
            tasks: state.tasks.map((task) => (task.id === active.id ? updater(task) : task)),
          };
        });

      return {
        ...seedState(),

        updateJob: (jobId, patch) =>
          set((state) => ({
            jobs: state.jobs.map((job) => (job.id === jobId ? { ...job, ...patch } : job)),
          })),

        addJob: (title, category) => {
          if (!title.trim()) return { ok: false, errors: ["请填写岗位名称。"] };
          const jobId = `job-${Date.now()}`;
          const job: CoachJob = {
            ...seedJob(),
            id: jobId,
            title: title.trim(),
            category: category.trim() || "未分类",
            workContent: "",
            environmentKnown: "",
            confirmed: "",
            pending: "",
            supports: "",
          };
          set((state) => ({
            jobs: [...state.jobs, job],
            activeJobId: jobId,
            events: [
              { id: `e-${Date.now()}`, at: stamp(), label: `新建岗位 ${job.title}` },
              ...state.events,
            ],
          }));
          return { ok: true, errors: [], jobId };
        },

        setActiveJob: (jobId) => set({ activeJobId: jobId }),

        setActiveTask: (taskId) => set({ activeTaskId: taskId }),

        createDraft: () => {
          const task = pickTask(get());
          if (activeVersion(task)) {
            return { ok: false, errors: ["这个任务已有待处理版本。"] };
          }
          const published = publishedVersion(task);
          if (!published) return { ok: false, errors: ["没有可参考的已发布版本。"] };
          const versionId = nextVersionLabel(task);
          const at = stamp();
          updateActive((entry) => ({
            ...entry,
            versions: [
              ...entry.versions,
              {
                versionId,
                status: "draft",
                createdAt: at,
                steps: published.steps.map((step) => ({ ...step })),
              },
            ],
          }));
          set((state) => ({
            events: [
              { id: `e-${Date.now()}`, at, label: `${task.title} ${versionId} 草稿已创建` },
              ...state.events,
            ],
          }));
          return { ok: true, errors: [] };
        },

        addTask: (title, type) => {
          if (!title.trim()) return { ok: false, errors: ["请填写任务名称。"] };
          const taskId = `task-${Date.now()}`;
          const task: CoachTask = {
            id: taskId,
            jobId: pickJob(get()).id,
            title: title.trim(),
            type,
            versions: [
              {
                versionId: "v1",
                status: "draft",
                createdAt: stamp(),
                steps: [
                  {
                    stepId: "s1",
                    title: "新步骤",
                    instruction: "",
                    image: null,
                    alt: "",
                    target: "",
                    dependsOn: "",
                    help: "",
                    notes: "",
                  },
                ],
              },
            ],
          };
          set((state) => ({
            tasks: [...state.tasks, task],
            activeTaskId: taskId,
            events: [
              { id: `e-${Date.now()}`, at: stamp(), label: `新建任务 ${task.title}（草稿）` },
              ...state.events,
            ],
          }));
          return { ok: true, errors: [], taskId };
        },

        updateStep: (stepId, patch) => {
          const active = activeVersion(pickTask(get()));
          if (!active || active.status !== "draft") return;
          const previous = active.steps.find((entry) => entry.stepId === stepId);
          if (!previous) return;
          const nextTitle = patch.title ?? previous.title;
          updateActive((task) => ({
            ...task,
            versions: task.versions.map((version) =>
              version.versionId === active.versionId
                ? {
                    ...version,
                    steps: version.steps.map((entry) => {
                      if (entry.stepId === stepId) return { ...entry, ...patch };
                      if (previous.title !== nextTitle && entry.dependsOn === previous.title) {
                        return { ...entry, dependsOn: nextTitle };
                      }
                      return entry;
                    }),
                  }
                : version,
            ),
          }));
        },

        addStep: () => {
          const active = activeVersion(pickTask(get()));
          if (!active || active.status !== "draft") return;
          updateActive((task) => ({
            ...task,
            versions: task.versions.map((version) =>
              version.versionId === active.versionId
                ? {
                    ...version,
                    steps: [
                      ...version.steps,
                      {
                        stepId: `s${Date.now()}`,
                        title: "新步骤",
                        instruction: "",
                        image: null,
                        alt: "",
                        target: "",
                        dependsOn: version.steps.at(-1)?.title ?? "",
                        help: "",
                        notes: "",
                      },
                    ],
                  }
                : version,
            ),
          }));
        },

        removeStep: (stepId) => {
          const active = activeVersion(pickTask(get()));
          if (!active || active.status !== "draft") {
            return { ok: false, errors: ["只有草稿可以修改。"] };
          }
          const step = active.steps.find((entry) => entry.stepId === stepId);
          if (!step) return { ok: false, errors: ["没有找到这个步骤。"] };
          if (active.steps.some((entry) => entry.dependsOn === step.title)) {
            return { ok: false, errors: ["其他步骤正在依赖它，请先解除依赖。"] };
          }
          updateActive((task) => ({
            ...task,
            versions: task.versions.map((version) =>
              version.versionId === active.versionId
                ? { ...version, steps: version.steps.filter((entry) => entry.stepId !== stepId) }
                : version,
            ),
          }));
          return { ok: true, errors: [] };
        },

        moveStep: (stepId, direction) => {
          const active = activeVersion(pickTask(get()));
          if (!active || active.status !== "draft") return;
          const index = active.steps.findIndex((entry) => entry.stepId === stepId);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= active.steps.length) return;
          updateActive((task) => ({
            ...task,
            versions: task.versions.map((version) => {
              if (version.versionId !== active.versionId) return version;
              const steps = [...version.steps];
              const [moved] = steps.splice(index, 1);
              steps.splice(target, 0, moved);
              return { ...version, steps };
            }),
          }));
        },

        saveDraft: () => {
          if (!storageAvailable()) {
            return { ok: false, errors: ["浏览器不允许访问本地存储，草稿没有保存。"] };
          }
          const active = activeVersion(pickTask(get()));
          if (!active || active.status !== "draft") {
            return { ok: false, errors: ["当前版本不在草稿状态，不能保存。"] };
          }
          set({ lastSavedAt: stamp() });
          return { ok: true, errors: [] };
        },

        submitReview: () => {
          const state = get();
          const task = pickTask(state);
          const active = activeVersion(task);
          if (!active) return { ok: false, errors: ["当前没有可提交的版本。"] };
          if (active.status !== "draft") return { ok: false, errors: ["这个版本已经提交审核。"] };
          const errors = [
            ...validateSteps(active.steps),
            ...validatePractice(active.steps, state.practice),
          ];
          if (errors.length > 0) return { ok: false, errors };
          const submittedAt = stamp();
          updateActive((entry) => ({
            ...entry,
            versions: entry.versions.map((version) =>
              version.versionId === active.versionId
                ? { ...version, status: "review", submittedAt }
                : version,
            ),
          }));
          set((current) => ({
            events: [
              {
                id: `e-${Date.now()}`,
                at: submittedAt,
                label: `${task.title} ${active.versionId} 已提交审核`,
              },
              ...current.events,
            ],
            lastSavedAt: submittedAt,
          }));
          return { ok: true, errors: [] };
        },

        withdrawReview: () => {
          const task = pickTask(get());
          const active = activeVersion(task);
          if (!active || active.status !== "review") {
            return { ok: false, errors: ["没有正在审核的版本。"] };
          }
          updateActive((entry) => ({
            ...entry,
            versions: entry.versions.map((version) =>
              version.versionId === active.versionId
                ? { ...version, status: "draft", submittedAt: undefined }
                : version,
            ),
          }));
          return { ok: true, errors: [] };
        },

        rejectReview: (note) => {
          if (!note.trim()) return { ok: false, errors: ["退回时请填写原因。"] };
          const task = pickTask(get());
          const active = activeVersion(task);
          if (!active || active.status !== "review") {
            return { ok: false, errors: ["没有正在审核的版本。"] };
          }
          const at = stamp();
          updateActive((entry) => ({
            ...entry,
            versions: entry.versions.map((version) =>
              version.versionId === active.versionId
                ? { ...version, status: "draft", submittedAt: undefined }
                : version,
            ),
          }));
          set((state) => ({
            events: [
              { id: `e-${Date.now()}`, at, label: `退回 ${task.title} ${active.versionId}`, note },
              ...state.events,
            ],
          }));
          return { ok: true, errors: [] };
        },

        publishReview: (confirmed) => {
          if (!confirmed) return { ok: false, errors: ["请先确认岗位事实和受影响的指导。"] };
          const task = pickTask(get());
          const active = activeVersion(task);
          if (!active || active.status !== "review") {
            return { ok: false, errors: ["没有正在审核的版本。"] };
          }
          const previous = publishedVersion(task);
          const at = stamp();
          updateActive((entry) => ({
            ...entry,
            versions: entry.versions.map((version) => {
              if (version.versionId === active.versionId) {
                return { ...version, status: "published", publishedAt: at };
              }
              if (previous && version.versionId === previous.versionId) {
                return { ...version, status: "superseded" };
              }
              return version;
            }),
          }));
          set((state) => ({
            lastPublishedAt: at,
            events: [
              { id: `e-${Date.now()}`, at, label: `${task.title} ${active.versionId} 已发布` },
              ...state.events,
            ],
          }));
          useDemoStore.setState({ changeDecision: null });
          return { ok: true, errors: [] };
        },

        savePractice: (config) => {
          const active = activeVersion(pickTask(get()));
          if (!active || active.status !== "draft") {
            return { ok: false, errors: ["只有草稿可以修改练习配置。"] };
          }
          const errors = validatePractice(active.steps, config);
          if (errors.length > 0) return { ok: false, errors };
          set({ practice: config });
          return { ok: true, errors: [] };
        },

        saveHandling: (requestId, handling) => {
          if (!handling.responsibility) return { ok: false, errors: ["请选择责任方。"] };
          if (!handling.note.trim()) return { ok: false, errors: ["请填写处理说明。"] };
          set((state) => ({
            handling: {
              ...state.handling,
              [requestId]: { ...handling, updatedAt: stamp() },
            },
          }));
          return { ok: true, errors: [] };
        },

        confirmResponsibility: (requestId) => {
          const handling = get().handling[requestId];
          const request = useDemoStore.getState().requests.find((entry) => entry.id === requestId);
          if (!request) return { ok: false, errors: ["没有找到这条请求。"] };
          if (!handling || !handling.responsibility || !handling.note.trim()) {
            return { ok: false, errors: ["请先选择责任方并填写处理说明。"] };
          }
          useDemoStore.getState().setRequestStatus(requestId, "confirmed", handling.note);
          set((state) => ({
            events: [
              {
                id: `e-${Date.now()}`,
                at: stamp(),
                label: `已确认支持请求 ${request.reference ?? request.id} 的责任方`,
              },
              ...state.events,
            ],
          }));
          return { ok: true, errors: [] };
        },

        sendToReview: (requestId) => {
          const handling = get().handling[requestId];
          const request = useDemoStore.getState().requests.find((entry) => entry.id === requestId);
          if (!request) return { ok: false, errors: ["没有找到这条请求。"] };
          if (request.status !== "confirmed") {
            return { ok: false, errors: ["需要先确认责任方。"] };
          }
          useDemoStore.getState().setRequestStatus(requestId, "prepared", handling?.note);
          set((state) => ({
            events: [
              {
                id: `e-${Date.now()}`,
                at: stamp(),
                label: `支持请求 ${request.reference ?? request.id} 已交本人复核`,
              },
              ...state.events,
            ],
          }));
          return { ok: true, errors: [] };
        },

        resetCoachData: () => set(seedState()),
      };
    },
    {
      name: "firstshift.coach.v1",
      version: 2,
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        jobs: state.jobs,
        activeJobId: state.activeJobId,
        tasks: state.tasks,
        activeTaskId: state.activeTaskId,
        practice: state.practice,
        handling: state.handling,
        access: state.access,
        events: state.events,
        lastSavedAt: state.lastSavedAt,
        lastPublishedAt: state.lastPublishedAt,
      }),
    },
  ),
);
