import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function ChatListScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { conversations, fetchConversations, isLoading } = useChatStore();

    useEffect(() => {
        if (user?.phone) {
            fetchConversations(user.phone || 'PAL_001');
        }
    }, [user]);

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center justify-between border-b border-gray-50 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-2xl font-black text-gray-900 flex-1">Messages</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
                {conversations.length > 0 ? (
                    conversations.map((conv, idx) => {
                        const otherParticipant = conv.participants.find(p => p.role !== 'pal');
                        return (
                            <Animated.View key={conv.id} entering={FadeInUp.delay(idx * 100)}>
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        router.push({ pathname: '/(pal)/chat-room', params: { id: conv.id } } as any);
                                    }}
                                    className="px-6 py-6 border-b border-gray-50 flex-row items-center"
                                >
                                    <View className="w-14 h-14 bg-emerald-50 rounded-[20px] items-center justify-center border border-emerald-100 overflow-hidden">
                                        <Ionicons name="person" size={24} color={BRAND_GREEN} />
                                    </View>
                                    <View className="flex-1 ml-4">
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-gray-900 font-black text-base">{otherParticipant?.name}</Text>
                                            {conv.lastTimestamp && (
                                                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">
                                                    {new Date(conv.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            )}
                                        </View>
                                        <Text numberOfLines={1} className="text-gray-500 text-xs font-bold mt-1">
                                            {conv.lastMessage || 'Start a conversation...'}
                                        </Text>
                                    </View>
                                    {conv.unreadCount > 0 && (
                                        <View className="bg-emerald-500 min-w-[20px] h-5 rounded-full items-center justify-center ml-4 px-1.5">
                                            <Text className="text-white text-[10px] font-black">{conv.unreadCount}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })
                ) : (
                    <View className="flex-1 items-center justify-center px-10 py-20">
                        <View className="w-20 h-20 bg-gray-50 rounded-[32px] items-center justify-center mb-6">
                            <Ionicons name="chatbubbles-outline" size={32} color="#D1D5DB" />
                        </View>
                        <Text className="text-gray-900 font-black text-lg text-center">No messages yet</Text>
                        <Text className="text-gray-400 text-sm text-center mt-2 leading-6">When you accept a gig, a chat group will be automatically created with the family.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
    }
});
