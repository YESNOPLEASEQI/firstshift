import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  HelpRequest,
  PassportItem,
  RequestStatus,
  Session,
  SessionAction,
  Settings,
  ShareConfig,
} from "../types";
import { demoRequest, initialPassportItems, scenarioV1, scenarioV2 } from "../fixtures/demo";
import { reduceSession, startSession } from "../simulation/model";

export type PracticeVersion = "v1" | "v2";

export interface PracticeRecord {
  scenarioVersion: PracticeVersion;
  session: Session;
  updatedAt: string;
}

interface DemoState {
  settings: Settings;
  practice: PracticeRecord | null;
  passportItems: PassportItem[];
  passportUpdatedAt: string | null;
  lastShare: ShareConfig | null;
  requests: HelpRequest[];
  changeDecision: "understood" | "not-applicable" | null;

  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  startPractice: (version: PracticeVersion, restart?: boolean) => void;
  dispatchPractice: (action: SessionAction) => Session | null;
  saveFeedbackItems: (items: Omit<PassportItem, "id">[]) => { ok: boolean };
  replacePassportItems: (items: PassportItem[]) => { ok: boolean };
  deletePassportItem: (id: string) => { ok: boolean };
  recordShare: (config: ShareConfig) => { ok: boolean };
  addRequest: (request: Omit<HelpRequest, "id" | "createdAt" | "status" | "timeline">) => {
    ok: boolean;
    id?: string;
  };
  setRequestStatus: (id: string, status: RequestStatus, note?: string) => void;
  acknowledgeChange: (decision: "understood" | "not-applicable") => void;
  resetDemoData: () => void;
}

function nowLabel(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function storageAvailable(): boolean {
  try {
    const probe = "firstshift.storage-probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const freshRequests = (): HelpRequest[] => [
  { ...demoRequest, timeline: demoRequest.timeline.map((event) => ({ ...event })) },
];

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      settings: { largeText: false, highContrast: false, reducedMotion: false },
      practice: null,
      passportItems: initialPassportItems.map((item) => ({ ...item })),
      passportUpdatedAt: null,
      lastShare: null,
      requests: freshRequests(),
      changeDecision: null,

      setSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),

      startPractice: (version, restart = false) => {
        const existing = get().practice;
        const canResume =
          existing &&
          existing.scenarioVersion === version &&
          existing.session.status !== "ended" &&
          !restart;
        if (canResume) {
          const resumed = reduceSession(
            existing.session,
            { type: "resume" },
            version === "v1" ? scenarioV1 : scenarioV2,
          );
          set({
            practice: { ...existing, session: resumed, updatedAt: nowLabel() },
          });
          return;
        }
        const scenario = version === "v1" ? scenarioV1 : scenarioV2;
        set({
          practice: {
            scenarioVersion: version,
            session: startSession(scenario),
            updatedAt: nowLabel(),
          },
        });
      },

      dispatchPractice: (action) => {
        const record = get().practice;
        if (!record) return null;
        const scenario = record.scenarioVersion === "v1" ? scenarioV1 : scenarioV2;
        const session = reduceSession(record.session, action, scenario);
        set({
          practice: { ...record, session, updatedAt: nowLabel() },
        });
        return session;
      },

      saveFeedbackItems: (items) => {
        if (!storageAvailable()) return { ok: false };
        const existing = get().passportItems;
        const additions = items
          .filter((item) => !existing.some((entry) => entry.value === item.value))
          .map((item, index) => ({ ...item, id: `p-${Date.now()}-${index}` }));
        set({
          passportItems: [...existing, ...additions],
          passportUpdatedAt: nowLabel(),
        });
        return { ok: true };
      },

      replacePassportItems: (items) => {
        if (!storageAvailable()) return { ok: false };
        set({ passportItems: items, passportUpdatedAt: nowLabel() });
        return { ok: true };
      },

      deletePassportItem: (id) => {
        if (!storageAvailable()) return { ok: false };
        set({
          passportItems: get().passportItems.filter((item) => item.id !== id),
          passportUpdatedAt: nowLabel(),
        });
        return { ok: true };
      },

      recordShare: (config) => {
        if (!storageAvailable()) return { ok: false };
        set({ lastShare: config });
        return { ok: true };
      },

      addRequest: (request) => {
        if (!storageAvailable()) return { ok: false };
        const id = `req-${Date.now()}`;
        const createdAt = nowLabel();
        const next: HelpRequest = {
          ...request,
          id,
          createdAt,
          status: "submitted",
          timeline: [{ at: createdAt, label: "我提出了请求" }],
        };
        set({ requests: [next, ...get().requests] });
        return { ok: true, id };
      },

      setRequestStatus: (id, status, note) => {
        const labels: Record<RequestStatus, string> = {
          submitted: "我提出了请求",
          confirmed: "责任方已确认",
          prepared: "支持已准备，等待你复核",
          done: "我已确认有帮助",
          adjust: "我提出了异议，仍需调整",
          withdrawn: "我撤回了请求",
        };
        set({
          requests: get().requests.map((request) =>
            request.id === id
              ? {
                  ...request,
                  status,
                  timeline: [
                    ...request.timeline,
                    { at: nowLabel(), label: labels[status], note },
                  ],
                }
              : request,
          ),
        });
      },

      acknowledgeChange: (decision) => set({ changeDecision: decision }),

      resetDemoData: () =>
        set({
          practice: null,
          passportItems: initialPassportItems.map((item) => ({ ...item })),
          passportUpdatedAt: null,
          lastShare: null,
          requests: freshRequests(),
          changeDecision: null,
        }),
    }),
    {
      name: "firstshift.demo.v1",
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        settings: state.settings,
        practice: state.practice,
        passportItems: state.passportItems,
        passportUpdatedAt: state.passportUpdatedAt,
        lastShare: state.lastShare,
        requests: state.requests,
        changeDecision: state.changeDecision,
      }),
    },
  ),
);

export const isResumable = (record: PracticeRecord | null): boolean =>
  Boolean(record && record.session.status !== "ended");
