import { Notification, useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FamilyNotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
    const [filter, setFilter] = useState<'all' | 'senior' | 'pal' | 'system' | 'wallet' | 'verification'>('all');

    useEffect(() => {
        fetchNotifications('family');
    }, [fetchNotifications]);

    const handleNotificationClick = async (notif: Notification) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (!notif.isRead) {
            await markAsRead(notif.id);
        }

        router.push({
            pathname: '/(family)/account/notification-detail',
            params: { id: notif.id }
        } as any);
    };

    const handleMarkAllRead = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        markAllAsRead('family');
    };

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

    const getIcon = (type: string) => {
        switch (type) {
            case 'alert': return 'alert-circle';
            case 'task': return 'calendar';
            case 'wallet': return 'wallet';
            case 'verification': return 'shield-checkmark';
            case 'support': return 'chatbox-ellipses';
            case 'pal': return 'star';
            case 'senior': return 'person';
            default: return 'notifications';
        }
    };

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => n.type === filter || (filter === 'senior' && n.type === 'alert') || (filter === 'pal' && n.type === 'task'));

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
                        onPress={() => router.back()}
                        className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-xl font-black text-gray-900">Notifications</Text>
                        <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{unreadCount} New Alerts</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        className={`w-12 h-12 items-center justify-center rounded-2xl border ${unreadCount === 0 ? 'bg-gray-50 border-gray-50' : 'bg-emerald-50 border-emerald-100'}`}
                    >
                        <Ionicons name="checkmark-done" size={20} color={unreadCount === 0 ? '#CBD5E1' : '#10B981'} />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-6 -mx-2"
                >
                    {(['all', 'senior', 'pal', 'system', 'wallet', 'verification'] as const).map((t) => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setFilter(t);
                            }}
                            className={`mx-2 px-6 py-3 rounded-full border ${filter === t ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-100'}`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === t ? 'text-white' : 'text-gray-400'}`}>
                                {t}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {isLoading && notifications.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#10B981" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24, paddingTop: 24 }}
                >
                    {filteredNotifications.length === 0 ? (
                        <View className="flex-1 items-center justify-center mt-20">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                                <Ionicons name="notifications-off-outline" size={40} color="#CBD5E1" />
                            </View>
                            <Text className="text-gray-900 font-black text-lg text-center">All Caught Up</Text>
                            <Text className="text-gray-400 text-sm text-center mt-2 px-10">No notifications found in this category.</Text>
                        </View>
                    ) : (
                        filteredNotifications.map((notification, idx) => (
                            <Animated.View
                                key={notification.id}
                                entering={FadeInDown.delay(idx * 50)}
                                className="mb-4"
                            >
                                <TouchableOpacity
                                    onPress={() => handleNotificationClick(notification)}
                                    activeOpacity={0.7}
                                    className={`bg-white p-6 rounded-[32px] border ${notification.isRead ? 'border-gray-50' : 'border-emerald-100 shadow-sm shadow-emerald-50'
                                        } flex-row items-start`}
                                >
                                    <View className="relative">
                                        <View
                                            style={{ backgroundColor: getTypeColor(notification.type) + '15' }}
                                            className="w-12 h-12 rounded-2xl items-center justify-center"
                                        >
                                            <Ionicons
                                                name={getIcon(notification.type) as any}
                                                size={24}
                                                color={getTypeColor(notification.type)}
                                            />
                                        </View>
                                        {!notification.isRead && (
                                            <View className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                                        )}
                                    </View>

                                    <View className="flex-1 ml-4">
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: getTypeColor(notification.type) }}>
                                                {notification.type}
                                            </Text>
                                            <Text className="text-[8px] font-bold text-gray-400 uppercase">
                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-900 font-black text-base mb-1">{notification.title}</Text>
                                        <Text className="text-gray-500 text-xs leading-5 font-bold italic">{notification.message}</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}


