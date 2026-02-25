import { useGigStore } from '@/store/gigStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PalActiveGigPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { gigs, updateGigStatus, toggleItem } = useGigStore();

    // Find a gig that is 'approved_and_assigned' or 'matched' or 'active'
    const activeGig = gigs.find(g => ['approved_and_assigned', 'matched', 'active'].includes(g.status));

    if (!activeGig) {
        return (
            <View style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <Ionicons name="documents-outline" size={80} color="#E5E7EB" />
                <Text className="text-gray-400 font-bold text-center mt-4">No active gigs found. Check the dashboard for opportunities.</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-8 bg-emerald-600 px-8 py-4 rounded-2xl"
                >
                    <Text className="text-white font-black uppercase tracking-widest">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const allChecked = activeGig.items.every(i => i.checked);

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: Math.max(insets.top, 20),
                    paddingBottom: insets.bottom + 100,
                    paddingHorizontal: 24
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100 mb-8"
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="flex-row justify-between items-start mb-10">
                    <View>
                        <Text className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Active Job</Text>
                        <Text className="text-3xl font-black text-gray-900">{activeGig.category}</Text>
                    </View>
                    <View className="bg-orange-500 px-4 py-2 rounded-xl">
                        <Text className="text-white text-[10px] font-black uppercase">Approved by Family</Text>
                    </View>
                </View>

                {/* Payment Guarantee Badge */}
                <Animated.View entering={FadeInDown} className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex-row items-center mb-10">
                    <View className="w-12 h-12 bg-indigo-500 rounded-2xl items-center justify-center">
                        <Ionicons name="shield-checkmark" size={24} color="white" />
                    </View>
                    <View className="ml-5 flex-1">
                        <Text className="text-indigo-900 font-black text-sm">Payment Guaranteed</Text>
                        <Text className="text-indigo-500 font-bold text-[10px] uppercase">Enlivo Wallet Verification</Text>
                    </View>
                </Animated.View>

                <Text className="text-xs font-bold text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Gig Checklist</Text>

                <View className="bg-gray-50 rounded-[40px] p-8 border border-gray-100">
                    {activeGig.items.map((item, idx) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                toggleItem(activeGig.id, item.id);
                            }}
                            className="flex-row items-center mb-6 last:mb-0"
                        >
                            <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'
                                }`}>
                                {item.checked && <Ionicons name="checkmark" size={16} color="white" />}
                            </View>
                            <View className="ml-5 flex-1">
                                <Text className={`text-lg font-bold ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.name}</Text>
                                <Text className="text-xs text-gray-400 font-bold uppercase">{item.quantity}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-10 bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex-row items-center">
                    <Ionicons name="information-circle" size={24} color="#F59E0B" />
                    <Text className="ml-4 text-orange-900 text-xs font-bold leading-5 flex-1">
                        Ensure you collect all items. Total budget approved is ₹{activeGig.budget || 'N/A'}. Submit bills on completion.
                    </Text>
                </View>
            </ScrollView>

            <View
                className="absolute bottom-0 left-0 right-0 p-6 bg-white/80"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <TouchableOpacity
                    onPress={() => {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        updateGigStatus(activeGig.id, 'completed');
                        router.replace('/(pal)/home');
                    }}
                    className={`h-20 rounded-[28px] items-center justify-center shadow-xl ${allChecked ? 'bg-emerald-600 shadow-emerald-200' : 'bg-gray-200 shadow-none'
                        }`}
                    disabled={!allChecked}
                >
                    <Text className="text-white font-black text-xl uppercase tracking-widest">
                        Finish & Request Payment
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
