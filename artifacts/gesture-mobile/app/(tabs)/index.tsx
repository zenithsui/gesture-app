import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
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
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";
import { useGesture } from "@/context/GestureContext";

const C = colors.dark;
const { width: SW, height: SH } = Dimensions.get("window");

type Mode = "idle" | "standby" | "active";

const DEMO_GESTURES = [
  { label: "☝️ Pointer Move", color: C.primary },
  { label: "✊ Click / Tap", color: C.purple },
  { label: "✋ Scroll", color: C.green },
  { label: "✌️ Go Back", color: C.orange },
  { label: "🤏 Go Home", color: C.yellow },
];

const WAKE_PHRASES = [
  "open bro",
  "open brow",
  "open bra",
  "open pro",
  "open row",
  "open broad",
  "open bruh",
  "openbro",
];

export default function GestureControl() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mode, setMode] = useState<Mode>("idle");
  const [gestureIdx, setGestureIdx] = useState(0);
  const [fps, setFps] = useState(0);
  const [listeningText, setListeningText] = useState("");
  const [micGranted, setMicGranted] = useState(false);
  const { settings } = useGesture();

  const pointerX = useSharedValue(SW * 0.5);
  const pointerY = useSharedValue(SH * 0.35);
  const pointerScale = useSharedValue(0);
  const micPulse = useSharedValue(1);
  const micRingScale = useSharedValue(1);
  const overlayOpacity = useSharedValue(0.75);

  const gestureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionActive = useRef(false);
  const currentMode = useRef<Mode>("idle");

  currentMode.current = mode;

  const stopTracking = useCallback(() => {
    if (gestureIntervalRef.current) clearInterval(gestureIntervalRef.current);
    if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current);
    gestureIntervalRef.current = null;
    fpsIntervalRef.current = null;
    pointerScale.value = withTiming(0, { duration: 250 });
  }, []);

  const startTracking = useCallback(() => {
    const cx = SW * 0.5;
    const cy = SH * 0.38;
    const rx = SW * 0.28;
    const ry = SH * 0.17;

    pointerScale.value = withSpring(1, { damping: 8, stiffness: 200 });

    pointerX.value = withRepeat(
      withSequence(
        withTiming(cx + rx, { duration: 960, easing: Easing.inOut(Easing.sin) }),
        withTiming(cx, { duration: 960, easing: Easing.inOut(Easing.sin) }),
        withTiming(cx - rx, { duration: 960, easing: Easing.inOut(Easing.sin) }),
        withTiming(cx, { duration: 960, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
    pointerY.value = withRepeat(
      withSequence(
        withTiming(cy - ry, { duration: 1920, easing: Easing.inOut(Easing.sin) }),
        withTiming(cy + ry, { duration: 1920, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    gestureIntervalRef.current = setInterval(() => {
      setGestureIdx((i) => (i + 1) % DEMO_GESTURES.length);
      pointerScale.value = withSequence(
        withTiming(1.45, { duration: 110 }),
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

  const startListening = useCallback(() => {
    if (Platform.OS === "web") return;
    if (recognitionActive.current) return;
    recognitionActive.current = true;
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      continuous: true,
      interimResults: true,
    });
  }, []);

  const stopListening = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (!recognitionActive.current) return;
    ExpoSpeechRecognitionModule.stop();
    recognitionActive.current = false;
  }, []);

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results
      .map((r) => r.transcript)
      .join(" ")
      .toLowerCase()
      .trim();

    if (transcript.length > 0) {
      setListeningText(transcript.slice(-80));
    }

    const isWake = WAKE_PHRASES.some((p) => transcript.includes(p));
    if (isWake && currentMode.current === "standby") {
      handleActivate();
    }
  });

  useSpeechRecognitionEvent("end", () => {
    recognitionActive.current = false;
    if (currentMode.current === "standby") {
      restartTimerRef.current = setTimeout(() => {
        if (currentMode.current === "standby") startListening();
      }, 600);
    }
  });

  useSpeechRecognitionEvent("error", () => {
    recognitionActive.current = false;
    if (currentMode.current === "standby") {
      restartTimerRef.current = setTimeout(() => {
        if (currentMode.current === "standby") startListening();
      }, 1200);
    }
  });

  const handleActivate = useCallback(() => {
    stopListening();
    setListeningText("");
    setMode("active");
    overlayOpacity.value = withTiming(0.12, { duration: 400 });
    startTracking();
    if (Platform.OS !== "web" && settings.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    if (Platform.OS !== "web") activateKeepAwakeAsync().catch(() => {});
  }, [stopListening, startTracking, settings.haptics]);

  const handleDeactivate = useCallback(() => {
    stopTracking();
    setMode("standby");
    overlayOpacity.value = withTiming(0.75, { duration: 400 });
    deactivateKeepAwake();
    setTimeout(() => {
      if (currentMode.current === "standby") startListening();
    }, 400);
    if (Platform.OS !== "web" && settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
  }, [stopTracking, startListening, settings.haptics]);

  const requestAllPermissions = useCallback(async () => {
    const camResult = await requestCameraPermission();
    let mic = false;
    if (Platform.OS !== "web") {
      try {
        const sr = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        mic = sr.granted;
      } catch {
        mic = false;
      }
    } else {
      mic = true;
    }
    setMicGranted(mic);
    if (camResult.granted) {
      setMode("standby");
      overlayOpacity.value = withTiming(0.75, { duration: 300 });
      if (mic) setTimeout(() => startListening(), 600);
    }
  }, [requestCameraPermission, startListening]);

  useEffect(() => {
    if (cameraPermission?.granted) {
      setMode("standby");
      overlayOpacity.value = 0.75;
      if (Platform.OS !== "web") {
        ExpoSpeechRecognitionModule.getPermissionsAsync()
          .then((p) => {
            setMicGranted(p.granted);
            if (p.granted) setTimeout(() => startListening(), 800);
          })
          .catch(() => {});
      }
    }
    return () => {
      stopListening();
      stopTracking();
      deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    if (mode === "standby") {
      micPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      micRingScale.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 1400, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 0 })
        ),
        -1,
        false
      );
    } else {
      micPulse.value = withTiming(1, { duration: 300 });
      micRingScale.value = withTiming(1, { duration: 300 });
    }
  }, [mode]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "background") {
        if (recognitionActive.current) stopListening();
      }
      if (state === "active") {
        if (currentMode.current === "standby" && !recognitionActive.current && micGranted) {
          restartTimerRef.current = setTimeout(() => startListening(), 800);
        }
      }
    });
    return () => sub.remove();
  }, [micGranted, startListening, stopListening]);

  const overlayStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    opacity: overlayOpacity.value,
  }));

  const micStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micPulse.value }],
  }));

  const micRingStyle = useAnimatedStyle(() => ({
    position: "absolute",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderColor: `${C.primary}60`,
    transform: [{ scale: micRingScale.value }],
    opacity: 1 - (micRingScale.value - 1) / 0.6,
  }));

  const pointerStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: pointerX.value - settings.pointerSize / 2,
    top: pointerY.value - settings.pointerSize / 2,
    width: settings.pointerSize,
    height: settings.pointerSize,
    borderRadius: settings.pointerSize / 2,
    transform: [{ scale: pointerScale.value }],
    opacity: pointerScale.value > 0 ? 1 : 0,
  }));

  const currentGesture = DEMO_GESTURES[gestureIdx];
  const isActive = mode === "active";
  const isStandby = mode === "standby";

  if (mode === "idle") {
    return (
      <View style={[styles.root, styles.center]}>
        <Text style={styles.permEmoji}>✋</Text>
        <Text style={styles.permTitle}>Gesture Control</Text>
        <Text style={styles.permSubtitle}>
          Needs camera to track hands, microphone to listen for the{" "}
          <Text style={{ color: C.primary }}>"Open Bro"</Text> wake word.
        </Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestAllPermissions} activeOpacity={0.8}>
          <Text style={styles.grantBtnText}>Grant Camera & Mic</Text>
        </TouchableOpacity>
        <Text style={styles.permNote}>📷 Camera · 🎤 Microphone · 🔊 Sound</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {cameraPermission?.granted && Platform.OS !== "web" ? (
        <CameraView style={StyleSheet.absoluteFill} facing="front" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraFallback]} />
      )}

      <Animated.View style={overlayStyle} pointerEvents="none" />

      <View style={[styles.hud, { top: topPad + 12 }]}>
        <View style={styles.hudLeft}>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isActive
                    ? C.green
                    : isStandby
                    ? C.primary
                    : C.red,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {isActive ? "TRACKING" : "LISTENING"}
            </Text>
          </View>
          {isActive && settings.showFps && (
            <View style={styles.fpsBadge}>
              <Text style={styles.fpsText}>{fps} FPS</Text>
            </View>
          )}
        </View>
        <View style={[styles.modeBadge, { borderColor: isActive ? `${C.green}50` : `${C.primary}50` }]}>
          <Text style={[styles.modeText, { color: isActive ? C.green : C.primary }]}>
            {isActive ? "DEMO" : "WAKE"}
          </Text>
        </View>
      </View>

      {isStandby && (
        <View style={styles.standbyCenter} pointerEvents="none">
          <View style={styles.micContainer}>
            <Animated.View style={micRingStyle} />
            <Animated.View style={[styles.micCircle, micStyle]}>
              <Text style={styles.micEmoji}>🎤</Text>
            </Animated.View>
          </View>
          <Text style={styles.wakeLabel}>Say "Open Bro" to activate</Text>
          {listeningText.length > 0 && (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptText} numberOfLines={2}>
                "{listeningText}"
              </Text>
            </View>
          )}
          {!micGranted && (
            <Text style={styles.noMicNote}>
              Mic permission not granted — tap below to activate manually
            </Text>
          )}
        </View>
      )}

      {isActive && (
        <>
          <Animated.View style={[pointerStyle, styles.pointer]} pointerEvents="none">
            <View
              style={[
                styles.pointerInner,
                {
                  backgroundColor: settings.darkPointer ? "#000" : C.text,
                  width: settings.pointerSize,
                  height: settings.pointerSize,
                  borderRadius: settings.pointerSize / 2,
                },
              ]}
            />
          </Animated.View>

          <View style={styles.gesturePill}>
            <Text style={[styles.gesturePillText, { color: currentGesture.color }]}>
              {currentGesture.label}
            </Text>
          </View>
        </>
      )}

      <View style={[styles.bottomBar, { paddingBottom: botPad + 16 }]}>
        {isStandby ? (
          <TouchableOpacity
            style={[styles.controlBtn, styles.activateBtn]}
            onPress={handleActivate}
            activeOpacity={0.8}
          >
            <Text style={[styles.controlBtnText, { color: C.primary }]}>
              ☝️  Activate Now
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlBtn, styles.stopBtn]}
            onPress={handleDeactivate}
            activeOpacity={0.8}
          >
            <Text style={[styles.controlBtnText, { color: C.red }]}>
              Stop → Back to Listening
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.hint}>
          {isStandby
            ? micGranted
              ? "🎤 Mic active · Listening for wake word"
              : "Mic not available on this platform"
            : `Hand #1 · α=${settings.smoothing.toFixed(2)} · ${settings.pointerSpeed}× speed`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050508" },
  center: { justifyContent: "center", alignItems: "center", gap: 16, padding: 32 },
  cameraFallback: { backgroundColor: "#060810" },

  permEmoji: { fontSize: 56, marginBottom: 4 },
  permTitle: {
    fontSize: 28,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  permSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  grantBtn: {
    marginTop: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: `${colors.dark.primary}22`,
    borderWidth: 1.5,
    borderColor: colors.dark.primary,
  },
  grantBtnText: {
    fontSize: 16,
    color: colors.dark.primary,
    fontFamily: "Inter_700Bold",
  },
  permNote: {
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    fontFamily: "Inter_400Regular",
    marginTop: 4,
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: {
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
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
  },
  modeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },

  standbyCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "25%",
    alignItems: "center",
    gap: 20,
  },
  micContainer: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.dark.primary}20`,
    borderWidth: 1.5,
    borderColor: `${colors.dark.primary}80`,
    alignItems: "center",
    justifyContent: "center",
  },
  micEmoji: { fontSize: 30 },
  wakeLabel: {
    fontSize: 18,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  transcriptBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    maxWidth: SW * 0.8,
  },
  transcriptText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    fontStyle: "italic",
  },
  noMicNote: {
    fontSize: 12,
    color: colors.dark.orange,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    paddingHorizontal: 32,
  },

  pointer: {
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 10,
    elevation: 10,
  },
  pointerInner: { opacity: 0.94 },

  gesturePill: {
    position: "absolute",
    bottom: 150,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.65)",
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
    backgroundColor: "rgba(0,0,0,0.7)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },
  controlBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1.5,
  },
  activateBtn: {
    backgroundColor: `${colors.dark.primary}18`,
    borderColor: colors.dark.primary,
  },
  stopBtn: {
    backgroundColor: "rgba(255,69,58,0.15)",
    borderColor: colors.dark.red,
  },
  controlBtnText: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },
  hint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.28)",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
