import { useEffect, useRef, useState } from "react";
import type { GestureResult } from "@/lib/gestures";

interface Props {
  gesture: GestureResult | null;
  active: boolean;
}

interface TrailDot { x: number; y: number; t: number }

export default function GesturePointer({ gesture, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gestureRef = useRef<GestureResult | null>(null);
  const trailRef = useRef<TrailDot[]>([]);
  const rafRef = useRef<number | null>(null);
  const [clickFlash, setClickFlash] = useState(false);
  const lastTypeRef = useRef<string>("none");
  const clickCoolRef = useRef(0);
  const pulsePhaseRef = useRef(0);

  useEffect(() => {
    gestureRef.current = gesture;
    if (!gesture) return;

    const now = Date.now();
    const type = gesture.type;
    const prev = lastTypeRef.current;

    if (type === "fist" && prev !== "fist" && now - clickCoolRef.current > 400) {
      clickCoolRef.current = now;
      setClickFlash(true);
      setTimeout(() => setClickFlash(false), 400);
    }
    lastTypeRef.current = type;
  }, [gesture]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d")!;

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const g = gestureRef.current;

      if (!g || !active) {
        trailRef.current = [];
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      const cx = g.pointerX * W;
      const cy = g.pointerY * H;
      const now = Date.now();
      pulsePhaseRef.current = ts * 0.002;

      const isFist = g.type === "fist";
      const isScroll = g.type === "open_palm";
      const isSwipe = g.type === "swipe_left" || g.type === "swipe_right";

      if (!isFist) {
        trailRef.current.push({ x: cx, y: cy, t: now });
      }
      trailRef.current = trailRef.current.filter((d) => now - d.t < 220);

      // Trail dots — 5 ghost points
      const trail = trailRef.current;
      for (let i = 0; i < trail.length; i++) {
        const dot = trail[i];
        const age = (now - dot.t) / 220;
        const progress = i / Math.max(trail.length - 1, 1);
        const alpha = (1 - age) * 0.55 * progress;
        const r = 5 * (1 - age * 0.4);
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(10,132,255,${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "rgba(10,132,255,0.6)";
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Swipe direction arc
      if (isSwipe) {
        const dir = g.type === "swipe_left" ? -1 : 1;
        const cp1x = cx + dir * 50;
        const cp1y = cy - 25;
        const endX = cx + dir * 110;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cp1x, cp1y, endX, cy);
        ctx.strokeStyle = "rgba(10,132,255,0.7)";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.shadowBlur = 16;
        ctx.shadowColor = "rgba(10,132,255,0.5)";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Scroll ring
      if (isScroll) {
        const pulse = 0.6 + 0.15 * Math.sin(pulsePhaseRef.current * 2);
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(48,209,88,${pulse})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "rgba(48,209,88,0.6)";
        ctx.stroke();
        ctx.shadowBlur = 0;
        return rafRef.current = requestAnimationFrame(draw), undefined;
      }

      // Pointer glow halo
      const pulse = 0.85 + 0.12 * Math.sin(pulsePhaseRef.current);
      const haloCols = isFist
        ? ["rgba(191,90,242,0.35)", "rgba(191,90,242,0)"]
        : ["rgba(10,132,255,0.3)", "rgba(10,132,255,0)"];
      const haloR = isFist ? 20 : 26;
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
      grd.addColorStop(0, haloCols[0]);
      grd.addColorStop(1, haloCols[1]);
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      // Main pointer dot
      const radius = isFist ? 8 : 11;
      const dotColor = isFist ? "rgba(191,90,242,1)" : "rgba(255,255,255,1)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = dotColor;
      ctx.shadowBlur = isFist ? 20 : 24;
      ctx.shadowColor = isFist ? "rgba(191,90,242,0.9)" : "rgba(10,132,255,0.9)";
      ctx.fill();
      ctx.shadowBlur = 0;

      // Center nub
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = isFist ? "rgba(255,255,255,0.9)" : "rgba(10,132,255,1)";
      ctx.fill();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  const W = typeof window !== "undefined" ? window.innerWidth : 430;
  const H = typeof window !== "undefined" ? window.innerHeight : 932;

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 50 }} />

      {clickFlash && gesture && (
        <div className="absolute pointer-events-none" style={{ zIndex: 60,
          left: gesture.pointerX * W - 50, top: gesture.pointerY * H - 50,
          width: 100, height: 100, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(191,90,242,0.9) 0%, rgba(191,90,242,0.2) 50%, transparent 100%)",
          animation: "gesture-flash 0.4s ease-out forwards",
        }} />
      )}
    </>
  );
}
