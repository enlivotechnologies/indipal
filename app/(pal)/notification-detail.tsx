import { useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function NotificationDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { notifications } = useNotificationStore();

    const notification = notifications.find(n => n.id === id);

    if (!notification) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-6">
                <Text className="text-gray-400 font-bold">Notification not found</Text>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(pal)/notifications' as any)} className="mt-4">
                    <Text className="text-emerald-600 font-black">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return { name: 'alert-circle', color: '#EF4444', bg: '#FEF2F2' };
            case 'task': return { name: 'calendar', color: '#3B82F6', bg: '#EFF6FF' };
            case 'wallet': return { name: 'wallet', color: '#10B981', bg: '#ECFDF5' };
            case 'verification': return { name: 'shield-checkmark', color: '#8B5CF6', bg: '#F5F3FF' };
            case 'support': return { name: 'chatbox-ellipses', color: '#F59E0B', bg: '#FFFBEB' };
            default: return { name: 'notifications', color: '#6B7280', bg: '#F3F4F6' };
        }
    };

    const icon = getIcon(notification.type);
    const date = new Date(notification.createdAt);

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row items-center bg-white"
            >
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(pal)/notifications' as any)}
                    className="mr-4 w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-gray-900">Message Detail</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                <Animated.View entering={FadeInUp.duration(600)}>
                    <View style={{ backgroundColor: icon.bg }} className="w-20 h-20 rounded-[32px] items-center justify-center mb-8">
                        <Ionicons name={icon.name as any} size={40} color={icon.color} />
                    </View>

                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{notification.type}</Text>
                    <Text className="text-3xl font-black text-gray-900 mb-6 leading-tight">{notification.title}</Text>

                    <View className="flex-row items-center mb-10 pb-6 border-b border-gray-100">
                        <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                        <Text className="text-gray-400 text-xs font-bold ml-2">
                            {date.toLocaleDateString([], { day: '2-digit', month: 'long', year: 'numeric' })} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <View className="ml-4 px-3 py-1 bg-emerald-100 rounded-full">
                            <Text className="text-emerald-700 text-[10px] font-black uppercase">READ</Text>
                        </View>
                    </View>

                    <View className="bg-gray-50 p-8 rounded-[40px] border border-gray-50">
                        <Text className="text-gray-700 text-lg font-medium leading-8 italic">"{notification.message}"</Text>
                    </View>

                    {notification.actionRoute && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            className="mt-12 group"
                        >
                            <View className="flex-row items-center justify-between p-6 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                                        <Ionicons name="link-outline" size={20} color={BRAND_GREEN} />
                                    </View>
                                    <View>
                                        <Text className="text-gray-900 font-bold uppercase text-[10px]">Reference Link</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold">Manual access only</Text>
                                    </View>
                                </View>
                                <Ionicons name="lock-closed-outline" size={18} color="#D1D5DB" />
                            </View>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(pal)/notifications' as any)}
                        className="mt-12 bg-gray-900 py-6 rounded-[32px] items-center shadow-xl shadow-gray-200"
                    >
                        <Text className="text-white font-black uppercase tracking-widest">Back to Inbox</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    }
});
