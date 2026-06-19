import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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

const GESTURES = [
  { emoji: "☝️", action: "Pointer" },
  { emoji: "✊", action: "Click" },
  { emoji: "✋", action: "Scroll" },
  { emoji: "✌️", action: "Back" },
  { emoji: "🤏", action: "Home" },
  { emoji: "👈", action: "← Swipe" },
  { emoji: "👉", action: "Swipe →" },
];

const PERMS = [
  {
    icon: "📷",
    title: "Camera",
    desc: "Real-time hand tracking — stays on-device",
    color: C.primary,
  },
  {
    icon: "📳",
    title: "Haptics",
    desc: "Vibration feedback on each gesture",
    color: C.purple,
  },
  {
    icon: "🔒",
    title: "Privacy",
    desc: "Zero network calls — all on-device",
    color: C.green,
  },
];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    AsyncStorage.getItem("gesture_onboarded").then((val) => {
      if (val === "true") router.replace("/(tabs)/");
    });
  }, []);

  const handleStart = async () => {
    if (Platform.OS !== "web") {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await AsyncStorage.setItem("gesture_onboarded", "true");
    router.replace("/(tabs)/");
  };

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: botPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>On-device · Zero network</Text>
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroEmoji}>✋</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>✓</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>Gesture</Text>
          <Text style={styles.subtitle}>Touchless Hand Control</Text>
        </View>

        <View style={styles.pillsSection}>
          <Text style={styles.sectionLabel}>7 GESTURES</Text>
          <View style={styles.pillsGrid}>
            {GESTURES.map((g) => (
              <View key={g.action} style={styles.pill}>
                <Text style={styles.pillEmoji}>{g.emoji}</Text>
                <Text style={styles.pillText}>{g.action}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.permsSection}>
          {PERMS.map((p) => (
            <View
              key={p.title}
              style={[styles.permCard, { borderColor: `${p.color}28` }]}
            >
              <View
                style={[
                  styles.permIconWrap,
                  {
                    backgroundColor: `${p.color}18`,
                    borderColor: `${p.color}30`,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{p.icon}</Text>
              </View>
              <View style={styles.permText}>
                <Text style={styles.permTitle}>{p.title}</Text>
                <Text style={styles.permDesc}>{p.desc}</Text>
              </View>
              <View
                style={[
                  styles.permBadgeOuter,
                  {
                    backgroundColor: `${p.color}28`,
                    borderColor: `${p.color}55`,
                  },
                ]}
              >
                <View
                  style={[styles.permBadgeInner, { backgroundColor: p.color }]}
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.8}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>Enable Gesture Control</Text>
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          All processing is on-device · No data leaves your device
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.background,
  },
  orb1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(10,132,255,0.06)",
    top: -80,
    left: -80,
  },
  orb2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(90,200,250,0.04)",
    bottom: 100,
    right: -60,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 20,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: C.border,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.green,
  },
  statusText: {
    fontSize: 12,
    color: C.text,
    fontFamily: "Inter_600SemiBold",
  },
  heroWrap: { position: "relative", marginTop: 8 },
  heroIcon: {
    width: 108,
    height: 108,
    borderRadius: 32,
    backgroundColor: "rgba(10,132,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(10,132,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroEmoji: { fontSize: 52 },
  heroBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
  },
  heroBadgeText: { fontSize: 14, color: "#fff" },
  titleSection: { alignItems: "center", gap: 4 },
  title: {
    fontSize: 40,
    color: C.text,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
  },
  subtitle: {
    fontSize: 15,
    color: C.textTertiary,
    fontFamily: "Inter_500Medium",
  },
  pillsSection: { width: "100%", gap: 10 },
  sectionLabel: {
    fontSize: 11,
    color: C.textTertiary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  pillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  pill: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: C.border,
    minWidth: 70,
  },
  pillEmoji: { fontSize: 22 },
  pillText: {
    fontSize: 11,
    color: C.mutedForeground,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  permsSection: { width: "100%", gap: 8 },
  permCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
  },
  permIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  permText: { flex: 1 },
  permTitle: {
    fontSize: 14,
    color: C.text,
    fontFamily: "Inter_600SemiBold",
  },
  permDesc: {
    fontSize: 12,
    color: C.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  permBadgeOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  permBadgeInner: { width: 8, height: 8, borderRadius: 4 },
  ctaButton: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: "center",
    marginTop: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  privacyNote: {
    fontSize: 12,
    color: C.textQuaternary,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
