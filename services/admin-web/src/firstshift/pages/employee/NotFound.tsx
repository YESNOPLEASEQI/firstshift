import { Link } from "react-router-dom";
import { PageHeader, useDocumentTitle } from "../../components/ui";

export default function NotFound() {
  useDocumentTitle("页面不存在");
  return (
    <div className="fs-stack">
      <PageHeader
        title="页面不存在"
        titleId="fs-nf-title"
      />
      <div className="fs-actions">
        <Link className="fs-btn fs-btn--primary" to="/firstshift">
          回到开场页
        </Link>
        <Link className="fs-btn fs-btn--secondary" to="/firstshift/work">
          查看我的工作
        </Link>
      </div>
    </div>
  );
}
