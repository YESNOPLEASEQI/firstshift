import { Link } from "react-router-dom";
import { HeroScene } from "../../components/art";
import { Icon, useDocumentTitle } from "../../components/ui";
import { isResumable, useDemoStore } from "../../store/demoStore";

const ENTRIES = [
  {
    to: "/firstshift/jobs",
    icon: "look" as const,
    title: "岗位",
  },
  {
    to: "/firstshift/practice",
    icon: "try" as const,
    title: "练习",
  },
  {
    to: "/firstshift/passport",
    icon: "support" as const,
    title: "支持说明",
  },
  {
    to: "/firstshift/help/request",
    icon: "help" as const,
    title: "请求帮助",
  },
];

export default function Home() {
  useDocumentTitle("工作台");
  const practice = useDemoStore((state) => state.practice);
  const changeDecision = useDemoStore((state) => state.changeDecision);
  const requests = useDemoStore((state) => state.requests);

  const resumable = isResumable(practice);
  const reviewRequest = requests.find((request) => request.status === "prepared");

  return (
    <div className="fs-stack">
      <section className="fs-hero" aria-labelledby="fs-home-title">
        <div className="fs-hero__copy">
          <h1 className="fs-h1 fs-hero__title" id="fs-home-title" tabIndex={-1}>
            工作台
          </h1>
        </div>
        <figure className="fs-hero__art">
          <div className="fs-hero__frame">
            <HeroScene />
            <span className="fs-stamp" aria-hidden="true">
              合成演示
            </span>
          </div>
          <figcaption className="fs-hero__caption">
            原创场景插画 · 人物与门店均为虚构示意，不是真实照片
          </figcaption>
        </figure>
      </section>

      <nav className="fs-entries" aria-label="四个主要入口">
        {ENTRIES.map((entry) => (
          <Link key={entry.to} to={entry.to} className="fs-entry">
            <span className="fs-entry__icon">
              <Icon name={entry.icon} size={32} />
            </span>
            <span className="fs-entry__text">
              <span className="fs-entry__title">{entry.title}</span>
            </span>
            <Icon name="arrow" className="fs-icon fs-entry__arrow" />
          </Link>
        ))}
      </nav>

      {(resumable || changeDecision === null || reviewRequest) && (
        <div className="fs-home-grid">
          {resumable && practice && (
            <section className="fs-card" aria-labelledby="fs-continue-title">
              <div className="fs-spread" style={{ marginBottom: 8 }}>
                <h2 className="fs-h3" id="fs-continue-title">
                  整理货架
                </h2>
                <span className="fs-badge fs-badge--primary">
                  {practice.session.status === "paused" ? "已暂停" : "进行中"}
                </span>
              </div>
              <div className="fs-actions" style={{ marginTop: 14 }}>
                <Link className="fs-btn fs-btn--primary" to="/firstshift/practice/demo-stock">
                  继续练习
                </Link>
              </div>
            </section>
          )}

          {changeDecision === null && (
            <section className="fs-card fs-card--signal" aria-labelledby="fs-change-title">
              <div className="fs-spread" style={{ marginBottom: 8 }}>
                <h2 className="fs-h3" id="fs-change-title">
                  燕麦片从 A2 移到 B1
                </h2>
                <span className="fs-badge fs-badge--warn">待确认</span>
              </div>
              <div className="fs-actions" style={{ marginTop: 14 }}>
                <Link className="fs-btn fs-btn--secondary" to="/firstshift/work/changes/chg-1">
                  查看哪里变了
                </Link>
              </div>
            </section>
          )}

          {reviewRequest && (
            <section className="fs-card" aria-labelledby="fs-request-title">
              <div className="fs-spread" style={{ marginBottom: 8 }}>
                <h2 className="fs-h3" id="fs-request-title">
                  支持请求
                </h2>
                <span className="fs-badge fs-badge--primary">待复核</span>
              </div>
              <div className="fs-actions" style={{ marginTop: 14 }}>
                <Link className="fs-btn fs-btn--secondary" to="/firstshift/help/requests">
                  查看请求
                </Link>
              </div>
            </section>
          )}
        </div>
      )}

      <p className="fs-note">
        练习不是考试：不评分、不计时、不排名，也不推断工作能力。使用前不需要登录，也不需要填写诊断或个人资料。
      </p>
    </div>
  );
}
