import { BottomTab } from "@/components/pal/BottomTab";
import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";
import { useGroceryStore } from "@/store/groceryStore";
import { useNotificationStore } from "@/store/notificationStore";
import { usePharmacyStore } from "@/store/pharmacyStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { Easing, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const BRAND_GREEN = '#10B981';
const DARK_GREEN = '#065F46';

export default function PalHome() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { bookings, fetchGigs, hasNewGigs, setHasNewGigs, isLoading, acceptGig, declineGig } = useBookingStore();
    const { orders: groceryOrders, acceptOrder: acceptGroceryOrder, completeOrder: completeGroceryOrder } = useGroceryStore();
    const {
        orders: pharmacyOrders,
        acceptOrder: acceptPharmacyOrder,
        rejectOrder: rejectPharmacyOrder,
        completeOrder: completePharmacyOrder
    } = usePharmacyStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();

    const [viewRx, setViewRx] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications('pal');
        fetchGigs();

        const interval = setInterval(() => {
            fetchGigs();
        }, 20000);

        return () => clearInterval(interval);
    }, [fetchGigs, fetchNotifications]);

    const pendingAppointments = bookings.filter(b =>
        (b.status === "pending" || b.status === "open" || b.status === "sent_to_pals") &&
        (!b.palId || b.palId === user?.id)
    ).sort((a, b) => b.timestamp - a.timestamp);

    const pendingGroceryOrders = groceryOrders.filter(o =>
        o.status === 'forwarded_to_pal' && (!o.palId || o.palId === user?.id)
    );

    const pendingPharmacyOrders = pharmacyOrders.filter(o =>
        o.status === 'processing' && (!o.palId || o.palId === user?.id)
    );

    const activeGig = bookings.find(b =>
        b.palId === user?.id &&
        ["accepted", "on_the_way", "on_site", "in_progress"].includes(b.status)
    );

    const activeGrocery = groceryOrders.find(o =>
        o.palId === user?.id && o.status === 'accepted_by_pal'
    );

    const activePharmacy = pharmacyOrders.find(o =>
        o.palId === user?.id && o.status === 'accepted'
    );


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

                {/* New Gig Alert System */}
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

                {/* Pharmacy Queue */}
                {pendingPharmacyOrders.length > 0 && (
                    <View className="mb-8">
                        <View className="flex-row items-center mb-4 ml-1">
                            <Text className="text-xs font-black text-emerald-600 uppercase tracking-widest">Pharmacy Pickups 💊</Text>
                            <View className="ml-3 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Text className="text-emerald-500 text-[8px] font-black">{pendingPharmacyOrders.length}</Text>
                            </View>
                        </View>
                        {pendingPharmacyOrders.map(order => (
                            <Animated.View key={order.id} entering={FadeInUp} className="mb-4">
                                <View className="bg-white p-6 rounded-[32px] border border-emerald-100 shadow-sm relative overflow-hidden">
                                    <View className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 rounded-full -mr-12 -mt-12" />
                                    <View className="flex-row items-center mb-6">
                                        <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center border border-emerald-100">
                                            <Ionicons name="medical" size={24} color={BRAND_GREEN} />
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <Text className="text-gray-900 font-bold text-sm">₹{order.totalAmount} • {order.items.length} Meds</Text>
                                            <Text className="text-gray-500 text-[10px] mt-0.5">For {order.seniorName} • Approval Received</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row gap-x-2">
                                        <TouchableOpacity
                                            onPress={() => {
                                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                acceptPharmacyOrder(order.id, user?.id || 'PAL001', user?.name || 'Arjun');
                                            }}
                                            className="flex-[2] bg-emerald-500 py-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200"
                                        >
                                            <Text className="text-white font-black text-[10px] uppercase">Accept Task</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                rejectPharmacyOrder(order.id);
                                            }}
                                            className="flex-1 bg-white py-4 rounded-2xl items-center justify-center border border-gray-100"
                                        >
                                            <Text className="text-gray-400 font-black text-[10px] uppercase">Decline</Text>
                                        </TouchableOpacity>
                                        {order.prescriptionImage && (
                                            <TouchableOpacity
                                                onPress={() => setViewRx(order.prescriptionImage || null)}
                                                className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center border border-emerald-100"
                                            >
                                                <Ionicons name="image" size={20} color={BRAND_GREEN} />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                )}

                {/* 3. Active Gig Highlight (If exists) */}
                {activeGig && (
                    <Animated.View entering={FadeInUp.delay(400)} className="mb-8">
                        <Text className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 ml-1">Current Active Gig ⚡️</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(pal)/active-gig')}
                            className="bg-gray-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
                        >
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.1)', 'transparent']}
                                className="absolute inset-0"
                            />
                            <View className="flex-row items-center justify-between mb-6">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-12 bg-emerald-500/20 rounded-2xl items-center justify-center">
                                        <Ionicons name="person" size={24} color="#10B981" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-white font-black text-lg">{activeGig.clientName}</Text>
                                        <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">{activeGig.title || 'Elderly Care'}</Text>
                                    </View>
                                </View>
                                <View className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <Text className="text-emerald-400 text-[8px] font-black uppercase">{activeGig.status.replace(/_/g, ' ')}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between pt-6 border-t border-white/10">
                                <View className="flex-row items-center">
                                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.4)" />
                                    <Text className="text-white/40 text-[10px] font-bold ml-2 uppercase">{activeGig.time}</Text>
                                </View>
                                <View className="flex-row items-center bg-emerald-500 px-4 py-2 rounded-xl">
                                    <Text className="text-white font-black text-[10px] uppercase">GOTO GIG</Text>
                                    <Ionicons name="arrow-forward" size={12} color="white" className="ml-2" />
                                </View>
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

                {/* Grocery Orders Queue */}
                {pendingGroceryOrders.length > 0 && (
                    <View className="mb-8">
                        <View className="flex-row items-center mb-4 ml-1">
                            <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Grocery Pickups 🛒</Text>
                            <View className="ml-3 bg-red-100 px-2 py-0.5 rounded-full">
                                <Text className="text-red-500 text-[8px] font-black">{pendingGroceryOrders.length}</Text>
                            </View>
                        </View>
                        {pendingGroceryOrders.map(order => (
                            <Animated.View key={order.id} entering={FadeInUp} className="mb-4">
                                <View className="bg-white p-6 rounded-[32px] border border-orange-100 shadow-sm">
                                    <View className="flex-row items-center mb-6">
                                        <View className="w-12 h-12 bg-orange-50 rounded-2xl border border-orange-100 items-center justify-center">
                                            <Ionicons name="cart" size={24} color="#F97316" />
                                        </View>
                                        <View className="flex-1 ml-4">
                                            <Text className="text-gray-900 font-bold text-sm">₹{order.totalAmount} • {order.items.length} Items</Text>
                                            <Text className="text-gray-500 text-[10px] mt-0.5">For {order.seniorName} • Pending Acceptance</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row gap-x-3">
                                        <TouchableOpacity
                                            onPress={() => {
                                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                acceptGroceryOrder(order.id, user?.id || 'PAL001', user?.name || 'Arjun');
                                            }}
                                            className="flex-1 bg-orange-500 py-4 rounded-2xl items-center justify-center shadow-lg shadow-orange-100"
                                        >
                                            <Text className="text-white font-black text-[10px] uppercase">Accept Pickup</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                )}

                {pendingAppointments.length > 0 ? (
                    pendingAppointments.map((booking, idx) => (
                        <Animated.View key={booking.id} entering={FadeInUp.delay(600 + idx * 100)} className="mb-4">
                            <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                                <View className="flex-row items-center mb-6">
                                    <View className="w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-100 items-center justify-center">
                                        <Ionicons
                                            name={((booking as any).type === 'nurse' ? 'medkit' :
                                                (booking as any).type === 'house_help' ? 'home' :
                                                    (booking as any).type === 'grocery' ? 'cart' :
                                                        (booking as any).type === 'pharmacy' ? 'medical' :
                                                            (booking as any).type === 'errand' ? 'briefcase' : 'briefcase') as any}
                                            size={24}
                                            color={BRAND_GREEN}
                                        />
                                    </View>
                                    <View className="flex-1 ml-4">
                                        <Text className="text-gray-900 font-bold text-sm">₹{booking.price}</Text>
                                        <Text className="text-gray-500 text-[10px] mt-0.5" numberOfLines={1}>
                                            {booking.title || `${(booking as any).type?.toUpperCase()} Session`} • {booking.clientName}
                                        </Text>
                                    </View>
                                    <View className="bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                        <Text className="text-gray-400 text-[8px] font-black uppercase">{booking.status}</Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-x-3">
                                    <TouchableOpacity
                                        onPress={async () => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                            await acceptGig(booking.id, user?.id || 'PAL001', user?.name || 'Arjun');
                                        }}
                                        className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200"
                                    >
                                        <Text className="text-white font-black text-[10px] uppercase">Accept Gig</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={async () => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            await declineGig(booking.id);
                                        }}
                                        className="flex-1 bg-white py-4 rounded-2xl items-center justify-center border border-gray-200"
                                    >
                                        <Text className="text-gray-400 font-black text-[10px] uppercase">Decline</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    ))
                ) : (
                    <View className="bg-gray-50 p-10 rounded-[32px] border border-gray-100 items-center justify-center mb-8 opacity-60">
                        <Ionicons name="sparkles-outline" size={32} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold text-xs mt-3 uppercase tracking-widest text-center">No jobs available right now</Text>
                        <Text className="text-gray-300 text-[10px] mt-1 text-center font-medium">We&apos;ll alert you when a new gig appears.</Text>
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
                            <View className="flex-row items-center justify-between mb-6">
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 bg-emerald-500/20 rounded-2xl items-center justify-center">
                                        <Ionicons name="person" size={24} color="white" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-white font-black text-xl">{activeGig.clientName}</Text>
                                        <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                            {activeGig.services?.length || 1} {activeGig.services?.length === 1 ? 'Service' : 'Services'} • ₹{activeGig.price}
                                        </Text>
                                    </View>
                                </View>
                                <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                                    <Text className="text-emerald-400 text-[10px] font-black uppercase">
                                        {activeGig.status.replace(/_/g, ' ')}
                                    </Text>
                                </View>
                            </View>

                            {/* Progress Bar */}
                            {activeGig.services && activeGig.services.length > 0 && (
                                <View className="mb-6">
                                    <View className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <View
                                            style={{ width: `${(activeGig.services.filter(s => s.status === 'completed').length / activeGig.services.length) * 100}%` }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </View>
                                    <View className="flex-row justify-between mt-2">
                                        <Text className="text-white/40 text-[8px] font-black uppercase tracking-widest">Progress</Text>
                                        <Text className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                                            {Math.round((activeGig.services.filter(s => s.status === 'completed').length / activeGig.services.length) * 100)}% Complete
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View className="flex-row items-center justify-between">
                                <View className="flex-row gap-x-2">
                                    {activeGig.services?.slice(0, 3).map((s, i) => (
                                        <View key={s.id} className={`px-2 py-0.5 rounded-md ${s.status === 'completed' ? 'bg-emerald-500/20 border border-emerald-500/30' : s.status === 'in_progress' ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-white/5 border border-white/10'}`}>
                                            <Text className={`text-[7px] font-black uppercase ${s.status === 'completed' ? 'text-emerald-400' : s.status === 'in_progress' ? 'text-orange-400' : 'text-white/40'}`}>
                                                {s.title.split(' ')[0]} {s.status === 'completed' ? '✓' : ''}
                                            </Text>
                                        </View>
                                    ))}
                                    {(activeGig.services?.length || 0) > 3 && (
                                        <Text className="text-white/40 text-[7px] font-black self-center">+{activeGig.services.length - 3} more</Text>
                                    )}
                                </View>
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

                {/* Active Grocery Task */}
                {activeGrocery && (
                    <View className="mb-10">
                        <Text className="text-xs font-black text-orange-600 uppercase tracking-widest mb-6 ml-1">Grocery Task In-Progress</Text>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="bg-orange-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
                        >
                            <View className="flex-row items-center justify-between mb-6">
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center">
                                        <Ionicons name="cart" size={24} color="white" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-white font-black text-xl">{activeGrocery.seniorName}</Text>
                                        <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                                            {activeGrocery.items.length} Items • ₹{activeGrocery.totalAmount}
                                        </Text>
                                    </View>
                                </View>
                                <View className="bg-orange-500 px-3 py-1.5 rounded-full">
                                    <Text className="text-white text-[10px] font-black uppercase">Active</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    completeGroceryOrder(activeGrocery.id);
                                }}
                                className="bg-white py-4 rounded-2xl items-center justify-center shadow-lg"
                            >
                                <Text className="text-orange-900 font-black text-[10px] uppercase">Mark Delivered</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Active Pharmacy Task */}
                {activePharmacy && (
                    <View className="mb-10">
                        <Text className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-6 ml-1">Active Pharmacy Order</Text>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="bg-emerald-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
                        >
                            <LinearGradient
                                colors={['rgba(16, 185, 129, 0.15)', 'transparent']}
                                className="absolute inset-0"
                            />
                            <View className="flex-row items-center justify-between mb-6">
                                <View className="flex-row items-center">
                                    <View className="w-14 h-14 bg-emerald-500/20 rounded-2xl items-center justify-center border border-emerald-500/20">
                                        <Ionicons name="medical" size={24} color="#10B981" />
                                    </View>
                                    <View className="ml-4">
                                        <Text className="text-white font-black text-xl">{activePharmacy.seniorName}</Text>
                                        <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                            {activePharmacy.items.length} Items • ₹{activePharmacy.totalAmount}
                                        </Text>
                                    </View>
                                </View>
                                <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                                    <Text className="text-emerald-400 text-[10px] font-black uppercase">Active</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-x-2">
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                        completePharmacyOrder(activePharmacy.id);
                                    }}
                                    className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200"
                                >
                                    <Text className="text-white font-black text-[10px] uppercase">Mark as Delivered</Text>
                                </TouchableOpacity>
                                {activePharmacy.prescriptionImage && (
                                    <TouchableOpacity
                                        onPress={() => setViewRx(activePharmacy.prescriptionImage || null)}
                                        className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                                    >
                                        <Ionicons name="image" size={20} color="white" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Prescription Viewer Modal */}
            <Modal visible={!!viewRx} transparent animationType="fade">
                <View className="flex-1 bg-black/95 justify-center items-center p-6">
                    <TouchableOpacity
                        onPress={() => setViewRx(null)}
                        className="absolute top-12 right-6 z-10 w-12 h-12 bg-white/10 rounded-full items-center justify-center"
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white/40 text-[10px] font-black uppercase tracking-[3px] mb-6">Prescription Document</Text>
                    {viewRx && (
                        <Image
                            source={{ uri: viewRx }}
                            className="w-full h-2/3 rounded-3xl"
                            resizeMode="contain"
                        />
                    )}
                    <View className="mt-10 items-center">
                        <View className="flex-row items-center bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                            <Text className="text-emerald-400 text-[10px] font-bold ml-2 uppercase">Verified by Family</Text>
                        </View>
                    </View>
                </View>
            </Modal>

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




const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        // Standard styles only
    }
});
