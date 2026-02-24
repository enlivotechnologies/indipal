import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' } // Hide default tab bar for total control
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracking"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="care"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="account/wallet"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profiles/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services/errands"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="account/notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profiles/pal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services/grocery"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services/pharmacy"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services/care-service"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services/nurse"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="services/house-help"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profiles/caretaker"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
