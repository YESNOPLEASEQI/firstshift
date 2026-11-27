import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../components/ui";
import { EmptyCard } from "../../components/v3";

export default function NotFound() {
  useDocumentTitle("页面不存在");
  return (
    <EmptyCard
      action={
        <div className="v3-actions-stack">
          <Link className="fs-btn fs-btn--primary fs-btn--block" to="/firstshift">
            回到首页
          </Link>
          <Link className="fs-btn fs-btn--secondary fs-btn--block" to="/firstshift/work">
            查看我的工作
          </Link>
        </div>
      }
    >
      没有找到这个页面。
    </EmptyCard>
  );
}
