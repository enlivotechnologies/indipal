import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function EarningsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, withdrawFunds } = useAuthStore();
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleWithdraw = async () => {
        if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        const amount = Number(withdrawAmount);
        setIsProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const result = await withdrawFunds(amount);

        setIsProcessing(false);
        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Success", result.message);
            setShowWithdrawModal(false);
            setWithdrawAmount('');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Locked", result.message);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center justify-between border-b border-gray-50 bg-white">
                <Text className="text-2xl font-black text-gray-900">Earnings</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(pal)/profile' as any)}
                    className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                >
                    <Ionicons name="person-outline" size={20} color="#10B981" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}>
                <Animated.View entering={FadeInUp.duration(600)} className="bg-emerald-500 p-8 rounded-[40px] shadow-2xl relative overflow-hidden mb-10">
                    <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
                    <Text className="text-white/70 text-xs font-black uppercase tracking-widest">Available Balance</Text>
                    <Text className="text-white text-5xl font-black mt-2">₹{(user?.walletBalance || 0).toLocaleString()}</Text>

                    {(() => {
                        const requiredDocs = ['id_proof', 'address_proof', 'bank_details'];
                        const allVerified = requiredDocs.every(type =>
                            user?.verificationDocuments?.find(d => d.documentType === type)?.verificationStatus === 'Verified'
                        );

                        if (!allVerified) {
                            return (
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                                        Alert.alert("Action Locked", "Complete Trust Shield verification to enable wallet withdrawals.", [
                                            { text: "Verify Now", onPress: () => router.push('/(pal)/verification') },
                                            { text: "Later", style: "cancel" }
                                        ]);
                                    }}
                                    className="mt-8 bg-black/20 py-4 rounded-[20px] items-center flex-row justify-center border border-white/10"
                                >
                                    <Ionicons name="lock-closed" size={16} color="white" />
                                    <Text className="text-white font-black uppercase tracking-widest text-[10px] ml-3">Verification Required</Text>
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <TouchableOpacity
                                onPress={() => setShowWithdrawModal(true)}
                                className="mt-8 bg-white py-4 rounded-[20px] items-center flex-row justify-center shadow-lg"
                            >
                                <Ionicons name="card" size={18} color={BRAND_GREEN} />
                                <Text className="text-emerald-600 font-black uppercase tracking-widest text-xs ml-3">Withdraw to Bank</Text>
                            </TouchableOpacity>
                        );
                    })()}
                </Animated.View>

                <View className="flex-row gap-x-4 mb-10">
                    <StatCard label="Total Earned" value={`₹${(user?.totalEarnings || 0).toLocaleString()}`} icon="trending-up" color="#10B981" />
                    <StatCard label="Withdrawn" value={`₹${(user?.totalWithdrawn || 0).toLocaleString()}`} icon="arrow-up" color="#3B82F6" />
                </View>

                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Recent Transactions</Text>

                {user?.transactions?.map((txn, idx) => (
                    <Animated.View key={txn.id} entering={FadeInUp.delay(200 + idx * 100)} className="flex-row items-center p-5 rounded-[24px] mb-4 bg-gray-50 border border-gray-100">
                        <View className={`w-10 h-10 rounded-xl items-center justify-center ${txn.type === 'earning' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                            <Ionicons name={txn.type === 'earning' ? 'add' : 'arrow-up'} size={18} color={txn.type === 'earning' ? '#059669' : '#2563EB'} />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-gray-900 font-bold text-sm">{txn.title}</Text>
                            <Text className="text-gray-400 text-[10px] font-bold uppercase mt-0.5">{txn.date}</Text>
                        </View>
                        <Text className={`font-black text-sm ${txn.type === 'earning' ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {txn.type === 'earning' ? '+' : '-'} ₹{txn.amount}
                        </Text>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <View style={StyleSheet.absoluteFill} className="bg-black/60 items-center justify-center p-6 z-50">
                    <Animated.View entering={ZoomIn} className="bg-white w-full rounded-[40px] p-8 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900">Withdraw</Text>
                            <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                                <Ionicons name="close" size={24} color="#D1D5DB" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-400 text-xs font-bold uppercase mb-4">Enter Amount to Deposit</Text>
                        <TextInput
                            value={withdrawAmount}
                            onChangeText={setWithdrawAmount}
                            placeholder="₹ 0.00"
                            keyboardType="numeric"
                            className="bg-gray-50 p-6 rounded-[24px] border border-gray-100 text-2xl font-black text-gray-900 mb-8"
                        />

                        <TouchableOpacity
                            onPress={handleWithdraw}
                            disabled={isProcessing}
                            className="bg-emerald-500 py-6 rounded-[24px] items-center flex-row justify-center"
                        >
                            {isProcessing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={18} color="white" />
                                    <Text className="text-white font-black uppercase tracking-widest text-sm ml-3">Proceed to Bank</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            )}

            {/* Custom Bottom Tab Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row items-center h-16 rounded-[28px] px-2 shadow-2xl">
                    <TabButton icon="home" label="Home" active={false} onPress={() => router.replace('/(pal)/home')} />
                    <TabButton icon="briefcase" label="Gig" active={false} onPress={() => router.replace('/(pal)/active-gig')} />
                    <TabButton icon="wallet" label="Earnings" active={true} onPress={() => router.replace('/(pal)/earnings')} />
                    <TabButton icon="school" label="Training" active={false} onPress={() => router.replace('/(pal)/training')} />
                </View>
            </Animated.View>
        </View>
    );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <View className="flex-1 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
            <View style={{ backgroundColor: `${color}15` }} className="w-8 h-8 rounded-xl items-center justify-center mb-3">
                <Ionicons name={icon} size={16} color={color} />
            </View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</Text>
            <Text className="text-xl font-black text-gray-900">{value}</Text>
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
