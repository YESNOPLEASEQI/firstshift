import { type ReactNode, useEffect, useId, useRef } from "react";
import { Link } from "react-router-dom";

export type IconName =
  | "arrow"
  | "look"
  | "try"
  | "support"
  | "help"
  | "back"
  | "pause"
  | "play"
  | "check"
  | "undo"
  | "doc"
  | "photo"
  | "example"
  | "settings"
  | "close"
  | "warning"
  | "info"
  | "work"
  | "home"
  | "share"
  | "edit"
  | "trash"
  | "plus"
  | "refresh"
  | "list"
  | "inbox"
  | "briefcase"
  | "book"
  | "branch"
  | "idcard"
  | "chevronRight"
  | "arrowUp"
  | "arrowDown"
  | "grip"
  | "external"
  | "search"
  | "menu"
  | "clock";

const ICON_PATHS: Record<IconName, ReactNode> = {
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  look: (
    <>
      <path d="M3 12s3.3-6 9-6 9 6 9 6-3.3 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  try: (
    <>
      <path d="M4 9h7v11H4zM13 4h7v16h-7M4 14h7m2-5h7" />
      <path d="m5 4 2 2 3-3" />
    </>
  ),
  support: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <circle cx="8.5" cy="10" r="2" />
      <path d="M5.5 16c.4-2 1.5-3 3-3s2.6 1 3 3M14 9h4m-4 4h4m-4 3h3" />
    </>
  ),
  help: (
    <>
      <path d="M20.5 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-3.6-.8L3 21l1.8-5.4A8.5 8.5 0 1 1 20.5 11.5Z" />
      <path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1.2.8-1.5 1.1-1.5 2.3M12 16h.01" />
    </>
  ),
  back: <path d="M20 12H5m6-6-6 6 6 6" />,
  pause: <path d="M9 5v14m6-14v14" />,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  check: <path d="m5 12 4 4 10-10" />,
  undo: <path d="m8 4-5 5 5 5M3 9h10a6 6 0 0 1 0 12h-2" />,
  doc: <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6" />,
  photo: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8" cy="9" r="1.5" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </>
  ),
  example: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m10 8 6 4-6 4V8Z" />
    </>
  ),
  settings: <path d="M4 6h16M4 12h16M4 18h16M9 4v4m6 2v4m-7 2v4" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  warning: <path d="M10.6 4.5a1.6 1.6 0 0 1 2.8 0l7.3 13A1.7 1.7 0 0 1 19.2 20H4.8a1.7 1.7 0 0 1-1.5-2.5zM12 9v4m0 3h.01" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-8h.01" />
    </>
  ),
  work: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V4h8v3M3 12c6 3 12 3 18 0M12 13v2" />
    </>
  ),
  home: <path d="m3 10 9-7 9 7M5 9v11h14V9M10 20v-7h4v7" />,
  share: <path d="M12 15V3m-4 4 4-4 4 4M5 11v9h14v-9" />,
  edit: <path d="m14 5 5 5M4 20l1.3-5.5L16 3.8a2 2 0 0 1 2.8 0l1.4 1.4a2 2 0 0 1 0 2.8L9.5 18.7z" />,
  trash: <path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  refresh: <path d="M20 10a8 8 0 0 0-13.6-5.7L4 7m0-4v4h4M4 14a8 8 0 0 0 13.6 5.7L20 17m-4 0h4v4" />,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  inbox: (
    <>
      <path d="M4 5h16v10H4z" />
      <path d="m4 15 3.5 3.5h9L20 15" />
      <path d="M9 9.5h6" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
    </>
  ),
  book: (
    <>
      <path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z" />
    </>
  ),
  branch: (
    <>
      <path d="M6 4v10a4 4 0 0 0 4 4h8" />
      <path d="m15 15 3 3-3 3M6 8h4a4 4 0 0 1 4 4v2" />
      <circle cx="5" cy="5" r="1.6" />
      <circle cx="5" cy="19" r="1.6" />
    </>
  ),
  idcard: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="1.8" />
      <path d="M5.5 16c.4-1.8 1.5-2.6 3-2.6s2.6.8 3 2.6M14 10h4M14 14h4" />
    </>
  ),
  chevronRight: <path d="m9 5 7 7-7 7" />,
  arrowUp: <path d="M12 19V5m-6 6 6-6 6 6" />,
  arrowDown: <path d="M12 5v14m6-6-6 6-6-6" />,
  grip: (
    <>
      <circle cx="9" cy="6" r="1" />
      <circle cx="15" cy="6" r="1" />
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <circle cx="9" cy="18" r="1" />
      <circle cx="15" cy="18" r="1" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export function Icon({ name, className = "fs-icon", size }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

interface PageHeaderProps {
  title: string;
  backTo?: string;
  backLabel?: string;
  aside?: ReactNode;
  titleId?: string;
}

export function PageHeader({
  title,
  backTo,
  backLabel = "返回",
  aside,
  titleId = "fs-page-title",
}: PageHeaderProps) {
  return (
    <header className="fs-page-head">
      <div>
        {backTo && (
          <Link to={backTo} className="fs-backlink">
            <Icon name="back" size={20} />
            {backLabel}
          </Link>
        )}
        <h1 className="fs-h1" id={titleId} tabIndex={-1}>
          {title}
        </h1>
      </div>
      {aside}
    </header>
  );
}

interface DialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Dialog({ open, title, children, onClose }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open) {
      lastActive.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!element.open) element.showModal();
      const preferred = element.querySelector<HTMLElement>("[data-autofocus]");
      const focusable =
        preferred ??
        element.querySelector<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        );
      focusable?.focus();
    } else if (element.open) {
      element.close();
      lastActive.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    element.addEventListener("cancel", handleCancel);
    return () => element.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog ref={ref} className="fs-dialog" aria-labelledby={titleId}>
      {open && (
        <div className="fs-dialog__body">
          <h2 className="fs-dialog__title" id={titleId}>
            {title}
          </h2>
          {children}
        </div>
      )}
    </dialog>
  );
}

interface StateProps {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: StateProps) {
  return (
    <div className="fs-state">
      <Icon name="list" className="fs-icon fs-icon--lg" />
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ title, children, action }: StateProps) {
  return (
    <div className="fs-state" role="alert">
      <Icon name="warning" className="fs-icon fs-icon--lg" />
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function LoadingState({ label = "正在读取内容…" }: { label?: string }) {
  return (
    <div className="fs-loading" role="status" aria-live="polite">
      <span className="fs-caption">{label}</span>
      <span className="fs-skeleton" />
      <span className="fs-skeleton" style={{ width: "80%" }} />
      <span className="fs-skeleton" style={{ width: "60%" }} />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · 岗伴 FirstShift`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
