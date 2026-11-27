import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import shelfOverview from "../../assets/v3/shelf-overview.jpg";
import { Dialog, useDocumentTitle } from "../../components/ui";
import { isResumable, useDemoStore } from "../../store/demoStore";

const STEP_BY_VIEW: Record<string, number> = {
  "choose-item": 1,
  "choose-shelf": 2,
  "confirm-placement": 3,
  review: 4,
};

export default function PracticePrep() {
  useDocumentTitle("整理货架");
  const { taskId } = useParams();
  const navigate = useNavigate();
  const practice = useDemoStore((state) => state.practice);
  const startPractice = useDemoStore((state) => state.startPractice);
  const [restartOpen, setRestartOpen] = useState(false);

  if (taskId !== "demo-stock") {
    return <Navigate to="/firstshift/practice/new" replace />;
  }

  const version = practice?.scenarioVersion ?? "v1";
  const resumable = isResumable(practice);
  const step = practice ? STEP_BY_VIEW[practice.session.view] ?? 1 : 1;

  function begin() {
    startPractice(version, true);
    navigate("/firstshift/practice/demo-stock");
  }

  if (resumable) {
    return (
      <div className="v3-card">
        <p className="fs-body" style={{ margin: 0 }}>
          你还有一次还没有完成的练习。
        </p>
        <p className="v3-practice-card__meta" style={{ marginTop: 8 }}>
          第 {step} 步，共 4 步
        </p>
        <div className="v3-actions-stack">
          <Link className="fs-btn fs-btn--primary" to="/firstshift/practice/demo-stock">
            继续练习
          </Link>
          <button
            type="button"
            className="fs-btn fs-btn--secondary"
            onClick={() => setRestartOpen(true)}
          >
            重新开始
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--secondary"
            onClick={() => navigate("/firstshift/practice/new")}
          >
            取消
          </button>
        </div>

        <Dialog open={restartOpen} title="重新开始这份练习？" onClose={() => setRestartOpen(false)}>
          <p className="fs-body">
            已经放好的商品和用过的提示会被清空。原来的进行中记录不会保留。
          </p>
          <div className="fs-dialog__actions">
            <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setRestartOpen(false)}>
              继续原来的练习
            </button>
            <button type="button" className="fs-btn fs-btn--danger" onClick={begin}>
              清空并重新开始
            </button>
          </div>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="v3-card" style={{ padding: 16 }}>
      <img
        className="v3-cover--wide"
        src={shelfOverview}
        alt="货架示意，标签为 A1、A2、B1、B2"
        style={{ display: "block", marginBottom: 16 }}
      />
      <p className="fs-body" style={{ margin: 0 }}>
        检查商品、辨认货位，把商品放到对应的位置。
      </p>
      <p className="fs-body" style={{ marginTop: 14 }}>
        这是模拟练习，不是考试。你可以随时暂停、退出或求助。
      </p>
      <div className="v3-actions-stack">
        <button type="button" className="fs-btn fs-btn--primary" onClick={begin}>
          开始模拟
        </button>
      </div>
    </div>
  );
}
