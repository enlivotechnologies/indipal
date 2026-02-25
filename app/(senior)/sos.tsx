import { useErrandStore } from "@/store/errandStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BRAND_PURPLE = '#6E5BFF';

export default function SOSScreen() {
  const { auto } = useLocalSearchParams();
  const [isActivating, setIsActivating] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { triggerSOS } = useErrandStore();

  const primaryFamilyMember = {
    name: 'Vivek Chandra',
    phone: '+91 98765 43210'
  };

  const handleCallMember = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${primaryFamilyMember.phone}`);
  };

  const handleSOS = () => {
    if (sosTriggered) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsActivating(true);

    // Trigger immediate alert in store
    triggerSOS("Ramesh Chandra", "4th Floor, HSR Layout, Sector 2");

    // Auto-trigger call to family member
    handleCallMember();

    setTimeout(() => {
      setIsActivating(false);
      setSosTriggered(true);

      Alert.alert(
        "SOS DISPATCHED",
        "Your family members and the nearest officials have been notified lively. Help is on the way.",
        [{ text: "OK" }]
      );
    }, 1000); // Small delay for visual feedback of the "HOLD" state
  };

  useEffect(() => {
    if (auto === 'true' && !sosTriggered) {
      handleSOS();
    }
  }, [auto]);

  const activeTab = pathname.includes('home') ? 'Home' :
    pathname.includes('services') ? 'Services' :
      pathname.includes('health') ? 'Health' :
        pathname.includes('video') ? 'Video' : 'SOS';

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tab === 'Home') router.replace('/(senior)/home' as any);
    if (tab === 'Services') router.replace('/(senior)/services' as any);
    if (tab === 'Health') router.replace('/(senior)/health' as any);
    if (tab === 'Video') router.replace('/(senior)/video' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: sosTriggered ? '#FEF2F2' : '#FFFFFF' }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
        ]}
        className={`px-6 flex-row justify-between items-center ${sosTriggered ? 'bg-red-50' : 'bg-white'}`}
      >
        <View>
          <Text className={`text-[10px] font-black uppercase tracking-[2px] ${sosTriggered ? 'text-red-600' : 'text-red-400'}`}>
            {sosTriggered ? 'ACTIVE ALERT' : 'Emergency'}
          </Text>
          <Text className="text-2xl font-black text-gray-900">SOS Center</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.back()}
          className={`w-12 h-12 rounded-2xl items-center justify-center border ${sosTriggered ? 'bg-red-100 border-red-200' : 'bg-indigo-50 border-indigo-100'}`}
        >
          <Ionicons name="chevron-back" size={24} color={sosTriggered ? '#DC2626' : BRAND_PURPLE} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-8 items-center pt-8 pb-32">
          <Animated.View entering={FadeInUp.delay(100).duration(600)} className={`${sosTriggered ? 'bg-red-100 border-red-200' : 'bg-indigo-50/50 border-indigo-100/50'} p-6 rounded-[32px] border mb-12 flex-row items-center`}>
            <Ionicons name={sosTriggered ? "shield-checkmark" : "information-circle"} size={26} color={sosTriggered ? "#DC2626" : BRAND_PURPLE} />
            <Text className={`${sosTriggered ? 'text-red-900' : 'text-indigo-900/70'} font-black text-sm ml-4 flex-1`}>
              {sosTriggered
                ? "Help is arriving in 5-8 mins. Your location is being shared in real-time."
                : "Pressing SOS will immediately notify your care circle and emergency services."}
            </Text>
          </Animated.View>

          {/* The SOS Button - Elevated & Animated */}
          <View className="items-center justify-center mt-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSOS}
              disabled={isActivating || sosTriggered}
              style={[
                styles.sosButton,
                isActivating && styles.sosButtonActive,
                sosTriggered && { backgroundColor: '#10B981', shadowColor: '#10B981' }
              ]}
              className="w-56 h-56 rounded-full items-center justify-center shadow-2xl"
            >
              <Ionicons name={sosTriggered ? "checkmark-circle" : "alert"} size={80} color="white" />
              <Text className="text-white font-black text-3xl mt-2 tracking-widest">
                {isActivating ? "WAITING..." : sosTriggered ? "SENT" : "SOS"}
              </Text>
            </TouchableOpacity>

            {sosTriggered && (
              <Text className="text-emerald-600 font-black text-xs uppercase tracking-widest mt-6">Family Notified • Officials Alerted</Text>
            )}
          </View>

          {/* Tracking Section for SOS Triggered */}
          {sosTriggered && (
            <Animated.View entering={FadeInDown} className="w-full mt-12 bg-white p-6 rounded-[40px] border border-red-100 shadow-xl shadow-red-100/20">
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Dispatch Status</Text>

              <StatusRow icon="people" label="Family" status="Notified" confirmed />
              <StatusRow icon="bus" label="Ambulance" status="En-route" confirmed />
              <StatusRow icon="shield" label="Security" status="Alerted" confirmed />
            </Animated.View>
          )}

          {/* Emergency Contacts Section */}
          <View className="w-full mt-12">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Primary Contacts</Text>
            <Animated.View entering={FadeInUp.delay(300).duration(600)} className="bg-white p-6 rounded-[32px] border border-gray-100 flex-row items-center shadow-sm">
              <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center">
                <Ionicons name="person" size={28} color={BRAND_PURPLE} />
              </View>
              <View className="ml-5 flex-1">
                <Text className="text-gray-900 font-black text-lg">{primaryFamilyMember.name}</Text>
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Son • Primary Care</Text>
              </View>
              <TouchableOpacity
                onPress={handleCallMember}
                className="w-14 h-14 bg-emerald-500 rounded-full items-center justify-center shadow-lg shadow-emerald-200"
              >
                <Ionicons name="call" size={24} color="white" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* Custom Floating Bottom Bar */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 bg-transparent"
        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      >
        <View style={styles.tabBar} className="bg-gray-900/95 flex-row justify-between items-center h-16 rounded-[28px] px-3 shadow-2xl">
          <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
          <TabButton icon="grid" label="Services" active={activeTab === 'Services'} onPress={() => handleTabPress('Services')} />
          <TabButton icon="heart" label="Health" active={activeTab === 'Health'} onPress={() => handleTabPress('Health')} />
          <TabButton icon="videocam" label="Video" active={activeTab === 'Video'} onPress={() => handleTabPress('Video')} />
        </View>
      </View>
    </View>
  );
}

function StatusRow({ icon, label, status, confirmed }: { icon: any, label: string, status: string, confirmed: boolean }) {
  return (
    <View className="flex-row items-center mb-6 last:mb-0">
      <View className={`w-10 h-10 rounded-xl items-center justify-center ${confirmed ? 'bg-emerald-50' : 'bg-gray-50'}`}>
        <Ionicons name={icon} size={18} color={confirmed ? '#10B981' : '#9CA3AF'} />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-gray-900 font-bold text-sm">{label}</Text>
        <Text className="text-gray-400 text-[10px] uppercase font-black tracking-widest">{status}</Text>
      </View>
      <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
        <Ionicons name="checkmark" size={14} color="white" />
      </View>
    </View>
  )
}

function TabButton({ icon, label, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-2 rounded-2xl ${active ? 'bg-indigo-600' : ''}`}
    >
      <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
      {active && <Text className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
    </TouchableOpacity>
  );
} const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBar: {
    ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
  },
  sosButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  sosButtonActive: {
    backgroundColor: '#DC2626',
    transform: [{ scale: 0.95 }],
  },
});
