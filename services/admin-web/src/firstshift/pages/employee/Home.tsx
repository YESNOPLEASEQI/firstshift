import { Group, Row } from "../../components/v3";
import { useDocumentTitle } from "../../components/ui";

const ENTRIES = [
  { to: "/firstshift/jobs", icon: "look" as const, title: "看看工作" },
  { to: "/firstshift/practice/new", icon: "try" as const, title: "工作尝试模拟" },
  { to: "/firstshift/passport", icon: "support" as const, title: "我的支持" },
  { to: "/firstshift/help/requests", icon: "help" as const, title: "我的求助" },
];

export default function Home() {
  useDocumentTitle("岗伴");

  return (
    <div className="v3-stack">
      <Group label="主要入口">
        {ENTRIES.map((entry) => (
          <Row key={entry.to} to={entry.to} icon={entry.icon} title={entry.title} />
        ))}
      </Group>
    </div>
  );
}
