import { useState } from "react";
import { useHandTracker } from "@/hooks/useHandTracker";
import GlassCard from "@/components/GlassCard";
import type { GestureType } from "@/lib/gestures";

interface Props { active: boolean; }

const STEPS = [
  { gesture: "pointer" as GestureType, emoji: "☝️", title: "Pointer Move", color: "var(--ios-blue)",
    instruction: "Extend your index finger toward the camera and keep other fingers curled. The neon pointer will mirror your finger tip with smooth tracking.",
    tip: "The smoother you move, the smoother the pointer. Fast movements are dampened by the α=0.3 EMA filter." },
  { gesture: "fist" as GestureType, emoji: "✊", title: "Click / Tap", color: "var(--ios-purple)",
    instruction: "From a pointing position, close your hand into a tight fist. The click fires the instant your fingers curl below the PIP joint threshold.",
    tip: "A 400ms cooldown prevents double-clicks. Quick open → close motion works best." },
  { gesture: "open_palm" as GestureType, emoji: "✋", title: "Scroll", color: "var(--ios-green)",
    instruction: "Spread all five fingers and hold your open palm toward the camera. Tilt your wrist upward to scroll up, downward to scroll down.",
    tip: "There's a ±10° dead zone at neutral pitch — so small movements don't accidentally scroll." },
  { gesture: "peace" as GestureType, emoji: "✌️", title: "Go Back", color: "var(--ios-orange)",
    instruction: "Raise your index and middle finger into a peace sign. Keep ring and pinky curled down. Orange flash confirms the back gesture.",
    tip: "Hold the peace sign for 600ms to navigate all the way back to the root screen." },
  { gesture: "pinch" as GestureType, emoji: "🤏", title: "Go Home", color: "var(--ios-yellow)",
    instruction: "Touch your thumb tip to your index fingertip in a pinch gesture. A glowing arc animation rises from the bottom of the screen.",
    tip: "A quick pinch triggers HOME. Hold for 600ms to open the App Switcher." },
];

export default function Tutorial({ active }: Props) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const { videoRef, state, gesture, fps, start, stop } = useHandTracker();
  const current = STEPS[step];
  const detected = gesture?.type === current.gesture;

  if (!active) return null;

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else { stop(); setDone(true); }
  };

  if (done) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-5 animate-ios-spring">
        <div className="w-28 h-28 rounded-[30%] flex items-center justify-center text-5xl mb-6"
          style={{ background: "linear-gradient(145deg, rgba(48,209,88,0.25) 0%, rgba(48,209,88,0.08) 100%)", border: "1px solid rgba(48,209,88,0.4)", boxShadow: "0 20px 60px rgba(48,209,88,0.2)" }}>
          🎉
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 text-center tracking-tight" style={{ letterSpacing: "-0.03em" }}>Tutorial Complete!</h2>
        <p className="text-base text-center mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>You've learned all 5 core gestures.</p>
        <button onClick={() => { setStep(0); setDone(false); }}
          className="px-8 py-3.5 rounded-2xl font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--ios-blue) 0%, #0066CC 100%)", boxShadow: "0 8px 30px rgba(10,132,255,0.4)" }}>
          Restart Tutorial
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-slide-up">
      <div className="px-5 pt-12 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>Tutorial</h1>
          <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{step + 1}/{STEPS.length}</span>
        </div>
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-400"
              style={{ background: i < step ? "rgba(48,209,88,0.7)" : i === step ? s.color : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
        {/* Camera preview */}
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            aspectRatio: "4/3",
            background: "rgba(0,0,0,0.6)",
            border: `1px solid ${current.color}30`,
            boxShadow: `0 8px 32px ${current.color}15`,
          }}>
          <video ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: "scaleX(-1)", opacity: state === "active" ? 0.65 : 0 }}
            muted playsInline />

          {state === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="text-6xl">{current.emoji}</span>
              <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>Tap below to practice with your camera</p>
            </div>
          )}
          {state === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 animate-spin"
                style={{ borderColor: `${current.color}30`, borderTopColor: current.color }} />
            </div>
          )}
          {state === "active" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-300`}
                style={{
                  background: detected ? `${current.color}22` : "rgba(255,255,255,0.04)",
                  border: `2px solid ${detected ? current.color : "rgba(255,255,255,0.12)"}`,
                  boxShadow: detected ? `0 0 40px ${current.color}40` : "none",
                  transform: detected ? "scale(1.1)" : "scale(1)",
                }}>
                {current.emoji}
              </div>
            </div>
          )}
          {state === "active" && detected && (
            <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
              style={{ background: `${current.color}20`, border: `1px solid ${current.color}50`, color: current.color, backdropFilter: "blur(20px)" }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: current.color }} />
              Detected
            </div>
          )}
          {state === "active" && (
            <div className="absolute bottom-2 left-3 text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{fps} FPS</div>
          )}
        </div>

        {/* Gesture info */}
        <GlassCard accent={current.color}>
          <div className="px-4 py-4 flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${current.color}18`, border: `1px solid ${current.color}35` }}>
              {current.emoji}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-white text-lg mb-1 tracking-tight" style={{ letterSpacing: "-0.02em" }}>{current.title}</h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>{current.instruction}</p>
              <div className="rounded-xl px-3 py-2.5 flex gap-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="text-yellow-400 text-sm flex-shrink-0">💡</span>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{current.tip}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="flex gap-3">
          {state === "idle" ? (
            <button onClick={start}
              className="flex-1 py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${current.color} 0%, ${current.color}99 100%)`, boxShadow: `0 8px 24px ${current.color}30` }}>
              Start Camera
            </button>
          ) : (
            <button onClick={next}
              className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-105 active:scale-95"
              style={{
                background: detected ? `${current.color}20` : "rgba(255,255,255,0.06)",
                border: `1px solid ${detected ? current.color : "rgba(255,255,255,0.1)"}`,
                color: detected ? current.color : "rgba(255,255,255,0.5)",
              }}>
              {step < STEPS.length - 1 ? (detected ? "Next →" : "Skip →") : (detected ? "Complete ✓" : "Skip & Finish")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
