/* eslint-disable react-refresh/only-export-components */
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export function motionAllowed(scope?: Element | null): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const holder = scope?.closest?.("[data-reduced-motion]") ?? document.querySelector(".fsc");
  return holder?.getAttribute("data-reduced-motion") !== "true";
}

export function usePageIntro(hostRef: RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let ctx: gsap.Context | null = null;
    let observer: MutationObserver | null = null;

    const run = (): boolean => {
      const page = host.querySelector<HTMLElement>(".fsc-page, .fsc-editorpage");
      if (!page || !page.querySelector("h1")) return false;
      if (!motionAllowed(page)) return true;
      ctx = gsap.context(() => {
        const marked = Array.from(page.querySelectorAll<HTMLElement>("[data-reveal]"));
        const fallback = Array.from(page.children).filter(
          (el): el is HTMLElement => el instanceof HTMLElement,
        );
        const targets = (marked.length > 0 ? marked : fallback).slice(0, 24);
        if (targets.length > 0) {
          gsap.fromTo(
            targets,
            { y: 20, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.52,
              ease: "power3.out",
              stagger: 0.055,
              clearProps: "transform,opacity,visibility",
            },
          );
        }
        const heading = page.querySelector<HTMLElement>("h1");
        if (heading && !targets.includes(heading)) {
          gsap.fromTo(
            heading,
            { y: 10, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.4, ease: "power2.out", clearProps: "all" },
          );
        }
      }, page);
      return true;
    };

    if (run()) return () => ctx?.revert();

    // Lazy pages mount after the route change, so wait for real content.
    observer = new MutationObserver(() => {
      if (run()) {
        observer?.disconnect();
        observer = null;
      }
    });
    observer.observe(host, { childList: true, subtree: true });
    return () => {
      observer?.disconnect();
      ctx?.revert();
    };
  }, [hostRef, key]);
}

const PRESSABLE =
  "button:not(:disabled), .fsc-btn, .fsc-rowlink, .fsc-record, .fsc-step, .fsc-metric";

export function usePressFeedback(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const host = rootRef.current;
    if (!host) return;
    let current: HTMLElement | null = null;

    const down = (event: PointerEvent) => {
      if (event.button !== 0 || !motionAllowed(host)) return;
      const target = event.target as Element | null;
      const el = target?.closest<HTMLElement>(PRESSABLE);
      if (!el || el.matches(":disabled")) return;
      current = el;
      gsap.to(el, { scale: 0.965, duration: 0.12, ease: "power2.out", overwrite: "auto" });
    };

    const release = () => {
      if (!current) return;
      const el = current;
      current = null;
      gsap.to(el, {
        scale: 1,
        duration: 0.36,
        ease: "back.out(2.4)",
        overwrite: "auto",
        clearProps: "transform",
      });
    };

    // Checkbox rows get a small nudge so each toggle feels answered.
    const changed = (event: Event) => {
      if (!motionAllowed(host)) return;
      const input = (event.target as Element | null)?.closest<HTMLInputElement>(
        "input[type='checkbox']",
      );
      if (!input) return;
      const label = input.closest("label") ?? input;
      gsap.fromTo(
        label,
        { x: input.checked ? 4 : -4 },
        { x: 0, duration: 0.32, ease: "power2.out", clearProps: "transform" },
      );
    };

    host.addEventListener("pointerdown", down);
    host.addEventListener("change", changed);
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("change", changed);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [rootRef]);
}

export function useNavPulse(rootRef: RefObject<HTMLElement | null>, key: string) {
  useEffect(() => {
    const host = rootRef.current;
    if (!host || !motionAllowed(host)) return;
    const active = host.querySelector<HTMLElement>(
      ".fsc-nav a.active, .fsc-nav a[aria-current='page']",
    );
    if (!active) return;
    const icon = active.querySelector("svg");
    gsap.fromTo(
      active,
      { x: -6, autoAlpha: 0.7 },
      { x: 0, autoAlpha: 1, duration: 0.4, ease: "power3.out", clearProps: "transform,opacity,visibility" },
    );
    if (icon) {
      gsap.fromTo(
        icon,
        { rotate: -14, scale: 0.75 },
        { rotate: 0, scale: 1, duration: 0.5, ease: "back.out(2.6)", clearProps: "all" },
      );
    }
  }, [rootRef, key]);
}

export function useSoftSwap(ref: RefObject<HTMLElement | null>, key: string | number) {
  const previous = useRef(key);
  useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    const el = ref.current;
    if (!el || !motionAllowed(el)) return;
    gsap.fromTo(
      el,
      { autoAlpha: 0.55, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out", clearProps: "all" },
    );
  }, [ref, key]);
}

export function reorderWithFlip(host: HTMLElement | null, apply: () => void) {
  if (!host || !motionAllowed(host)) {
    apply();
    return;
  }
  const state = Flip.getState(Array.from(host.children));
  apply();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.5,
        ease: "power3.inOut",
        absolute: true,
        nested: true,
        clearProps: "all",
      });
    });
  });
}

export function shake(el: Element | null) {
  if (!el || !motionAllowed(el)) return;
  gsap.fromTo(
    el,
    { x: -8 },
    { x: 0, duration: 0.5, ease: "elastic.out(1, 0.32)", clearProps: "transform" },
  );
}

export function celebrate(origin?: Element | null) {
  if (typeof document === "undefined") return;
  const scope = document.querySelector(".fsc");
  if (!scope || !motionAllowed(scope)) return;

  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + Math.min(rect.height / 2, 160) : window.innerHeight / 3;
  const layer = document.createElement("div");
  layer.className = "fsc-burst";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  const colors = ["#235C50", "#E9B950", "#8FB9A8", "#F3D9A4"];
  for (let index = 0; index < 16; index += 1) {
    const dot = document.createElement("span");
    dot.style.background = colors[index % colors.length];
    layer.appendChild(dot);
    const angle = (Math.PI * 2 * index) / 16 + Math.random() * 0.4;
    const distance = 34 + Math.random() * 54;
    gsap.set(dot, { x, y, scale: 0.6 + Math.random() * 0.5 });
    gsap.to(dot, {
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance + 20,
      autoAlpha: 0,
      scale: 0.2,
      duration: 0.7 + Math.random() * 0.3,
      ease: "power3.out",
      onComplete: () => dot.remove(),
    });
  }
  window.setTimeout(() => layer.remove(), 1300);
}

export function Count({ value }: { value: number }) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!motionAllowed(el)) {
      el.textContent = String(value);
      return;
    }
    const state = { n: 0 };
    const tween = gsap.to(state, {
      n: value,
      duration: 0.8,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(state.n));
      },
      onComplete: () => {
        el.textContent = String(value);
      },
    });
    return () => {
      tween.kill();
    };
  }, [value]);
  return <strong ref={ref}>{value}</strong>;
}
