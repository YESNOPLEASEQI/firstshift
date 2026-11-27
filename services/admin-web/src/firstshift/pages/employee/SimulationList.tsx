import { Link } from "react-router-dom";
import shelfOverview from "../../assets/v3/shelf-overview.jpg";
import { useDocumentTitle } from "../../components/ui";
import { taskV2 } from "../../fixtures/demo";

export default function SimulationList() {
  useDocumentTitle("工作尝试模拟");

  return (
    <div className="v3-stack">
      <Link
        to="/firstshift/practice/new/demo-stock"
        className="v3-card"
        style={{ color: "inherit", textDecoration: "none", padding: 0, overflow: "hidden" }}
      >
        <img
          className="v3-cover--wide"
          src={shelfOverview}
          alt="货架示意，标签为 A1、A2、B1、B2"
          style={{ display: "block" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="v3-practice-card__title">{taskV2.label.replace(/（.*?）/, "")}</h2>
            <p className="v3-practice-card__meta">
              超市理货员 · {taskV2.steps.length} 个步骤
            </p>
          </div>
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ flex: "none", color: "#66776e" }}
          >
            <path d="m9 5 7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
