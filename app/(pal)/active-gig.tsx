import { BottomTab } from "@/components/pal/BottomTab";
import { useBookingStore } from "@/store/bookingStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function ActiveGigScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { bookings, updateGigStatus, completeGig, updateServiceStatus } = useBookingStore();

    // Find the current active gig
    const activeGig = bookings.find(b => ["accepted", "on_the_way", "on_site", "in_progress"].includes(b.status));

    const handleAction = async () => {
        if (!activeGig) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (activeGig.status === 'accepted') {
            await updateGigStatus(activeGig.id, 'on_the_way');
        } else if (activeGig.status === 'on_the_way') {
            await updateGigStatus(activeGig.id, 'on_site');
        } else if (activeGig.status === 'on_site') {
            await updateGigStatus(activeGig.id, 'in_progress');
        } else if (activeGig.status === 'in_progress') {
            const res = await completeGig(activeGig.id);
            if (res.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace('/(pal)/home');
            }
        }
    };

    const getButtonStyles = () => {
        if (!activeGig) return { text: 'Unknown', bg: 'bg-gray-400' };
        switch (activeGig.status) {
            case 'accepted': return { text: 'Start Travel', bg: 'bg-indigo-600' };
            case 'on_the_way': return { text: 'Mark Arrived', bg: 'bg-orange-500' };
            case 'on_site': return { text: 'Start Session', bg: 'bg-emerald-600' };
            case 'in_progress': return { text: `Complete Gig • ₹${activeGig.price}`, bg: 'bg-gray-900' };
            default: return { text: 'Action', bg: 'bg-gray-900' };
        }
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

    const btn = getButtonStyles();

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center justify-between border-b border-gray-50 bg-white">
                <Text className="text-2xl font-black text-gray-900">Active Gig</Text>
                <View className="flex-row items-center gap-x-2">
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/(pal)/chat/[id]', params: { id: activeGig.palId } } as any)}
                        className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                    >
                        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#10B981" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}>
                <Animated.View entering={FadeInUp.duration(600)} className="bg-gray-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden mb-10">
                    <View className="flex-row items-center mb-8">
                        <View className="w-16 h-16 bg-emerald-500/20 rounded-2xl items-center justify-center overflow-hidden">
                            <Ionicons name="person" size={32} color="white" />
                        </View>
                        <View className="ml-4">
                            <Text className="text-white font-black text-xl">{activeGig.clientName}</Text>
                            <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{activeGig.title}</Text>
                        </View>
                    </View>

                    <View className="gap-y-6 mb-8">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                                <Ionicons name="location" size={20} color="white" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-white/50 text-[10px] uppercase font-black">Location</Text>
                                <Text className="text-white font-bold text-sm" numberOfLines={1}>{activeGig.location.address}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                                <Ionicons name="time" size={20} color="white" />
                            </View>
                            <View className="ml-4">
                                <Text className="text-white/50 text-[10px] uppercase font-black">Scheduled Time</Text>
                                <Text className="text-white font-bold text-sm">{activeGig.time}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between pt-4 border-t border-white/10">
                        <View>
                            <Text className="text-white/40 text-[10px] uppercase font-black">Session Status</Text>
                            <Text className="text-emerald-400 font-black text-xs uppercase mt-1">● {activeGig.status.replace(/_/g, ' ')}</Text>
                        </View>
                        <View className="items-end">
                            <Text className="text-white/40 text-[10px] uppercase font-black">Total Amount</Text>
                            <Text className="text-white font-black text-lg mt-1">₹{activeGig.price}</Text>
                        </View>
                    </View>

                    {/* Overall Progress for Gig */}
                    {activeGig.services && activeGig.services.length > 0 && (
                        <View className="mt-6">
                            <View className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <View
                                    style={{ width: `${(activeGig.services.filter(s => s.status === 'completed').length / activeGig.services.length) * 100}%` }}
                                    className="h-full bg-emerald-500"
                                />
                            </View>
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-white/30 text-[7px] font-black uppercase tracking-widest">
                                    {activeGig.services.filter(s => s.status === 'completed').length} of {activeGig.services.length} services completed
                                </Text>
                                <Text className="text-emerald-400 text-[7px] font-black uppercase tracking-widest">
                                    {Math.round((activeGig.services.filter(s => s.status === 'completed').length / activeGig.services.length) * 100)}%
                                </Text>
                            </View>
                        </View>
                    )}
                </Animated.View>

                {/* Service Items Section */}
                {["on_site", "in_progress", "completed", "accepted", "on_the_way"].includes(activeGig.status) && activeGig.services && activeGig.services.length > 0 && (
                    <View className="mb-10">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Services List</Text>
                        {activeGig.services.map((service, idx) => (
                            <Animated.View
                                key={service.id}
                                entering={FadeInUp.delay(100 * idx)}
                                className={`p-6 rounded-[32px] mb-4 border ${service.status === 'completed' ? 'bg-emerald-50 border-emerald-100' :
                                    service.status === 'in_progress' ? 'bg-orange-50 border-orange-100' :
                                        'bg-gray-50 border-gray-100'
                                    }`}
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-1 mr-4">
                                        <Text className={`text-base font-bold ${service.status === 'completed' ? 'text-emerald-900' : 'text-gray-900'}`}>{service.title}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">{service.duration} • ₹{service.price}</Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${service.status === 'completed' ? 'bg-emerald-500/10' :
                                        service.status === 'in_progress' ? 'bg-orange-500/10' :
                                            'bg-gray-200/50'
                                        }`}>
                                        <Text className={`text-[8px] font-black uppercase ${service.status === 'completed' ? 'text-emerald-600' :
                                            service.status === 'in_progress' ? 'text-orange-600' :
                                                'text-gray-400'
                                            }`}>{service.status.replace(/_/g, ' ')}</Text>
                                    </View>
                                </View>

                                {service.status === 'pending' && activeGig.status !== 'completed' && activeGig.status !== 'accepted' && activeGig.status !== 'on_the_way' && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                            updateServiceStatus(activeGig.id, service.id, 'in_progress');
                                        }}
                                        className="bg-gray-900 py-3 rounded-2xl items-center"
                                    >
                                        <Text className="text-white font-black text-[10px] uppercase tracking-widest">Start Service</Text>
                                    </TouchableOpacity>
                                )}

                                {service.status === 'in_progress' && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                            updateServiceStatus(activeGig.id, service.id, 'completed');
                                        }}
                                        className="bg-emerald-600 py-3 rounded-2xl items-center"
                                    >
                                        <Text className="text-white font-black text-[10px] uppercase tracking-widest">Mark Completed</Text>
                                    </TouchableOpacity>
                                )}
                            </Animated.View>
                        ))}
                    </View>
                )}

                {/* Fallback for single service gigs or initial phases */}
                {(!activeGig.services || activeGig.services.length === 0 || !["on_site", "in_progress"].includes(activeGig.status)) && (
                    <>
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Session Protocol</Text>
                        {[
                            { id: 1, task: 'Acceptance & Assignment', done: ['accepted', 'on_the_way', 'on_site', 'in_progress'].includes(activeGig.status) },
                            { id: 2, task: 'Travel Started', done: ['on_the_way', 'on_site', 'in_progress'].includes(activeGig.status) },
                            { id: 3, task: 'Arrived at Site', done: ['on_site', 'in_progress'].includes(activeGig.status) },
                            { id: 4, task: 'Service In Progress', done: ['in_progress'].includes(activeGig.status) },
                            { id: 5, task: 'Payment & Completion', done: activeGig.status === 'completed' },
                        ].map((item, idx) => (
                            <View
                                key={item.id}
                                className={`flex-row items-center p-6 rounded-[24px] mb-4 border ${item.done ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100'}`}
                            >
                                <View className={`w-6 h-6 rounded-lg items-center justify-center ${item.done ? 'bg-emerald-500' : 'bg-white border border-gray-200'}`}>
                                    {item.done && <Ionicons name="checkmark" size={14} color="white" />}
                                </View>
                                <Text className={`ml-4 font-bold text-sm ${item.done ? 'text-emerald-900' : 'text-gray-600'}`}>{item.task}</Text>
                            </View>
                        ))}
                    </>
                )}

                {/* Main Action Button Logic */}
                {activeGig.status !== 'completed' && (
                    <TouchableOpacity
                        onPress={handleAction}
                        className={`mt-6 ${btn.bg} py-6 rounded-[32px] items-center shadow-2xl overflow-hidden ${activeGig.status === 'in_progress' && activeGig.services?.some(s => s.status !== 'completed') ? 'opacity-50' : ''}`}
                        disabled={activeGig.status === 'in_progress' && activeGig.services?.some(s => s.status !== 'completed')}
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.05)']}
                            className="absolute inset-0"
                        />
                        <Text className="text-white font-black uppercase tracking-widest text-sm">{btn.text}</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <BottomTab activeTab="Gig" />
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
