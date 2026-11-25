import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSoftSwap } from "../../coach/motion";
import { useCoachStore } from "../../coach/store";
import { CoachHeading, VersionPill, useDocumentTitle } from "../../coach/ui";

export default function Reviews() {
  useDocumentTitle("版本审核 · 辅导员端");
  const tasks = useCoachStore((state) => state.tasks);
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "all" ? "all" : "review";
  const tableRef = useRef<HTMLElement>(null);
  useSoftSwap(tableRef, tab);

  const rows = tasks
    .flatMap((task) =>
      task.versions.map((version) => ({ task, version })),
    )
    .filter((row) => (tab === "review" ? row.version.status === "review" : row.version.status !== "superseded"))
    .sort((a, b) =>
      (b.version.submittedAt ?? b.version.createdAt).localeCompare(
        a.version.submittedAt ?? a.version.createdAt,
      ),
    );

  return (
    <div className="fsc-page">
      <CoachHeading title="版本审核" titleId="fsc-reviews-title" />

      <div className="fsc-tabs" role="tablist" aria-label="版本筛选">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "review"}
          className={tab === "review" ? "active" : ""}
          onClick={() => setParams({}, { replace: true })}
        >
          待审核
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "all"}
          className={tab === "all" ? "active" : ""}
          onClick={() => setParams({ tab: "all" }, { replace: true })}
        >
          全部版本
        </button>
      </div>

      <section className="fsc-panel" aria-label="版本列表" ref={tableRef}>
        <div className="fsc-tablewrap">
          <table className="fsc-table">
            <thead>
              <tr>
                <th scope="col">任务</th>
                <th scope="col">版本</th>
                <th scope="col">状态</th>
                <th scope="col">提交时间</th>
                <th scope="col">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ task, version }) => (
                <tr key={`${task.id}-${version.versionId}`}>
                  <td>{task.title}</td>
                  <td className="num">{version.versionId}</td>
                  <td>
                    <VersionPill status={version.status} />
                  </td>
                  <td className="num">{version.submittedAt ?? version.createdAt}</td>
                  <td>
                    <Link className="fsc-link" to={`/firstshift/coach/reviews/${task.id}`}>
                      {version.status === "review" ? "审核" : "查看"}
                    </Link>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="fsc-quiet">
                    {tab === "review" ? "当前没有待审核的版本。" : "还没有可查看的版本。"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
