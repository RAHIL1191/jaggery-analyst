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
      <NativeTabs.Trigger name="tools">
        <Icon sf={{ default: "wrench.and.screwdriver", selected: "wrench.and.screwdriver.fill" }} />
        <Label>Tools</Label>
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

  const HIDDEN = { href: null } as const;

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
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 10 },
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
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="wrench.and.screwdriver" tintColor={color} size={22} /> : <Feather name="grid" size={21} color={color} />,
        }}
      />

      {/* Hidden screens — accessible via router.push from Tools hub */}
      <Tabs.Screen name="advisor" options={HIDDEN} />
      <Tabs.Screen name="alerts" options={HIDDEN} />
      <Tabs.Screen name="calculator" options={HIDDEN} />
      <Tabs.Screen name="journal" options={HIDDEN} />
      <Tabs.Screen name="seasonal" options={HIDDEN} />
      <Tabs.Screen name="spread" options={HIDDEN} />
      <Tabs.Screen name="quality" options={HIDDEN} />
      <Tabs.Screen name="transport" options={HIDDEN} />
      <Tabs.Screen name="export" options={HIDDEN} />
      <Tabs.Screen name="policy" options={HIDDEN} />
      <Tabs.Screen name="chat" options={HIDDEN} />
      <Tabs.Screen name="settings" options={HIDDEN} />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
