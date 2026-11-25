import { Link } from "react-router-dom";
import { JobScene } from "../../components/art";
import { PageHeader, useDocumentTitle } from "../../components/ui";
import { demoJob } from "../../fixtures/demo";

export default function Jobs() {
  useDocumentTitle("岗位信息");

  return (
    <div className="fs-stack">
      <PageHeader
        title="岗位信息"
      />

      <article className="fs-jobcard" aria-labelledby="fs-job-title">
        <div className="fs-jobcard__art">
          <JobScene />
        </div>
        <div className="fs-jobcard__body">
          <div className="fs-row">
            <span className="fs-badge fs-badge--demo">演示岗位</span>
            <span className="fs-badge">零售 · 理货</span>
          </div>
          <h2 className="fs-h2" id="fs-job-title">
            {demoJob.title}
          </h2>
          <p className="fs-body">{demoJob.summary}</p>
          <dl className="fs-meta">
            <div>
              <dt>典型任务</dt>
              <dd>{demoJob.typicalTasks.slice(0, 2).join("、")}</dd>
            </div>
            <div>
              <dt>可能获得的帮助</dt>
              <dd>图文步骤、货架示意图、现场示范</dd>
            </div>
            <div>
              <dt>来源</dt>
              <dd>合成演示数据</dd>
            </div>
          </dl>
          <div className="fs-actions" style={{ marginTop: 8 }}>
            <Link className="fs-btn fs-btn--primary" to={`/firstshift/jobs/${demoJob.id}`}>
              查看详情
            </Link>
            <Link className="fs-btn fs-btn--ghost" to="/firstshift">
              先回首页
            </Link>
          </div>
        </div>
      </article>

      <p className="fs-note">
        这里只有一个岗位样本。你随时可以从首页进入练习，或查看自己的支持说明。
      </p>
    </div>
  );
}
