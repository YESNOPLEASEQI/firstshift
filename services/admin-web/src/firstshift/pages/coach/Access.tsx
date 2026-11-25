import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui";
import { useDemoStore } from "../../store/demoStore";
import { pickTask, useCoachStore } from "../../coach/store";
import { CoachHeading, useDocumentTitle } from "../../coach/ui";

export default function Access() {
  useDocumentTitle("授权信息 · 辅导员端");
  const records = useCoachStore((state) => state.access);
  const task = useCoachStore(pickTask);
  const passportItems = useDemoStore((state) => state.passportItems);
  const [params, setParams] = useSearchParams();

  const query = params.get("q") ?? "";
  const filtered = records.filter((record) => {
    if (!query.trim()) return true;
    const needle = query.trim().toLowerCase();
    return (
      record.name.toLowerCase().includes(needle) ||
      record.purpose.toLowerCase().includes(needle)
    );
  });
  const requestedId = params.get("id");
  const selected = filtered.find((record) => record.id === requestedId) ?? filtered[0];

  useEffect(() => {
    if (selected && selected.id !== requestedId) {
      const next = new URLSearchParams(params);
      next.set("id", selected.id);
      setParams(next, { replace: true });
    }
  }, [selected, requestedId, params, setParams]);

  const visibleItems = selected
    ? passportItems.filter((item) => selected.itemIds.includes(item.id))
    : [];

  return (
    <div className="fsc-page">
      <CoachHeading title="授权信息" titleId="fsc-access-title" />

      <div className="fsc-toolbar">
        <label className="fsc-search">
          <Icon name="search" size={16} />
          <span className="fsc-visually-hidden">搜索授权记录</span>
          <input
            type="search"
            placeholder="搜索姓名或授权用途"
            value={query}
            onChange={(event) => {
              const next = new URLSearchParams(params);
              if (event.target.value) next.set("q", event.target.value);
              else next.delete("q");
              next.delete("id");
              setParams(next, { replace: true });
            }}
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="fsc-panel">
          <div className="fsc-empty">
            <p>没有匹配的授权记录。</p>
          </div>
        </div>
      ) : (
        <div className="fsc-detailgrid">
          <div className="fsc-recordlist" aria-label="授权记录">
            {filtered.map((record) => (
              <button
                key={record.id}
                type="button"
                className={`fsc-record${selected?.id === record.id ? " active" : ""}`}
                aria-current={selected?.id === record.id ? "true" : undefined}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set("id", record.id);
                  setParams(next, { replace: true });
                }}
              >
                <span className="between">
                  <b>{record.name}</b>
                  <span className={`fsc-pill ${record.status === "active" ? "green" : ""}`}>
                    {record.status === "active" ? "有效" : "已撤销"}
                  </span>
                </span>
                <span className="fsc-small fsc-quiet">{record.purpose}</span>
                <span className="fsc-small fsc-quiet">到期 {record.expiresAt}</span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="fsc-detail">
              <div className="fsc-detailtop">
                <h2>{selected.name} 的授权</h2>
                <span className="fsc-pill green">有效</span>
              </div>

              <dl className="fsc-kv">
                <dt>授权用途</dt>
                <dd>{selected.purpose}</dd>
                <dt>授权给</dt>
                <dd>{selected.audience}</dd>
                <dt>授权时间</dt>
                <dd>{selected.grantedAt}</dd>
                <dt>到期时间</dt>
                <dd>{selected.expiresAt}</dd>
              </dl>

              <div className="fsc-formblock">
                <h3>可见的支持信息</h3>
                <div className="fsc-panel">
                  {visibleItems.length > 0 ? (
                    visibleItems.map((item) => (
                      <div className="fsc-retained" key={item.id}>
                        <span>
                          <b>{item.label}</b>
                          <span className="fsc-small fsc-quiet" style={{ display: "block" }}>
                            {item.value}
                          </span>
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="fsc-panelbody fsc-quiet">没有已授权的支持信息。</div>
                  )}
                </div>
                <p className="fsc-small fsc-quiet" style={{ marginTop: 10 }}>
                  这里只显示本人授权分享的信息，不会读取其他记录。
                </p>
              </div>

              <div className="fsc-formblock">
                <h3>相关指导</h3>
                <div className="fsc-actions">
                  <Link className="fsc-btn" to={`/firstshift/coach/editor/${task.id}`}>
                    <Icon name="book" size={16} />
                    {task.title}
                  </Link>
                  <Link className="fsc-btn" to="/firstshift/passport">
                    <Icon name="external" size={16} />
                    查看本人端支持护照
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
