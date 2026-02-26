import { Notification, useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_PURPLE = '#6E5BFF';

export default function SeniorNotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications('senior');
    }, [fetchNotifications]);

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

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'task': return { icon: 'briefcase', color: '#6366F1', label: 'Family Task', bg: '#EEF2FF', border: '#E0E7FF' };
            case 'service': return { icon: 'star', color: '#10B981', label: 'Service Secure', bg: '#ECFDF5', border: '#D1FAE5' };
            case 'alert': return { icon: 'alert-circle', color: '#EF4444', label: 'Priority Update', bg: '#FFF1F2', border: '#FECDD3' };
            default: return { icon: 'information-circle', color: BRAND_PURPLE, label: 'Update', bg: '#F5F3FF', border: '#EDE9FE' };
        }
    };

    const renderItem = ({ item, index }: { item: Notification, index: number }) => {
        const style = getNotificationStyle(item.type);
        return (
            <Animated.View entering={FadeInDown.delay(index * 100)}>
                <TouchableOpacity
                    onPress={() => handleNotificationClick(item)}
                    activeOpacity={0.8}
                    className={`p-6 mb-5 rounded-[32px] border ${item.isRead ? 'bg-white border-gray-100' : 'bg-white border-indigo-200 shadow-xl shadow-indigo-100'} flex-row items-start relative overflow-hidden`}
                >
                    {!item.isRead && (
                        <View className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                    )}

                    <View
                        style={{ backgroundColor: style.bg }}
                        className="w-14 h-14 rounded-2xl items-center justify-center border border-gray-100 shadow-sm"
                    >
                        <Ionicons
                            name={style.icon as any}
                            size={28}
                            color={style.color}
                        />
                    </View>
                    <View className="flex-1 ml-5">
                        <View className="flex-row justify-between items-center mb-1.5">
                            <Text style={{ color: style.color }} className="text-[10px] font-black uppercase tracking-[2px]">{style.label}</Text>
                            <Text className="text-gray-400 text-[10px] font-bold">
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        <Text className="text-gray-900 font-black text-lg mb-1">{item.title}</Text>
                        <Text className="text-gray-500 text-sm font-medium leading-5">{item.message}</Text>

                        {!item.isRead && (
                            <View className="mt-4 flex-row items-center">
                                <View className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                                <Text className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">New Update</Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <LinearGradient
                colors={['#F5F3FF', '#FFFFFF']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row items-center justify-between bg-white/80 backdrop-blur-xl"
            >
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(senior)/home')} className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 items-center justify-center">
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-xl font-black text-gray-900">Notifications</Text>
                    <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Family Live Updates</Text>
                </View>
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
                        paddingHorizontal: 24,
                        paddingTop: 24,
                        paddingBottom: insets.bottom + 100
                    }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20 px-10">
                            <View className="w-24 h-24 bg-indigo-50 rounded-[40px] items-center justify-center mb-8 border border-indigo-100 shadow-sm shadow-indigo-100">
                                <Ionicons name="notifications-off-outline" size={48} color="#818CF8" />
                            </View>
                            <Text className="text-gray-900 font-black text-xl text-center">All Caught Up</Text>
                            <Text className="text-gray-400 text-sm text-center mt-3 leading-6">Any updates from your family, Care Pals, or services will appear here in real-time.</Text>
                        </View>
                    }
                />
            )}

            {unreadCount > 0 && (
                <View
                    className="absolute bottom-6 left-6 right-6"
                    style={{ paddingBottom: Math.max(insets.bottom, 0) }}
                >
                    <TouchableOpacity
                        onPress={() => markAllAsRead('senior')}
                        className="bg-gray-900 py-6 rounded-[32px] items-center shadow-2xl"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-xs">Mark All as Read</Text>
                    </TouchableOpacity>
                </View>
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
