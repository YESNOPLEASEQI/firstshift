import { useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, EmptyState, Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import { DEMO_USER_NAME } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";
import { CATEGORY_LABELS } from "../../types";
import type { PassportCategory, PassportItem } from "../../types";

const ORDER: PassportCategory[] = ["goal", "explain", "format", "help"];

export default function Passport() {
  useDocumentTitle("支持说明");
  const items = useDemoStore((state) => state.passportItems);
  const updatedAt = useDemoStore((state) => state.passportUpdatedAt);
  const lastShare = useDemoStore((state) => state.lastShare);
  const deletePassportItem = useDemoStore((state) => state.deletePassportItem);
  const [pendingDelete, setPendingDelete] = useState<PassportItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groups = ORDER.map((category) => ({
    category,
    title: CATEGORY_LABELS[category],
    rows: items.filter((item) => item.category === category),
  })).filter((group) => group.rows.length > 0);

  function confirmDelete() {
    if (!pendingDelete) return;
    const result = deletePassportItem(pendingDelete.id);
    if (!result.ok) {
      setError("这台设备的本地存储暂时不可用，没有删除。请稍后再试。");
    } else {
      setError(null);
    }
    setPendingDelete(null);
  }

  return (
    <div className="fs-stack">
      <PageHeader
        title="支持说明"
        backTo="/firstshift"
        backLabel="回到首页"
        aside={
          <div className="fs-row">
            <span className="fs-badge fs-badge--primary">默认私密</span>
            {updatedAt && <span className="fs-badge">更新于 {updatedAt}</span>}
          </div>
        }
        titleId="fs-passport-title"
      />

      {error && (
        <p className="fs-error" role="alert">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="还没有支持说明"
          action={
            <Link className="fs-btn fs-btn--primary" to="/firstshift/passport/edit">
              创建支持说明
            </Link>
          }
        >
          你可以记录希望别人怎样解释任务、哪些说明方式更容易理解，以及遇到困难时希望怎样获得帮助。
        </EmptyState>
      ) : (
        <div className="fs-passport">
          <article className="fs-passport__paper" aria-labelledby="fs-passport-paper-title">
            <div className="fs-passport__head">
              <h2 className="fs-passport__name" id="fs-passport-paper-title">
                {DEMO_USER_NAME}
              </h2>
            </div>

            {groups.map((group) => (
              <section key={group.category} className="fs-passport__group" aria-label={group.title}>
                <h3>{group.title}</h3>
                {group.rows.map((item) => (
                  <div key={item.id} className="fs-passport__item">
                    <p>{item.value}</p>
                    <button
                      type="button"
                      className="fs-itemdel"
                      onClick={() => setPendingDelete(item)}
                      aria-label={`删除：${item.value}`}
                    >
                      <Icon name="trash" size={18} />
                      删除
                    </button>
                  </div>
                ))}
              </section>
            ))}

            <hr className="fs-divider" style={{ margin: "24px 0 16px" }} />
            <p className="fs-help">
              这些是演示条目，你可以修改、删除，或换成自己的说法。它们不是诊断、能力证书或就业资格证明。
            </p>
          </article>

          <aside className="fs-stack">
            <section className="fs-card fs-card--soft" aria-labelledby="fs-passport-actions">
              <h2 className="fs-h3" id="fs-passport-actions">
                修改或分享
              </h2>
              <div className="fs-stack fs-stack--tight" style={{ marginTop: 14 }}>
                <Link className="fs-btn fs-btn--primary fs-btn--block" to="/firstshift/passport/edit">
                  <Icon name="edit" size={20} />
                  编辑支持说明
                </Link>
                <Link className="fs-btn fs-btn--secondary fs-btn--block" to="/firstshift/passport/share">
                  <Icon name="share" size={20} />
                  选择要分享的内容
                </Link>
              </div>
            </section>

            <section className="fs-card" aria-labelledby="fs-passport-share-info">
              <h2 className="fs-h3" id="fs-passport-share-info">
                分享与隐私
              </h2>
              <ul className="fs-list" style={{ marginTop: 10 }}>
                <li>分享前会显示接收者看到的全部内容。</li>
                <li>只导出你勾选的字段，不包含历史或诊断。</li>
                <li>已发送或打印的副本无法远程撤回。</li>
              </ul>
              {lastShare && (
                <p className="fs-note" style={{ marginTop: 12 }}>
                  上次导出：{lastShare.exportedAt} · 给 {lastShare.recipientLabel} · 共{" "}
                  {lastShare.itemIds.length} 项
                </p>
              )}
            </section>
          </aside>
        </div>
      )}

      <Dialog
        open={pendingDelete !== null}
        title="删除这条支持说明？"
        onClose={() => setPendingDelete(null)}
      >
        <p className="fs-body">{pendingDelete?.value}</p>
        <p className="fs-caption">删除后，这条内容不再出现在支持说明里，也不会出现在以后的分享中。</p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setPendingDelete(null)}>
            保留这条
          </button>
          <button type="button" className="fs-btn fs-btn--danger" onClick={confirmDelete}>
            删除
          </button>
        </div>
      </Dialog>
    </div>
  );
}
