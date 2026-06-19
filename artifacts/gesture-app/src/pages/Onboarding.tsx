import { useState } from "react";
import GlassCard from "@/components/GlassCard";

interface Props { onStart: () => void; }

const GESTURES = [
  { emoji: "☝️", action: "Pointer" },
  { emoji: "✊", action: "Click" },
  { emoji: "✋", action: "Scroll" },
  { emoji: "✌️", action: "Back" },
  { emoji: "🤏", action: "Home" },
  { emoji: "👈", action: "← Swipe" },
  { emoji: "👉", action: "Swipe →" },
];

const PERMS = [
  { icon: "📷", title: "Camera", desc: "Real-time hand tracking — stays on-device", color: "var(--ios-blue)" },
  { icon: "🔊", title: "Sound", desc: "Gesture confirmation tones", color: "var(--ios-teal)" },
  { icon: "📳", title: "Haptics", desc: "Vibration feedback on each gesture", color: "var(--ios-purple)" },
];

export default function Onboarding({ onStart }: Props) {
  const [pressed, setPressed] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden animate-ios-spring"
      style={{
        background: "radial-gradient(ellipse 120% 80% at 50% -10%, rgba(10,132,255,0.18) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 80% 100%, rgba(90,200,250,0.1) 0%, transparent 50%), #0a0a0c",
      }}>

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, var(--ios-blue) 0%, transparent 70%)", top: "-10%", left: "-20%", filter: "blur(40px)" }} />
        <div className="absolute w-72 h-72 rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, var(--ios-teal) 0%, transparent 70%)", bottom: "10%", right: "-10%", filter: "blur(40px)" }} />
      </div>

      {/* Dynamic Island pill */}
      <div className="flex-shrink-0 pt-12 pb-2">
        <div className="dynamic-island px-5 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--ios-green)", boxShadow: "0 0 6px var(--ios-green)" }} />
          <span className="text-xs text-white font-semibold tracking-tight">On-device · Zero network</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 w-full max-w-sm gap-5">
        {/* Hero icon */}
        <div className="relative">
          <div className="w-28 h-28 rounded-[30%] flex items-center justify-center text-6xl"
            style={{
              background: "linear-gradient(145deg, rgba(10,132,255,0.25) 0%, rgba(90,200,250,0.1) 100%)",
              border: "1px solid rgba(10,132,255,0.35)",
              boxShadow: "0 20px 60px rgba(10,132,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
            ✋
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "var(--ios-green)", boxShadow: "0 0 12px var(--ios-green)" }}>
            <span className="text-sm">✓</span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight" style={{ letterSpacing: "-0.04em" }}>Gesture</h1>
          <p className="text-sm mt-1 font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>Touchless Hand Control</p>
        </div>

        {/* Gesture pills row */}
        <div className="w-full">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2.5 text-center" style={{ color: "rgba(255,255,255,0.3)" }}>7 Gestures</p>
          <div className="grid grid-cols-4 gap-2">
            {GESTURES.map((g) => (
              <GlassCard key={g.action} className="flex flex-col items-center py-2.5 gap-1">
                <span className="text-xl">{g.emoji}</span>
                <span className="text-[10px] text-center font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>{g.action}</span>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="w-full space-y-2">
          {PERMS.map((p) => (
            <GlassCard key={p.title} accent={p.color}>
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${p.color}22`, border: `1px solid ${p.color}30` }}>
                  {p.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{p.title}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{p.desc}</div>
                </div>
                <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: `${p.color}30`, border: `1px solid ${p.color}60` }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 w-full max-w-sm px-5 pb-10">
        <button
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onClick={onStart}
          className="w-full py-4 rounded-2xl text-base font-bold tracking-tight text-white transition-all"
          style={{
            background: "linear-gradient(135deg, var(--ios-blue) 0%, #0066CC 100%)",
            boxShadow: pressed ? "0 4px 20px rgba(10,132,255,0.3)" : "0 8px 30px rgba(10,132,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
            transform: pressed ? "scale(0.97)" : "scale(1)",
          }}>
          Enable Gesture Control
        </button>
        <p className="text-center text-xs mt-3" style={{ color: "rgba(255,255,255,0.25)" }}>
          All processing is on-device · No data leaves your device
        </p>
      </div>
    </div>
  );
}
