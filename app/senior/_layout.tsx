import { Tabs } from "expo-router";

export default function SeniorLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
      <Tabs.Screen name="sos" options={{ title: "SOS" }} />
    </Tabs>
  );
}
