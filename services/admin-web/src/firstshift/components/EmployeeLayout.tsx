import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDemoStore } from "../store/demoStore";
import { Icon, LoadingState } from "./ui";
import { BrandMark, EmployeeChromeContext } from "./v3";
import "../styles/firstshift.css";
import "../styles/employee-v3.css";

type TabKey = "home" | "practice" | "work" | "settings";

interface ScreenMeta {
  tab?: TabKey;
  title: string;
  back?: string;
  main: boolean;
}

const TABS: { key: TabKey; to: string; label: string; icon: "home" | "list" | "briefcase" | "settings" }[] = [
  { key: "home", to: "/firstshift", label: "首页", icon: "home" },
  { key: "practice", to: "/firstshift/practice", label: "练习", icon: "list" },
  { key: "work", to: "/firstshift/work", label: "我的工作", icon: "briefcase" },
  { key: "settings", to: "/firstshift/settings", label: "设置", icon: "settings" },
];

function screenFor(pathname: string): ScreenMeta {
  if (pathname === "/firstshift" || pathname === "/firstshift/") {
    return { tab: "home", title: "首页", main: true };
  }
  if (pathname === "/firstshift/practice") return { tab: "practice", title: "练习", main: true };
  if (pathname === "/firstshift/work") return { tab: "work", title: "我的工作", main: true };
  if (pathname === "/firstshift/settings") return { tab: "settings", title: "设置", main: true };

  if (pathname === "/firstshift/jobs") return { title: "看看工作", back: "/firstshift", main: false };
  if (pathname.startsWith("/firstshift/jobs/")) {
    return { title: "超市理货员", back: "/firstshift/jobs", main: false };
  }
  if (pathname === "/firstshift/practice/new") {
    return { title: "工作尝试模拟", back: "/firstshift/practice", main: false };
  }
  if (pathname.startsWith("/firstshift/practice/new/")) {
    return { title: "整理货架", back: "/firstshift/practice/new", main: false };
  }
  if (pathname.endsWith("/feedback")) {
    return { title: "练习记录", back: "/firstshift/practice", main: false };
  }
  if (pathname.startsWith("/firstshift/practice/")) {
    return { title: "整理货架", back: "/firstshift/practice", main: false };
  }
  if (pathname === "/firstshift/passport") {
    return { title: "我的支持", back: "/firstshift", main: false };
  }
  if (pathname === "/firstshift/passport/edit") {
    return { title: "编辑我的支持", back: "/firstshift/passport", main: false };
  }
  if (pathname === "/firstshift/passport/share") {
    return { title: "选择分享内容", back: "/firstshift/passport", main: false };
  }
  if (pathname === "/firstshift/passport/share/preview") {
    return { title: "分享预览", back: "/firstshift/passport/share", main: false };
  }
  if (pathname === "/firstshift/passport/share/history") {
    return { title: "分享记录", back: "/firstshift/passport", main: false };
  }
  if (pathname === "/firstshift/work/guides") {
    return { title: "工作指导", back: "/firstshift/work", main: false };
  }
  if (pathname === "/firstshift/work/changes") {
    return { title: "工作变化", back: "/firstshift/work", main: false };
  }
  if (pathname.startsWith("/firstshift/work/changes/")) {
    return { title: "货架位置变了", back: "/firstshift/work/changes", main: false };
  }
  if (pathname === "/firstshift/work/contacts") {
    return { title: "工作联系人", back: "/firstshift/work", main: false };
  }
  if (pathname.startsWith("/firstshift/work/contacts/")) {
    return { title: "工作联系人", back: "/firstshift/work/contacts", main: false };
  }
  if (pathname.startsWith("/firstshift/work/")) {
    return { title: "整理货架", back: "/firstshift/work/guides", main: false };
  }
  if (pathname === "/firstshift/help/requests") {
    return { title: "我的求助", back: "/firstshift", main: false };
  }
  if (pathname.startsWith("/firstshift/help/requests/")) {
    return { title: "求助详情", back: "/firstshift/help/requests", main: false };
  }
  if (pathname === "/firstshift/help/request") {
    return { title: "提出求助", back: "/firstshift/help/requests", main: false };
  }
  if (pathname === "/firstshift/settings/font") {
    return { title: "文字大小", back: "/firstshift/settings", main: false };
  }
  if (pathname === "/firstshift/settings/help") {
    return { title: "使用帮助", back: "/firstshift/settings", main: false };
  }
  if (pathname === "/firstshift/settings/privacy") {
    return { title: "隐私与分享", back: "/firstshift/settings", main: false };
  }
  if (pathname === "/firstshift/settings/data") {
    return { title: "我的数据", back: "/firstshift/settings", main: false };
  }
  if (pathname === "/firstshift/settings/data/clear") {
    return { title: "清除本地数据", back: "/firstshift/settings/data", main: false };
  }
  if (pathname === "/firstshift/settings/about") {
    return { title: "关于岗伴", back: "/firstshift/settings", main: false };
  }
  return { title: "页面不存在", back: "/firstshift", main: false };
}

