import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function GigDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { bookings, acceptGig, isLoading } = useBookingStore();
    const user = useAuthStore(s => s.user);

    const gig = bookings.find(b => b.id === id);

    if (!gig) {
        return (
            <View className="flex-1 items-center justify-center p-10 bg-white">
                <Text className="text-gray-400 font-bold">Gig not found or already accepted.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-emerald-500 font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleAccept = async () => {
        if (!user) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const result = await acceptGig(gig.id, user.phone || 'PAL_001', user.name || 'Arjun Singh');
            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace('/(pal)/active-gig');
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Notice', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const handleDecline = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.back();
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center border-b border-gray-50">
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(pal)/home')}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-2xl font-black text-gray-900">Gig Details</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 40 }}>
                <View className="items-center mb-8">
                    <View className="w-32 h-32 bg-emerald-50 rounded-[40px] mb-4 items-center justify-center overflow-hidden border border-emerald-100">
                        <Ionicons name="person" size={48} color={BRAND_GREEN} />
                    </View>
                    <Text className="text-2xl font-black text-gray-900">{gig.userName}</Text>
                    <Text className="text-emerald-500 font-black uppercase text-[10px] tracking-widest mt-1">Care Opportunity</Text>
                </View>

                <View className="bg-gray-50 rounded-[32px] p-8 mb-8 border border-gray-100">
                    <View className="flex-row justify-between items-center mb-8">
                        <View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Payout</Text>
                            <Text className="text-gray-900 text-3xl font-black mt-1">₹{gig.price}</Text>
                        </View>
                        <View className="bg-emerald-500 px-4 py-2 rounded-2xl">
                            <Text className="text-white font-black text-[10px] uppercase">Instant Pay</Text>
                        </View>
                    </View>

                    <View className="space-y-6">
                        <DetailItem icon="calendar" label="Date" value={gig.date} />
                        <DetailItem icon="time" label="Time & Duration" value={`${gig.time} (${gig.duration || 'Session'})`} />
                        <DetailItem icon="location" label="Location" value={gig.location.address} />
                        <DetailItem icon="list" label="Tasks" value={gig.requirements?.join(', ') || 'General Care'} />
                    </View>

                    {gig.description && (
                        <View className="mt-8 pt-8 border-t border-gray-200">
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Instructions</Text>
                            <Text className="text-gray-600 text-xs leading-5 font-medium">{gig.description}</Text>
                        </View>
                    )}
                </View>

                <View className="bg-orange-50 p-6 rounded-[24px] border border-orange-100 mb-10">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="alert-circle" size={18} color="#F59E0B" />
                        <Text className="text-orange-900 font-bold text-sm ml-2">Protocol Requirement</Text>
                    </View>
                    <Text className="text-orange-700/80 text-xs leading-5">Please ensure you are wearing your EnlivoCare vest and have your digital ID ready for verification at the doorstep.</Text>
                </View>

                <View className="flex-row gap-x-4">
                    <TouchableOpacity
                        onPress={handleDecline}
                        className="flex-1 bg-white py-6 rounded-[24px] items-center border border-gray-200"
                    >
                        <Text className="text-gray-400 font-black uppercase tracking-widest text-sm">Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleAccept}
                        disabled={isLoading}
                        className="flex-[2] bg-emerald-500 py-6 rounded-[24px] items-center shadow-2xl shadow-emerald-200"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-sm">
                            {isLoading ? 'Accepting...' : 'Accept Gig'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

function DetailItem({ icon, label, value }: any) {
    return (
        <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-100">
                <Ionicons name={icon} size={20} color="#10B981" />
            </View>
            <View className="ml-4">
                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">{label}</Text>
                <Text className="text-gray-900 font-bold text-sm">{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
    }
});
