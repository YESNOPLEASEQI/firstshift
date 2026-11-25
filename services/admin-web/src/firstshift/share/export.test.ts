import { describe, expect, it } from "vitest";
import { buildSharePayload } from "./export";
import type { PassportItem, ShareConfig } from "../types";

const items: PassportItem[] = [
  { id: "a", category: "explain", label: "解释方式", value: "一次只给我一个步骤。" },
  { id: "b", category: "format", label: "说明方式", value: "希望配一张真实货架照片。" },
  { id: "c", category: "help", label: "求助方式", value: "先让我自己重看说明。" },
];

const config: ShareConfig = {
  recipientLabel: "就业辅导员",
  recipientDetail: "陈老师",
  purpose: "了解我的支持需要",
  itemIds: ["a", "c"],
  exportedAt: "2026-11-25 10:40",
};

describe("passport share export", () => {
  it("exports only the fields the owner selected", () => {
    const payload = buildSharePayload(items, config, "小林");
    expect(payload.selectedCount).toBe(2);
    expect(payload.text).toContain("一次只给我一个步骤");
    expect(payload.text).toContain("先让我自己重看说明");
    expect(payload.text).not.toContain("真实货架照片");
    expect(payload.html).not.toContain("真实货架照片");
  });

  it("includes recipient and purpose context, and the withdrawal warning", () => {
    const payload = buildSharePayload(items, config, "小林");
    expect(payload.html).toContain("就业辅导员");
    expect(payload.text).toContain("了解我的支持需要");
    expect(payload.text).toContain("无法远程撤回");
    expect(payload.text).toContain("不是诊断");
  });

  it("never leaks history or diagnostics when nothing is selected", () => {
    const payload = buildSharePayload(items, { ...config, itemIds: [] }, "小林");
    expect(payload.selectedCount).toBe(0);
    expect(payload.html).not.toContain("真实货架照片");
    expect(payload.text).not.toContain("一次只给我一个步骤");
  });
});
