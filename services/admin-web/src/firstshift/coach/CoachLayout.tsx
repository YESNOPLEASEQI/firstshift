import { Suspense, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { Icon } from "../components/ui";
import { useDemoStore } from "../store/demoStore";
import { motionAllowed, useNavPulse, usePageIntro, usePressFeedback } from "./motion";
import { useCoachStore } from "./store";
import { CoachDialog } from "./ui";
import "../styles/coach.css";

const NAV = [
  { to: "/firstshift/coach", label: "工作台", icon: "home", end: true },
  { to: "/firstshift/coach/requests", label: "支持请求", icon: "inbox", count: "requests" },
  { to: "/firstshift/coach/tasks", label: "岗位与任务", icon: "briefcase" },
  { to: "/firstshift/coach/editor", label: "指导编辑", icon: "book" },
  { to: "/firstshift/coach/reviews", label: "版本审核", icon: "branch", count: "reviews" },
  { to: "/firstshift/coach/access", label: "授权信息", icon: "idcard" },
] as const;

const SETTING_ROWS = [
  { key: "largeText", title: "更大的文字", description: "把工作台的字号放大，方便阅读。" },
  { key: "highContrast", title: "更高的对比度", description: "加深文字和边框的颜色。" },
  { key: "reducedMotion", title: "减少动效", description: "关闭界面过渡和入场效果。" },
] as const;

function crumbFor(pathname: string): string {
  if (pathname.startsWith("/firstshift/coach/requests")) return "支持请求";
  if (pathname.startsWith("/firstshift/coach/tasks")) return "岗位与任务";
  if (pathname.startsWith("/firstshift/coach/editor")) return "指导编辑";
  if (pathname.startsWith("/firstshift/coach/reviews/")) return "变更审核";
  if (pathname.startsWith("/firstshift/coach/reviews")) return "版本审核";
  if (pathname.startsWith("/firstshift/coach/access")) return "授权信息";
  return "工作台";
}

export default function CoachLayout() {
  const location = useLocation();
  const settings = useDemoStore((state) => state.settings);
  const setSetting = useDemoStore((state) => state.setSetting);
  const requests = useDemoStore((state) => state.requests);
  const tasks = useCoachStore((state) => state.tasks);
  const versions = tasks.flatMap((task) => task.versions);
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pendingRequests = requests.filter((request) => request.status === "submitted").length;
  const pendingReviews = versions.filter((version) => version.status === "review").length;
  const counts: Record<"requests" | "reviews", number> = {
    requests: pendingRequests,
    reviews: pendingReviews,
  };

  usePageIntro(mainRef, location.pathname);
  useNavPulse(rootRef, location.pathname);
  usePressFeedback(rootRef);

  useEffect(() => {
    const host = rootRef.current;
    if (!host || !menuOpen || !motionAllowed(host)) return;
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const side = host.querySelector<HTMLElement>(".fsc-side");
    const scrim = host.querySelector<HTMLElement>(".fsc-scrim");
    if (side) {
      gsap.fromTo(
        side,
        { xPercent: -100 },
        { xPercent: 0, duration: 0.36, ease: "power3.out", clearProps: "transform" },
      );
    }
    if (scrim) {
      gsap.fromTo(
        scrim,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.24, ease: "power1.out", clearProps: "all" },
      );
    }
  }, [menuOpen]);

  useEffect(() => {
    const host = rootRef.current;
    if (!host || !motionAllowed(host)) return;
    host.querySelectorAll<HTMLElement>(".fsc-nav .c-count").forEach((badge) => {
      gsap.fromTo(
        badge,
        { scale: 0.55, autoAlpha: 0.4 },
        { scale: 1, autoAlpha: 1, duration: 0.42, ease: "back.out(3)", clearProps: "all" },
      );
    });
  }, [pendingRequests, pendingReviews]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMenuOpen(false);
    const heading = mainRef.current?.querySelector<HTMLElement>("h1");
    heading?.focus({ preventScroll: true });
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <div
      ref={rootRef}
      className="fsc"
      data-large-text={settings.largeText}
      data-high-contrast={settings.highContrast}
      data-reduced-motion={settings.reducedMotion}
    >
      <a href="#fsc-main" className="c-skip">
        跳到主要内容
      </a>

      <aside className={`fsc-side${menuOpen ? " open" : ""}`} aria-label="辅导员端导航">
        <Link to="/firstshift/coach" className="fsc-brand" aria-label="岗伴 FirstShift，辅导员端工作台">
          <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
            <path d="M7 34V13a7 7 0 0 1 7-7h20v7H15a1 1 0 0 0-1 1v5h13v7H14v8Z" fill="#235C50" />
            <path d="M20 34v-5h8v-8h6v10a3 3 0 0 1-3 3Z" fill="#E9B950" />
          </svg>
          <span>
            <strong>岗伴</strong>
            <small>FirstShift</small>
          </span>
        </Link>

        <nav className="fsc-nav" aria-label="主导航">
          {NAV.map((item) => {
            const count = "count" in item ? counts[item.count] : 0;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={"end" in item ? item.end : false}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
                {count > 0 && <span className="c-count">{count}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="fsc-sidebottom">
          <button type="button" className="fsc-settingsbtn" onClick={() => setSettingsOpen(true)}>
            <Icon name="settings" size={18} />
            设置
          </button>
          <div className="fsc-profile">
            <span className="fsc-avatar" aria-hidden="true">
              林
            </span>
            <span>
              <b>就业辅导员</b>
              <span>演示模式</span>
            </span>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          className="fsc-scrim"
          aria-label="关闭导航"
          onClick={() => {
            setMenuOpen(false);
            menuButton.current?.focus();
          }}
        />
      )}

      <div className="fsc-main">
        <header className="fsc-top">
          <div className="fsc-crumb">
            <button
              type="button"
              className="fsc-iconbtn fsc-menu"
              ref={menuButton}
              aria-label="打开导航"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Icon name="menu" size={20} />
            </button>
            <span>就业支持</span>
            <span aria-hidden="true">/</span>
            <b>{crumbFor(location.pathname)}</b>
          </div>
          <div className="fsc-topactions">
            <Link to="/firstshift" className="fsc-btn wide">
              <Icon name="external" size={16} />
              本人端预览
            </Link>
            <button
              type="button"
              className="fsc-iconbtn"
              aria-label="字号与显示设置"
              onClick={() => setSettingsOpen(true)}
            >
              <Icon name="settings" size={20} />
            </button>
          </div>
        </header>

        <main id="fsc-main" ref={mainRef} tabIndex={-1}>
          <Suspense fallback={<p className="fsc-page fsc-quiet">正在读取内容…</p>}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <CoachDialog
        open={settingsOpen}
        title="字号与显示"
        onClose={() => setSettingsOpen(false)}
        footer={
          <button type="button" className="fsc-btn" onClick={() => setSettingsOpen(false)}>
            完成
          </button>
        }
      >
        <div style={{ display: "grid", gap: 18 }}>
          {SETTING_ROWS.map((row) => (
            <div key={row.key} style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 13 }}>{row.title}</p>
                <p className="fsc-small fsc-quiet">{row.description}</p>
              </div>
              <div className="seg" role="group" aria-label={row.title}>
                <button
                  type="button"
                  className={settings[row.key] ? "active" : ""}
                  aria-pressed={settings[row.key]}
                  onClick={() => setSetting(row.key, true)}
                >
                  开
                </button>
                <button
                  type="button"
                  className={!settings[row.key] ? "active" : ""}
                  aria-pressed={!settings[row.key]}
                  onClick={() => setSetting(row.key, false)}
                >
                  关
                </button>
              </div>
            </div>
          ))}
        </div>
      </CoachDialog>
    </div>
  );
}
