import { Link } from "react-router-dom";
import { Icon, useDocumentTitle } from "../../components/ui";
import { demoChanges } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";

function day(label: string): string {
  const match = label.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return label;
  return `${Number(match[2])}月${Number(match[3])}日`;
}

export default function WorkChanges() {
  useDocumentTitle("工作变化");
  const readChangeIds = useDemoStore((state) => state.readChangeIds);
  const changeDecision = useDemoStore((state) => state.changeDecision);

  const status =
    changeDecision === "understood" ? "已理解" : changeDecision === "not-applicable" ? "不适用" : "待确认";

  return (
    <div className="v3-stack">
      {demoChanges.map((change) => {
        const unread = !readChangeIds.includes(change.id);
        return (
          <Link
            key={change.id}
            to={`/firstshift/work/changes/${change.id}`}
            className="v3-change-row"
            aria-label={`${change.title}，${unread ? "未读，" : ""}${status}`}
          >
            <span className="v3-change-row__head">
              <span className="v3-change-row__title">
                {change.title}
                {unread && <span className="v3-dot" aria-hidden="true" />}
                {unread && <span className="v3-sr">未读</span>}
              </span>
              <span className="v3-change-row__status" style={{ color: changeDecision ? "#596860" : "#895A16" }}>
                {status}
              </span>
              <Icon name="chevronRight" size={20} className="v3-row__chev" />
            </span>
            <span className="v3-change-row__meta">
              整理货架 · {day(change.publishedAt)}
            </span>
            <span className="v3-change-row__change">A2 → B1</span>
          </Link>
        );
      })}
    </div>
  );
}
