import GlassCard from "@/components/GlassCard";

interface Props { active: boolean; }

const GESTURES = [
  {
    emoji: "☝️", name: "Pointer Move", color: "var(--ios-blue)",
    trigger: "Index finger up, others curled",
    action: "Controls the on-screen pointer in all directions",
    detail: "Tracks landmark[8] (INDEX_FINGER_TIP) with exponential smoothing α=0.3. Mirror mode inverts X axis. Move smoothly — jitter is dampened automatically.",
  },
  {
    emoji: "✊", name: "Click / Tap", color: "var(--ios-purple)",
    trigger: "Close hand into a fist",
    action: "LEFT CLICK / TAP at current pointer position",
    detail: "All 5 fingertips drop below PIP joints. Fires on closing motion. 400ms cooldown prevents accidental double-clicks. Haptics fire a 40ms pulse.",
  },
  {
    emoji: "✋", name: "Scroll", color: "var(--ios-green)",
    trigger: "Open palm, all fingers extended",
    action: "Scroll content up or down",
    detail: "All fingers extended with wrist pitch detection. Tilt UP = scroll up, DOWN = scroll down. ±10° dead zone at neutral to prevent drift.",
  },
  {
    emoji: "✌️", name: "Go Back", color: "var(--ios-orange)",
    trigger: "Peace sign — index + middle up",
    action: "ESC / Navigate back / Previous step",
    detail: "Index[8] and middle[12] extended, ring and pinky curled. Quick flash (<300ms) = single BACK. Hold 600ms = root/home. Orange ripple flash on activation.",
  },
  {
    emoji: "🤏", name: "Go Home", color: "var(--ios-yellow)",
    trigger: "Pinch — thumb touches index tip",
    action: "Home — returns to main screen",
    detail: "dist(landmark[4], landmark[8]) < 0.06 threshold. Quick pinch = HOME. Hold >600ms = App Switcher. Glowing arc animation sweeps up from bottom.",
  },
  {
    emoji: "👈", name: "Swipe Left", color: "#F4594B",
    trigger: "Open palm sweeping right → left",
    action: "Navigate back / previous slide",
    detail: "Tracks wrist X-position across 500ms window. Fires when delta exceeds 0.18 screen width. 600ms cooldown after trigger. Curved trail renders on canvas.",
  },
  {
    emoji: "👉", name: "Swipe Right", color: "var(--ios-green)",
    trigger: "Open palm sweeping left → right",
    action: "Navigate forward / next slide",
    detail: "Same detection as Swipe Left but positive delta direction. Curved right trail on screen with directional arrow. 600ms cooldown.",
  },
];

export default function Dictionary({ active }: Props) {
  if (!active) return null;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-slide-up">
      <div className="px-5 pt-12 pb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>Gestures</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>MediaPipe · 21 landmarks · On-device ML</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {GESTURES.map((g) => (
          <GlassCard key={g.name} accent={g.color} className="overflow-hidden">
            <div className="px-4 py-4 flex gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: `${g.color}15`,
                  border: `1px solid ${g.color}35`,
                  boxShadow: `0 4px 16px ${g.color}15`,
                }}>
                {g.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-white text-[15px] leading-tight">{g.name}</h3>
                </div>
                <div className="inline-flex items-center gap-1 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${g.color}18`, color: g.color, border: `1px solid ${g.color}30` }}>
                    {g.trigger}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-1.5" style={{ color: g.color }}>→ {g.action}</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{g.detail}</p>
              </div>
            </div>
          </GlassCard>
        ))}

        <GlassCard accent="var(--ios-teal)">
          <div className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>ML Stack</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["Engine", "MediaPipe Hands"],
                ["Landmarks", "21 per hand"],
                ["Inference", "WASM + SIMD"],
                ["FPS target", "60 (rVFC sync)"],
                ["Hands", "1 (configurable)"],
                ["Privacy", "Zero network calls"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{k}</div>
                  <div className="text-xs font-semibold text-white">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
