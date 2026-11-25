import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSoftSwap } from "../../coach/motion";
import { useDemoStore } from "../../store/demoStore";
import { DEMO_USER_NAME } from "../../fixtures/demo";
import type { HelpRequest } from "../../types";
import { useCoachStore } from "../../coach/store";
import { celebrate } from "../../coach/motion";
import {
  CoachHeading,
  ErrorList,
  stateLabel,
  useCoachToast,
  useDocumentTitle,
} from "../../coach/ui";

const TABS = [
  { key: "all", label: "全部" },
  { key: "pending", label: "待确认" },
  { key: "confirmed", label: "已确认" },
  { key: "prepared", label: "待本人复核" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const RESPONSIBILITIES = ["岗位导师", "门店主管", "就业辅导员", "指导维护员"];

function matchesTab(request: HelpRequest, tab: TabKey): boolean {
  if (tab === "all") return true;
  if (tab === "pending") return request.status === "submitted";
  return request.status === tab;
}

function RequestDetail({ request }: { request: HelpRequest }) {
  const { setMessage, node } = useCoachToast();
  const handling = useCoachStore((state) => state.handling[request.id]);
  const saveHandling = useCoachStore((state) => state.saveHandling);
  const confirmResponsibility = useCoachStore((state) => state.confirmResponsibility);
  const sendToReview = useCoachStore((state) => state.sendToReview);
  const [responsibility, setResponsibility] = useState(handling?.responsibility ?? "");
  const [note, setNote] = useState(handling?.note ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  const persist = (): boolean => {
    const result = saveHandling(request.id, {
      responsibility,
      note,
      updatedAt: handling?.updatedAt ?? null,
    });
    if (!result.ok) {
      setErrors(result.errors);
      return false;
    }
    setErrors([]);
    return true;
  };

  const state = stateLabel(request.status);

  return (
    <div className="fsc-detail">
      <div className="fsc-detailtop">
        <h2>{request.title ?? request.barrierLabel}</h2>
        <span className={`fsc-pill ${state.tone}`}>{state.label}</span>
      </div>

      <dl className="fsc-kv">
        <dt>请求编号</dt>
        <dd>{request.reference ?? request.id}</dd>
        <dt>提出人</dt>
        <dd>{DEMO_USER_NAME}</dd>
        <dt>提出时间</dt>
        <dd>{request.createdAt}</dd>
        <dt>障碍类型</dt>
        <dd>{request.barrierLabel}</dd>
        <dt>希望的支持</dt>
        <dd>{request.wishes.join("；")}</dd>
        <dt>本人补充</dt>
        <dd>{request.note}</dd>
      </dl>

      <div className="fsc-formblock">
        <h3>处理记录</h3>
        <ErrorList errors={errors} />
        <div className="fsc-field">
          <label htmlFor="req-responsibility">责任方</label>
          <select
            id="req-responsibility"
            value={responsibility}
            onChange={(event) => setResponsibility(event.target.value)}
          >
            <option value="">请选择</option>
            {RESPONSIBILITIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="fsc-field">
          <label htmlFor="req-note">处理说明</label>
          <textarea
            id="req-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="例如：岗位导师确认 B1 位置属实，指导需要同步更新。"
          />
        </div>
        {handling?.updatedAt && (
          <p className="fsc-small fsc-quiet" style={{ marginBottom: 14 }}>
            上次保存：{handling.updatedAt}
          </p>
        )}
        <div className="fsc-actions">
          <button
            type="button"
            className="fsc-btn"
            onClick={() => {
              if (persist()) setMessage("处理记录已保存");
            }}
          >
            保存处理记录
          </button>
          <button
            type="button"
            className="fsc-btn"
            disabled={request.status !== "submitted"}
            onClick={() => {
              if (!persist()) return;
              const result = confirmResponsibility(request.id);
              if (result.ok) {
                setMessage("已确认责任方");
                celebrate(document.activeElement);
              } else setErrors(result.errors);
            }}
          >
            确认责任方
          </button>
          <button
            type="button"
            className="fsc-btn primary"
            disabled={request.status !== "confirmed"}
            onClick={() => {
              if (!persist()) return;
              const result = sendToReview(request.id);
              if (result.ok) {
                setMessage("已交本人复核");
                celebrate(document.activeElement);
              } else setErrors(result.errors);
            }}
          >
            交本人复核
          </button>
        </div>
      </div>

      <div className="fsc-formblock">
        <h3>请求进展</h3>
        <div className="fsc-timeline">
          {request.timeline.map((event) => (
            <div className="fsc-event" key={`${event.at}-${event.label}`}>
              <b>{event.label}</b>
              <time>{event.at}</time>
              {event.note && <p>{event.note}</p>}
            </div>
          ))}
        </div>
      </div>

      {node}
    </div>
  );
}

export default function Requests() {
  useDocumentTitle("支持请求 · 辅导员端");
  const requests = useDemoStore((state) => state.requests);
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab");
  const tab: TabKey = TABS.some((entry) => entry.key === rawTab) ? (rawTab as TabKey) : "all";

  const filtered = requests.filter((request) => matchesTab(request, tab));
  const gridRef = useRef<HTMLDivElement>(null);
  useSoftSwap(gridRef, tab);
  const requestedId = params.get("id");
  const selected = filtered.find((request) => request.id === requestedId) ?? filtered[0];

  useEffect(() => {
    if (selected && selected.id !== requestedId) {
      const next = new URLSearchParams(params);
      next.set("id", selected.id);
      setParams(next, { replace: true });
    }
  }, [selected, requestedId, params, setParams]);

  return (
    <div className="fsc-page">
      <CoachHeading title="支持请求" titleId="fsc-requests-title" />

      <div className="fsc-tabs" role="tablist" aria-label="请求筛选">
        {TABS.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={tab === entry.key}
            className={tab === entry.key ? "active" : ""}
            onClick={() => {
              const next = new URLSearchParams();
              if (entry.key !== "all") next.set("tab", entry.key);
              setParams(next, { replace: true });
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="fsc-panel">
          <div className="fsc-empty">
            <p>这个分栏里还没有请求。</p>
          </div>
        </div>
      ) : (
        <div className="fsc-detailgrid" ref={gridRef}>
          <div className="fsc-recordlist" aria-label="请求列表">
            {filtered.map((request) => {
              const state = stateLabel(request.status);
              return (
                <button
                  key={request.id}
                  type="button"
                  className={`fsc-record${selected?.id === request.id ? " active" : ""}`}
                  aria-current={selected?.id === request.id ? "true" : undefined}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set("id", request.id);
                    setParams(next, { replace: true });
                  }}
                >
                  <span className="between">
                    <b>{request.title ?? request.barrierLabel}</b>
                    <span className={`fsc-pill ${state.tone}`}>{state.label}</span>
                  </span>
                  <span className="fsc-small fsc-quiet">
                    {request.reference ?? request.id} · {DEMO_USER_NAME} · {request.createdAt}
                  </span>
                </button>
              );
            })}
          </div>
          {selected && <RequestDetail key={selected.id} request={selected} />}
        </div>
      )}
    </div>
  );
}
