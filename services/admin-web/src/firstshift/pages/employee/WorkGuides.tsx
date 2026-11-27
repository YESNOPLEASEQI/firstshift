import { Group, Row } from "../../components/v3";
import { useDocumentTitle } from "../../components/ui";
import { taskV2 } from "../../fixtures/demo";

export default function WorkGuides() {
  useDocumentTitle("工作指导");

  return (
    <Group label="工作指导">
      <Row
        icon="doc"
        title={taskV2.label.replace(/（.*?）/, "")}
        value={`${taskV2.steps.length} 个步骤`}
        to="/firstshift/work/demo-stock"
      />
    </Group>
  );
}
