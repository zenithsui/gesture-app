import { useRef, useState, useCallback, useEffect } from "react";
import { detectGesture, buildGestureResult, SwipeDetector } from "@/lib/gestures";
import type { GestureResult, GestureType } from "@/lib/gestures";

type TrackingState = "idle" | "loading" | "active" | "error";

const ALPHA = 0.3;

function smooth(prev: number, next: number) {
  return prev + (next - prev) * ALPHA;
}

export function useHandTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<TrackingState>("idle");
  const [gesture, setGesture] = useState<GestureResult | null>(null);
  const [fps, setFps] = useState(0);

  const handsRef = useRef<import("@mediapipe/hands").Hands | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsRef = useRef(Date.now());
  const smoothPosRef = useRef({ x: 0.5, y: 0.5 });
  const swipeDetRef = useRef(new SwipeDetector());
  const lastGestureRef = useRef<GestureType>("none");
  const swipeLockRef = useRef(false);
  // For click detection via wrist oscillation
  const prevWristYRef = useRef(0);
  const clickCoolRef = useRef(0);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (handsRef.current) handsRef.current.close();
    rafRef.current = null;
    streamRef.current = null;
    handsRef.current = null;
    setState("idle");
    setGesture(null);
    setFps(0);
  }, []);

  const start = useCallback(async () => {
    setState("loading");
    try {
      const { Hands } = await import("@mediapipe/hands");

      const hands = new Hands({
        locateFile: (f: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.8,
        selfieMode: true,
      });

      hands.onResults((results) => {
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastFpsRef.current >= 500) {
          setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsRef.current)));
          frameCountRef.current = 0;
          lastFpsRef.current = now;
        }

        if (!results.multiHandLandmarks?.length) {
          swipeDetRef.current.reset();
          lastGestureRef.current = "none";
          setGesture(null);
          return;
        }

        const lm = results.multiHandLandmarks[0];
        let type = detectGesture(lm);

        smoothPosRef.current.x = smooth(smoothPosRef.current.x, 1 - lm[8].x);
        smoothPosRef.current.y = smooth(smoothPosRef.current.y, lm[8].y);

        if (type === "open_palm") {
          swipeDetRef.current.push(lm[0].x);
          const swipe = swipeDetRef.current.detect();
          if (swipe && !swipeLockRef.current) {
            swipeLockRef.current = true;
            type = swipe;
            setTimeout(() => {
              swipeLockRef.current = false;
              swipeDetRef.current.reset();
            }, 600);
          }
        } else {
          swipeDetRef.current.push(lm[0].x);
        }

        lastGestureRef.current = type;
        const result = buildGestureResult(type, lm);
        result.pointerX = smoothPosRef.current.x;
        result.pointerY = smoothPosRef.current.y;
        setGesture(result);
      });

      await hands.initialize();
      handsRef.current = hands;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 60, min: 30 },
          facingMode: "user",
        },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "");
        await videoRef.current.play();
      }

      setState("active");

      // Use requestVideoFrameCallback when available for 60 FPS sync
      const loopRAF = async () => {
        if (videoRef.current && handsRef.current && videoRef.current.readyState === 4) {
          await handsRef.current.send({ image: videoRef.current });
        }
        rafRef.current = requestAnimationFrame(loopRAF);
      };

      if ("requestVideoFrameCallback" in HTMLVideoElement.prototype && videoRef.current) {
        const loopVFC = async () => {
          if (videoRef.current && handsRef.current) {
            await handsRef.current.send({ image: videoRef.current });
          }
          if (videoRef.current) {
            (videoRef.current as HTMLVideoElement & {
              requestVideoFrameCallback: (cb: () => void) => void;
            }).requestVideoFrameCallback(loopVFC);
          }
        };
        (videoRef.current as HTMLVideoElement & {
          requestVideoFrameCallback: (cb: () => void) => void;
        }).requestVideoFrameCallback(loopVFC);
      } else {
        rafRef.current = requestAnimationFrame(loopRAF);
      }
    } catch (err) {
      console.error(err);
      setState("error");
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, state, gesture, fps, start, stop };
}
