import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../components/ui";
import { EmptyCard, Group, Row } from "../../components/v3";
import { useDemoStore } from "../../store/demoStore";
import { CATEGORY_LABELS } from "../../types";
import type { PassportCategory } from "../../types";

const SUPPORT_GROUPS: { key: string; label: string; categories: PassportCategory[] }[] = [
  { key: "goal", label: CATEGORY_LABELS.goal, categories: ["goal"] },
  { key: "explain", label: CATEGORY_LABELS.explain, categories: ["explain", "format"] },
  { key: "help", label: CATEGORY_LABELS.help, categories: ["help"] },
];

export default function Passport() {
  useDocumentTitle("我的支持");
  const items = useDemoStore((state) => state.passportItems);

  if (items.length === 0) {
    return (
      <EmptyCard
        action={
          <Link className="fs-btn fs-btn--primary" to="/firstshift/passport/edit">
            开始填写
          </Link>
        }
      >
        还没有填写支持信息。
      </EmptyCard>
    );
  }

  return (
    <div className="v3-stack">
      <section className="v3-card v3-support" aria-label="我的支持内容">
        {SUPPORT_GROUPS.map((group) => {
          const rows = items.filter((item) => group.categories.includes(item.category));
          if (rows.length === 0) return null;
          return (
            <section key={group.key} className="v3-support__section">
              <div className="v3-support__head">
                <h2>{group.label}</h2>
                {group.key === "goal" && (
                  <Link className="v3-support__edit" to="/firstshift/passport/edit">
                    编辑
                  </Link>
                )}
              </div>
              {rows.map((item) => (
                <p key={item.id}>{item.value}</p>
              ))}
            </section>
          );
        })}
      </section>

      <Group label="分享">
        <Row icon="share" title="分享记录" to="/firstshift/passport/share/history" />
        <Row icon="doc" title="导出与打印" to="/firstshift/passport/share" />
      </Group>

      <Link className="fs-btn fs-btn--primary fs-btn--block" to="/firstshift/passport/share">
        分享我的支持
      </Link>
    </div>
  );
}
