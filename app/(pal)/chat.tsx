import { BottomTab } from "@/components/pal/BottomTab";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function ChatListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { conversations, fetchConversations } = useChatStore();
    const [search, setSearch] = useState('');
    useEffect(() => {
        if (user?.phone) {
            fetchConversations(user.phone);
        }
    }, [user, fetchConversations]);

    const filteredConversations = conversations.filter(conv => {
        const otherParticipant = conv.participants.find(p => p.role !== 'pal');
        return otherParticipant?.name.toLowerCase().includes(search.toLowerCase());
    });

    const formatTime = (timestamp?: number) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Premium Header */}
            <View
                style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
                className="px-6 flex-row items-center border-b border-gray-50 bg-white"
            >
                <TouchableOpacity
                    onPress={() => router.replace('/(pal)/home')}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-2xl font-black text-gray-900">Conversations</Text>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enlivo Connect</Text>
                </View>
            </View>

            {/* Search Bar */}
            <View className="px-6 py-4">
                <View className="bg-gray-50 flex-row items-center px-4 py-3 rounded-2xl border border-gray-100">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search contacts..."
                        className="ml-3 flex-1 text-gray-800 font-medium"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 100
                }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-20">
                        <View className="w-20 h-20 bg-gray-50 rounded-[32px] items-center justify-center mb-6">
                            <Ionicons name="chatbubbles-outline" size={32} color="#D1D5DB" />
                        </View>
                        <Text className="text-gray-900 font-black text-lg text-center">No messages yet</Text>
                        <Text className="text-gray-400 text-sm text-center mt-2 leading-6 px-10">When you accept a gig, a chat group will be automatically created with the family.</Text>
                    </View>
                }
                renderItem={({ item, index }) => {
                    const otherParticipant = item.participants.find(p => p.role !== 'pal');
                    return (
                        <Animated.View entering={FadeInDown.delay(index * 100)}>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push({ pathname: '/(pal)/chat-room', params: { id: item.id } } as any);
                                }}
                                className="flex-row items-center py-5 border-b border-gray-50"
                            >
                                <View className="relative">
                                    <View className="w-14 h-14 bg-emerald-50 rounded-[22px] items-center justify-center border border-emerald-100 overflow-hidden">
                                        {otherParticipant?.avatar ? (
                                            <Image source={{ uri: otherParticipant.avatar }} className="w-full h-full" />
                                        ) : (
                                            <Ionicons name="person" size={24} color={BRAND_GREEN} />
                                        )}
                                    </View>
                                    <View className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                                </View>

                                <View className="flex-1 ml-4">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{otherParticipant?.name}</Text>
                                        <Text className="text-[10px] font-bold text-gray-400">{formatTime(item.lastTimestamp)}</Text>
                                    </View>
                                    <Text className="text-[10px] font-black text-emerald-600 mb-1 uppercase tracking-widest">{otherParticipant?.role || 'User'}</Text>
                                    <Text className="text-xs text-gray-500 font-medium" numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
                                </View>

                                {item.unreadCount > 0 && (
                                    <View className="ml-2 bg-orange-500 w-5 h-5 rounded-full items-center justify-center shadow-sm shadow-orange-200">
                                        <Text className="text-[10px] font-black text-white">{item.unreadCount}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    );
                }}
            />

            {/* Dashboard Bottom Tab Bar */}
            <BottomTab activeTab="Connect" />
        </View>
    );
}


