import { type FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Icon, PageHeader, useDocumentTitle } from "../../components/ui";
import { BARRIER_OPTIONS, WISH_OPTIONS } from "../../types";
import { demoContacts, DEMO_USER_NAME } from "../../fixtures/demo";
import { useDemoStore } from "../../store/demoStore";

export default function HelpRequest() {
  useDocumentTitle("请求帮助");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const addRequest = useDemoStore((state) => state.addRequest);

  const preset = params.get("barrier") ?? "";
  const [barrier, setBarrier] = useState(
    BARRIER_OPTIONS.some((option) => option.id === preset) ? preset : "",
  );
  const [wishes, setWishes] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggleWish = (wish: string) =>
    setWishes((current) =>
      current.includes(wish) ? current.filter((item) => item !== wish) : [...current, wish],
    );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const option = BARRIER_OPTIONS.find((item) => item.id === barrier);
    if (!option) {
      setError("请先选择一项最接近你现在遇到的情况。");
      return;
    }
    const result = addRequest({
      barrier: option.id,
      barrierLabel: option.label,
      wishes,
      note: note.trim(),
    });
    if (!result.ok) {
      setError("这台设备暂时无法保存记录（可能是浏览器存储被禁用或空间不足）。请求没有被保存，请稍后再试或直接联系工作人员。");
      return;
    }
    navigate("/firstshift/help/requests?created=1");
  };

  return (
    <div className="fs-stack">
      <PageHeader
        backTo="/firstshift/work"
        backLabel="返回我的工作"
        title="请求帮助"
        titleId="fs-help-title"
      />

      <div className="fs-work-grid">
        <form className="fs-card" onSubmit={handleSubmit} noValidate>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="fs-h3" style={{ marginBottom: 12 }}>
              1. 最接近你现在遇到的情况
            </legend>
            <div className="fs-choicegroup">
              {BARRIER_OPTIONS.map((option) => (
                <label key={option.id} className="fs-choice">
                  <input
                    type="radio"
                    name="barrier"
                    value={option.id}
                    checked={barrier === option.id}
                    onChange={() => {
                      setBarrier(option.id);
                      setError(null);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ border: 0, padding: 0, margin: "24px 0 0" }}>
            <legend className="fs-h3" style={{ marginBottom: 4 }}>
              2. 希望得到怎样的帮助
            </legend>
            <p className="fs-help" style={{ marginBottom: 12 }}>
              可以不选，也可以选多项。
            </p>
            <div className="fs-choicegroup">
              {WISH_OPTIONS.map((wish) => (
                <label key={wish} className="fs-choice">
                  <input
                    type="checkbox"
                    value={wish}
                    checked={wishes.includes(wish)}
                    onChange={() => toggleWish(wish)}
                  />
                  <span>{wish}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="fs-field" style={{ marginTop: 24 }}>
            <label htmlFor="fs-help-note">3. 补充说明（可选）</label>
            <textarea
              id="fs-help-note"
              className="fs-textarea"
              value={note}
              maxLength={300}
              onChange={(event) => setNote(event.target.value)}
              placeholder="例如：我在 B1 货架前不确定下一步，希望有人陪我做一次。"
            />
            <span className="fs-help">不需要写诊断或个人隐私。{note.length}/300</span>
          </div>

          {error && (
            <p className="fs-error" role="alert" style={{ marginTop: 16 }}>
              {error}
            </p>
          )}

          <div className="fs-actions" style={{ marginTop: 20 }}>
            <button type="submit" className="fs-btn fs-btn--primary">
              <Icon name="check" size={20} />
              提交请求
            </button>
            <Link className="fs-btn fs-btn--ghost" to="/firstshift/help/requests">
              查看我的请求
            </Link>
          </div>
          <p className="fs-help" style={{ marginTop: 12 }}>
            这是演示版本：请求只会保存在这台浏览器里，不会发送给任何真实联系人，也不会自动显示为“已解决”。
          </p>
        </form>

        <aside className="fs-stack">
          <section className="fs-card fs-card--soft" aria-labelledby="fs-help-why">
            <h2 className="fs-h3" id="fs-help-why">
              请求说明
            </h2>
            <ul className="fs-list" style={{ marginTop: 10 }}>
              <li>由你决定什么时候提出、什么时候暂停或结束。</li>
              <li>请求里不包含能力评价或测试结果。</li>
              <li>请求内容只包括你在这里写的部分。</li>
              <li>如果你不想继续，可以随时撤回这次请求。</li>
            </ul>
          </section>

          <section className="fs-card" aria-labelledby="fs-help-contacts">
            <h2 className="fs-h3" id="fs-help-contacts">
              协作对象
            </h2>
            <ul className="fs-list" style={{ marginTop: 10 }}>
              {demoContacts.map((contact) => (
                <li key={contact.role}>
                  <strong>{contact.role}</strong>：{contact.name}
                  <span className="fs-caption"> · {contact.note}</span>
                </li>
              ))}
            </ul>
            <p className="fs-caption" style={{ marginTop: 8 }}>
              {DEMO_USER_NAME}的演示请求不会真的通知这些人。
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
