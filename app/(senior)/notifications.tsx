import { Notification, useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_PURPLE = '#6E5BFF';

export default function SeniorNotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications('senior');
    }, []);

    const handleNotificationClick = async (notif: Notification) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }

        router.push({
            pathname: '/(senior)/notification-detail',
            params: { id: notif.id }
        } as any);
    };

    const renderItem = ({ item, index }: { item: Notification, index: number }) => {
        return (
            <Animated.View entering={FadeInRight.delay(index * 100)}>
                <TouchableOpacity
                    onPress={() => handleNotificationClick(item)}
                    activeOpacity={0.7}
                    className={`p-6 mb-4 rounded-[32px] border ${item.isRead ? 'bg-white border-gray-100' : 'bg-indigo-50 border-indigo-200'}`}
                >
                    <View className="flex-row items-center mb-3">
                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${item.type === 'alert' ? 'bg-red-100' : 'bg-indigo-100'}`}>
                            <Ionicons
                                name={item.type === 'alert' ? 'alert-circle' : 'notifications'}
                                size={24}
                                color={item.type === 'alert' ? '#EF4444' : BRAND_PURPLE}
                            />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className={`text-xl ${item.isRead ? 'font-bold text-gray-800' : 'font-black text-gray-900'}`}>{item.title}</Text>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                {new Date(item.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        {!item.isRead && <View className="w-3 h-3 bg-yellow-400 rounded-full" />}
                    </View>
                    <Text className="text-gray-600 text-base font-medium leading-6">{item.message}</Text>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row items-center justify-between bg-white"
            >
                <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center">
                    <Ionicons name="chevron-back" size={28} color={BRAND_PURPLE} />
                </TouchableOpacity>
                <Text className="text-2xl font-black text-gray-900">Notifications</Text>
                <View className="w-12" />
            </View>

            {isLoading && notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={BRAND_PURPLE} size="large" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 20,
                        paddingBottom: insets.bottom + 40
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center pt-20">
                            <Ionicons name="notifications-off-outline" size={80} color="#E5E7EB" />
                            <Text className="text-2xl font-black text-gray-300 mt-6 text-center">No messages yet</Text>
                        </View>
                    }
                />
            )}

            {unreadCount > 0 && (
                <TouchableOpacity
                    onPress={() => markAllAsRead('senior')}
                    className="absolute bottom-10 left-10 right-10 bg-gray-900 py-6 rounded-[32px] items-center shadow-2xl"
                    style={{ marginBottom: Math.max(insets.bottom, 20) }}
                >
                    <Text className="text-white font-black uppercase tracking-widest">Mark All as Read</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    }
});
