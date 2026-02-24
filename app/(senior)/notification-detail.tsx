import { useNotificationStore } from "@/store/notificationStore";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_PURPLE = '#6E5BFF';

export default function SeniorNotificationDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { notifications } = useNotificationStore();

    const notification = notifications.find(n => n.id === id);

    if (!notification) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-6">
                <Text className="text-gray-400 font-black text-xl">Message not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-8 bg-indigo-50 px-10 py-4 rounded-full">
                    <Text className="text-indigo-600 font-black text-lg">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
                <TouchableOpacity onPress={() => router.back()} className="mr-6 w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center">
                    <Ionicons name="arrow-back" size={32} color={BRAND_PURPLE} />
                </TouchableOpacity>
                <Text className="text-2xl font-black text-gray-900">Health Message</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
                <Animated.View entering={FadeInUp.duration(600)}>
                    <View className={`w-24 h-24 rounded-[40px] items-center justify-center mb-10 ${notification.type === 'alert' ? 'bg-red-100' : 'bg-indigo-100'}`}>
                        <Ionicons
                            name={notification.type === 'alert' ? 'alert-circle' : 'notifications'}
                            size={50}
                            color={notification.type === 'alert' ? '#EF4444' : BRAND_PURPLE}
                        />
                    </View>

                    <Text className="text-indigo-400 text-sm font-black uppercase tracking-widest mb-2">{notification.type}</Text>
                    <Text className="text-4xl font-black text-gray-900 mb-8 leading-tight">{notification.title}</Text>

                    <View className="flex-row items-center mb-12 pb-8 border-b border-gray-100">
                        <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                        <Text className="text-gray-400 text-lg font-bold ml-3 flex-1">
                            {date.toLocaleDateString([], { day: '2-digit', month: 'short' })} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <View className="bg-yellow-400 px-4 py-2 rounded-full">
                            <Text className="text-gray-900 text-xs font-black uppercase">STATUS: READ</Text>
                        </View>
                    </View>

                    <View className="bg-indigo-50/50 p-10 rounded-[48px] border border-indigo-100 mb-10">
                        <Text className="text-gray-800 text-2xl font-bold leading-10">{notification.message}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-gray-900 py-8 rounded-[40px] items-center shadow-2xl"
                    >
                        <Text className="text-white font-black text-xl uppercase tracking-widest">Done</Text>
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
