import { describe, expect, it } from "vitest";
import { placedItems, reduceSession, startSession } from "./model";
import { scenarioV1, scenarioV2 } from "../fixtures/demo";
import type { Session, SessionAction } from "../types";

function run(session: Session, action: SessionAction, scenario = scenarioV1) {
  return reduceSession(session, action, scenario);
}

describe("independent practice model", () => {
  it("keeps inventory unchanged when the shelf does not match the item", () => {
    let session = startSession(scenarioV1);
    session = run(session, { type: "choose-item", id: "oats-1" });
    session = run(session, { type: "choose-shelf", id: "A1" });
    expect(session.target).toBeNull();
    expect(Object.keys(session.placements)).toHaveLength(0);
    expect(session.view).toBe("choose-shelf");
    expect(session.message).toContain("对不上");
  });

  it("deduplicates hint usage without any penalty", () => {
    let session = startSession(scenarioV1);
    session = run(session, { type: "hint", hint: "photo" });
    session = run(session, { type: "hint", hint: "photo" });
    expect(session.hints).toEqual(["photo"]);
  });

  it("places an item at the correct shelf only once", () => {
    let session = startSession(scenarioV1);
    session = run(session, { type: "choose-item", id: "oats-1" });
    session = run(session, { type: "choose-shelf", id: "A2" });
    session = run(session, { type: "place" });
    expect(session.placements["oats-1"]).toBe("A2");
    session = run(session, { type: "place" });
    expect(session.history).toHaveLength(1);
  });

  it("keeps existing placements when going back or pausing", () => {
    let session = startSession(scenarioV1);
    session = run(session, { type: "choose-item", id: "oats-1" });
    session = run(session, { type: "choose-shelf", id: "A2" });
    session = run(session, { type: "place" });
    session = run(session, { type: "back" });
    expect(session.placements["oats-1"]).toBe("A2");
    session = run(session, { type: "pause" });
    session = run(session, { type: "choose-item", id: "rice-1" });
    expect(session.status).toBe("paused");
    expect(session.selected).toBeNull();
  });

  it("supports resume, undo and partial review", () => {
    let session = startSession(scenarioV1);
    session = run(session, { type: "choose-item", id: "oats-1" });
    session = run(session, { type: "choose-shelf", id: "A2" });
    session = run(session, { type: "place" });
    session = run(session, { type: "exit" });
    session = run(session, { type: "resume" });
    expect(session.status).toBe("active");
    session = run(session, { type: "undo" });
    expect(session.placements["oats-1"]).toBeUndefined();
    session = run(session, { type: "review" });
    session = run(session, { type: "end", outcome: "unsure" });
    expect(session.status).toBe("ended");
    expect(session.outcome).toBe("unsure");
  });

  it("moves to review when all items are placed and never scores the result", () => {
    let session = startSession(scenarioV1);
    session = run(session, { type: "choose-item", id: "oats-1" });
    session = run(session, { type: "choose-shelf", id: "A2" });
    session = run(session, { type: "place" });
    session = run(session, { type: "choose-item", id: "rice-1" });
    session = run(session, { type: "choose-shelf", id: "A1" });
    session = run(session, { type: "place" });
    expect(session.view).toBe("review");
    const placed = placedItems(session, scenarioV1);
    expect(placed.every((item) => item.location)).toBe(true);
    session = run(session, { type: "end", outcome: "confirmed" });
    expect(session.outcome).toBe("confirmed");
    expect(JSON.stringify(session)).not.toMatch(/score|rank|grade/i);
  });

  it("never applies changed instructions to an existing session", () => {
    let session = startSession(scenarioV1);
    session = run(session, { type: "choose-item", id: "oats-1" });
    session = run(session, { type: "choose-shelf", id: "A2" });
    session = run(session, { type: "place" });
    const original = session;
    const mismatch = reduceSession(session, { type: "undo" }, scenarioV2);
    expect(mismatch.placements).toBe(original.placements);
    expect(mismatch.message).toContain("另一个任务版本");
  });

  it("places oats at B1 in the updated scenario", () => {
    let session = startSession(scenarioV2);
    session = reduceSession(session, { type: "choose-item", id: "oats-1" }, scenarioV2);
    session = reduceSession(session, { type: "choose-shelf", id: "B1" }, scenarioV2);
    session = reduceSession(session, { type: "place" }, scenarioV2);
    expect(session.placements["oats-1"]).toBe("B1");
  });
});