export default function EmployeeLayout() {
  const settings = useDemoStore((state) => state.settings);
  const readChangeIds = useDemoStore((state) => state.readChangeIds);
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [titleOverride, setTitleOverride] = useState<string | null>(null);

  const meta = useMemo(() => screenFor(location.pathname), [location.pathname]);
  const title = titleOverride ?? meta.title;
  const hasUnreadChange = !readChangeIds.includes("chg-1");

  useEffect(() => {
    setTitleOverride(null);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
    headingRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  const chrome = useMemo(() => ({ setTitle: setTitleOverride }), []);

  function goBack() {
    if (location.key !== "default") {
      navigate(-1);
    } else if (meta.back) {
      navigate(meta.back);
    } else {
      navigate("/firstshift");
    }
  }

  return (
    <EmployeeChromeContext.Provider value={chrome}>
      <div
        className="firstshift"
        data-font-scale={settings.fontScale}
        data-large-text={settings.fontScale !== "standard"}
      >
        <a href="#fs-main" className="fs-skip">
          跳到主要内容
        </a>
        <header className="v3-topbar">
          <div className="v3-topbar__inner">
            {meta.main ? (
              meta.tab === "home" ? (
                <Link to="/firstshift" className="v3-brand" aria-label="岗伴 FirstShift，回到首页">
                  <BrandMark />
                  <span className="v3-brand__name">岗伴</span>
                </Link>
              ) : (
                <h1 className="v3-topbar__title" ref={headingRef} tabIndex={-1}>
                  {title}
                </h1>
              )
            ) : (
              <>
                <button type="button" className="v3-back" onClick={goBack} aria-label="返回">
                  <Icon name="back" size={26} />
                </button>
                <h1 className="v3-topbar__title" ref={headingRef} tabIndex={-1}>
                  {title}
                </h1>
              </>
            )}
            {meta.main && meta.tab !== "settings" && (
              <Link to="/firstshift/settings/help" className="v3-help" aria-label="使用帮助">
                <Icon name="help" size={22} />
                <span>使用帮助</span>
              </Link>
            )}
            {meta.main && meta.tab === "home" && (
              <h1 className="v3-sr" ref={headingRef} tabIndex={-1}>
                首页
              </h1>
            )}
          </div>
        </header>

        <main id="fs-main" className={`v3-main${meta.main ? " v3-main--tabbed" : ""}`} ref={mainRef} tabIndex={-1}>
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>

        {meta.main && (
          <nav className="v3-tabbar" aria-label="主导航">
            <div className="v3-tabbar__inner">
              {TABS.map((tab) => {
                const active = meta.tab === tab.key;
                const showDot = tab.key === "work" && hasUnreadChange;
                return (
                  <Link
                    key={tab.key}
                    to={tab.to}
                    className="v3-tab"
                    aria-current={active ? "page" : undefined}
                    aria-label={
                      showDot ? `${tab.label}，有未读工作变化` : tab.label
                    }
                  >
                    <span className="v3-tab__icon">
                      <Icon name={tab.icon} size={26} />
                      {showDot && <span className="v3-dot v3-dot--tab" aria-hidden="true" />}
                    </span>
                    <span className="v3-tab__label">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </EmployeeChromeContext.Provider>
  );
}
