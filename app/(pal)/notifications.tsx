import { Notification, useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications('pal');
    }, []);

    const handleNotificationClick = async (notif: Notification) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }

        router.push({
            pathname: '/(pal)/notification-detail',
            params: { id: notif.id }
        } as any);
    };

    const handleMarkAllRead = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        markAllAsRead('pal');
    };

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

    const renderItem = ({ item }: { item: Notification }) => {
        const icon = getIcon(item.type);
        const date = new Date(item.createdAt);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString([], { day: '2-digit', month: 'short' });

        return (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                <TouchableOpacity
                    onPress={() => handleNotificationClick(item)}
                    activeOpacity={0.7}
                    className={`flex-row p-5 mb-3 rounded-[32px] border ${item.isRead ? 'bg-white border-gray-50' : 'bg-emerald-50/30 border-emerald-100 shadow-sm shadow-emerald-50'}`}
                >
                    <View style={{ backgroundColor: icon.bg }} className="w-12 h-12 rounded-2xl items-center justify-center">
                        <Ionicons name={icon.name as any} size={24} color={icon.color} />
                    </View>

                    <View className="ml-4 flex-1">
                        <View className="flex-row justify-between items-start">
                            <Text className={`text-base flex-1 mr-2 ${item.isRead ? 'font-bold text-gray-800' : 'font-black text-gray-900'}`}>{item.title}</Text>
                            {!item.isRead && <View className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1 font-semibold" numberOfLines={2}>{item.message}</Text>
                        <Text className="text-gray-400 text-[10px] font-bold mt-2 uppercase tracking-tighter">{dateStr} • {timeStr}</Text>
                    </View>
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
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black text-gray-900">Notifications</Text>
                        <Text className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{unreadCount} Unread</Text>
                    </View>
                </View>

                {unreadCount > 0 && (
                    <TouchableOpacity
                        onPress={handleMarkAllRead}
                        className="px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100"
                    >
                        <Text className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isLoading && notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color={BRAND_GREEN} size="large" />
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
                            <View className="w-20 h-20 bg-gray-50 rounded-[32px] items-center justify-center mb-6">
                                <Ionicons name="notifications-off-outline" size={40} color="#D1D5DB" />
                            </View>
                            <Text className="text-xl font-black text-gray-900">All caught up!</Text>
                            <Text className="text-gray-400 font-bold mt-2 text-center px-10">No new notifications. We'll let you know when something happens.</Text>
                        </View>
                    }
                />
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
