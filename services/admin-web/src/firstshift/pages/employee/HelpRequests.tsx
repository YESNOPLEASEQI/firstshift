import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import type { RequestStatus } from "../../types";
import { REQUEST_STATUS_LABELS } from "../../types";
import { demoContacts } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";

const STATUS_BADGE: Record<RequestStatus, string> = {
  submitted: "fs-badge",
  confirmed: "fs-badge fs-badge--primary",
  prepared: "fs-badge fs-badge--warn",
  done: "fs-badge fs-badge--success",
  adjust: "fs-badge fs-badge--danger",
  withdrawn: "fs-badge",
};

export default function HelpRequests() {
  useDocumentTitle("我的请求");
  const [params] = useSearchParams();
  const requests = useDemoStore((state) => state.requests);
  const setRequestStatus = useDemoStore((state) => state.setRequestStatus);
  const created = params.get("created") === "1";

  return (
    <div className="fs-stack">
      <PageHeader
        backTo="/firstshift/work"
        backLabel="返回我的工作"
        title="我的请求"
        aside={
          <Link className="fs-btn fs-btn--secondary" to="/firstshift/help/request">
            <Icon name="plus" size={20} />
            再提一个请求
          </Link>
        }
        titleId="fs-requests-title"
      />

      {created && (
        <p className="fs-success" role="status">
          请求已保存在这台浏览器（演示数据）。它没有被真实发送，也不会自动显示为“已确认”或“已解决”。
        </p>
      )}

      <div className="fs-work-grid">
        <div className="fs-stack">
          {requests.map((request) => {
            const canReview = request.status === "prepared";
            const canWithdraw = request.status === "submitted" || request.status === "adjust";
            return (
              <section className="fs-request" key={request.id} aria-labelledby={`req-${request.id}`}>
                <div className="fs-spread">
                  <div>
                    <h2 className="fs-h3" id={`req-${request.id}`}>
                      {request.barrierLabel}
                    </h2>
                    <p className="fs-caption">提出于 {request.createdAt}</p>
                  </div>
                  <span className={STATUS_BADGE[request.status]}>{REQUEST_STATUS_LABELS[request.status]}</span>
                </div>

                {request.wishes.length > 0 && (
                  <div>
                    <h3 className="fs-help">希望得到的帮助</h3>
                    <ul className="fs-list">
                      {request.wishes.map((wish) => (
                        <li key={wish}>{wish}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {request.note && <p className="fs-body">{request.note}</p>}

                <div>
                  <h3 className="fs-help" id={`tl-${request.id}`}>
                    经过
                  </h3>
                  <ul className="fs-timeline" aria-labelledby={`tl-${request.id}`} style={{ marginTop: 8 }}>
                    {request.timeline.map((event, index) => (
                      <li key={`${event.at}-${index}`}>
                        <time>{event.at}</time>
                        <strong>{event.label}</strong>
                        {event.note && <p>{event.note}</p>}
                      </li>
                    ))}
                  </ul>
                </div>

                {canReview && (
                  <div className="fs-actions">
                    <button
                      type="button"
                      className="fs-btn fs-btn--primary"
                      onClick={() => setRequestStatus(request.id, "done", "本人确认这次支持有帮助。")}
                    >
                      <Icon name="check" size={20} />
                      有帮助，确认完成
                    </button>
                    <button
                      type="button"
                      className="fs-btn fs-btn--secondary"
                      onClick={() =>
                        setRequestStatus(request.id, "adjust", "本人认为还需要调整，等待责任方回应。")
                      }
                    >
                      还需要调整
                    </button>
                  </div>
                )}

                {canWithdraw && (
                  <div className="fs-actions">
                    <button
                      type="button"
                      className="fs-btn fs-btn--ghost"
                      onClick={() => setRequestStatus(request.id, "withdrawn", "本人主动撤回请求。")}
                    >
                      撤回这个请求
                    </button>
                  </div>
                )}

                {request.status === "adjust" && (
                  <p className="fs-help">已记录你的意见。责任方回应之前，这里不会自动改变状态。</p>
                )}
                {request.status === "done" && (
                  <p className="fs-help">这是你自己确认的结果，不代表对你能力的评价。</p>
                )}
                {request.status === "withdrawn" && (
                  <p className="fs-help">请求已撤回。你仍然可以随时重新提出。</p>
                )}
                {request.status === "submitted" && (
                  <p className="fs-help">等待责任方回应。</p>
                )}
              </section>
            );
          })}
          {requests.length === 0 && (
            <p className="fs-note">还没有请求。可以在需要时再提出。</p>
          )}
        </div>

        <aside className="fs-stack">
          <section className="fs-card fs-card--soft" aria-labelledby="fs-requests-scope">
            <h2 className="fs-h3" id="fs-requests-scope">
              数据保存
            </h2>
            <p className="fs-body" style={{ marginTop: 8 }}>
              请求的创建、确认和撤回都是演示操作，只写入这台浏览器的本地存储，不会真正通知任何人。清除演示数据后，这些记录会一起消失。
            </p>
            <Link className="fs-btn fs-btn--ghost" to="/firstshift/settings#data" style={{ marginTop: 12 }}>
              <Icon name="settings" size={20} />
              管理演示数据
            </Link>
          </section>

          <section className="fs-card" aria-labelledby="fs-requests-contacts">
            <h2 className="fs-h3" id="fs-requests-contacts">
              协作对象
            </h2>
            <ul className="fs-list" style={{ marginTop: 10 }}>
              {demoContacts.map((contact) => (
                <li key={contact.role}>
                  <strong>{contact.role}</strong>：{contact.name}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
