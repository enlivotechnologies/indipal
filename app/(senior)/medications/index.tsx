import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BRAND_PURPLE = '#6E5BFF';

const MEDICATIONS = [
    { id: "1", name: "Amlodipine", dosage: "5mg", time: "08:00 AM", status: "Taken", color: "#6E5BFF" },
    { id: "2", name: "Metformin", dosage: "500mg", time: "01:00 PM", status: "Taken", color: "#3BB273" },
    { id: "3", name: "Atorvastatin", dosage: "10mg", time: "08:00 PM", status: "Pending", color: "#FFB800" },
];

export default function MedicationsList() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('services') ? 'Services' :
            pathname.includes('health') ? 'Health' :
                pathname.includes('video') ? 'Video' : 'Home';

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home' as any);
        if (tab === 'Services') router.replace('/(senior)/services' as any);
        if (tab === 'Health') router.replace('/(senior)/health' as any);
        if (tab === 'Video') router.replace('/(senior)/video' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row justify-between items-center bg-white"
            >
                <View>
                    <Text className="text-xs font-bold text-indigo-400 uppercase tracking-widest">EnlivoCare</Text>
                    <Text className="text-2xl font-black text-gray-900">Medications</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                >
                    <Ionicons name="chevron-back" size={20} color={BRAND_PURPLE} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 120
                }}
            >
                {/* 1. Progress Hero Card */}
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="mb-8 mt-6">
                    <View className="bg-indigo-600 p-8 rounded-[40px] shadow-xl shadow-indigo-100">
                        <Text className="text-white/70 text-xs font-black uppercase tracking-[2px]">Daily Adherence</Text>
                        <View className="flex-row items-baseline mt-2">
                            <Text className="text-white text-5xl font-black">2 of 3</Text>
                            <Text className="text-white/50 text-base font-bold ml-2">Doses Taken</Text>
                        </View>
                        <View className="h-2 w-full bg-white/10 rounded-full mt-6 overflow-hidden">
                            <View className="h-full bg-white rounded-full" style={{ width: '66.6%' }} />
                        </View>
                    </View>
                </Animated.View>

                {/* Daily Schedule List */}
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Today's Schedule</Text>

                <View className="gap-y-4">
                    {MEDICATIONS.map((med, idx) => (
                        <Animated.View
                            key={med.id}
                            entering={FadeInUp.delay(200 + idx * 100).duration(600)}
                        >
                            <TouchableOpacity
                                onPress={() => router.push(`/(senior)/medications/${med.id}` as any)}
                                activeOpacity={0.9}
                                className="bg-white p-5 rounded-[28px] border border-gray-100 flex-row items-center shadow-sm"
                            >
                                <View style={{ backgroundColor: med.color }} className="w-1.5 h-10 rounded-full" />
                                <View className="ml-5 flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">{med.name}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-400 text-xs font-medium">{med.dosage}</Text>
                                        <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                                        <Text className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">{med.time}</Text>
                                    </View>
                                </View>
                                <View className={`px-4 py-2 rounded-2xl ${med.status === 'Taken' ? 'bg-emerald-50 border border-emerald-100' : 'bg-orange-50 border border-orange-100'}`}>
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${med.status === 'Taken' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                        {med.status}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Refill Reminder */}
                <Animated.View entering={FadeInUp.delay(600).duration(600)} className="mt-12 bg-gray-50 p-6 rounded-[32px] border border-gray-200/50 flex-row items-center">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-gray-100">
                        <Ionicons name="refresh" size={20} color={BRAND_PURPLE} />
                    </View>
                    <View className="ml-5 flex-1">
                        <Text className="text-gray-900 font-bold">Refill Needed Soon</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Amlodipine • 3 Days left</Text>
                    </View>
                    <TouchableOpacity className="bg-white px-4 py-2 rounded-xl border border-indigo-100">
                        <Text className="text-indigo-600 text-[10px] font-black uppercase">Order</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            {/* Premium FAB - Larger for Senior */}
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.seniorFAB}
                className="absolute bottom-32 right-8 w-16 h-16 rounded-[24px] bg-indigo-600 items-center justify-center shadow-xl shadow-indigo-300"
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            {/* Custom Floating Bottom Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row justify-between items-center h-16 rounded-[28px] px-3 shadow-2xl">
                    <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
                    <TabButton icon="grid" label="Services" active={activeTab === 'Services'} onPress={() => handleTabPress('Services')} />
                    <TabButton icon="heart" label="Health" active={activeTab === 'Health'} onPress={() => handleTabPress('Health')} />
                    <TabButton icon="videocam" label="Video" active={activeTab === 'Video'} onPress={() => handleTabPress('Video')} />
                </View>
            </Animated.View>
        </View>
    );
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
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    },
    seniorFAB: {
        zIndex: 99,
    }
});
