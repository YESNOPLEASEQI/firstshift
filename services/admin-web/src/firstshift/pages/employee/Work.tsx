import { Link } from "react-router-dom";
import { Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import {
  demoChange,
  demoContacts,
  demoWorkSteps,
} from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";
import { REQUEST_STATUS_LABELS } from "../../types";

export default function Work() {
  useDocumentTitle("我的工作");
  const changeDecision = useDemoStore((state) => state.changeDecision);
  const requests = useDemoStore((state) => state.requests);
  const latestRequest = requests[0];
  const pendingSteps = demoWorkSteps.filter((step) => step.status === "review");

  return (
    <div className="fs-stack">
      <PageHeader
        title="我的工作"
        backTo="/firstshift"
        backLabel="回到首页"
        aside={<span className="fs-badge fs-badge--demo">演示数据 · 未关联真实岗位</span>}
        titleId="fs-work-title"
      />

      <div className="fs-work-grid">
        <div className="fs-stack">
          <section className="fs-card fs-card--signal" aria-labelledby="fs-work-change">
            <div className="fs-spread">
              <h2 className="fs-h3" id="fs-work-change">
                {demoChange.title}
              </h2>
              <span className="fs-badge fs-badge--warn">
                {changeDecision === "understood"
                  ? "已确认"
                  : changeDecision === "not-applicable"
                    ? "已标记为不适用"
                    : "待确认"}
              </span>
            </div>
            {changeDecision === null && (
              <p className="fs-help" style={{ marginTop: 8 }}>
                在确认之前，「寻找货架」这一步显示等待确认，不把旧 A2 指令当作当前操作。
              </p>
            )}
            {changeDecision === "not-applicable" && (
              <p className="fs-help" style={{ marginTop: 8 }}>
                你已经标记这项变化不适用。旧 A2 指令仍然暂停，等待辅导员进一步确认。
              </p>
            )}
            <div className="fs-actions" style={{ marginTop: 14 }}>
              <Link className="fs-btn fs-btn--primary" to={`/firstshift/work/changes/${demoChange.id}`}>
                查看哪里变了
              </Link>
              <Link className="fs-btn fs-btn--secondary" to="/firstshift/work/demo-stock">
                打开步骤指导
              </Link>
            </div>
          </section>

          <section className="fs-card" aria-labelledby="fs-work-task">
            <div className="fs-spread">
              <h2 className="fs-h3" id="fs-work-task">
                整理货架
              </h2>
              <div className="fs-row">
                <span className="fs-badge fs-badge--success">已审核发布</span>
              </div>
            </div>
            <ol className="fs-steps" style={{ marginTop: 16 }}>
              {demoWorkSteps.map((step, index) => (
                <li key={step.stepId} className="fs-stepcard">
                  <span className="fs-stepcard__no" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>
                    <strong>{step.title}</strong>
                    <p>{step.instruction}</p>
                  </span>
                  <span
                    className={`fs-badge ${
                      step.status === "review" ? "fs-badge--warn" : "fs-badge--primary"
                    }`}
                  >
                    {step.status === "review" ? "待复核" : "已发布"}
                  </span>
                </li>
              ))}
            </ol>
            {pendingSteps.length > 0 && (
              <p className="fs-warn" style={{ marginTop: 12 }}>
                有 {pendingSteps.length} 个步骤正在按今天的变化复核。未确认前，请先查看变化说明，不要按旧照片或旧位置操作。
              </p>
            )}
            <div className="fs-actions" style={{ marginTop: 14 }}>
              <Link className="fs-btn fs-btn--secondary" to="/firstshift/work/demo-stock">
                逐步查看指导
              </Link>
            </div>
          </section>

          <section className="fs-card" aria-labelledby="fs-work-requests">
            <div className="fs-spread">
              <h2 className="fs-h3" id="fs-work-requests">
                我的支持请求
              </h2>
              <Link className="fs-btn fs-btn--ghost" to="/firstshift/help/requests">
                全部请求
              </Link>
            </div>
            {latestRequest ? (
              <div className="fs-stack fs-stack--tight" style={{ marginTop: 10 }}>
                <div className="fs-row">
                  <span className="fs-badge fs-badge--primary">
                    {REQUEST_STATUS_LABELS[latestRequest.status]}
                  </span>
                  <span className="fs-caption">{latestRequest.createdAt}</span>
                </div>
                <p className="fs-body" style={{ fontSize: "1.0625rem" }}>
                  {latestRequest.barrierLabel}
                </p>
                {latestRequest.status === "prepared" && (
                  <p className="fs-note">支持已准备，等待你确认。</p>
                )}
              </div>
            ) : (
              <p className="fs-caption" style={{ marginTop: 8 }}>
                还没有提出过请求。遇到困难时可以随时提出。
              </p>
            )}
            <div className="fs-actions" style={{ marginTop: 14 }}>
              <Link className="fs-btn fs-btn--secondary" to="/firstshift/help/request">
                <Icon name="help" size={20} />
                请求帮助
              </Link>
            </div>
          </section>
        </div>

        <aside className="fs-stack">
          <section className="fs-card" aria-labelledby="fs-work-contacts">
            <h2 className="fs-h3" id="fs-work-contacts">
              联系人
            </h2>
            <ul className="fs-list" style={{ marginTop: 10 }}>
              {demoContacts.map((contact) => (
                <li key={contact.role}>
                  <strong>{contact.role}：</strong>
                  {contact.name}
                  <span className="fs-help" style={{ display: "block" }}>
                    {contact.note}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="fs-note">
            这些内容都是合成演示数据，不会发送给任何真实联系人。
          </p>
        </aside>
      </div>
    </div>
  );
}
