import { BottomTab } from "@/components/pal/BottomTab";
import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";
import { useHealthStore } from "@/store/healthStore";
import { useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');
const BRAND_GREEN = '#10B981';
const DARK_GREEN = '#065F46';
const SOFT_GREEN = '#ECFDF5';

export default function PalHome() {
    const user = useAuthStore((state) => state.user);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const healthRecords = useHealthStore((state) => state.records);
    const { bookings, fetchGigs, hasNewGigs, setHasNewGigs, isLoading } = useBookingStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();

    useEffect(() => {
        fetchNotifications('pal');
        fetchGigs();

        const interval = setInterval(() => {
            fetchGigs();
        }, 20000);

        return () => clearInterval(interval);
    }, []);

    const pendingAppointments = bookings.filter(b => b.status === "open").sort((a, b) => b.timestamp - a.timestamp);
    const activeGig = bookings.find(b => ["accepted", "on_the_way", "on_site", "in_progress"].includes(b.status));


    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header - Aligned with other modules */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row justify-between items-center bg-white"
            >
                <View>
                    <Text className="text-xs font-bold text-emerald-400 uppercase tracking-widest">EnlivoCare</Text>
                    <Text className="text-2xl font-black text-gray-900">Gig Market</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                    <TouchableOpacity
                        onPress={() => router.push('/(pal)/notifications' as any)}
                        className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                    >
                        <Ionicons name="notifications-outline" size={20} color={BRAND_GREEN} />
                        {unreadCount > 0 && (
                            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center border-2 border-white">
                                <Text className="text-[10px] text-white font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(pal)/profile' as any)}
                        className="w-10 h-10 bg-emerald-100 rounded-[24px] items-center justify-center overflow-hidden border border-emerald-200"
                    >
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} className="w-full h-full" />
                        ) : (
                            <Ionicons name="person" size={20} color={BRAND_GREEN} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 120
                }}
            >
                <View className="mt-4">
                    <Text className="text-xs font-bold text-gray-400 uppercase">{getGreeting()}, {user?.name?.split(' ')[0] || 'Arjun'}</Text>
                </View>

                {/* 1. Critical Actions: Profile & Verification Alerts */}
                {(!user?.profileImage || !user?.trustShieldVerified) && (
                    <Animated.View entering={FadeInUp.delay(200)} className="mb-6 mt-4">
                        <LinearGradient
                            colors={['#FFF7ED', '#FFFBEB']}
                            className="p-6 rounded-[32px] border border-orange-100 shadow-sm"
                        >
                            <View className="flex-row items-center justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-orange-100 rounded-2xl items-center justify-center">
                                        <Ionicons name="shield-half" size={20} color="#D97706" />
                                    </View>
                                    <Text className="text-orange-900 font-black text-xs uppercase tracking-widest ml-4">Profile Incomplete</Text>
                                </View>
                                <View className="bg-orange-200/50 px-3 py-1 rounded-full">
                                    <Text className="text-orange-700 text-[8px] font-black uppercase">High Priority</Text>
                                </View>
                            </View>

                            <Text className="text-orange-800/70 text-[11px] font-bold leading-5 mb-5">
                                {!user?.profileImage && !user?.trustShieldVerified
                                    ? "Upload your profile photo and complete Trust Shield verification to start accepting premium gigs."
                                    : !user?.profileImage
                                        ? "A profile photo is required to build trust with seniors. Please upload a clear photo of yourself."
                                        : "Your document verification is in progress. Complete any pending steps to unlock all features."}
                            </Text>

                            <View className="flex-row gap-x-3">
                                {!user?.profileImage && (
                                    <TouchableOpacity
                                        onPress={() => router.push('/(pal)/profile')}
                                        className="flex-1 bg-orange-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-orange-200"
                                    >
                                        <Text className="text-white font-black text-[10px] uppercase">Upload Photo</Text>
                                    </TouchableOpacity>
                                )}
                                {!user?.trustShieldVerified && (
                                    <TouchableOpacity
                                        onPress={() => router.push('/(pal)/verification')}
                                        className="flex-1 bg-white py-4 rounded-2xl items-center justify-center border border-orange-200"
                                    >
                                        <Text className="text-orange-700 font-black text-[10px] uppercase">Verify Docs</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* 2. Earnings Hero Card - Compact */}
                <Animated.View entering={FadeInUp.delay(300).duration(600).easing(Easing.out(Easing.quad))} className="mb-8 mt-5">
                    <TouchableOpacity activeOpacity={0.9} onPress={() => router.replace('/(pal)/earnings')}>
                        <LinearGradient
                            colors={[BRAND_GREEN, DARK_GREEN]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            className="p-8 w-full rounded-[40px] shadow-2xl shadow-emerald-200"
                        >
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <Text className="text-white/70 text-xs font-bold uppercase tracking-widest">Available Balance</Text>
                                    <Text className="text-white text-4xl font-black mt-1">₹{(user?.walletBalance || 0).toLocaleString()}</Text>
                                </View>
                                <View className="bg-white/20 p-4 rounded-2xl border border-white/20">
                                    <Ionicons name="wallet-outline" size={24} color="white" />
                                </View>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* New Gig Alert System (Requirement #3 & #4) */}
                {hasNewGigs && (
                    <Animated.View entering={FadeInUp} className="mb-8">
                        <TouchableOpacity
                            onPress={() => {
                                setHasNewGigs(false);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}
                            className="bg-indigo-600 p-5 rounded-[32px] flex-row items-center justify-between shadow-xl shadow-indigo-200"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center">
                                    <Ionicons name="flash" size={20} color="white" />
                                </View>
                                <View className="ml-4">
                                    <Text className="text-white font-black text-xs uppercase tracking-widest">New Opportunity!</Text>
                                    <Text className="text-white/70 text-[10px] font-bold">A fresh gig just appeared in your area.</Text>
                                </View>
                            </View>
                            <View className="bg-white/10 w-8 h-8 rounded-full items-center justify-center">
                                <Ionicons name="close" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Quick Stats Grid */}
                <View className="flex-row justify-between mb-8">
                    <QuickStatItem label="Gigs Done" value="12" icon="shield-checkmark" color="#10B981" />
                    <QuickStatItem label="Active" value={activeGig ? "01" : "00"} icon="flash" color="#F59E0B" />
                    <QuickStatItem label="Rating" value="4.9 ★" icon="star" color="#3B82F6" />
                </View>

                {/* Dynamic Gig Queue */}
                <View className="flex-row items-center justify-between mb-6 ml-1">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Open Opportunities 🔥</Text>
                    <TouchableOpacity onPress={() => fetchGigs()}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={BRAND_GREEN} />
                        ) : (
                            <Text className="text-emerald-500 text-[10px] font-black uppercase">Refresh</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {pendingAppointments.length > 0 ? (
                    pendingAppointments.map((booking, idx) => (
                        <Animated.View key={booking.id} entering={FadeInUp.delay(600 + idx * 100)} className="mb-4">
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => router.push({ pathname: '/(pal)/gig-detail', params: { id: booking.id } } as any)}
                                className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center"
                            >
                                <View className="w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-100 items-center justify-center">
                                    <Ionicons name="briefcase" size={24} color={BRAND_GREEN} />
                                </View>
                                <View className="flex-1 ml-4">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-900 font-bold text-sm">₹{booking.price}</Text>
                                        <Text className="text-emerald-500 text-[8px] font-black uppercase">Instant Pay</Text>
                                    </View>
                                    <Text className="text-gray-500 text-[10px] mt-0.5">{booking.userName} • {booking.time}</Text>
                                </View>
                                <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center ml-2">
                                    <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))
                ) : (
                    <View className="bg-gray-50 p-10 rounded-[32px] border border-gray-100 items-center justify-center mb-8 opacity-60">
                        <Ionicons name="sparkles-outline" size={32} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold text-xs mt-3 uppercase tracking-widest text-center">No jobs available right now</Text>
                        <Text className="text-gray-300 text-[10px] mt-1 text-center font-medium">We'll alert you when a new gig appears.</Text>
                    </View>
                )}

                {/* Active Session Shortcut */}
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1 mt-4">Active Gig</Text>
                <Animated.View entering={FadeInUp.delay(700).duration(600)} className="mb-10">
                    {activeGig ? (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.replace('/(pal)/active-gig')}
                            className="bg-gray-900/95 p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
                        >
                            <View className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10" />
                            <View className="flex-row items-center justify-between mb-8">
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 bg-emerald-500/20 rounded-2xl items-center justify-center">
                                        <Ionicons name="person" size={24} color="white" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-white font-black text-xl">{activeGig.userName}</Text>
                                        <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{activeGig.title}</Text>
                                    </View>
                                </View>
                                <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                                    <Text className="text-emerald-400 text-[10px] font-black uppercase">
                                        {activeGig.status.replace(/_/g, ' ')}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between">
                                <Text className="text-white/60 text-xs font-bold">{activeGig.location.address}</Text>
                                <Ionicons name="arrow-forward-circle" size={32} color="white" />
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 items-center justify-center opacity-70">
                            <Ionicons name="calendar-clear-outline" size={24} color="#D1D5DB" />
                            <Text className="text-gray-400 font-bold text-[10px] mt-2 uppercase tracking-widest">No Active Sessions</Text>
                        </View>
                    )}
                </Animated.View>

            </ScrollView>

            {/* Dashboard Bottom Tab Bar */}
            <BottomTab activeTab="Home" />
        </View>
    );
}

function QuickStatItem({ label, value, icon, color }: any) {
    return (
        <View className="flex-1 bg-gray-50 p-4 rounded-[24px] border border-gray-100 items-center">
            <View style={{ backgroundColor: `${color}15` }} className="w-8 h-8 rounded-xl items-center justify-center mb-2">
                <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text className="text-gray-900 font-black text-sm">{value}</Text>
            <Text className="text-gray-400 text-[8px] font-bold uppercase tracking-widest mt-1">{label}</Text>
        </View>
    );
}

function QuickActionItem({ icon, label, onPress, bg, delay }: any) {
    return (
        <Animated.View entering={FadeInUp.delay(delay).duration(500)}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                className="items-center"
            >
                <View style={{ backgroundColor: bg }} className="w-16 h-16 rounded-[24px] items-center justify-center shadow-sm">
                    <Ionicons name={icon} size={28} color={BRAND_GREEN} />
                </View>
                <Text className="text-gray-900 font-bold text-[11px] mt-3 uppercase tracking-wider">{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

function ActiveTaskItem({ icon, label }: any) {
    return (
        <View className="flex-row items-center">
            <View className="w-8 h-8 bg-white/10 rounded-xl items-center justify-center">
                <Ionicons name={icon} size={16} color="white" />
            </View>
            <Text className="text-white/80 text-xs font-bold ml-4">{label}</Text>
        </View>
    );
}

function HealthInsightCard({ icon, label, value, color }: any) {
    return (
        <View className="flex-1 bg-gray-50 p-5 rounded-[32px] border border-gray-100">
            <View className="flex-row items-center mb-3">
                <View style={{ backgroundColor: `${color}15` }} className="w-8 h-8 rounded-xl items-center justify-center">
                    <Ionicons name={icon} size={16} color={color} />
                </View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">{label}</Text>
            </View>
            <Text className="text-xl font-black text-gray-900">{value}</Text>
        </View>
    );
}


const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
