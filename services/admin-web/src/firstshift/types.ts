// FirstShift demo domain types. These are synthetic A-mode (sandbox) shapes only.
// Formal API types must come from the team's docs/INTEGRATION_CONTRACT.md once agreed.

export interface JobExample {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  workContent: string[];
  environmentKnown: string[];
  environmentUnknown: string[];
  typicalTasks: string[];
  supports: string[];
  source: string;
}

export interface TaskStepDef {
  stepId: string;
  title: string;
  instruction: string;
  location?: string;
}

export interface TaskVersion {
  taskId: string;
  versionId: string;
  status: "draft" | "reviewed" | "published" | "superseded";
  label: string;
  publishedAt?: string;
  steps: TaskStepDef[];
}

export interface ShelfSlot {
  id: string;
  name: string;
  capacity: number;
}

export interface PracticeItem {
  id: string;
  name: string;
  target: string;
  packageLabel: string;
}

export interface Scenario {
  taskId: string;
  versionId: string;
  title: string;
  items: PracticeItem[];
  shelves: ShelfSlot[];
  worksheet: string[];
}

export type SessionStatus = "active" | "paused" | "exited" | "ended";
export type SessionView = "choose-item" | "choose-shelf" | "confirm-placement" | "review";
export type Outcome = "confirmed" | "needs-help" | "unsure" | "stopped";
export type Hint = "work-order" | "photo" | "example";

export interface Session {
  taskId: string;
  versionId: string;
  status: SessionStatus;
  view: SessionView;
  selected: string | null;
  target: string | null;
  placements: Record<string, string>;
  history: string[];
  hints: Hint[];
  outcome: Outcome | null;
  message: string;
}

export type SessionAction =
  | { type: "choose-item"; id: string }
  | { type: "choose-shelf"; id: string }
  | { type: "place" }
  | { type: "undo" }
  | { type: "back" }
  | { type: "review" }
  | { type: "hint"; hint: Hint }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "exit" }
  | { type: "end"; outcome: Outcome };

export type ImpactDecision = "retained" | "review" | "paused";

export interface ChangeStep {
  stepId: string;
  stepTitle: string;
  from: string;
  to: string;
  decision: ImpactDecision;
  note: string;
}

export interface PublishedChange {
  id: string;
  title: string;
  summary: string;
  fromVersion: string;
  toVersion: string;
  publishedAt: string;
  /** Synthetic stand-in for the shared domain layer's impact result. */
  source: string;
  retainedSupport: string[];
  steps: ChangeStep[];
}

export type PassportCategory = "goal" | "explain" | "format" | "help";

export interface PassportItem {
  id: string;
  category: PassportCategory;
  label: string;
  value: string;
}

export interface ShareConfig {
  recipientLabel: string;
  recipientDetail: string;
  purpose: string;
  itemIds: string[];
  exportedAt: string;
}

export type RequestStatus =
  | "submitted"
  | "confirmed"
  | "prepared"
  | "done"
  | "adjust"
  | "withdrawn";

export interface RequestEvent {
  at: string;
  label: string;
  note?: string;
}

export interface HelpRequest {
  id: string;
  /** Coach-side reference shown in the support queue. Synthetic in the demo. */
  reference?: string;
  /** Task the request belongs to, as shown to the coach. */
  title?: string;
  barrier: string;
  barrierLabel: string;
  wishes: string[];
  note: string;
  createdAt: string;
  status: RequestStatus;
  timeline: RequestEvent[];
}

export type FontScale = "standard" | "large" | "larger";

export interface Settings {
  fontScale: FontScale;
  /** Legacy fields kept so existing coach permissions and stored data stay compatible. */
  largeText: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
}

export const CATEGORY_LABELS: Record<PassportCategory, string> = {
  goal: "我的工作目标",
  explain: "我喜欢的工作说明",
  format: "我喜欢的工作说明",
  help: "我希望得到的帮助",
};

export const BARRIER_OPTIONS = [
  { id: "dont-understand", label: "我看不懂这一步" },
  { id: "mismatch", label: "说明和实际情况不一样" },
  { id: "environment-change", label: "工作环境变了" },
  { id: "need-different-support", label: "我需要其他帮助" },
] as const;

export const WISH_OPTIONS = [
  "给我新的图片说明",
  "再解释一次",
  "请同事给我演示",
  "其他",
] as const;

export const HINT_LABELS: Record<Hint, string> = {
  "work-order": "工作单",
  photo: "图片提示",
  example: "看示范",
};

export const OUTCOME_LABELS: Record<Outcome, string> = {
  confirmed: "我完成了",
  "needs-help": "我还需要帮助",
  unsure: "我不确定",
  stopped: "暂时停止",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "已提出，等待确认",
  confirmed: "责任方已确认",
  prepared: "支持已准备，等待你复核",
  done: "已完成（你已确认）",
  adjust: "仍需调整，等待责任方",
  withdrawn: "已撤回",
};
