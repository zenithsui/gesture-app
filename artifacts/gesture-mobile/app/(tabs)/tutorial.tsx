import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";

const C = colors.dark;

const STEPS = [
  {
    emoji: "☝️",
    title: "Pointer Move",
    color: C.primary,
    instruction:
      "Extend your index finger toward the camera and keep other fingers curled. The neon pointer will mirror your fingertip with smooth tracking.",
    tip: "The smoother you move, the smoother the pointer. Fast movements are dampened by the α=0.3 EMA filter.",
    detail: "Tracks landmark[8] (INDEX_FINGER_TIP) with exponential smoothing.",
  },
  {
    emoji: "✊",
    title: "Click / Tap",
    color: C.purple,
    instruction:
      "From a pointing position, close your hand into a tight fist. The click fires the instant your fingers curl below the PIP joint threshold.",
    tip: "A 400ms cooldown prevents double-clicks. Quick open → close motion works best.",
    detail: "All 5 fingertips drop below PIP joints. 400ms cooldown. Haptics fire a 40ms pulse.",
  },
  {
    emoji: "✋",
    title: "Scroll",
    color: C.green,
    instruction:
      "Spread all five fingers and hold your open palm toward the camera. Tilt your wrist upward to scroll up, downward to scroll down.",
    tip: "There's a ±10° dead zone at neutral pitch — small movements won't accidentally scroll.",
    detail: "Wrist pitch detection. ±10° dead zone at neutral.",
  },
  {
    emoji: "✌️",
    title: "Go Back",
    color: C.orange,
    instruction:
      "Raise your index and middle finger into a peace sign. Keep ring and pinky curled down. An orange flash confirms the back gesture.",
    tip: "Hold the peace sign for 600ms to navigate all the way back to the root screen.",
    detail: "Index[8] and middle[12] extended. Quick flash = BACK. Hold 600ms = root.",
  },
  {
    emoji: "🤏",
    title: "Go Home",
    color: C.yellow,
    instruction:
      "Touch your thumb tip to your index fingertip in a pinch gesture. A glowing arc animation rises from the bottom of the screen.",
    tip: "A quick pinch triggers HOME. Hold for 600ms to open the App Switcher.",
    detail: "dist(landmark[4], landmark[8]) < 0.06 threshold.",
  },
];

export default function Tutorial() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const current = STEPS[step];

  const goNext = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else setDone(true);
  };

  const goPrev = async () => {
    if (step > 0) {
      if (Platform.OS !== "web") {
        await Haptics.selectionAsync();
      }
      setStep((s) => s - 1);
    }
  };

  if (done) {
    return (
      <View style={[styles.root, { paddingTop: topPad, paddingBottom: botPad }]}>
        <View style={styles.doneContainer}>
          <View style={styles.doneIcon}>
            <Text style={styles.doneEmoji}>🎉</Text>
          </View>
          <Text style={styles.doneTitle}>Tutorial Complete!</Text>
          <Text style={styles.doneSubtitle}>
            You've learned all {STEPS.length} core gestures.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setDone(false);
              setStep(0);
            }}
            activeOpacity={0.8}
            style={styles.restartBtn}
          >
            <Text style={styles.restartBtnText}>Restart Tutorial</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Tutorial</Text>
          <Text style={styles.headerSub}>
            {step + 1} of {STEPS.length}
          </Text>
        </View>
        <View style={styles.progressDots}>
          {STEPS.map((s, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i < step
                      ? C.green
                      : i === step
                      ? s.color
                      : "rgba(255,255,255,0.12)",
                  width: i === step ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 100 : insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.gesturePreview,
            {
              borderColor: `${current.color}30`,
              shadowColor: current.color,
            },
          ]}
        >
          <Text style={styles.gestureEmoji}>{current.emoji}</Text>
          <View
            style={[
              styles.gestureGlow,
              { backgroundColor: `${current.color}10` },
            ]}
          />
        </View>

        <View
          style={[
            styles.infoCard,
            { borderColor: `${current.color}25` },
          ]}
        >
          <View style={styles.infoCardHeader}>
            <View
              style={[
                styles.infoIconWrap,
                {
                  backgroundColor: `${current.color}18`,
                  borderColor: `${current.color}35`,
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>{current.emoji}</Text>
            </View>
            <View style={styles.infoTitleWrap}>
              <Text style={styles.infoTitle}>{current.title}</Text>
              <View
                style={[
                  styles.infoColorDot,
                  { backgroundColor: current.color },
                ]}
              />
            </View>
          </View>

          <Text style={styles.infoInstruction}>{current.instruction}</Text>

          <View style={styles.tipBox}>
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={styles.tipText}>{current.tip}</Text>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>TECH DETAIL</Text>
            <Text style={styles.detailText}>{current.detail}</Text>
          </View>
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={goPrev}
            activeOpacity={0.8}
            style={[
              styles.navBtn,
              {
                opacity: step === 0 ? 0.3 : 1,
                backgroundColor: "rgba(255,255,255,0.06)",
                borderColor: C.border,
              },
            ]}
            disabled={step === 0}
          >
            <Text style={[styles.navBtnText, { color: C.textSecondary }]}>
              ← Prev
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.8}
            style={[
              styles.navBtn,
              {
                backgroundColor: `${current.color}20`,
                borderColor: current.color,
                flex: 1.4,
              },
            ]}
          >
            <Text style={[styles.navBtnText, { color: current.color }]}>
              {step < STEPS.length - 1 ? "Next →" : "Complete ✓"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  headerSub: {
    fontSize: 13,
    color: C.textTertiary,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  gesturePreview: {
    height: 180,
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  gestureEmoji: { fontSize: 80 },
  gestureGlow: {
    position: "absolute",
    inset: 0,
    borderRadius: 24,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    gap: 12,
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  infoTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoTitle: {
    fontSize: 20,
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  infoColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoInstruction: {
    fontSize: 14,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  tipBox: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "flex-start",
  },
  tipIcon: { fontSize: 14, marginTop: 1 },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: C.textTertiary,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  detailBox: {
    gap: 4,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.025)",
    borderWidth: 1,
    borderColor: C.border,
  },
  detailLabel: {
    fontSize: 10,
    color: C.textQuaternary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  detailText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
  },
  navBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  doneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  doneIcon: {
    width: 108,
    height: 108,
    borderRadius: 32,
    backgroundColor: "rgba(48,209,88,0.18)",
    borderWidth: 1,
    borderColor: "rgba(48,209,88,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  doneEmoji: { fontSize: 52 },
  doneTitle: {
    fontSize: 32,
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
    textAlign: "center",
  },
  doneSubtitle: {
    fontSize: 15,
    color: C.textSecondary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  restartBtn: {
    paddingHorizontal: 32,
    paddingVertical: 15,
    borderRadius: 16,
    backgroundColor: C.primary,
    marginTop: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  restartBtnText: {
    fontSize: 15,
    color: "#fff",
    fontFamily: "Inter_700Bold",
  },
});
