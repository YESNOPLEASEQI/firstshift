import { useDocumentTitle } from "../../components/ui";
import { Group, Row } from "../../components/v3";
import { useDemoStore } from "../../store/demoStore";
import type { FontScale } from "../../types";

const FONT_LABELS: Record<FontScale, string> = {
  standard: "标准",
  large: "大",
  larger: "更大",
};

export default function Settings() {
  useDocumentTitle("设置");
  const fontScale = useDemoStore((state) => state.settings.fontScale);

  return (
    <div className="v3-settings-list">
      <Group label="显示">
        <Row
          icon="type"
          title="文字大小"
          value={FONT_LABELS[fontScale]}
          to="/firstshift/settings/font"
        />
      </Group>

      <Group label="支持与说明">
        <Row icon="help" title="使用帮助" to="/firstshift/settings/help" />
        <Row icon="shield" title="隐私与分享" to="/firstshift/settings/privacy" />
        <Row icon="list" title="我的数据" to="/firstshift/settings/data" />
        <Row icon="info" title="关于岗伴" to="/firstshift/settings/about" />
      </Group>
    </div>
  );
}
