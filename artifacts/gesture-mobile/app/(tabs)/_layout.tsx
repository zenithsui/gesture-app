import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "camera", selected: "camera.fill" }} />
        <Label>Control</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tutorial">
        <Icon sf={{ default: "graduationcap", selected: "graduationcap.fill" }} />
        <Label>Tutorial</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="dictionary">
        <Icon sf={{ default: "hand.raised", selected: "hand.raised.fill" }} />
        <Label>Gestures</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Control",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="camera" tintColor={color} size={22} />
            ) : (
              <Feather name="camera" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="tutorial"
        options={{
          title: "Tutorial",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="graduationcap" tintColor={color} size={22} />
            ) : (
              <Feather name="play-circle" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="dictionary"
        options={{
          title: "Gestures",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="hand.raised" tintColor={color} size={22} />
            ) : (
              <Feather name="book-open" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="gearshape" tintColor={color} size={22} />
            ) : (
              <Feather name="settings" size={20} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
