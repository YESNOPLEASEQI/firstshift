import type {
  Hint,
  Outcome,
  Scenario,
  Session,
  SessionAction,
} from "../types";

// Independent practice state model. No GSAP, no network, no persistence, no scoring.
// Adapt to the shared domain/contract after review; this file is UI-local logic only.

export function startSession(scenario: Scenario): Session {
  return {
    taskId: scenario.taskId,
    versionId: scenario.versionId,
    status: "active",
    view: "choose-item",
    selected: null,
    target: null,
    placements: {},
    history: [],
    hints: [],
    outcome: null,
    message: "请先从备货台选择一件商品。",
  };
}

function say(session: Session, message: string): Session {
  return { ...session, message };
}

const owns = (record: Record<string, string>, key: string) =>
  Object.prototype.hasOwnProperty.call(record, key);

export function reduceSession(
  session: Session,
  action: SessionAction,
  scenario: Scenario,
): Session {
  // A running session never silently adopts changed instructions.
  if (session.taskId !== scenario.taskId || session.versionId !== scenario.versionId) {
    return say(session, "这份练习属于另一个任务版本。请回到原来的练习，或开始新的练习。");
  }
  if (session.status === "ended") {
    return session;
  }
  if (action.type === "resume") {
    return session.status === "paused" || session.status === "exited"
      ? { ...session, status: "active", message: "继续上次的练习，已经放好的商品仍然保留。" }
      : session;
  }
  if (session.status !== "active") {
    return session;
  }

  switch (action.type) {
    case "choose-item": {
      const item = scenario.items.find((entry) => entry.id === action.id);
      if (!item || owns(session.placements, action.id)) {
        return say(session, "请选择还在备货台上的商品。");
      }
      return {
        ...session,
        selected: item.id,
        target: null,
        view: "choose-shelf",
        message: `已选择${item.name}。看一看包装名称，再选择货架。`,
      };
    }
    case "choose-shelf": {
      const item = scenario.items.find((entry) => entry.id === session.selected);
      const shelf = scenario.shelves.find((entry) => entry.id === action.id);
      if (session.view !== "choose-shelf" || !item || !shelf) {
        return say(session, "请先选择一件商品。");
      }
      if (item.target !== shelf.id) {
        return say(session, "这个位置和商品名称对不上。再看看商品名称和货架标签，也可以查看提示。");
      }
      const used = Object.values(session.placements).filter((id) => id === shelf.id).length;
      if (used >= shelf.capacity) {
        return say(session, "这里没有空位。可以查看工作单或请求帮助。");
      }
      return {
        ...session,
        target: shelf.id,
        view: "confirm-placement",
        message: `已选中 ${shelf.id} 货架。确认后会把商品放到这里。`,
      };
    }
    case "place": {
      const item = scenario.items.find((entry) => entry.id === session.selected);
      const shelf = scenario.shelves.find((entry) => entry.id === session.target);
      if (
        session.view !== "confirm-placement" ||
        !item ||
        !shelf ||
        item.target !== shelf.id ||
        owns(session.placements, item.id)
      ) {
        return say(session, "请先确认商品和位置。");
      }
      const used = Object.values(session.placements).filter((id) => id === shelf.id).length;
      if (used >= shelf.capacity) {
        return say(session, "这里没有空位。可以请求帮助。");
      }
      const placements = { ...session.placements, [item.id]: shelf.id };
      const allPlaced = scenario.items.every((entry) => owns(placements, entry.id));
      return {
        ...session,
        placements,
        history: [...session.history, item.id],
        selected: null,
        target: null,
        view: allPlaced ? "review" : "choose-item",
        message: allPlaced
          ? `${item.name}已放到 ${shelf.id}。两件商品都放好了，可以检查位置，再决定是否完成。`
          : `${item.name}已放到 ${shelf.id}。还有商品在备货台上。`,
      };
    }
    case "undo": {
      const lastId = session.history[session.history.length - 1];
      if (!lastId) {
        return say(session, "现在还没有可以撤销的放置。");
      }
      const placements = { ...session.placements };
      delete placements[lastId];
      return {
        ...session,
        placements,
        history: session.history.slice(0, -1),
        selected: lastId,
        target: null,
        view: "choose-shelf",
        message: "已撤销最近一次放置，可以重新选择位置。",
      };
    }
    case "back": {
      if (session.view === "confirm-placement") {
        return { ...session, target: null, view: "choose-shelf", message: "可以重新选择货架。" };
      }
      return {
        ...session,
        selected: null,
        target: null,
        view: "choose-item",
        message: "回到备货台。已经放好的商品仍然保留。",
      };
    }
    case "review": {
      return { ...session, selected: null, target: null, view: "review", message: "可以检查当前结果，也可以暂时结束。" };
    }
    case "hint": {
      const hints = session.hints.includes(action.hint)
        ? session.hints
        : [...session.hints, action.hint];
      return { ...session, hints, message: hintMessage(action.hint, session, scenario) };
    }
    case "pause": {
      return { ...session, status: "paused", message: "练习已暂停。进度保存在这台设备上，可以稍后继续。" };
    }
    case "exit": {
      return { ...session, status: "exited", message: "已退出练习。进度保存在这台设备上。" };
    }
    case "end": {
      return {
        ...session,
        status: "ended",
        outcome: action.outcome,
        message: "已记录你的选择。没有成绩，也不需要完成全部步骤。",
      };
    }
    default:
      return session;
  }
}

function hintMessage(hint: Hint, session: Session, scenario: Scenario): string {
  if (hint === "work-order") {
    return "工作单：看商品名称，找到相同名称的货架标签，把商品放到空位，再核对一遍。";
  }
  if (hint === "photo") {
    return "图片提示：对比包装上的名称和货架标签的文字。这里只展示已确认的演示照片。";
  }
  const item = scenario.items.find((entry) => entry.id === session.selected);
  const shelf = item ? scenario.shelves.find((entry) => entry.id === item.target) : undefined;
  if (!item || !shelf) {
    return "示范：先选一件商品，再看货架标签上的名称。";
  }
  return `示范：${item.name}对应的货架是 ${shelf.id}（${shelf.name}）。可以照着做一次，不会扣分。`;
}

/** Describes actual placements only; never a score or an ability inference. */
export function placedItems(session: Session, scenario: Scenario) {
  return scenario.items.map((item) => ({
    id: item.id,
    name: item.name,
    location: session.placements[item.id] ?? null,
  }));
}

export function hintSummary(session: Session): string[] {
  return session.hints.map((hint) =>
    hint === "work-order" ? "查看工作单" : hint === "photo" ? "查看图片提示" : "查看示范",
  );
}

export function outcomeLabel(outcome: Outcome | null): string {
  switch (outcome) {
    case "confirmed":
      return "我完成了";
    case "needs-help":
      return "我还需要帮助";
    case "unsure":
      return "我不确定";
    case "stopped":
      return "暂时停止";
    default:
      return "还没有选择";
  }
}
