import { Link, useNavigate, useSearchParams } from "react-router-dom";
import shelfOverview from "../../assets/v3/shelf-overview.jpg";
import { useDocumentTitle } from "../../components/ui";
import { outcomeStatus } from "../../simulation/model";
import { isResumable, useDemoStore } from "../../store/demoStore";

const STEP_BY_VIEW: Record<string, number> = {
  "choose-item": 1,
  "choose-shelf": 2,
  "confirm-placement": 3,
  review: 4,
};
const TOTAL_STEPS = 4;

function shortDate(label: string | null): string {
  if (!label) return "";
  const match = label.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return label;
  return `${Number(match[2])}月${Number(match[3])}日`;
}

export default function PracticeIndex() {
  useDocumentTitle("练习");
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const practice = useDemoStore((state) => state.practice);
  const startPractice = useDemoStore((state) => state.startPractice);
  const tab = params.get("tab") === "done" ? "done" : "active";

  const resumable = isResumable(practice);
  const completed = practice?.session.status === "ended";
  const activeStep = practice ? STEP_BY_VIEW[practice.session.view] ?? 1 : 1;
  const version = practice?.scenarioVersion ?? "v1";
  const date = shortDate(practice?.updatedAt ?? null);

  function switchTab(next: "active" | "done") {
    setParams(next === "done" ? { tab: "done" } : {}, { replace: true });
  }

  function retry() {
    startPractice(version, true);
    navigate("/firstshift/practice/demo-stock");
  }

  return (
    <div>
      <div className="v3-page-tabs" role="tablist" aria-label="练习记录">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "active"}
          onClick={() => switchTab("active")}
        >
          进行中
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "done"}
          onClick={() => switchTab("done")}
        >
          已完成
        </button>
      </div>

      {tab === "active" ? (
        <div role="tabpanel" aria-label="进行中的练习">
          {resumable && practice ? (
            <section className="v3-practice-card" aria-labelledby="v3-active-title">
              <div className="v3-practice-card__head">
                <img className="v3-cover" src={shelfOverview} alt="货架示意，标签为 A1、A2、B1、B2" />
                <div className="v3-practice-card__body">
                  <h2 className="v3-practice-card__title" id="v3-active-title">
                    整理货架
                  </h2>
                  <p className="v3-practice-card__meta">超市理货员</p>
                  <p className="v3-practice-card__meta">
                    第 {activeStep} 步，共 {TOTAL_STEPS} 步
                  </p>
                </div>
              </div>
              <div className="v3-progress" aria-hidden="true">
                <i style={{ width: `${Math.round((activeStep / TOTAL_STEPS) * 100)}%` }} />
              </div>
              {date && <p className="v3-practice-card__meta">上次练习：{date}</p>}
              <div className="v3-actions-stack">
                <Link className="fs-btn fs-btn--primary" to="/firstshift/practice/demo-stock">
                  继续练习
                </Link>
              </div>
            </section>
          ) : (
            <div className="v3-card v3-empty">
              <p>还没有开始练习。</p>
              <Link className="fs-btn fs-btn--primary" to="/firstshift/practice/new">
                开始练习
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div role="tabpanel" aria-label="已完成的练习">
          {completed && practice ? (
            <section className="v3-record-card" aria-labelledby="v3-done-title">
              <div className="v3-record-card__head">
                <h2 className="v3-practice-card__title" id="v3-done-title">
                  整理货架
                </h2>
                <span className="fs-caption">{outcomeStatus(practice.session.outcome)}</span>
              </div>
              {date && <p className="v3-record-card__date">{date}</p>}
              <div className="v3-record-actions">
                <Link className="fs-btn fs-btn--secondary" to="/firstshift/practice/demo-stock/feedback">
                  查看记录
                </Link>
                <button type="button" className="fs-btn fs-btn--primary" onClick={retry}>
                  再练一次
                </button>
              </div>
            </section>
          ) : (
            <div className="v3-card v3-empty">
              <p>还没有完成的练习。</p>
              <Link className="fs-btn fs-btn--primary" to="/firstshift/practice/new">
                开始练习
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
