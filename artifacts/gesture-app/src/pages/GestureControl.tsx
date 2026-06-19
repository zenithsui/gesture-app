import { useHandTracker } from "@/hooks/useHandTracker";
import GesturePointer from "@/components/GesturePointer";
import GlassCard from "@/components/GlassCard";
import { useState, useEffect, useRef } from "react";
import type { GestureType } from "@/lib/gestures";

interface Props { active: boolean; }

const GESTURE_META: Record<GestureType, { color: string; label: string; hint: string }> = {
  none: { color: "rgba(255,255,255,0.2)", label: "—", hint: "Show your hand to begin" },
  pointer: { color: "var(--ios-blue)", label: "Pointer", hint: "Move index finger to steer cursor" },
  fist: { color: "var(--ios-purple)", label: "Click", hint: "Tap fired at pointer position" },
  open_palm: { color: "var(--ios-green)", label: "Scroll", hint: "Tilt palm up/down to scroll" },
  peace: { color: "var(--ios-orange)", label: "Go Back", hint: "Navigate to previous screen" },
  pinch: { color: "var(--ios-yellow)", label: "Home", hint: "Return to home screen" },
  swipe_left: { color: "#F4594B", label: "Swipe ←", hint: "Navigate back in history" },
  swipe_right: { color: "var(--ios-green)", label: "Swipe →", hint: "Navigate forward in history" },
};

interface Toast { id: number; msg: string; color: string }

export default function GestureControl({ active }: Props) {
  const { videoRef, state, gesture, fps, start, stop } = useHandTracker();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);
  const lastTypeRef = useRef<GestureType>("none");

  useEffect(() => {
    if (!active && state !== "idle") stop();
  }, [active, state, stop]);

  useEffect(() => {
    if (!gesture || gesture.type === "none" || gesture.type === "pointer") {
      if (gesture?.type !== lastTypeRef.current) lastTypeRef.current = gesture?.type ?? "none";
      return;
    }
    if (gesture.type === lastTypeRef.current) return;
    lastTypeRef.current = gesture.type;

    const meta = GESTURE_META[gesture.type];
    const id = ++toastIdRef.current;
    setToasts((t) => [...t.slice(-2), { id, msg: `${gesture.emoji} ${gesture.label}`, color: meta.color }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 1800);

    // Haptics
    if (navigator.vibrate) navigator.vibrate(gesture.type === "fist" ? [40] : [20]);
  }, [gesture?.type]);

  const meta = gesture ? GESTURE_META[gesture.type] : GESTURE_META.none;

  if (!active) return null;

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#050507" }}>
      {/* Camera feed */}
      <video ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        style={{ transform: "scaleX(-1)", opacity: state === "active" ? 0.15 : 0 }}
        muted playsInline />

      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(10,132,255,0.05) 0%, transparent 70%)" }} />

      <GesturePointer gesture={gesture} active={state === "active"} />

      {/* Toast stack */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div key={t.id}
            className="px-5 py-2.5 rounded-full text-sm font-semibold animate-slide-up"
            style={{
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
              border: `1px solid ${t.color}50`,
              color: t.color,
              boxShadow: `0 4px 20px ${t.color}25`,
            }}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* Central state display */}
      {state !== "active" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {state === "idle" && (
            <div className="text-center animate-ios-spring">
              <div className="w-28 h-28 mx-auto mb-6 rounded-[30%] flex items-center justify-center text-6xl"
                style={{
                  background: "linear-gradient(145deg, rgba(10,132,255,0.2) 0%, rgba(90,200,250,0.08) 100%)",
                  border: "1px solid rgba(10,132,255,0.3)",
                  boxShadow: "0 20px 60px rgba(10,132,255,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}>
                ✋
              </div>
              <h2 className="text-2xl font-bold text-white mb-1.5 tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                Gesture Control
              </h2>
              <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>MediaPipe · 60 FPS · On-device</p>
            </div>
          )}
          {state === "loading" && (
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-5">
                <div className="w-20 h-20 rounded-full border-2 animate-spin"
                  style={{ borderColor: "rgba(10,132,255,0.3)", borderTopColor: "var(--ios-blue)" }} />
                <div className="absolute inset-3 rounded-full text-3xl flex items-center justify-center">✋</div>
              </div>
              <p className="text-white font-semibold">Loading gesture model…</p>
              <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                Downloading MediaPipe WASM + model weights
              </p>
            </div>
          )}
          {state === "error" && (
            <GlassCard className="mx-6 text-center" accent="#F4594B">
              <div className="px-6 py-5">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="font-bold text-white mb-1">Camera Access Denied</p>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Allow camera permissions in your browser then tap Retry.
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {/* Gesture status pill — bottom center */}
      {state === "active" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="px-5 py-2.5 rounded-full flex items-center gap-2.5"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(30px) saturate(180%)",
              WebkitBackdropFilter: "blur(30px) saturate(180%)",
              border: `1px solid ${meta.color}35`,
            }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
            <span className="text-sm font-semibold" style={{ color: meta.color }}>
              {gesture?.emoji} {meta.label}
            </span>
          </div>
          <p className="text-center text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>{meta.hint}</p>
        </div>
      )}

      {/* Top-right FPS badge */}
      {state === "active" && (
        <div className="absolute top-16 right-4 z-30">
          <div className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: fps >= 45 ? "var(--ios-green)" : fps >= 25 ? "var(--ios-yellow)" : "#F4594B",
            }}>
            {fps} FPS
          </div>
        </div>
      )}

      {/* Start/Stop CTA */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30">
        {state === "idle" && (
          <button onClick={start}
            className="px-10 py-3.5 rounded-2xl font-bold text-white text-[15px] transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--ios-blue) 0%, #0066CC 100%)",
              boxShadow: "0 8px 30px rgba(10,132,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
            Start Gesture Control
          </button>
        )}
        {(state === "active" || state === "loading") && state !== "idle" && (
          <button onClick={stop}
            className="px-8 py-3 rounded-2xl font-semibold text-white text-sm transition-all hover:scale-105 active:scale-95"
            style={{
              background: "rgba(244,89,75,0.25)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(244,89,75,0.5)",
            }}>
            Stop
          </button>
        )}
        {state === "error" && (
          <button onClick={start}
            className="px-10 py-3.5 rounded-2xl font-bold text-white text-[15px]"
            style={{ background: "linear-gradient(135deg, var(--ios-blue) 0%, #0066CC 100%)" }}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
