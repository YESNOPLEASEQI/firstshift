import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, PageHeader, useDocumentTitle } from "../../components/ui";
import { isResumable, useDemoStore } from "../../store/demoStore";
import { scenarioV1 } from "../../fixtures/demo";

export default function PracticePrep() {
  useDocumentTitle("准备练习");
  const navigate = useNavigate();
  const practice = useDemoStore((state) => state.practice);
  const startPractice = useDemoStore((state) => state.startPractice);
  const [restartOpen, setRestartOpen] = useState(false);

  const resumable = isResumable(practice);
  const version = practice?.scenarioVersion ?? "v1";
  const scenario = version === "v2" ? { ...scenarioV1, versionId: "v2" } : scenarioV1;

  function begin() {
    startPractice(version, true);
    navigate("/firstshift/practice/demo-stock");
  }

  return (
    <div className="fs-stack">
      <PageHeader
        backTo="/firstshift/jobs/retail-community"
        backLabel="返回岗位详情"
        title="整理货架"
        aside={<span className="fs-badge fs-badge--demo">合成场景 · 非测评</span>}
        titleId="fs-prep-title"
      />

      <div className="fs-work-grid">
        <div className="fs-stack">
          <section className="fs-card" aria-labelledby="fs-prep-what">
            <h2 className="fs-h3" id="fs-prep-what">
              练习内容
            </h2>
            <ul className="fs-worksheet" style={{ fontSize: "1.0625rem" }}>
              {scenario.worksheet.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>

          <section className="fs-card" aria-labelledby="fs-prep-rules">
            <h2 className="fs-h3" id="fs-prep-rules">
              练习操作
            </h2>
            <div className="fs-pillgrid" style={{ marginTop: 12 }}>
              <span className="fs-pill">暂停</span>
              <span className="fs-pill">退出</span>
              <span className="fs-pill">重复查看说明</span>
              <span className="fs-pill">查看图片提示</span>
              <span className="fs-pill">请求帮助</span>
            </div>
          </section>

          <p className="fs-warn">
            这是网页模拟，不是无偿试工、雇主筛选或能力测评。实际岗位操作需要安全培训与雇主审核。
          </p>
        </div>

        <aside className="fs-stack">
          <section className="fs-card fs-card--soft" aria-labelledby="fs-prep-start">
            <h2 className="fs-h3" id="fs-prep-start">
              开始练习
            </h2>
            <div className="fs-stack fs-stack--tight" style={{ marginTop: 16 }}>
              {resumable ? (
                <>
                  <Link className="fs-btn fs-btn--primary fs-btn--block" to="/firstshift/practice/demo-stock">
                    继续上次练习
                  </Link>
                  <button
                    type="button"
                    className="fs-btn fs-btn--secondary fs-btn--block"
                    onClick={() => setRestartOpen(true)}
                  >
                    重新开始
                  </button>
                </>
              ) : (
                <button type="button" className="fs-btn fs-btn--primary fs-btn--block fs-btn--lg" onClick={begin}>
                  开始练习
                </button>
              )}
              <Link className="fs-btn fs-btn--ghost fs-btn--block" to="/firstshift">
                取消，回首页
              </Link>
            </div>
          </section>
          <p className="fs-note">
            退出后如果需要，可以在首页「继续上次」恢复这份练习。重练会新建一份练习，不覆盖旧记录。
          </p>
        </aside>
      </div>

      <Dialog open={restartOpen} title="重新开始这份练习？" onClose={() => setRestartOpen(false)}>
        <p className="fs-body">
          已经放好的商品和用过的提示会被清空。旧记录不会保留在这台设备上。
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
