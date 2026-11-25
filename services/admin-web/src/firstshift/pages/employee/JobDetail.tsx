import { Link, useParams } from "react-router-dom";
import { EmptyState, PageHeader, useDocumentTitle } from "../../components/ui";
import { demoJob } from "../../fixtures/demo";

export default function JobDetail() {
  const { jobId } = useParams();
  useDocumentTitle("岗位详情");

  if (jobId !== demoJob.id) {
    return (
      <div className="fs-stack">
        <PageHeader backTo="/firstshift/jobs" backLabel="返回岗位列表" title="没有找到这个岗位" />
        <EmptyState
          title="这个岗位样本不存在"
          action={
            <Link className="fs-btn fs-btn--primary" to="/firstshift/jobs">
              回到岗位列表
            </Link>
          }
        >
          演示版只有一个岗位样本。可以回到列表重新选择。
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="fs-stack">
      <PageHeader
        backTo="/firstshift/jobs"
        backLabel="返回岗位列表"
        title={demoJob.title}
        aside={<span className="fs-badge fs-badge--demo">不对应真实门店</span>}
        titleId="fs-jobdetail-title"
      />

      <div className="fs-work-grid">
        <div className="fs-stack">
          <section className="fs-card" aria-labelledby="fs-job-content">
            <h2 className="fs-h3" id="fs-job-content">
              工作内容
            </h2>
            <ul className="fs-list" style={{ marginTop: 12 }}>
              {demoJob.workContent.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="fs-card" aria-labelledby="fs-job-tasks">
            <h2 className="fs-h3" id="fs-job-tasks">
              常见任务
            </h2>
            <div className="fs-pillgrid" style={{ marginTop: 12 }}>
              {demoJob.typicalTasks.map((task) => (
                <span key={task} className="fs-pill">
                  {task}
                </span>
              ))}
            </div>
          </section>

          <section className="fs-card" aria-labelledby="fs-job-env">
            <h2 className="fs-h3" id="fs-job-env">
              工作环境
            </h2>
            <div className="fs-stack fs-stack--tight" style={{ marginTop: 12 }}>
              <h3 className="fs-h3" style={{ fontSize: "1rem" }}>
                已经知道
              </h3>
              <ul className="fs-list">
                {demoJob.environmentKnown.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <h3 className="fs-h3" style={{ fontSize: "1rem", marginTop: 10 }}>
                还需要现场了解
              </h3>
              <ul className="fs-list">
                {demoJob.environmentUnknown.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="fs-card" aria-labelledby="fs-job-support">
            <h2 className="fs-h3" id="fs-job-support">
              可以获得的帮助
            </h2>
            <ul className="fs-list" style={{ marginTop: 12 }}>
              {demoJob.supports.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="fs-stack">
          <section className="fs-card fs-card--soft" aria-labelledby="fs-job-next">
            <h2 className="fs-h3" id="fs-job-next">
              想试试看？
            </h2>
            <div className="fs-stack fs-stack--tight" style={{ marginTop: 16 }}>
              <Link className="fs-btn fs-btn--primary fs-btn--block" to="/firstshift/practice">
                开始练习
              </Link>
              <Link className="fs-btn fs-btn--secondary fs-btn--block" to="/firstshift">
                暂时不考虑
              </Link>
            </div>
          </section>

          <p className="fs-note">
            {demoJob.source}。工作时间、薪酬与录用条件必须由真实雇主确认，演示版不作承诺。
          </p>
        </aside>
      </div>
    </div>
  );
}
