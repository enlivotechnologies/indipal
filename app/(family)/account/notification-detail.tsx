import { useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FamilyNotificationDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { notifications } = useNotificationStore();

    const notification = notifications.find(n => n.id === id);

    if (!notification) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-6">
                <Text className="text-gray-400 font-black">Notification not found</Text>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(family)/account/notifications' as any)} className="mt-4">
                    <Text className="text-orange-600 font-bold">Return Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'senior': case 'alert': return '#EF4444';
            case 'pal': case 'task': return '#3B82F6';
            case 'system': return '#10B981';
            case 'wallet': return '#10B981';
            case 'verification': return '#8B5CF6';
            default: return '#94A3B8';
        }
    };

    const date = new Date(notification.createdAt);

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View
                className="px-6 pb-6 pt-4 bg-white/80 backdrop-blur-xl border-b border-gray-100"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(family)/account/notifications' as any)}
                        className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-xl font-black text-gray-900">Health Alert Detail</Text>
                    <View className="w-12" />
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown} className="p-8">
                    <View
                        style={{ backgroundColor: getTypeColor(notification.type) + '15' }}
                        className="w-20 h-20 rounded-[32px] items-center justify-center mb-8"
                    >
                        <Ionicons
                            name={notification.type === 'alert' ? 'alert-circle' : 'notifications'}
                            size={40}
                            color={getTypeColor(notification.type)}
                        />
                    </View>

                    <Text className="text-[10px] font-black uppercase tracking-[3px] mb-2" style={{ color: getTypeColor(notification.type) }}>
                        {notification.type} Update
                    </Text>
                    <Text className="text-3xl font-black text-gray-900 mb-6 leading-tight">{notification.title}</Text>

                    <View className="flex-row items-center mb-10 pb-6 border-b border-gray-100">
                        <Ionicons name="time" size={16} color="#94A3B8" />
                        <Text className="text-gray-400 text-xs font-bold ml-2">
                            {date.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <View className="ml-4 px-3 py-1 bg-gray-100 rounded-lg">
                            <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest">STATUS: READ</Text>
                        </View>
                    </View>

                    <View className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm">
                        <Text className="text-gray-600 text-lg font-bold leading-8 tracking-tight">{notification.message}</Text>
                    </View>

                    {notification.actionRoute && (
                        <View className="mt-12 p-6 bg-orange-50 rounded-[32px] border border-orange-100 flex-row items-center">
                            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center mr-4">
                                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-900 font-bold text-[10px] uppercase">Direct Redirection Disabled</Text>
                                <Text className="text-gray-400 text-[8px] font-bold uppercase mt-0.5">Please navigate to the related section manually.</Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(family)/account/notifications' as any)}
                        className="mt-12 bg-gray-900 py-6 rounded-[32px] items-center shadow-2xl shadow-black/20"
                    >
                        <Text className="text-white font-black uppercase tracking-widest">Return to Inbox</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}


