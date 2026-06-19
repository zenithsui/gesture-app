import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGesture } from "@/context/GestureContext";
import colors from "@/constants/colors";

const C = colors.dark;

function TrackSlider({
  value,
  min,
  max,
  step,
  onChange,
  accent = C.primary,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  const trackWidth = useRef(0);

  const pct = (value - min) / (max - min);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        if (trackWidth.current === 0) return;
        const raw = gs.moveX / trackWidth.current;
        const clamped = Math.min(1, Math.max(0, raw));
        const range = max - min;
        const steps = Math.round((clamped * range) / step);
        const newVal = parseFloat((min + steps * step).toFixed(3));
        if (newVal !== value) {
          if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => {});
          }
          onChange(newVal);
        }
      },
    })
  ).current;

  return (
    <View
      style={styles.sliderTrack}
      onLayout={(e) => {
        trackWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.sliderFill,
          { width: `${pct * 100}%` as unknown as number, backgroundColor: accent },
        ]}
      />
      <View
        style={[
          styles.sliderThumb,
          {
            left: `${pct * 100}%` as unknown as number,
            backgroundColor: accent,
            shadowColor: accent,
          },
        ]}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function Row({
  label,
  sub,
  right,
  last,
}: {
  label: string;
  sub?: string;
  right: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.row,
        !last && { borderBottomWidth: 1, borderBottomColor: C.border },
      ]}
    >
      <View style={styles.rowLabels}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  display,
  accent,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  accent?: string;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color: accent ?? C.primary }]}>
          {display}
        </Text>
      </View>
      <TrackSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={onChange}
        accent={accent}
      />
    </View>
  );
}

const PERF_SPECS = [
  ["Target FPS", "60 (rVFC sync)", C.green],
  ["Click Latency", "< 60ms", C.teal],
  ["Model", "MediaPipe Hands v1 (lite)", C.primary],
  ["Processing", "On-device only", C.purple],
  ["Network calls", "Zero", C.green],
] as const;

export default function Settings() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const { settings, updateSetting } = useGesture();

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Gesture · On-device</Text>
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
        <Section title="Pointer">
          <View style={styles.slidersCard}>
            <SliderRow
              label="Pointer Size"
              value={settings.pointerSize}
              min={12}
              max={48}
              step={4}
              display={`${settings.pointerSize}px`}
              onChange={(v) => updateSetting("pointerSize", v)}
            />
            <View style={styles.divider} />
            <SliderRow
              label="Speed Multiplier"
              value={settings.pointerSpeed}
              min={0.5}
              max={3}
              step={0.5}
              display={`${settings.pointerSpeed}×`}
              accent={C.teal}
              onChange={(v) => updateSetting("pointerSpeed", v)}
            />
            <View style={styles.divider} />
            <SliderRow
              label="Smoothing (α)"
              value={settings.smoothing}
              min={0.1}
              max={0.9}
              step={0.05}
              display={settings.smoothing.toFixed(2)}
              accent={C.purple}
              onChange={(v) => updateSetting("smoothing", v)}
            />
          </View>
        </Section>

        <Section title="Click Sensitivity">
          <View style={styles.slidersCard}>
            <SliderRow
              label="Threshold"
              value={settings.clickSens}
              min={0.02}
              max={0.2}
              step={0.01}
              display={settings.clickSens.toFixed(2)}
              accent={C.orange}
              onChange={(v) => updateSetting("clickSens", v)}
            />
          </View>
        </Section>

        <Section title="Feedback">
          <Row
            label="Sound Effects"
            sub="Confirmation tones on gesture trigger"
            right={
              <Switch
                value={settings.sound}
                onValueChange={(v) => updateSetting("sound", v)}
                trackColor={{ false: C.border, true: C.green }}
                thumbColor="#fff"
              />
            }
          />
          <Row
            label="Haptic Feedback"
            sub="Vibration pulse per gesture"
            last
            right={
              <Switch
                value={settings.haptics}
                onValueChange={(v) => updateSetting("haptics", v)}
                trackColor={{ false: C.border, true: C.green }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

        <Section title="Display">
          <Row
            label="Mirror Camera"
            sub="Flip horizontally (selfie mode)"
            right={
              <Switch
                value={settings.mirrorCam}
                onValueChange={(v) => updateSetting("mirrorCam", v)}
                trackColor={{ false: C.border, true: C.green }}
                thumbColor="#fff"
              />
            }
          />
          <Row
            label="Show FPS Counter"
            right={
              <Switch
                value={settings.showFps}
                onValueChange={(v) => updateSetting("showFps", v)}
                trackColor={{ false: C.border, true: C.green }}
                thumbColor="#fff"
              />
            }
          />
          <Row
            label="Dark Pointer"
            sub="Black pointer instead of white"
            last
            right={
              <Switch
                value={settings.darkPointer}
                onValueChange={(v) => updateSetting("darkPointer", v)}
                trackColor={{ false: C.border, true: C.green }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

        <Section title="Handedness">
          <View style={styles.handednessRow}>
            {(["auto", "left", "right"] as const).map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => updateSetting("handedness", h)}
                activeOpacity={0.7}
                style={[
                  styles.handBtn,
                  {
                    backgroundColor:
                      settings.handedness === h
                        ? `${C.primary}20`
                        : "rgba(255,255,255,0.05)",
                    borderColor:
                      settings.handedness === h
                        ? C.primary
                        : "rgba(255,255,255,0.1)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.handBtnText,
                    {
                      color:
                        settings.handedness === h
                          ? C.primary
                          : "rgba(255,255,255,0.4)",
                    },
                  ]}
                >
                  {h.charAt(0).toUpperCase() + h.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <Section title="Wake Word">
          <Row
            label='"Open bro"'
            sub="Voice activation for gesture control"
            last
            right={
              <Switch
                value={settings.wakeWord}
                onValueChange={(v) => updateSetting("wakeWord", v)}
                trackColor={{ false: C.border, true: C.green }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

        <View style={styles.perfCard}>
          <Text style={styles.mlCardLabel}>PERFORMANCE SPEC</Text>
          <View style={styles.perfList}>
            {PERF_SPECS.map(([k, v, c]) => (
              <View key={k} style={styles.perfRow}>
                <Text style={styles.perfKey}>{k}</Text>
                <Text style={[styles.perfVal, { color: c }]}>{v}</Text>
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
    gap: 8,
  },
  section: { gap: 6 },
  sectionTitle: {
    fontSize: 11,
    color: C.textTertiary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    paddingHorizontal: 4,
    textTransform: "uppercase",
  },
  sectionCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  slidersCard: {
    padding: 14,
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  rowLabels: { flex: 1 },
  rowLabel: {
    fontSize: 14,
    color: C.text,
    fontFamily: "Inter_500Medium",
  },
  rowSub: {
    fontSize: 12,
    color: C.textTertiary,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },
  sliderRow: { gap: 10 },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    position: "relative",
    justifyContent: "center",
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
  sliderThumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: -9,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  handednessRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  handBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
  },
  handBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  perfCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${C.primary}25`,
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  mlCardLabel: {
    fontSize: 10,
    color: C.textQuaternary,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  perfList: { gap: 8 },
  perfRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  perfKey: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "Inter_400Regular",
  },
  perfVal: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
