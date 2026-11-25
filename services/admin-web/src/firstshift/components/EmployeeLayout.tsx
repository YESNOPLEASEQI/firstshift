import { Suspense, useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useDemoStore } from "../store/demoStore";
import { Icon, LoadingState } from "./ui";
import "../styles/firstshift.css";

export default function EmployeeLayout() {
  const settings = useDemoStore((state) => state.settings);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const heading = mainRef.current?.querySelector<HTMLElement>("h1");
    heading?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div
      className="firstshift"
      data-large-text={settings.largeText}
      data-high-contrast={settings.highContrast}
      data-reduced-motion={settings.reducedMotion}
    >
      <a href="#fs-main" className="fs-skip">
        跳到主要内容
      </a>
      <p className="fs-demo-strip" role="note">
        演示版本：岗位、任务与联系人都是虚构的合成数据，只保存在这台设备。
      </p>
      <header className="fs-topbar">
        <div className="fs-topbar__inner">
          <Link to="/firstshift" className="fs-brand" aria-label="岗伴 FirstShift，回到首页">
            <span className="fs-brand__mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" focusable="false">
                <path
                  d="M7 34V13a7 7 0 0 1 7-7h20v7H15a1 1 0 0 0-1 1v5h13v7H14v8Z"
                  fill="#235C50"
                />
                <path d="M20 34v-5h8v-8h6v10a3 3 0 0 1-3 3Z" fill="#E9B950" />
              </svg>
            </span>
            <span className="fs-brand__zh">岗伴</span>
            <span className="fs-brand__en">FirstShift</span>
          </Link>
          <nav className="fs-nav" aria-label="主导航">
            <Link className="fs-nav__link" to="/firstshift/settings" aria-label="字号与显示">
              <Icon name="settings" size={20} />
              <span className="fs-nav__text">字号与显示</span>
            </Link>
            <Link className="fs-nav__link" to="/firstshift/settings#help" aria-label="使用帮助">
              <Icon name="help" size={20} />
              <span className="fs-nav__text">使用帮助</span>
            </Link>
            <Link className="fs-nav__link" to="/firstshift/work" aria-label="我的工作">
              <Icon name="work" size={20} />
              <span className="fs-nav__text">我的工作</span>
            </Link>
          </nav>
        </div>
      </header>
      <main id="fs-main" className="fs-main" ref={mainRef} tabIndex={-1}>
        <Suspense fallback={<LoadingState />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="fs-footer">
        <div className="fs-footer__inner">
          <span>岗伴 FirstShift · 融合就业支持演示</span>
          <span>合成数据 · 无真实通知 · 无跨端同步</span>
          <span className="fs-footer__spacer" />
        </div>
      </footer>
    </div>
  );
}
