/* eslint-disable react-refresh/only-export-components */
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { motionAllowed, shake } from "./motion";
import { useCoachStore, pickTask, type CoachVersionStatus } from "./store";
import { Icon, useDocumentTitle } from "../components/ui";

export { useDocumentTitle };

export function CoachHeading({
  title,
  titleId,
  aside,
}: {
  title: string;
  titleId: string;
  aside?: ReactNode;
}) {
  return (
    <header className="fsc-heading">
      <h1 id={titleId} tabIndex={-1}>
        {title}
      </h1>
      {aside}
    </header>
  );
}

const VERSION_LABELS: Record<CoachVersionStatus, { label: string; tone: "green" | "amber" | "red" | "" }> = {
  draft: { label: "草稿", tone: "" },
  review: { label: "待审核", tone: "amber" },
  published: { label: "已发布", tone: "green" },
  superseded: { label: "历史版本", tone: "" },
};

export function VersionPill({ status }: { status: CoachVersionStatus }) {
  const meta = VERSION_LABELS[status];
  return <span className={`fsc-pill ${meta.tone}`}>{meta.label}</span>;
}

export function stateLabel(status: string): { label: string; tone: string } {
  switch (status) {
    case "submitted":
      return { label: "待确认", tone: "amber" };
    case "confirmed":
      return { label: "已确认", tone: "green" };
    case "prepared":
      return { label: "待本人复核", tone: "amber" };
    case "done":
      return { label: "已完成", tone: "green" };
    case "adjust":
      return { label: "仍需调整", tone: "amber" };
    case "withdrawn":
      return { label: "已撤回", tone: "" };
    default:
      return { label: "未知状态", tone: "" };
  }
}

interface CoachDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
}

export function CoachDialog({ open, title, children, footer, onClose, wide = false }: CoachDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);
  const closeToken = useRef(0);
  const titleId = useId();
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open) {
      closeToken.current += 1;
      lastActive.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!element.open) element.showModal();
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const token = ++closeToken.current;
    const panel = element.querySelector<HTMLElement>(":scope > div");
    const finish = () => {
      if (closeToken.current !== token) return;
      if (element.open) element.close();
      setMounted(false);
      lastActive.current?.focus();
    };
    if (panel && motionAllowed(element)) {
      gsap.to(panel, {
        autoAlpha: 0,
        y: 8,
        scale: 0.985,
        duration: 0.16,
        ease: "power2.in",
        onComplete: finish,
      });
    } else {
      finish();
    }
  }, [open, mounted]);

  useEffect(() => {
    const element = ref.current;
    if (!element || !open || !mounted) return;
    const preferred = element.querySelector<HTMLElement>("[data-autofocus]");
    const focusable =
      preferred ??
      element.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
    focusable?.focus({ preventScroll: true });
    const panel = element.querySelector<HTMLElement>(":scope > div");
    if (panel && motionAllowed(element)) {
      gsap.fromTo(
        panel,
        { y: 16, scale: 0.97, autoAlpha: 0 },
        { y: 0, scale: 1, autoAlpha: 1, duration: 0.38, ease: "power3.out", clearProps: "all" },
      );
    }
  }, [open, mounted]);

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
    <dialog
      ref={ref}
      className="fsc-dialog"
      aria-labelledby={titleId}
      style={wide ? { maxWidth: 640 } : undefined}
    >
      {mounted && (
        <div>
          <div className="body">
            <h2 id={titleId}>{title}</h2>
            {children}
          </div>
          {footer && <div className="footer">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export function ErrorList({ errors, id }: { errors: string[]; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (errors.length > 0) shake(ref.current);
  }, [errors]);
  if (errors.length === 0) return null;
  return (
    <div className="fsc-callout red" id={id} role="alert" ref={ref}>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !motionAllowed(el)) return;
    gsap.fromTo(
      el,
      { y: 16, autoAlpha: 0, scale: 0.97 },
      { y: 0, autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out", clearProps: "all" },
    );
  }, []);
  return (
    <p ref={ref} className="fsc-toast" role="status" aria-live="polite">
      {message}
    </p>
  );
}

export function useCoachToast() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);
  const node = message ? <Toast key={message} message={message} /> : null;
  return { message, setMessage, node };
}

export function StatusIcon({ name }: { name: "inbox" | "branch" | "clock" }) {
  return <Icon name={name} size={18} />;
}

export function useActiveTask() {
  return useCoachStore(pickTask);
}
