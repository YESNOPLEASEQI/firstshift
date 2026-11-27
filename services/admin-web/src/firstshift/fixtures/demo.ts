import type {
  HelpRequest,
  JobExample,
  PassportItem,
  PublishedChange,
  Scenario,
  TaskVersion,
} from "../types";

// All names, stores and instructions below are synthetic demo data.
// Formal seed data and API shapes must be agreed with the backend owner.

export const DEMO_USER_NAME = "小林";

export const demoJob: JobExample = {
  id: "retail-community",
  title: "超市理货员",
  kicker: "社区零售门店 · 演示岗位",
  summary: "整理商品，让货架保持整齐。检查商品包装和标签。",
  workContent: [
    "看商品包装上的名称。",
    "找到名称相同的货架标签。",
    "把轻量商品放到对应空位。",
    "对照标签再检查一遍。",
  ],
  environmentKnown: [
    "在超市或零售门店工作，可能遇到顾客和同事。",
  ],
  environmentUnknown: [
    "具体工作时间与休息安排需要和真实门店确认。",
    "噪音、灯光和通道宽度需要现场了解。",
    "工作机会与劳动条件需要和真实雇主协商。",
  ],
  typicalTasks: ["核对商品标签", "整理轻量商品", "把商品放到指定位置"],
  supports: [
    "图片说明、工作步骤、同事指导。",
    "需要时可以查看商品和货架的图片说明。",
    "不清楚时可以暂停并请人示范。",
    "可以把自己的支持偏好分享给辅导员。",
  ],
  source: "合成演示数据 · 不对应任何真实门店或雇主",
};

export const taskV1: TaskVersion = {
  taskId: "demo-stock",
  versionId: "v1",
  status: "published",
  label: "整理货架（演示版本 v1）",
  publishedAt: "2026-11-22",
  steps: [
    {
      stepId: "s1",
      title: "检查商品",
      instruction: "看手中商品的名称和包装，确认是哪一种商品。",
    },
    {
      stepId: "s2",
      title: "寻找货架",
      instruction: "找到名称相同的货架标签：燕麦片在 A2，米在 A1。",
      location: "A2 / A1",
    },
    {
      stepId: "s3",
      title: "放置商品",
      instruction: "把商品放到对应货架的空位里。",
      location: "A2 / A1",
    },
    {
      stepId: "s4",
      title: "核对位置",
      instruction: "对照当前货架标签，检查商品名称是否一致。",
    },
  ],
};

export const taskV2: TaskVersion = {
  taskId: "demo-stock",
  versionId: "v2",
  status: "published",
  label: "整理货架（演示版本 v2）",
  publishedAt: "2026-11-25",
  steps: [
    {
      stepId: "s1",
      title: "检查商品",
      instruction: "看手中商品的名称和包装，确认是哪一种商品。",
    },
    {
      stepId: "s2",
      title: "寻找货架",
      instruction: "燕麦片现在在 B1 货架，米仍然在 A1。",
      location: "B1 / A1",
    },
    {
      stepId: "s3",
      title: "放置商品",
      instruction: "把商品放到对应空位。新位置照片还在更新，不确定时先暂停查看变化说明。",
      location: "B1 / A1",
    },
    {
      stepId: "s4",
      title: "核对位置",
      instruction: "对照当前货架标签，检查商品名称是否一致。",
    },
  ],
};

export const scenarioV1: Scenario = {
  taskId: "demo-stock",
  versionId: "v1",
  title: "整理货架",
  items: [
    { id: "oats-1", name: "燕麦片", target: "A2", packageLabel: "盒装 · 轻量" },
    { id: "rice-1", name: "米", target: "A1", packageLabel: "袋装 · 轻量" },
  ],
  shelves: [
    { id: "A1", name: "米", capacity: 1 },
    { id: "A2", name: "燕麦片", capacity: 1 },
    { id: "B1", name: "备用位置", capacity: 1 },
    { id: "B2", name: "备用位置", capacity: 1 },
  ],
  worksheet: [
    "看商品包装上的名称。",
    "找到名称相同的货架标签。",
    "把商品放到对应空位。",
    "对照标签再检查一遍。",
  ],
};

export const scenarioV2: Scenario = {
  ...scenarioV1,
  versionId: "v2",
  items: scenarioV1.items.map((item) =>
    item.id === "oats-1" ? { ...item, target: "B1" } : item,
  ),
  shelves: scenarioV1.shelves.map((shelf) => {
    if (shelf.id === "A2") return { ...shelf, name: "备用位置" };
    if (shelf.id === "B1") return { ...shelf, name: "燕麦片" };
    return shelf;
  }),
};

