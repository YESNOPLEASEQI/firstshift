import { Group, Row } from "../../components/v3";
import { useDocumentTitle } from "../../components/ui";
import { demoChanges, demoJob } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";

export default function Work() {
  useDocumentTitle("我的工作");
  const readChangeIds = useDemoStore((state) => state.readChangeIds);
  const hasUnread = demoChanges.some((change) => !readChangeIds.includes(change.id));

  return (
    <div className="v3-stack">
      <section className="v3-card" aria-label="当前岗位">
        <h2 className="v3-practice-card__title">{demoJob.title}</h2>
        <p className="v3-practice-card__meta">{demoJob.kicker}</p>
      </section>

      <Group label="工作信息">
        <Row icon="doc" title="工作指导" to="/firstshift/work/guides" />
        <Row
          icon="refresh"
          title="工作变化"
          to="/firstshift/work/changes"
          unread={hasUnread}
          unreadLabel="有未读工作变化"
        />
        <Row icon="support" title="工作联系人" to="/firstshift/work/contacts" />
      </Group>
    </div>
  );
}
