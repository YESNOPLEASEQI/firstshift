import { beforeEach, describe, expect, it } from "vitest";
import { useDemoStore } from "../store/demoStore";
import {
  computeImpact,
  pickTask,
  publishedVersion,
  SUPPLY_TARGETS,
  useCoachStore,
  validatePractice,
  validateSteps,
  type CoachStep,
  type PracticeConfig,
} from "./store";

const step = (patch: Partial<CoachStep> & { stepId: string }): CoachStep => ({
  title: "步骤",
  instruction: "说明",
  image: null,
  alt: "",
  target: "",
  dependsOn: "",
  help: "",
  notes: "",
  ...patch,
});

const practice: PracticeConfig = {
  template: "shelf",
  itemCount: 2,
  shelfCount: 4,
  targets: ["B1"],
  initial: "",
};

describe("coach store", () => {
  beforeEach(() => {
    useCoachStore.getState().resetCoachData();
    useDemoStore.getState().resetDemoData();
  });

  it("validates readable steps and practice coverage", () => {
    const steps = [
      step({ stepId: "a", title: "检查", instruction: "" }),
      step({ stepId: "b", title: "放置", image: "/img.jpg", alt: "", target: "B9" }),
      step({ stepId: "c", title: "核对", dependsOn: "核对" }),
    ];
    const errors = validateSteps(steps);
    expect(errors).toContain("第 1 步缺少易读指导。");
    expect(errors).toContain("第 2 步的图片缺少替代文本。");
    expect(errors).toContain("第 2 步的目标货位不在当前模板支持范围内。");
    expect(errors).toContain("第 3 步不能依赖自己。");

    expect(validatePractice([step({ stepId: "a", target: "A2" })], practice)).toContain(
      "练习配置没有覆盖指导中的 A2 货位。",
    );
    expect(validatePractice([step({ stepId: "a", target: "B1" })], practice)).toEqual([]);
    expect(SUPPLY_TARGETS).toEqual(["A1", "A2", "B1", "B2"]);
  });

  it("marks moved targets as paused and dependent steps for review", () => {
    const from = [
      step({ stepId: "s1", title: "寻找货架", target: "A2" }),
      step({ stepId: "s2", title: "放置商品", target: "A2", dependsOn: "寻找货架" }),
      step({ stepId: "s3", title: "完成检查", dependsOn: "放置商品" }),
    ];
    const to = [
      step({ stepId: "s1", title: "寻找货架", target: "B1" }),
      step({ stepId: "s2", title: "放置商品", target: "B1", dependsOn: "寻找货架" }),
      step({ stepId: "s3", title: "完成检查", dependsOn: "放置商品" }),
    ];
    const impact = computeImpact(from, to);
    expect(impact.find((item) => item.stepId === "s1")?.decision).toBe("paused");
    expect(impact.find((item) => item.stepId === "s2")?.decision).toBe("paused");
    expect(impact.find((item) => item.stepId === "s3")?.decision).toBe("review");
  });

  it("keeps published edits behind withdraw, review and publish", () => {
    const initial = pickTask(useCoachStore.getState());
    expect(publishedVersion(initial)?.versionId).toBe("v1");

    expect(useCoachStore.getState().submitReview().ok).toBe(false);
    expect(useCoachStore.getState().withdrawReview().ok).toBe(true);
    expect(useCoachStore.getState().withdrawReview().ok).toBe(false);

    const drafts = pickTask(useCoachStore.getState());
    const draft = drafts.versions.find((version) => version.status === "draft");
    expect(draft?.versionId).toBe("v2");

    expect(useCoachStore.getState().submitReview().ok).toBe(true);
    expect(pickTask(useCoachStore.getState()).versions.find((v) => v.versionId === "v2")?.status).toBe(
      "review",
    );

    expect(useCoachStore.getState().publishReview(false).ok).toBe(false);
    useDemoStore.setState({ changeDecision: "understood" });
    expect(useCoachStore.getState().publishReview(true).ok).toBe(true);

    const published = pickTask(useCoachStore.getState());
    expect(publishedVersion(published)?.versionId).toBe("v2");
    expect(published.versions.find((v) => v.versionId === "v1")?.status).toBe("superseded");
    expect(useDemoStore.getState().changeDecision).toBeNull();
  });

  it("renames dependencies and blocks deleting a used step", () => {
    useCoachStore.getState().withdrawReview();
    const task = pickTask(useCoachStore.getState());
    const draft = task.versions.find((version) => version.status === "draft");
    const target = draft?.steps.find((entry) => entry.title === "寻找货架");
    expect(target).toBeDefined();
    if (!draft || !target) return;

    useCoachStore.getState().updateStep(target.stepId, { title: "找到货架" });
    const updated = pickTask(useCoachStore.getState())
      .versions.find((version) => version.status === "draft")
      ?.steps.find((entry) => entry.title === "放置商品");
    expect(updated?.dependsOn).toBe("找到货架");

    const result = useCoachStore.getState().removeStep(target.stepId);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("依赖");
  });
});
