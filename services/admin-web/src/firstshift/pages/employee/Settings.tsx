import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dialog, Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import { useDemoStore } from "../../store/demoStore";

type SettingKey = "largeText" | "highContrast" | "reducedMotion";

const SETTING_ROWS: { key: SettingKey; title: string; description: string }[] = [
  {
    key: "largeText",
    title: "更大的文字",
    description: "把正文、按钮和说明放大到约 125%，方便阅读。也可以配合浏览器的页面缩放使用。",
  },
  {
    key: "highContrast",
    title: "更高的对比度",
    description: "加深文字和边框的颜色，让内容在强光或低视力的情况下更容易看清。",
  },
  {
    key: "reducedMotion",
    title: "减少动效",
    description: "关闭界面的过渡和入场效果。练习场景本身没有动画，这一步只是让页面更安静。",
  },
];

export default function Settings() {
  useDocumentTitle("设置与帮助");
  const location = useLocation();
  const settings = useDemoStore((state) => state.settings);
  const setSetting = useDemoStore((state) => state.setSetting);
  const resetDemoData = useDemoStore((state) => state.resetDemoData);
  const [confirming, setConfirming] = useState<null | "reset" | "clear">(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ block: "start" });
  }, [location.hash]);

  return (
    <div className="fs-stack">
      <PageHeader
        title="设置与帮助"
        titleId="fs-settings-title"
      />

      {message && (
        <p className="fs-success" role="status" aria-live="polite">
          {message}
        </p>
      )}

      <div className="fs-settings">
        <section className="fs-card" aria-labelledby="fs-settings-display">
          <h2 className="fs-h2" id="fs-settings-display">
            显示与阅读
          </h2>
          <div style={{ marginTop: 8 }}>
            {SETTING_ROWS.map((row) => (
              <div className="fs-setting-row" key={row.key}>
                <div>
                  <h3 id={`fs-set-${row.key}`}>{row.title}</h3>
                  <p>{row.description}</p>
                </div>
                <div className="fs-segmented" role="group" aria-labelledby={`fs-set-${row.key}`}>
                  <button
                    type="button"
                    aria-pressed={settings[row.key]}
                    onClick={() => {
                      setSetting(row.key, true);
                      setMessage(`已开启“${row.title}”。`);
                    }}
                  >
                    开
                  </button>
                  <button
                    type="button"
                    aria-pressed={!settings[row.key]}
                    onClick={() => {
                      setSetting(row.key, false);
                      setMessage(`已关闭“${row.title}”。`);
                    }}
                  >
                    关
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="fs-card fs-card--soft" style={{ marginTop: 16 }} aria-label="显示效果预览">
            <p className="fs-body">
              燕麦片现在在 B1 货架，米仍然在 A1。找到名称相同的货架标签后，再把商品放进空位。
            </p>
            <div className="fs-row" style={{ marginTop: 10 }}>
              <span className="fs-badge fs-badge--primary">B1 · 燕麦片</span>
              <span className="fs-badge">A1 · 米</span>
            </div>
          </div>
        </section>

        <section className="fs-card" id="help" aria-labelledby="fs-settings-help">
          <h2 className="fs-h2" id="fs-settings-help">
            使用帮助
          </h2>
          <div className="fs-stack fs-stack--tight" style={{ marginTop: 12 }}>
            <div>
              <h3 className="fs-h3">我可以随时停下来吗？</h3>
              <p className="fs-body">
                可以。练习中随时可以暂停、退出或结束，不需要完成全部步骤。暂停不会清空已经放好的商品。
              </p>
            </div>
            <div>
              <h3 className="fs-h3">练习结果会被当成能力评价吗？</h3>
              <p className="fs-body">
                不会。这里只记录你实际放好的位置和你自己的选择，不评分、不计时、不排名，也不推断你能不能胜任某份工作。
              </p>
            </div>
            <div>
              <h3 className="fs-h3">只用键盘可以操作吗？</h3>
              <p className="fs-body">
                可以。按 Tab 在按钮和选项之间移动，按空格或回车确认。对话框打开后焦点会留在其中，按 Esc 关闭并回到原来的位置。
              </p>
            </div>
            <div>
              <h3 className="fs-h3">练习时说明变了怎么办？</h3>
              <p className="fs-body">
                打开“我的工作”里的变化说明，确认新旧位置的区别。正在进行的练习会保留它开始的版本，不会被悄悄替换。
              </p>
            </div>
            <div>
              <h3 className="fs-h3">需要人工帮助时怎么办？</h3>
              <p className="fs-body">
                打开 <Link to="/firstshift/help/request">请求帮助</Link>，选一项最接近的情况。请求先保存在本机（演示），不会假扮成已经有人回复。
              </p>
            </div>
          </div>
        </section>

        <section className="fs-card" id="data" aria-labelledby="fs-settings-data">
          <h2 className="fs-h2" id="fs-settings-data">
            演示数据
          </h2>
          <p className="fs-body" style={{ marginTop: 6 }}>
            练习记录、支持护照、分享记录、请求和变化确认都保存在这台浏览器的本地存储里。没有服务器，也没有跨设备同步。
          </p>
          <div className="fs-actions" style={{ marginTop: 16 }}>
            <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setConfirming("reset")}>
              <Icon name="refresh" size={20} />
              重置演示数据
            </button>
            <button type="button" className="fs-btn fs-btn--danger" onClick={() => setConfirming("clear")}>
              <Icon name="trash" size={20} />
              清除本机演示数据
            </button>
          </div>
          <p className="fs-help" style={{ marginTop: 12 }}>
            重置会恢复初始的演示内容，保留显示设置。清除会删除这条浏览器的全部演示记录并回到开场页。
          </p>
        </section>

      </div>

      <Dialog
        open={confirming === "reset"}
        title="重置演示数据？"
        onClose={() => setConfirming(null)}
      >
        <p className="fs-body">
          练习记录、支持护照、分享记录、请求和变化确认会恢复到初始演示内容。显示设置会保留。此操作无法撤销。
        </p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setConfirming(null)}>
            取消
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--primary"
            onClick={() => {
              resetDemoData();
              setConfirming(null);
              setMessage("演示数据已重置为初始内容。");
            }}
          >
            确认重置
          </button>
        </div>
      </Dialog>

      <Dialog
        open={confirming === "clear"}
        title="清除这台设备上的演示数据？"
        onClose={() => setConfirming(null)}
      >
        <p className="fs-body">
          这会删除当前浏览器的全部演示记录（练习、护照、分享、请求、变化确认和显示设置），然后回到开场页。其他地方没有副本，无法恢复。
        </p>
        <div className="fs-dialog__actions">
          <button type="button" className="fs-btn fs-btn--secondary" onClick={() => setConfirming(null)}>
            保留数据
          </button>
          <button
            type="button"
            className="fs-btn fs-btn--danger"
            onClick={() => {
              try {
                window.localStorage.removeItem("firstshift.demo.v1");
                window.location.assign("/firstshift");
              } catch {
                setConfirming(null);
                setMessage("浏览器不允许访问本地存储，数据没有变化。");
              }
            }}
          >
            清除并回到开场页
          </button>
        </div>
      </Dialog>
    </div>
  );
}
