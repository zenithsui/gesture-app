import { useState } from "react";
import GlassCard from "@/components/GlassCard";

interface Props { active: boolean; }

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative w-12 h-7 rounded-full transition-all duration-200 flex-shrink-0"
      style={{
        background: on ? "var(--ios-green)" : "rgba(255,255,255,0.12)",
        boxShadow: on ? "0 0 12px rgba(48,209,88,0.35)" : "none",
      }}>
      <div className="absolute top-0.5 w-6 h-6 rounded-full bg-white transition-all duration-200 shadow-md"
        style={{ left: on ? "calc(100% - 1.6rem)" : "0.15rem" }} />
    </button>
  );
}

function Slider({ label, value, min, max, step, onChange, display, accent = "var(--ios-blue)" }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; display: string; accent?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-sm font-bold" style={{ color: accent }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accent} 0%, ${accent} ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`
        }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest px-1 mb-2" style={{ color: "rgba(255,255,255,0.3)" }}>{title}</p>
      <GlassCard>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {children}
        </div>
      </GlassCard>
    </div>
  );
}

function Row({ label, sub, right }: { label: string; sub?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        {sub && <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const STORAGE_KEY = "gesture-settings";

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveSettings(s: object) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export default function Settings({ active }: Props) {
  const saved = loadSettings();
  const [pointerSize, setPointerSize] = useState(saved.pointerSize ?? 24);
  const [pointerSpeed, setPointerSpeed] = useState(saved.pointerSpeed ?? 1.0);
  const [smoothing, setSmoothing] = useState(saved.smoothing ?? 0.3);
  const [clickSens, setClickSens] = useState(saved.clickSens ?? 0.08);
  const [sound, setSound] = useState(saved.sound ?? true);
  const [haptics, setHaptics] = useState(saved.haptics ?? true);
  const [wakeWord, setWakeWord] = useState(saved.wakeWord ?? false);
  const [handedness, setHandedness] = useState<"auto" | "left" | "right">(saved.handedness ?? "auto");
  const [mirrorCam, setMirrorCam] = useState(saved.mirrorCam ?? true);
  const [showFps, setShowFps] = useState(saved.showFps ?? true);
  const [darkPointer, setDarkPointer] = useState(saved.darkPointer ?? false);

  const update = (key: string, val: unknown) => {
    const next = { pointerSize, pointerSpeed, smoothing, clickSens, sound, haptics, wakeWord, handedness, mirrorCam, showFps, darkPointer, [key]: val };
    saveSettings(next);
  };

  if (!active) return null;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-slide-up">
      <div className="px-5 pt-12 pb-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: "-0.03em" }}>Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Gesture · On-device</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-5 pb-6">
        <Section title="Pointer">
          <div className="px-4 pt-4 pb-3 space-y-5">
            <Slider label="Pointer Size" value={pointerSize} min={12} max={48} step={4}
              onChange={(v) => { setPointerSize(v); update("pointerSize", v); }} display={`${pointerSize}px`} />
            <Slider label="Speed Multiplier" value={pointerSpeed} min={0.5} max={3} step={0.5}
              onChange={(v) => { setPointerSpeed(v); update("pointerSpeed", v); }} display={`${pointerSpeed}×`} accent="var(--ios-teal)" />
            <Slider label="Smoothing (α)" value={smoothing} min={0.1} max={0.9} step={0.05}
              onChange={(v) => { setSmoothing(v); update("smoothing", v); }} display={smoothing.toFixed(2)} accent="var(--ios-purple)" />
          </div>
        </Section>

        <Section title="Click Sensitivity">
          <div className="px-4 pt-4 pb-3">
            <Slider label="Threshold" value={clickSens} min={0.02} max={0.2} step={0.01}
              onChange={(v) => { setClickSens(v); update("clickSens", v); }} display={clickSens.toFixed(2)} accent="var(--ios-orange)" />
          </div>
        </Section>

        <Section title="Feedback">
          <Row label="Sound Effects" sub="Confirmation tones on gesture trigger"
            right={<Toggle on={sound} onChange={(v) => { setSound(v); update("sound", v); }} />} />
          <Row label="Haptic Feedback" sub="Vibration pulse per gesture"
            right={<Toggle on={haptics} onChange={(v) => { setHaptics(v); update("haptics", v); }} />} />
        </Section>

        <Section title="Display">
          <Row label="Mirror Camera" sub="Flip horizontally (selfie mode)"
            right={<Toggle on={mirrorCam} onChange={(v) => { setMirrorCam(v); update("mirrorCam", v); }} />} />
          <Row label="Show FPS Counter"
            right={<Toggle on={showFps} onChange={(v) => { setShowFps(v); update("showFps", v); }} />} />
          <Row label="Dark Pointer" sub="Black pointer instead of white"
            right={<Toggle on={darkPointer} onChange={(v) => { setDarkPointer(v); update("darkPointer", v); }} />} />
        </Section>

        <Section title="Handedness">
          <div className="px-4 py-3 flex gap-2">
            {(["auto", "left", "right"] as const).map((h) => (
              <button key={h} onClick={() => { setHandedness(h); update("handedness", h); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all hover:scale-105 active:scale-95"
                style={{
                  background: handedness === h ? "rgba(10,132,255,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${handedness === h ? "rgba(10,132,255,0.6)" : "rgba(255,255,255,0.1)"}`,
                  color: handedness === h ? "var(--ios-blue)" : "rgba(255,255,255,0.5)",
                }}>{h}</button>
            ))}
          </div>
        </Section>

        <Section title="Wake Word">
          <Row label='"Open bro"' sub="Voice activation for gesture control"
            right={<Toggle on={wakeWord} onChange={(v) => { setWakeWord(v); update("wakeWord", v); }} />} />
        </Section>

        <GlassCard accent="var(--ios-blue)">
          <div className="px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Performance Spec</p>
            <div className="space-y-2">
              {[
                ["Target FPS", "60 (rVFC sync)", "var(--ios-green)"],
                ["Click Latency", "< 60ms", "var(--ios-teal)"],
                ["Model", "MediaPipe Hands v1 (lite)", "var(--ios-blue)"],
                ["Processing", "On-device only", "var(--ios-purple)"],
                ["Network calls", "Zero", "var(--ios-green)"],
              ].map(([k, v, c]) => (
                <div key={k} className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{k}</span>
                  <span className="text-xs font-semibold" style={{ color: c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        <div className="h-2" />
      </div>
    </div>
  );
}
