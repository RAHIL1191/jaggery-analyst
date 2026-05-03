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
        <Icon sf={{ default: "chart.line.uptrend.xyaxis", selected: "chart.line.uptrend.xyaxis" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="market">
        <Icon sf={{ default: "globe.asia.australia", selected: "globe.asia.australia.fill" }} />
        <Label>Market</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="news">
        <Icon sf={{ default: "newspaper", selected: "newspaper.fill" }} />
        <Label>News</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="storage">
        <Icon sf={{ default: "building.2", selected: "building.2.fill" }} />
        <Label>Storage</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="advisor">
        <Icon sf={{ default: "brain.head.profile", selected: "brain.head.profile" }} />
        <Label>Advisor</Label>
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
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="chart.line.uptrend.xyaxis" tintColor={color} size={22} /> : <Feather name="trending-up" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: "Market",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="globe.asia.australia" tintColor={color} size={22} /> : <Feather name="globe" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: "News",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="newspaper" tintColor={color} size={22} /> : <Feather name="radio" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="storage"
        options={{
          title: "Storage",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="building.2" tintColor={color} size={22} /> : <Feather name="database" size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="advisor"
        options={{
          title: "Advisor",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="brain.head.profile" tintColor={color} size={22} /> : <Feather name="cpu" size={21} color={color} />,
        }}
      />
      <Tabs.Screen name="alerts" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
