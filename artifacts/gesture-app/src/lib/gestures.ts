export type GestureType =
  | "none"
  | "pointer"
  | "fist"
  | "open_palm"
  | "peace"
  | "pinch"
  | "swipe_left"
  | "swipe_right";

export interface GestureResult {
  type: GestureType;
  confidence: number;
  pointerX: number;
  pointerY: number;
  label: string;
  emoji: string;
}

export interface Point2D { x: number; y: number; }

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isFingerExtended(
  lm: { x: number; y: number }[],
  tip: number, pip: number, mcp: number,
): boolean {
  return lm[tip].y < lm[pip].y && lm[pip].y < lm[mcp].y;
}

function isFingerCurled(
  lm: { x: number; y: number }[],
  tip: number, pip: number,
): boolean {
  return lm[tip].y > lm[pip].y - 0.01;
}

function isThumbExtended(lm: { x: number; y: number }[]) {
  return Math.abs(lm[4].x - lm[2].x) > 0.06;
}

export function detectGesture(
  lm: { x: number; y: number; z: number }[],
): GestureType {
  if (!lm || lm.length < 21) return "none";

  const indexExt = isFingerExtended(lm, 8, 6, 5);
  const middleExt = isFingerExtended(lm, 12, 10, 9);
  const ringExt = isFingerExtended(lm, 16, 14, 13);
  const pinkyExt = isFingerExtended(lm, 20, 18, 17);
  const thumbExt = isThumbExtended(lm);

  const indexCurl = isFingerCurled(lm, 8, 6);
  const middleCurl = isFingerCurled(lm, 12, 10);
  const ringCurl = isFingerCurled(lm, 16, 14);
  const pinkyCurl = isFingerCurled(lm, 20, 18);

  const pinchDist = dist(lm[4], lm[8]);
  if (pinchDist < 0.06 && !indexExt) return "pinch";

  if (indexExt && middleExt && ringCurl && pinkyCurl) return "peace";

  if (indexExt && !middleExt && !ringExt && !pinkyExt) return "pointer";

  if (!indexExt && !middleExt && !ringExt && !pinkyExt &&
      indexCurl && middleCurl && ringCurl && pinkyCurl) return "fist";

  const allExt = indexExt && middleExt && ringExt && pinkyExt;
  if (allExt) return "open_palm";

  return "none";
}

const GESTURE_LABELS: Record<GestureType, { label: string; emoji: string }> = {
  none: { label: "No gesture", emoji: "—" },
  pointer: { label: "Pointer", emoji: "☝️" },
  fist: { label: "Click", emoji: "✊" },
  open_palm: { label: "Scroll", emoji: "✋" },
  peace: { label: "Go Back", emoji: "✌️" },
  pinch: { label: "Go Home", emoji: "🤏" },
  swipe_left: { label: "Swipe Left", emoji: "👈" },
  swipe_right: { label: "Swipe Right", emoji: "👉" },
};

export function buildGestureResult(
  type: GestureType,
  lm: { x: number; y: number; z: number }[],
): GestureResult {
  const { label, emoji } = GESTURE_LABELS[type];
  const tip = lm[8];
  return {
    type,
    confidence: 1,
    pointerX: 1 - tip.x,
    pointerY: tip.y,
    label,
    emoji,
  };
}

export class SwipeDetector {
  private history: { x: number; ts: number }[] = [];
  private readonly windowMs = 500;
  private readonly minDelta = 0.18;

  push(x: number) {
    const now = Date.now();
    this.history.push({ x, ts: now });
    this.history = this.history.filter((h) => now - h.ts < this.windowMs);
  }

  detect(): "swipe_left" | "swipe_right" | null {
    if (this.history.length < 4) return null;
    const first = this.history[0];
    const last = this.history[this.history.length - 1];
    const delta = last.x - first.x;
    if (delta > this.minDelta) return "swipe_right";
    if (delta < -this.minDelta) return "swipe_left";
    return null;
  }

  reset() { this.history = []; }
}
