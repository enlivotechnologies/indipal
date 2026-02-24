import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BRAND_PURPLE = '#6E5BFF';

export default function SOSScreen() {
    const [isActivating, setIsActivating] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('services') ? 'Services' :
            pathname.includes('health') ? 'Health' :
                pathname.includes('video') ? 'Video' : 'SOS';

    const handleSOS = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsActivating(true);
        // Simulate emergency call logic
        setTimeout(() => {
            setIsActivating(false);
            Alert.alert(
                "Emergency Alert Sent",
                "Your family members and the nearest emergency services have been notified. Stay calm, help is on the way.",
                [{ text: "OK" }]
            );
        }, 2000);
    };

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home' as any);
        if (tab === 'Services') router.replace('/(senior)/services' as any);
        if (tab === 'Health') router.replace('/(senior)/health' as any);
        if (tab === 'Video') router.replace('/(senior)/video' as any);
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withRepeat(withSequence(withTiming(1.1, { duration: 1000 }), withTiming(1, { duration: 1000 })), -1) }],
        opacity: withRepeat(withTiming(0.6, { duration: 1000 }), -1),
    }));

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
                    <Text className="text-xs font-black text-red-400 uppercase tracking-widest">Emergency</Text>
                    <Text className="text-2xl font-black text-gray-900">SOS Center</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                >
                    <Ionicons name="chevron-back" size={20} color={BRAND_PURPLE} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-8 items-center justify-center">
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50 mb-12 flex-row items-center">
                    <Ionicons name="information-circle" size={24} color={BRAND_PURPLE} />
                    <Text className="text-indigo-900/70 font-medium text-sm ml-4 flex-1">
                        Pressing SOS will immediately notify your care circle and emergency services.
                    </Text>
                </Animated.View>

                {/* The SOS Button - Elevated & Animated */}
                <View className="items-center justify-center">
                    {!isActivating && (
                        <Animated.View style={[pulseStyle, styles.sosPulse]} className="w-64 h-64 rounded-full bg-red-100 absolute" />
                    )}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleSOS}
                        disabled={isActivating}
                        style={[styles.sosButton, isActivating && styles.sosButtonActive]}
                        className="w-56 h-56 rounded-full items-center justify-center shadow-2xl shadow-red-300"
                    >
                        <Ionicons name="alert" size={72} color="white" />
                        <Text className="text-white font-black text-3xl mt-2 tracking-widest">
                            {isActivating ? "HOLDING..." : "SOS"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Emergency Contacts Section */}
                <View className="w-full mt-16">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Emergency Contacts</Text>
                    <Animated.View entering={FadeInUp.delay(300).duration(600)} className="bg-white p-6 rounded-[32px] border border-gray-100 flex-row items-center shadow-sm">
                        <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center">
                            <Ionicons name="person" size={24} color={BRAND_PURPLE} />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-gray-900 font-bold text-base">Vivek (Primary)</Text>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Son • +91 98765 43210</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                            className="w-12 h-12 bg-emerald-500 rounded-full items-center justify-center shadow-lg shadow-emerald-200"
                        >
                            <Ionicons name="call" size={20} color="white" />
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                <View className="h-20" />
            </View>

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
    sosButton: {
        backgroundColor: '#EF4444',
    },
    sosButtonActive: {
        backgroundColor: '#DC2626',
        transform: [{ scale: 0.95 }],
    },
    sosPulse: {
        zIndex: -1,
    }
});
