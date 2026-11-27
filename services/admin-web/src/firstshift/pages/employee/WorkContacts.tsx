import { Group, Row } from "../../components/v3";
import { useDocumentTitle } from "../../components/ui";
import { demoContacts } from "../../fixtures/demo";

export default function WorkContacts() {
  useDocumentTitle("工作联系人");

  return (
    <Group label="工作联系人">
      {demoContacts.map((contact) => (
        <Row
          key={contact.id}
          icon="support"
          title={contact.role}
          value={contact.area}
          to={`/firstshift/work/contacts/${contact.id}`}
        />
      ))}
    </Group>
  );
}
