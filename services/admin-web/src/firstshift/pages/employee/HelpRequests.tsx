import { Link } from "react-router-dom";
import { Icon, useDocumentTitle } from "../../components/ui";
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

function shortDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${Number(match[2])}月${Number(match[3])}日`;
}

export default function HelpRequests() {
  useDocumentTitle("我的求助");
  const requests = useDemoStore((state) => state.requests);

  return (
    <div className="v3-stack">
      <Link className="fs-btn fs-btn--primary fs-btn--block" to="/firstshift/help/request">
        <Icon name="plus" size={20} />
        提出新的求助
      </Link>

      {requests.length === 0 ? (
        <p className="v3-demo-note">还没有提出过求助。</p>
      ) : (
        requests.map((request) => {
          const status = STATUS_TEXT[request.status];
          return (
            <Link
              key={request.id}
              to={`/firstshift/help/requests/${request.id}`}
              className="v3-card v3-request-item"
            >
              <div className="v3-request-item__text">
                <h2>{request.title ?? request.barrierLabel}</h2>
                <p>
                  整理货架 · {shortDate(request.createdAt)}
                </p>
              </div>
              <span className={`v3-status v3-status--${status.tone}`}>{status.label}</span>
              <Icon name="chevronRight" size={20} className="v3-row__chev" />
            </Link>
          );
        })
      )}

      <p className="v3-demo-note">演示数据。新建的求助只保存在这台浏览器里。</p>
    </div>
  );
}
