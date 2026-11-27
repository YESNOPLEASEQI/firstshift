import { createContext, useContext, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "./ui";

interface ChromeContextValue {
  setTitle: (title: string | null) => void;
}

export const EmployeeChromeContext = createContext<ChromeContextValue>({ setTitle: () => {} });

export function useEmployeeTitle(title: string) {
  const { setTitle } = useContext(EmployeeChromeContext);
  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [setTitle, title]);
}

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M7 34V13a7 7 0 0 1 7-7h20v7H15a1 1 0 0 0-1 1v5h13v7H14v8Z" fill="#235C50" />
      <path d="M20 34v-5h8v-8h6v10a3 3 0 0 1-3 3Z" fill="#E9B950" />
    </svg>
  );
}

export function Group({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="v3-group" role="group" aria-label={label}>
      {children}
    </div>
  );
}

interface RowProps {
  icon: IconName;
  title: string;
  value?: ReactNode;
  to?: string;
  onClick?: () => void;
  unread?: boolean;
  unreadLabel?: string;
  ariaLabel?: string;
}

export function Row({ icon, title, value, to, onClick, unread, unreadLabel, ariaLabel }: RowProps) {
  const content = (
    <>
      <span className="v3-row__icon">
        <Icon name={icon} size={24} />
      </span>
      <span className="v3-row__text">
        {title}
        {unread && <span className="v3-dot" aria-hidden="true" />}
        {unread && unreadLabel && <span className="v3-sr">{unreadLabel}</span>}
      </span>
      {value !== undefined && <span className="v3-row__value">{value}</span>}
      <Icon name="chevronRight" size={20} className="v3-row__chev" />
    </>
  );
  const label = ariaLabel ?? (unread && unreadLabel ? `${title}，${unreadLabel}` : title);

  if (to) {
    return (
      <Link to={to} className="v3-row" aria-label={label}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className="v3-row" onClick={onClick} aria-label={label}>
      {content}
    </button>
  );
}

export function EmptyCard({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="v3-card v3-empty">
      <p>{children}</p>
      {action}
    </div>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return <p className="v3-demo-note">{children}</p>;
}
