type Screen = "gesture" | "tutorial" | "dictionary" | "settings";

interface Tab {
  id: Screen;
  icon: string;
  label: string;
}

const TABS: Tab[] = [
  { id: "gesture", icon: "✋", label: "Control" },
  { id: "tutorial", icon: "🎓", label: "Tutorial" },
  { id: "dictionary", icon: "📖", label: "Gestures" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

interface Props {
  active: Screen;
  onChange: (s: Screen) => void;
}

export default function IOSTabBar({ active, onChange }: Props) {
  return (
    <div
      className="flex-shrink-0 px-4 pt-2 pb-safe"
      style={{
        background: "rgba(18,18,20,0.85)",
        backdropFilter: "blur(60px) saturate(200%)",
        WebkitBackdropFilter: "blur(60px) saturate(200%)",
        borderTop: "0.5px solid rgba(255,255,255,0.1)",
        paddingBottom: "max(env(safe-area-inset-bottom), 12px)",
      }}
    >
      <div className="flex items-center justify-around">
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-1 min-w-[60px] py-1 transition-all active:scale-90"
              style={{ color: isActive ? "var(--ios-blue)" : "rgba(255,255,255,0.4)" }}
            >
              <div className="relative">
                {isActive && (
                  <div
                    className="absolute inset-0 rounded-xl -m-1.5"
                    style={{ background: "rgba(10, 132, 255, 0.18)" }}
                  />
                )}
                <span className="relative text-2xl" style={{ filter: isActive ? "none" : "grayscale(0.5)" }}>
                  {tab.icon}
                </span>
              </div>
              <span
                className="text-[10px] font-medium tracking-tight"
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
