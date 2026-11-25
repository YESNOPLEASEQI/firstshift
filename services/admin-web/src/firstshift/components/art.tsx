import heroArt from "../assets/illustrations/hero-workspace.webp";
import jobArt from "../assets/illustrations/job-shelf-work.webp";

interface ArtProps {
  className?: string;
}

export function HeroScene({ className }: ArtProps) {
  return (
    <img
      className={className}
      src={heroArt}
      width={1320}
      height={880}
      alt="插画示意：两位店员在货架前，一人核对检查单，一人把商品放上货架。"
      decoding="async"
      fetchPriority="high"
    />
  );
}

export function JobScene({ className }: ArtProps) {
  return (
    <img
      className={className}
      src={jobArt}
      width={1000}
      height={667}
      alt="插画示意：店员把纸箱放到货架上层，旁边是绿植和待上架商品。"
      loading="lazy"
      decoding="async"
    />
  );
}

export function PackageArt({ kind, className }: { kind: "oats" | "rice"; className?: string }) {
  if (kind === "oats") {
    return (
      <svg viewBox="0 0 64 78" aria-hidden="true" className={className}>
        <rect x="9" y="12" width="46" height="60" rx="4" fill="#e5c98f" stroke="#65776d" strokeWidth="2" />
        <rect x="13" y="5" width="38" height="10" rx="2" fill="#d2b273" stroke="#65776d" strokeWidth="2" />
        <rect x="16" y="26" width="32" height="20" rx="2" fill="#f6f4ee" stroke="#8a9a8c" strokeWidth="1.5" />
        <path d="M20 32h24M20 38h16" stroke="#235c50" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="16" y="52" width="32" height="12" rx="2" fill="#bfd4c7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 78" aria-hidden="true" className={className}>
      <path
        d="M14 8h36l4 6v56a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V14z"
        fill="#f3f1e9"
        stroke="#65776d"
        strokeWidth="2"
      />
      <path d="M14 8h36l4 6H10z" fill="#9fb6ad" stroke="#65776d" strokeWidth="2" />
      <rect x="17" y="26" width="30" height="22" rx="2" fill="#fff" stroke="#8a9a8c" strokeWidth="1.5" />
      <path d="M21 33h22M21 39h14" stroke="#235c50" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M18 58h28" stroke="#c6cdc0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function MiniShelf({ current }: { current: "A2" | "B1" }) {
  const slots: { id: string; label: string }[] = [
    { id: "A1", label: "米" },
    { id: "A2", label: "燕麦片" },
    { id: "B1", label: "备用" },
    { id: "B2", label: "备用" },
  ];
  const updated = slots.map((slot) => {
    if (current === "B1") {
      if (slot.id === "A2") return { ...slot, label: "备用" };
      if (slot.id === "B1") return { ...slot, label: "燕麦片" };
    }
    return slot;
  });

  return (
    <div className="fs-minishelf" aria-hidden="true">
      {updated.map((slot) => (
        <span key={slot.id} data-current={slot.id === current} data-empty={slot.label === "备用"}>
          {slot.id} · {slot.label}
        </span>
      ))}
    </div>
  );
}
