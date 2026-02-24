import { useBookingStore } from "@/store/bookingStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function ActiveGigScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { bookings, updateBookingStatus } = useBookingStore();

    // Find the current active gig (Accepted status)
    const activeGig = bookings.find(b => b.status === "Accepted");

    const handleComplete = () => {
        if (!activeGig) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateBookingStatus(activeGig.id, 'Completed');
        router.replace('/(pal)/home');
    };

    if (!activeGig) {
        return (
            <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                <View className="w-24 h-24 bg-gray-50 rounded-full items-center justify-center mb-6">
                    <Ionicons name="briefcase-outline" size={40} color="#D1D5DB" />
                </View>
                <Text className="text-xl font-black text-gray-900 text-center">No Active Gig</Text>
                <Text className="text-gray-400 text-center mt-2 leading-6">Accept a gig from the marketplace to start your daily session.</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(pal)/home')}
                    className="mt-10 bg-emerald-500 px-8 py-4 rounded-2xl shadow-lg shadow-emerald-200"
                >
                    <Text className="text-white font-black uppercase tracking-widest text-xs">Browse Jobs</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center justify-between border-b border-gray-50 bg-white">
                <Text className="text-2xl font-black text-gray-900">Active Gig</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(pal)/profile' as any)}
                    className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                >
                    <Ionicons name="person-outline" size={20} color="#10B981" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}>
                <Animated.View entering={FadeInUp.duration(600)} className="bg-gray-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden mb-10">
                    <View className="flex-row items-center mb-8">
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1544144433-d50aff500b91?auto=format&fit=crop&q=80&w=100' }}
                            className="w-16 h-16 rounded-2xl"
                        />
                        <View className="ml-4">
                            <Text className="text-white font-black text-xl">{activeGig.userName}</Text>
                            <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Ongoing Care Session</Text>
                        </View>
                    </View>

                    <View className="gap-y-6 mb-8">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                                <Ionicons name="location" size={20} color="white" />
                            </View>
                            <View className="ml-4">
                                <Text className="text-white/50 text-[10px] uppercase font-black">Location</Text>
                                <Text className="text-white font-bold text-sm">Sector 4, HSR Layout, BLR</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                                <Ionicons name="time" size={20} color="white" />
                            </View>
                            <View className="ml-4">
                                <Text className="text-white/50 text-[10px] uppercase font-black">Started At</Text>
                                <Text className="text-white font-bold text-sm">{activeGig.time}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Session Checklist</Text>

                {[
                    { id: 1, task: 'Arrival Check-in', done: true },
                    { id: 2, task: 'Morning Medication', done: false },
                    { id: 3, task: 'Light Exercises', done: false },
                    { id: 4, task: 'BP Monitoring', done: false },
                    { id: 5, task: 'Hydration Log', done: false },
                ].map((item, idx) => (
                    <TouchableOpacity
                        key={item.id}
                        className={`flex-row items-center p-6 rounded-[24px] mb-4 border ${item.done ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}
                    >
                        <View className={`w-6 h-6 rounded-lg items-center justify-center ${item.done ? 'bg-emerald-500' : 'bg-white border border-gray-200'}`}>
                            {item.done && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                        <Text className={`ml-4 font-bold text-sm ${item.done ? 'text-emerald-900' : 'text-gray-600'}`}>{item.task}</Text>
                    </TouchableOpacity>
                ))}

                <TouchableOpacity
                    onPress={handleComplete}
                    className="mt-10 bg-gray-900 py-6 rounded-[24px] items-center shadow-2xl"
                >
                    <Text className="text-white font-black uppercase tracking-widest text-sm">Complete Gig • ₹{activeGig.price}</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Custom Bottom Tab Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row items-center h-16 rounded-[28px] px-2 shadow-2xl">
                    <TabButton icon="home" label="Home" active={false} onPress={() => router.replace('/(pal)/home')} />
                    <TabButton icon="briefcase" label="Gig" active={true} onPress={() => router.replace('/(pal)/active-gig')} />
                    <TabButton icon="wallet" label="Earnings" active={false} onPress={() => router.replace('/(pal)/earnings')} />
                    <TabButton icon="school" label="Training" active={false} onPress={() => router.replace('/(pal)/training')} />
                </View>
            </Animated.View>
        </View>
    );
}

function TabButton({ icon, label, active, onPress }: any) {
    return (
        <View className="flex-1 h-full items-center justify-center">
            <TouchableOpacity
                onPress={onPress}
                className={`flex-row items-center justify-center px-4 h-10 rounded-2xl ${active ? 'bg-emerald-500' : ''}`}
            >
                <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
                {active && <Text numberOfLines={1} className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
