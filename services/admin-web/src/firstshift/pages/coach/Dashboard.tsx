import { Link } from "react-router-dom";
import { Icon } from "../../components/ui";
import { useDemoStore } from "../../store/demoStore";
import {
  activeVersion,
  pickTask,
  publishedVersion,
  useCoachStore,
} from "../../coach/store";
import { CoachHeading, stateLabel, useDocumentTitle } from "../../coach/ui";
import { Count } from "../../coach/motion";

export default function Dashboard() {
  useDocumentTitle("工作台 · 辅导员端");
  const requests = useDemoStore((state) => state.requests);
  const tasks = useCoachStore((state) => state.tasks);
  const events = useCoachStore((state) => state.events);
  const access = useCoachStore((state) => state.access);
  const board = useCoachStore(pickTask);

  const pending = requests.filter(
    (request) => request.status === "submitted" || request.status === "confirmed",
  );
  const prepared = requests.filter((request) => request.status === "prepared");
  const reviewTasks = tasks.filter((task) => activeVersion(task)?.status === "review");
  const published = publishedVersion(board);
  const granted = access.find((record) => record.status === "active");

  return (
    <div className="fsc-page">
      <CoachHeading title="工作台" titleId="fsc-dashboard-title" />

      <div className="fsc-metricline">
        <Link className="fsc-metric" to="/firstshift/coach/requests?tab=pending">
          <span>
            <Icon name="inbox" size={17} />
            待处理支持请求
          </span>
          <Count value={pending.length} />
        </Link>
        <Link className="fsc-metric" to="/firstshift/coach/reviews">
          <span>
            <Icon name="branch" size={17} />
            待审核指导
          </span>
          <Count value={reviewTasks.length} />
        </Link>
        <Link className="fsc-metric" to="/firstshift/coach/requests?tab=prepared">
          <span>
            <Icon name="clock" size={17} />
            待本人复核
          </span>
          <Count value={prepared.length} />
        </Link>
      </div>

      <div className="fsc-two">
        <div className="fsc-stack">
          <section className="fsc-panel" aria-labelledby="fsc-todo">
            <div className="fsc-panelhead">
              <h2 id="fsc-todo">待处理事项</h2>
            </div>
            {pending.length === 0 && reviewTasks.length === 0 ? (
              <div className="fsc-panelbody fsc-quiet">当前没有待处理的事项。</div>
            ) : (
              <div>
                {pending.map((request) => {
                  const state = stateLabel(request.status);
                  return (
                    <Link
                      key={request.id}
                      className="fsc-row fsc-rowlink"
                      to={`/firstshift/coach/requests?id=${request.id}`}
                    >
                      <span className="fsc-square">
                        <Icon name="inbox" size={18} />
                      </span>
                      <span className="grow">
                        <b>{request.title ?? request.barrierLabel}</b>
                        <span className="meta">
                          小林 · {request.reference ?? request.id}
                        </span>
                      </span>
                      <span className={`fsc-pill ${state.tone}`}>{state.label}</span>
                      <Icon name="chevronRight" size={16} />
                    </Link>
                  );
                })}
                {reviewTasks.map((task) => {
                  const version = activeVersion(task);
                  return (
                    <Link
                      key={task.id}
                      className="fsc-row fsc-rowlink"
                      to={`/firstshift/coach/reviews/${task.id}`}
                    >
                      <span className="fsc-square">
                        <Icon name="branch" size={18} />
                      </span>
                      <span className="grow">
                        <b>
                          {task.title} · {version?.versionId}
                        </b>
                        <span className="meta">提交于 {version?.submittedAt}</span>
                      </span>
                      <span className="fsc-pill amber">待审核</span>
                      <Icon name="chevronRight" size={16} />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <section className="fsc-panel" aria-labelledby="fsc-workguide">
            <div className="fsc-panelhead">
              <h2 id="fsc-workguide">工作指导</h2>
              <Link className="fsc-link" to="/firstshift/coach/tasks">
                岗位与任务
              </Link>
            </div>
            <div className="fsc-row">
              <span className="fsc-square">
                <Icon name="book" size={18} />
              </span>
              <span className="grow">
                <b>{board.title}</b>
                <span className="meta">
                  {(activeVersion(board) ?? published)?.steps.length ?? 0} 个步骤
                  {published ? ` · ${published.versionId} 已发布` : " · 尚未发布"}
                </span>
              </span>
              <Link className="fsc-btn" to={`/firstshift/coach/editor/${board.id}`}>
                编辑
              </Link>
            </div>
          </section>
        </div>

        <aside className="fsc-stack">
          <section className="fsc-panel" aria-labelledby="fsc-activity">
            <div className="fsc-panelhead">
              <h2 id="fsc-activity">最近动态</h2>
            </div>
            <div className="fsc-panelbody">
              <div className="fsc-timeline">
                {events.slice(0, 4).map((event) => (
                  <div key={event.id} className="fsc-event">
                    <b>{event.label}</b>
                    <time>{event.at}</time>
                    {event.note && <p>{event.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="fsc-panel" aria-labelledby="fsc-access">
            <div className="fsc-panelhead">
              <h2 id="fsc-access">已授权支持</h2>
              <Link className="fsc-link" to="/firstshift/coach/access">
                授权信息
              </Link>
            </div>
            {granted ? (
              <Link className="fsc-row fsc-rowlink" to={`/firstshift/coach/access?id=${granted.id}`}>
                <span className="fsc-square">
                  <Icon name="idcard" size={18} />
                </span>
                <span className="grow">
                  <b>{granted.name}</b>
                  <span className="meta">{granted.purpose}</span>
                </span>
                <span className="fsc-pill green">有效</span>
                <Icon name="chevronRight" size={16} />
              </Link>
            ) : (
              <div className="fsc-panelbody fsc-quiet">还没有有效的授权。</div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
