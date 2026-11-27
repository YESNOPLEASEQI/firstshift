import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Dialog, Icon, useDocumentTitle } from "../../components/ui";
import { EmptyCard } from "../../components/v3";
import shelfA2 from "../../assets/v3/shelf-a2-closeup.jpg";
import type { RequestStatus } from "../../types";
import { useDemoStore } from "../../store/demoStore";

const STATUS_TEXT: Record<RequestStatus, { label: string; tone: "wait" | "ok" | "muted" }> = {
  submitted: { label: "处理中", tone: "wait" },
  confirmed: { label: "处理中", tone: "wait" },
  prepared: { label: "等待我确认", tone: "ok" },
  done: { label: "已完成", tone: "ok" },
  adjust: { label: "处理中", tone: "wait" },
  withdrawn: { label: "已撤回", tone: "muted" },
};

const STAGES = ["已提出求助", "辅导员正在处理", "帮助已经准备好", "本人确认"];

function stageIndex(status: RequestStatus): number {
  if (status === "prepared") return 2;
  if (status === "done") return 4;
  if (status === "withdrawn") return 2;
  return 1;
}

function statusText(request: { status: RequestStatus; barrierLabel: string }): string {
  switch (request.status) {
    case "submitted":
      return "请求已保存，等待辅导员处理。";
    case "confirmed":
      return "辅导员正在确认新的货架位置。";
    case "prepared":
      return "辅导员提供了支持，等待你确认。";
    case "done":
      return "你已确认这次帮助有帮助。";
    case "adjust":
      return "你提出还需要调整，等待辅导员回应。";
    case "withdrawn":
      return "这条求助已撤回。";
  }
}

function shortDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${Number(match[2])}月${Number(match[3])}日`;
}

export default function HelpRequestDetail() {
  useDocumentTitle("求助详情");
  const { requestId } = useParams();
  const request = useDemoStore((state) => state.requests.find((entry) => entry.id === requestId));
  const setRequestStatus = useDemoStore((state) => state.setRequestStatus);
  const addRequestNote = useDemoStore((state) => state.addRequestNote);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  if (!request) {
    return (
      <EmptyCard
        action={
          <Link className="fs-btn fs-btn--primary" to="/firstshift/help/requests">
            回到我的求助
          </Link>
        }
      >
        没有找到这条求助。
      </EmptyCard>
    );
  }

  const status = STATUS_TEXT[request.status];
  const current = stageIndex(request.status);
  const stages =
    request.status === "submitted"
      ? ["已提出求助", "等待辅导员处理", "帮助已经准备好", "本人确认"]
      : request.status === "adjust"
        ? ["已提出求助", "等待辅导员回应", "帮助已经准备好", "本人确认"]
        : request.status === "withdrawn"
          ? ["已提出求助", "已撤回"]
          : STAGES;
  const canWithdraw =
    request.status === "submitted" || request.status === "confirmed" || request.status === "adjust";

  function act(next: RequestStatus, message: string) {
    setRequestStatus(request!.id, next, message);
    setSaved("状态已更新。");
  }

  return (
    <div className="v3-stack">
      <section className="v3-card v3-request-detail">
        <div className="v3-request-detail__head">
          <h2>{request.title ?? request.barrierLabel}</h2>
          {request.status !== "prepared" && (
            <span className={`v3-status v3-status--${status.tone}`}>{status.label}</span>
          )}
        </div>

        {request.status === "prepared" ? (
          <>
            <p className="v3-caption">等待我确认</p>
            <hr className="v3-rule" />
            <p className="v3-request-detail__lead">辅导员提供了新的货架图片。</p>
            <img className="v3-cover--wide" src={shelfA2} alt="A2 货架近景，标签为 A2" />
            <p>这个办法对你有帮助吗？</p>
            <div className="v3-actions-stack">
              <button
                type="button"
                className="fs-btn fs-btn--primary fs-btn--block"
                onClick={() => act("done", "本人确认有帮助。")}
              >
                有帮助
              </button>
              <button
                type="button"
                className="fs-btn fs-btn--secondary fs-btn--block"
                onClick={() => act("adjust", "本人认为还需要调整。")}
              >
                还需要调整
              </button>
              <button
                type="button"
                className="fs-btn fs-btn--secondary fs-btn--block"
                onClick={() => setWithdrawOpen(true)}
              >
                我不想继续
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="v3-caption">
              整理货架 · {shortDate(request.createdAt)}
            </p>
            <hr className="v3-rule" />
            <p className="v3-request-detail__lead">{statusText(request)}</p>

            <ol className={`v3-stages${request.status === "withdrawn" ? " v3-stages--muted" : ""}`}>
              {stages.map((stage, index) => {
                const done = index < current;
                const active = index === current && current < stages.length;
                return (
                  <li
                    key={stage}
                    className={done ? "is-done" : active ? "is-active" : undefined}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="v3-stages__dot" aria-hidden="true" />
                    <span>{stage}</span>
                  </li>
                );
              })}
            </ol>

            {request.status !== "done" && request.status !== "withdrawn" && (
              <div className="v3-actions-stack">
                <button
                  type="button"
                  className="fs-btn fs-btn--secondary fs-btn--block"
                  onClick={() => setNoteOpen(true)}
                >
                  补充说明
                </button>
                {canWithdraw && (
                  <button
                    type="button"
                    className="fs-btn fs-btn--secondary fs-btn--block"
                    onClick={() => setWithdrawOpen(true)}
                  >
                    取消求助
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {saved && (
          <p className="fs-success" role="status">
            {saved}
          </p>
        )}
      </section>

      <p className="v3-demo-note">演示数据：状态只保存在这台浏览器里，不会通知真实联系人。</p>

      <Dialog open={noteOpen} title="补充说明" onClose={() => setNoteOpen(false)}>
        <div className="v3-field">
          <label htmlFor="request-note">你想补充什么？</label>
          <textarea
            id="request-note"
            className="fs-textarea"
            value={note}
            maxLength={300}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setNoteOpen(false)}>
            取消
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--primary"
            disabled={!note.trim()}
            onClick={() => {
              addRequestNote(request.id, note);
              setNote("");
              setNoteOpen(false);
              setSaved("已补充说明。");
            }}
          >
            <Icon name="check" size={20} />
            保存
          </button>
        </div>
      </Dialog>

      <Dialog open={withdrawOpen} title="撤回这次求助？" onClose={() => setWithdrawOpen(false)}>
        <p className="fs-body">
          {request.status === "prepared"
            ? "撤回后，已经准备好的帮助不会再出现在这里，也不能恢复。"
            : "撤回后，辅导员将不再处理这条求助，也不能恢复。"}
        </p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setWithdrawOpen(false)}>
            继续等待
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--danger"
            onClick={() => {
              act(
                "withdrawn",
                request.status === "prepared" ? "本人不想继续这次求助。" : "本人撤回求助。",
              );
              setWithdrawOpen(false);
            }}
          >
            确认撤回
          </button>
        </div>
      </Dialog>
    </div>
  );
}
