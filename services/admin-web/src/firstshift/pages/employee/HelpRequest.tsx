import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDocumentTitle } from "../../components/ui";
import { useEmployeeTitle } from "../../components/v3";
import { BARRIER_OPTIONS, WISH_OPTIONS } from "../../types";
import { useDemoStore } from "../../store/demoStore";

export default function HelpRequest() {
  useDocumentTitle("提出求助");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const addRequest = useDemoStore((state) => state.addRequest);

  const preset = params.get("barrier") ?? "";
  const [barrier, setBarrier] = useState(
    BARRIER_OPTIONS.some((option) => option.id === preset) ? preset : "",
  );
  const [wishes, setWishes] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEmployeeTitle(step === 2 ? "确认求助" : "提出求助");

  const option = BARRIER_OPTIONS.find((entry) => entry.id === barrier);

  const toggleWish = (wish: string) =>
    setWishes((current) =>
      current.includes(wish) ? current.filter((item) => item !== wish) : [...current, wish],
    );

  function submit() {
    if (!option) return;
    const result = addRequest({
      title: option.label,
      barrier: option.id,
      barrierLabel: option.label,
      wishes,
      note: note.trim(),
    });
    if (!result.ok || !result.id) {
      setError("这台设备暂时无法保存记录。请求没有被保存，请稍后再试。");
      return;
    }
    navigate(`/firstshift/help/requests/${result.id}`);
  }

  if (step === 0) {
    return (
      <div className="v3-stack">
        <fieldset className="v3-fieldset v3-fieldset--bare">
          <legend className="v3-share-legend">你遇到了什么困难？</legend>
          <div className="v3-share-list">
            {BARRIER_OPTIONS.map((entry) => (
              <label key={entry.id} className="v3-check">
                <input
                  type="radio"
                  name="help-barrier"
                  checked={barrier === entry.id}
                  onChange={() => {
                    setBarrier(entry.id);
                    setError(null);
                  }}
                />
                <span>{entry.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <p className="fs-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          className="fs-btn fs-btn--primary fs-btn--block"
          onClick={() => {
            if (!barrier) {
              setError("请先选择一项。");
              return;
            }
            setStep(1);
          }}
        >
          继续
        </button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="v3-stack">
        <fieldset className="v3-fieldset v3-fieldset--bare">
          <legend className="v3-share-legend">你希望得到什么帮助？</legend>
          <div className="v3-share-list">
            {WISH_OPTIONS.map((wish) => (
              <label key={wish} className="v3-check">
                <input
                  type="checkbox"
                  checked={wishes.includes(wish)}
                  onChange={() => toggleWish(wish)}
                />
                <span>{wish}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="v3-field">
          <label htmlFor="fs-help-note">补充说明（可不填）</label>
          <textarea
            id="fs-help-note"
            className="fs-textarea"
            value={note}
            maxLength={300}
            onChange={(event) => setNote(event.target.value)}
            placeholder="写下你想说的话"
          />
        </div>

        <div className="v3-actions-stack">
          <button type="button" className="fs-btn fs-btn--primary fs-btn--block" onClick={() => setStep(2)}>
            确认求助
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="v3-stack">
      <section className="v3-card v3-confirm">
        <div className="v3-confirm__row">
          <h2>遇到的困难</h2>
          <p>{option?.label}</p>
        </div>
        <div className="v3-confirm__row">
          <h2>希望得到的帮助</h2>
          {wishes.length > 0 ? (
            <ul>
              {wishes.map((wish) => (
                <li key={wish}>{wish}</li>
              ))}
            </ul>
          ) : (
            <p>没有选择具体方式。</p>
          )}
        </div>
        {note.trim() && (
          <div className="v3-confirm__row">
            <h2>补充说明</h2>
            <p>{note.trim()}</p>
          </div>
        )}
        <p className="v3-demo-note">这是演示版本：请求只保存在这台浏览器里，不会通知真实联系人。</p>

        {error && (
          <p className="fs-error" role="alert">
            {error}
          </p>
        )}

        <div className="v3-actions-stack">
          <button type="button" className="fs-btn fs-btn--primary fs-btn--block" onClick={submit}>
            提交求助
          </button>
          <button type="button" className="fs-btn fs-btn--secondary fs-btn--block" onClick={() => setStep(1)}>
            返回修改
          </button>
        </div>
      </section>
    </div>
  );
}
