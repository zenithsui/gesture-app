import { type ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  accent?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className = "", accent, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl overflow-hidden ${onClick ? "cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]" : ""} ${className}`}
      style={{
        background: accent
          ? `linear-gradient(135deg, ${accent}18 0%, rgba(255,255,255,0.04) 100%)`
          : "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
        backdropFilter: "blur(30px) saturate(160%)",
        WebkitBackdropFilter: "blur(30px) saturate(160%)",
        border: `1px solid ${accent ? `${accent}35` : "rgba(255,255,255,0.12)"}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.14)",
      }}
    >
      {children}
    </div>
  );
}