export const demoChange: PublishedChange = {
  id: "chg-1",
  title: "货架位置变更",
  summary:
    "今天门店调整了货架：燕麦片原来在 A2，现在移到 B1。米仍然在 A1。检查商品和一般核对方法不受影响。",
  fromVersion: "v1",
  toVersion: "v2",
  publishedAt: "2026-11-25 09:40",
  source: "影响分析结果由共享领域层提供（此处为已确认的演示数据）",
  retainedSupport: [
    "一次只给一个步骤。",
    "需要时可以查看商品和货架的图片说明。",
    "不清楚时先自己重看说明，再请人示范。",
  ],
  steps: [
    {
      stepId: "s1",
      stepTitle: "检查商品",
      from: "看名称和标签",
      to: "同左",
      decision: "retained",
      note: "检查商品名称与标签的方法保留。",
    },
    {
      stepId: "s2",
      stepTitle: "寻找货架",
      from: "燕麦片在 A2",
      to: "燕麦片在 B1",
      decision: "review",
      note: "旧 A2 指令已暂停；新位置等待你确认后再作为当前指导。",
    },
    {
      stepId: "s3",
      stepTitle: "放置商品",
      from: "放到对应位置",
      to: "放到对应位置",
      decision: "review",
      note: "放置位置依赖新照片，辅导员正在补图；旧照片不能作为当前操作依据。",
    },
    {
      stepId: "s4",
      stepTitle: "核对位置",
      from: "对照当前货架标签",
      to: "同左",
      decision: "retained",
      note: "一般核对方法保留，请以当前标签为准。",
    },
  ],
};

export const initialPassportItems: PassportItem[] = [
  {
    id: "p-goal-1",
    category: "goal",
    label: "工作目标",
    value: "尝试超市理货工作。",
  },
  {
    id: "p-explain-1",
    category: "explain",
    label: "解释方式",
    value: "每次告诉我一个步骤。",
  },
  {
    id: "p-format-1",
    category: "format",
    label: "说明方式",
    value: "给我看照片。",
  },
  {
    id: "p-help-1",
    category: "help",
    label: "求助方式",
    value: "让我重新看一遍说明。",
  },
  {
    id: "p-help-2",
    category: "help",
    label: "求助方式",
    value: "请同事给我演示。",
  },
];

export const demoRequest: HelpRequest = {
  id: "req-demo-1",
  reference: "SR-001",
  title: "货架位置不一样",
  barrier: "mismatch",
  barrierLabel: "说明与实际看到的不一样",
  wishes: ["希望看新旧位置对照图", "希望有人现场示范一次"],
  note: "货架标签换了位置，我有点不确定应该放哪里。",
  createdAt: "2026-11-25 10:20",
  status: "confirmed",
  timeline: [
    { at: "2026-11-25 10:20", label: "我提出了请求" },
    { at: "2026-11-25 10:40", label: "辅导员已确认收到" },
  ],
};

export const demoPreparedRequest: HelpRequest = {
  id: "req-demo-2",
  reference: "SR-002",
  title: "看不懂工作说明",
  barrier: "dont-understand",
  barrierLabel: "我看不懂这一步",
  wishes: ["给我新的图片说明"],
  note: "步骤说明里写的和现场不太一样，我担心放错。",
  createdAt: "2026-11-24 15:10",
  status: "prepared",
  timeline: [
    { at: "2026-11-24 15:10", label: "我提出了请求" },
    { at: "2026-11-25 09:10", label: "辅导员准备好了帮助" },
  ],
};

export const demoContacts = [
  {
    id: "coach",
    role: "就业辅导员",
    name: "陈老师（虚构）",
    note: "演示联系人，不做真实通知",
    area: "就业支持",
    description: "工作说明、支持偏好和求助处理。",
  },
  {
    id: "mentor",
    role: "岗位导师",
    name: "王师傅（虚构）",
    note: "演示联系人，不做真实通知",
    area: "门店指导",
    description: "现场示范、工作步骤和门店安排。",
  },
];

export const demoChanges = [demoChange];

export const demoWorkSteps = taskV2.steps.map((step) => ({
  ...step,
  status: step.stepId === "s2" ? ("review" as const) : step.stepId === "s3" ? ("review" as const) : ("published" as const),
}));
