import { Link, useParams } from "react-router-dom";
import shelfOverview from "../../assets/v3/shelf-overview.jpg";
import { useDocumentTitle } from "../../components/ui";
import { EmptyCard } from "../../components/v3";
import { demoJob } from "../../fixtures/demo";

export default function JobDetail() {
  const { jobId } = useParams();
  useDocumentTitle("超市理货员");

  if (jobId !== demoJob.id) {
    return (
      <EmptyCard
        action={
          <Link className="fs-btn fs-btn--primary" to="/firstshift/jobs">
            回到岗位列表
          </Link>
        }
      >
        这个岗位样本不存在。
      </EmptyCard>
    );
  }

  return (
    <div className="v3-stack">
      <section className="v3-card v3-jobdetail">
        <img
          className="v3-cover--wide"
          src={shelfOverview}
          alt="货架示意，标签为 A1、A2、B1、B2"
        />
        <div className="v3-jobdetail__body">
          <p className="v3-demo-note" style={{ margin: 0 }}>
            职业体验资料，非招聘信息。
          </p>

          <section>
            <h2 className="v3-section-title">主要做什么</h2>
            <p>{demoJob.summary}</p>
          </section>

          <section>
            <h2 className="v3-section-title">工作环境</h2>
            <p>{demoJob.environmentKnown.join(" ")}</p>
          </section>

          <section>
            <h2 className="v3-section-title">可以获得的帮助</h2>
            <p>{demoJob.supports[0]}</p>
          </section>

          <p className="v3-demo-note" style={{ margin: 0 }}>
            工作时间和报酬尚未确认。
          </p>

          <div className="v3-actions-stack">
            <Link className="fs-btn fs-btn--primary fs-btn--block" to="/firstshift/practice/new">
              尝试这份工作
            </Link>
            <Link className="fs-btn fs-btn--secondary fs-btn--block" to="/firstshift">
              暂时不考虑
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
