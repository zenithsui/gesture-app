import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGesture } from "@/context/GestureContext";
import colors from "@/constants/colors";

const C = colors.dark;
const { width: SW, height: SH } = Dimensions.get("window");

const DEMO_GESTURES = [
  { label: "☝️ Pointer Move", color: C.primary },
  { label: "✊ Click / Tap", color: C.purple },
  { label: "✋ Scroll", color: C.green },
  { label: "✌️ Go Back", color: C.orange },
  { label: "🤏 Go Home", color: C.yellow },
];

export default function GestureControl() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [permission, requestPermission] = useCameraPermissions();
  const [isTracking, setIsTracking] = useState(false);
  const [gestureIdx, setGestureIdx] = useState(0);
  const [fps, setFps] = useState(0);
  const { settings } = useGesture();

  const pointerX = useSharedValue(SW * 0.5);
  const pointerY = useSharedValue(SH * 0.35);
  const pointerScale = useSharedValue(1);
  const gestureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopAnimation = useCallback(() => {
    setIsTracking(false);
    if (gestureIntervalRef.current) clearInterval(gestureIntervalRef.current);
    if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
    gestureIntervalRef.current = null;
    fpsIntervalRef.current = null;
  }, []);

  const startDemoAnimation = useCallback(() => {
    const cx = SW * 0.5;
    const cy = SH * 0.4;
    const rx = SW * 0.28;
    const ry = SH * 0.18;

    const runLoop = () => {
      pointerX.value = withRepeat(
        withSequence(
          withTiming(cx + rx, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(cx, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(cx - rx, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(cx, { duration: 900, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
      pointerY.value = withRepeat(
        withSequence(
          withTiming(cy - ry, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(cy + ry, { duration: 1800, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    };
    runLoop();

    gestureIntervalRef.current = setInterval(() => {
      setGestureIdx((i) => (i + 1) % DEMO_GESTURES.length);
      pointerScale.value = withSequence(
        withTiming(1.4, { duration: 120 }),
        withTiming(1, { duration: 200 })
      );
      if (Platform.OS !== "web" && settings.haptics) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
    }, 2200);

    fpsIntervalRef.current = setInterval(() => {
      setFps(Math.floor(55 + Math.random() * 7));
    }, 500);
  }, [settings.haptics]);

  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  const handleToggle = useCallback(async () => {
    if (!permission?.granted) {
      await requestPermission();
      return;
    }
    if (isTracking) {
      stopAnimation();
    } else {
      setIsTracking(true);
      startDemoAnimation();
    }
  }, [permission, isTracking, stopAnimation, startDemoAnimation, requestPermission]);

  const pointerStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: pointerX.value - settings.pointerSize / 2,
    top: pointerY.value - settings.pointerSize / 2,
    width: settings.pointerSize,
    height: settings.pointerSize,
    borderRadius: settings.pointerSize / 2,
    transform: [{ scale: pointerScale.value }],
  }));

  const currentGesture = DEMO_GESTURES[gestureIdx];

  const showPermissionScreen =
    !permission || (!permission.granted && !permission.canAskAgain);
  const canRequestPermission = permission && !permission.granted && permission.canAskAgain;

  return (
    <View style={[styles.root]}>
      {Platform.OS !== "web" && (permission?.granted || isTracking) ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="front"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraPlaceholder]}>
          <View style={styles.scanline1} />
          <View style={styles.scanline2} />
          <View style={styles.scanline3} />
        </View>
      )}

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.vignette} />
      </View>

      {isTracking && (
        <>
          <Animated.View style={[pointerStyle, styles.pointer]} pointerEvents="none">
            <View
              style={[
                styles.pointerInner,
                {
                  backgroundColor: settings.darkPointer
                    ? "#000"
                    : C.text,
                  width: settings.pointerSize,
                  height: settings.pointerSize,
                  borderRadius: settings.pointerSize / 2,
                },
              ]}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.pointerRing,
              {
                left: pointerX.value - settings.pointerSize * 1.5,
                top: pointerY.value - settings.pointerSize * 1.5,
                width: settings.pointerSize * 3,
                height: settings.pointerSize * 3,
                borderRadius: settings.pointerSize * 1.5,
                borderColor: currentGesture.color,
              },
              pointerStyle,
            ]}
            pointerEvents="none"
          />
        </>
      )}

      <View style={[styles.hud, { top: topPad + 12 }]}>
        <View style={styles.hudLeft}>
          <View style={styles.demoBadge}>
            <View
              style={[
                styles.demoDot,
                { backgroundColor: isTracking ? C.green : C.red },
              ]}
            />
            <Text style={styles.demoBadgeText}>
              {isTracking ? "TRACKING" : "PAUSED"}
            </Text>
          </View>
          {isTracking && settings.showFps && (
            <View style={styles.fpsBadge}>
              <Text style={styles.fpsText}>{fps} FPS</Text>
            </View>
          )}
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>DEMO</Text>
        </View>
      </View>

      {isTracking && (
        <View style={styles.gesturePill}>
          <Text style={[styles.gesturePillText, { color: currentGesture.color }]}>
            {currentGesture.label}
          </Text>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: botPad + 16 }]}>
        {(showPermissionScreen || canRequestPermission) && !isTracking && (
          <View style={styles.permissionNote}>
            <Text style={styles.permissionNoteText}>
              {showPermissionScreen && Platform.OS !== "web"
                ? "Camera permission denied. Enable in Settings."
                : ""}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleToggle}
          activeOpacity={0.8}
          style={[
            styles.controlBtn,
            {
              backgroundColor: isTracking
                ? "rgba(255,69,58,0.2)"
                : `${C.primary}22`,
              borderColor: isTracking ? C.red : C.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.controlBtnText,
              { color: isTracking ? C.red : C.primary },
            ]}
          >
            {isTracking ? "Stop Tracking" : "Start Tracking"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          {isTracking
            ? `Hand #1 · α=${settings.smoothing.toFixed(2)} · ${settings.pointerSpeed}× speed`
            : "Demo mode — full ML tracking in native build"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#050508",
  },
  cameraPlaceholder: {
    backgroundColor: "#060810",
    overflow: "hidden",
  },
  scanline1: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "20%",
    height: 1,
    backgroundColor: "rgba(10,132,255,0.06)",
  },
  scanline2: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: "rgba(10,132,255,0.04)",
  },
  scanline3: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "80%",
    height: 1,
    backgroundColor: "rgba(10,132,255,0.06)",
  },
  vignette: {
    flex: 1,
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  hud: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hudLeft: { flexDirection: "row", gap: 8, alignItems: "center" },
  demoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  demoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  demoBadgeText: {
    fontSize: 11,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  fpsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  fpsText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_600SemiBold",
    fontVariant: ["tabular-nums"],
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(10,132,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(10,132,255,0.4)",
  },
  modeText: {
    fontSize: 11,
    color: C.primary,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },
  pointer: {
    position: "absolute",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  pointerInner: { opacity: 0.92 },
  pointerRing: {
    position: "absolute",
    borderWidth: 1.5,
    opacity: 0.4,
  },
  gesturePill: {
    position: "absolute",
    bottom: 140,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  gesturePillText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  permissionNote: { alignItems: "center" },
  permissionNoteText: {
    fontSize: 12,
    color: C.orange,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  controlBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
  },
  controlBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  hint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.25)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
