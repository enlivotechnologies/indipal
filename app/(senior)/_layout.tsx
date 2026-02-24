import { Tabs } from "expo-router";
import React from 'react';

export default function SeniorLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="sos" options={{ title: "SOS" }} />
      <Tabs.Screen name="mood" options={{ href: null }} />
      <Tabs.Screen name="vitals/bp" options={{ href: null }} />
      <Tabs.Screen name="vitals/sugar" options={{ href: null }} />
      <Tabs.Screen name="vitals/weight" options={{ href: null }} />
      <Tabs.Screen name="vitals/water" options={{ href: null }} />
    </Tabs>
  );
}
