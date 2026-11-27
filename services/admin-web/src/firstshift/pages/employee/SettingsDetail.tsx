import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "../../components/ui";
import { BrandMark, Group, Row } from "../../components/v3";
import { useDemoStore } from "../../store/demoStore";
import type { FontScale } from "../../types";

const FONT_OPTIONS: { value: FontScale; label: string; size: string }[] = [
  { value: "standard", label: "标准", size: "20px" },
  { value: "large", label: "大", size: "23px" },
  { value: "larger", label: "更大", size: "26px" },
];

function FontSettings() {
  useDocumentTitle("文字大小");
  const navigate = useNavigate();
  const current = useDemoStore((state) => state.settings.fontScale);
  const setSetting = useDemoStore((state) => state.setSetting);
  const [draft, setDraft] = useState<FontScale>(current);
  const preview = FONT_OPTIONS.find((option) => option.value === draft) ?? FONT_OPTIONS[0];

  return (
    <div className="v3-stack">
      <div className="v3-check-list" role="radiogroup" aria-label="文字大小">
        {FONT_OPTIONS.map((option) => (
          <label key={option.value} className="v3-check">
            <input
              type="radio"
              name="font-scale"
              value={option.value}
              checked={draft === option.value}
              onChange={() => setDraft(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>

      <div className="v3-font-preview">
        <p className="fs-caption" style={{ margin: 0 }}>
          文字显示预览
        </p>
        <p style={{ margin: "10px 0 0", fontSize: preview.size, lineHeight: 1.5 }}>
          找到写着 B1 的货架。
        </p>
      </div>

      <button
        type="button"
        className="fs-btn fs-btn--primary fs-btn--block"
        onClick={() => {
          setSetting("fontScale", draft);
          navigate("/firstshift/settings");
        }}
      >
        保存
      </button>
    </div>
  );
}

function HelpPage() {
  useDocumentTitle("使用帮助");
  return (
    <Group label="使用帮助">
      <Row icon="look" title="看看工作" to="/firstshift/jobs" />
      <Row icon="try" title="工作尝试模拟" to="/firstshift/practice/new" />
      <Row icon="support" title="我的支持" to="/firstshift/passport" />
      <Row icon="help" title="我的求助" to="/firstshift/help/requests" />
      <Row icon="list" title="练习" to="/firstshift/practice" />
      <Row icon="briefcase" title="我的工作" to="/firstshift/work" />
    </Group>
  );
}

function PrivacyPage() {
  useDocumentTitle("隐私与分享");
  return (
    <div className="v3-stack">
      <div className="v3-card">
        <p className="fs-body" style={{ margin: 0 }}>
          你的支持信息默认只有你可以查看。分享之前，你可以选择让别人看到哪些内容。
        </p>
        <p className="fs-body" style={{ marginTop: 12 }}>
          已经打印或导出的副本不能远程收回。
        </p>
      </div>
      <Group label="分享记录">
        <Row icon="share" title="分享记录" to="/firstshift/passport/share/history" />
      </Group>
    </div>
  );
}

function DataPage() {
  useDocumentTitle("我的数据");
  const navigate = useNavigate();
  return (
    <div className="v3-stack">
      <Group label="我的数据">
        <Row icon="list" title="练习记录" to="/firstshift/practice" />
        <Row icon="support" title="个人支持信息" to="/firstshift/passport" />
      </Group>
      <button
        type="button"
        className="fs-btn fs-btn--danger"
        onClick={() => navigate("/firstshift/settings/data/clear")}
      >
        清除本地数据
      </button>
    </div>
  );
}

function ClearDataPage() {
  useDocumentTitle("清除本地数据");
  const resetDemoData = useDemoStore((state) => state.resetDemoData);
  const navigate = useNavigate();

  function clear() {
    resetDemoData();
    try {
      window.localStorage.removeItem("firstshift.demo.v1");
    } catch {
      // Storage may be blocked; the in-memory reset still applies.
    }
    window.location.assign("/firstshift");
  }

  return (
    <div className="v3-card">
      <p className="fs-body" style={{ margin: 0 }}>
        清除后，这个设备上的练习记录和支持信息将被删除，不能恢复。
      </p>
      <div className="fs-dialog__actions">
        <button type="button" className="fs-btn fs-btn--secondary" onClick={() => navigate("/firstshift/settings/data")}>
          取消
        </button>
        <button type="button" className="fs-btn fs-btn--danger" onClick={clear}>
          确认清除
        </button>
      </div>
    </div>
  );
}

function AboutPage() {
  useDocumentTitle("关于岗伴");
  return (
    <div className="v3-card v3-about">
      <BrandMark size={48} />
      <h2 className="v3-about__name">岗伴 FirstShift</h2>
      <p className="fs-body" style={{ margin: 0 }}>
        了解工作、尝试任务，以及获得适合自己的工作支持。
      </p>
      <p className="v3-demo-note">
        当前为合成演示版本。岗位、任务、联系人和记录都是虚构内容，只保存在这台设备。
      </p>
    </div>
  );
}

export default function SettingsDetail() {
  const { pathname } = useLocation();

  if (pathname === "/firstshift/settings/font") return <FontSettings />;
  if (pathname === "/firstshift/settings/help") return <HelpPage />;
  if (pathname === "/firstshift/settings/privacy") return <PrivacyPage />;
  if (pathname === "/firstshift/settings/data") return <DataPage />;
  if (pathname === "/firstshift/settings/data/clear") return <ClearDataPage />;
  if (pathname === "/firstshift/settings/about") return <AboutPage />;
  return <Navigate to="/firstshift/settings" replace />;
}
