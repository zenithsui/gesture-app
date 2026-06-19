import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import colors from "@/constants/colors";

const C = colors.dark;

const GESTURES = [
  {
    emoji: "☝️",
    name: "Pointer Move",
    color: C.primary,
    trigger: "Index finger up, others curled",
    action: "Controls the on-screen pointer in all directions",
    detail:
      "Tracks landmark[8] (INDEX_FINGER_TIP) with exponential smoothing α=0.3. Mirror mode inverts X axis. Move smoothly — jitter is dampened automatically.",
  },
  {
    emoji: "✊",
    name: "Click / Tap",
    color: C.purple,
    trigger: "Close hand into a fist",
    action: "LEFT CLICK / TAP at current pointer position",
    detail:
      "All 5 fingertips drop below PIP joints. Fires on closing motion. 400ms cooldown prevents accidental double-clicks. Haptics fire a 40ms pulse.",
  },
  {
    emoji: "✋",
    name: "Scroll",
    color: C.green,
    trigger: "Open palm, all fingers extended",
    action: "Scroll content up or down",
    detail:
      "All fingers extended with wrist pitch detection. Tilt UP = scroll up, DOWN = scroll down. ±10° dead zone at neutral to prevent drift.",
  },
  {
    emoji: "✌️",
    name: "Go Back",
    color: C.orange,
    trigger: "Peace sign — index + middle up",
    action: "ESC / Navigate back / Previous step",
    detail:
      "Index[8] and middle[12] extended, ring and pinky curled. Quick flash (<300ms) = single BACK. Hold 600ms = root/home. Orange ripple flash on activation.",
  },
  {
    emoji: "🤏",
    name: "Go Home",
    color: C.yellow,
    trigger: "Pinch — thumb touches index tip",
    action: "Home — returns to main screen",
    detail:
      "dist(landmark[4], landmark[8]) < 0.06 threshold. Quick pinch = HOME. Hold >600ms = App Switcher. Glowing arc animation sweeps up from bottom.",
  },
  {
    emoji: "👈",
    name: "Swipe Left",
    color: C.red,
    trigger: "Open palm sweeping right → left",
    action: "Navigate back / previous slide",
    detail:
      "Tracks wrist X-position across 500ms window. Fires when delta exceeds 0.18 screen width. 600ms cooldown after trigger.",
  },
  {
    emoji: "👉",
    name: "Swipe Right",
    color: C.green,
    trigger: "Open palm sweeping left → right",
    action: "Navigate forward / next slide",
    detail:
      "Same detection as Swipe Left but positive delta direction. 600ms cooldown.",
  },
];

const ML_SPECS = [
  ["Engine", "MediaPipe Hands", C.green],
  ["Landmarks", "21 per hand", C.teal],
  ["Inference", "WASM + SIMD", C.primary],
  ["FPS target", "60 (rVFC sync)", C.green],
  ["Hands", "1 (configurable)", C.purple],
  ["Privacy", "Zero network calls", C.green],
] as const;

export default function Dictionary() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Gestures</Text>
        <Text style={styles.subtitle}>MediaPipe · 21 landmarks · On-device ML</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              Platform.OS === "web" ? 34 + 90 : insets.bottom + 90,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {GESTURES.map((g) => (
          <View
            key={g.name}
            style={[styles.gestureCard, { borderColor: `${g.color}25` }]}
          >
            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: `${g.color}15`,
                    borderColor: `${g.color}35`,
                  },
                ]}
              >
                <Text style={styles.cardEmoji}>{g.emoji}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{g.name}</Text>
                <View
                  style={[
                    styles.triggerPill,
                    {
                      backgroundColor: `${g.color}15`,
                      borderColor: `${g.color}30`,
                    },
                  ]}
                >
                  <Text style={[styles.triggerText, { color: g.color }]}>
                    {g.trigger}
                  </Text>
                </View>
                <Text style={[styles.actionText, { color: g.color }]}>
                  → {g.action}
                </Text>
                <Text style={styles.detailText}>{g.detail}</Text>
              </View>
            </View>
            <View
              style={[styles.cardAccent, { backgroundColor: g.color }]}
            />
          </View>
        ))}

        <View style={styles.mlCard}>
          <Text style={styles.mlCardLabel}>ML STACK</Text>
          <View style={styles.mlGrid}>
            {ML_SPECS.map(([k, v, c]) => (
              <View key={k} style={styles.mlItem}>
                <Text style={styles.mlKey}>{k}</Text>
                <Text style={[styles.mlVal, { color: c }]}>{v}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.background },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 13,
    color: C.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  scrollContent: {
    paddingHorizontal: 14,
    gap: 10,
  },
  gestureCard: {
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  },
  cardRow: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  cardEmoji: { fontSize: 28 },
  cardContent: { flex: 1, gap: 5 },
  cardName: {
    fontSize: 15,
    color: C.text,
    fontFamily: "Inter_700Bold",
  },
  triggerPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  triggerText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  actionText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  detailText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
  cardAccent: {
    height: 2,
    opacity: 0.35,
  },
  mlCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: `${C.teal}25`,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 14,
    marginTop: 4,
    gap: 12,
  },
  mlCardLabel: {
    fontSize: 10,
    color: C.textQuaternary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  mlGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  mlItem: {
    width: "47%",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: C.border,
    gap: 3,
  },
  mlKey: {
    fontSize: 10,
    color: C.textQuaternary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  mlVal: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
});
