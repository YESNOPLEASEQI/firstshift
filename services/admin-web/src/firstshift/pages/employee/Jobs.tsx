import { Link } from "react-router-dom";
import shelfOverview from "../../assets/v3/shelf-overview.jpg";
import { Icon, useDocumentTitle } from "../../components/ui";
import { demoJob } from "../../fixtures/demo";

export default function Jobs() {
  useDocumentTitle("看看工作");

  return (
    <div className="v3-stack">
      <Link
        to={`/firstshift/jobs/${demoJob.id}`}
        className="v3-card"
        style={{ display: "block", color: "inherit", textDecoration: "none", overflow: "hidden" }}
      >
        <img
          className="v3-cover--wide"
          src={shelfOverview}
          alt="货架示意，标签为 A1、A2、B1、B2"
          style={{ display: "block" }}
        />
        <div className="v3-jobcard__body">
          <div>
            <h2 className="v3-practice-card__title">{demoJob.title}</h2>
            <p className="v3-practice-card__meta">演示岗位</p>
          </div>
          <Icon name="chevronRight" size={20} className="v3-row__chev" />
        </div>
      </Link>
    </div>
  );
}
