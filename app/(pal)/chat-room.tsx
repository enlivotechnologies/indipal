import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function ChatRoomScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { user } = useAuthStore();
    const { conversations, messages, sendMessage, markAsRead, isLoading } = useChatStore();
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    const conversation = conversations.find(c => c.id === id);
    const chatMessages = messages[id as string] || [];
    const otherParticipant = conversation?.participants.find(p => p.role !== 'pal');

    useEffect(() => {
        if (id) {
            markAsRead(id as string);
        }
    }, [id]);

    useEffect(() => {
        // Scroll to bottom when messages change
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [chatMessages]);

    const handleSend = () => {
        if (!inputText.trim() || !id || !user) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        sendMessage(
            id as string,
            inputText.trim(),
            user.phone || 'PAL_001',
            user.name || 'Arjun Singh'
        );
        setInputText('');
    };

    if (!conversation) return null;

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center border-b border-gray-50 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="flex-1 flex-row items-center">
                    <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100">
                        <Ionicons name="person" size={20} color={BRAND_GREEN} />
                    </View>
                    <View className="ml-3">
                        <Text className="text-gray-900 font-black text-sm">{otherParticipant?.name}</Text>
                        <Text className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">Online</Text>
                    </View>
                </View>
                <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
                    <Ionicons name="call-outline" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                style={{ flex: 1 }}
            >
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-6"
                    contentContainerStyle={{ paddingVertical: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    {chatMessages.map((msg, idx) => {
                        const isMe = msg.senderId === (user?.phone || 'PAL_001');
                        return (
                            <View key={msg.id} className={`mb-6 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <View
                                    className={`max-w-[80%] px-5 py-4 rounded-[24px] ${isMe ? 'bg-emerald-500 rounded-tr-none' : 'bg-gray-50 rounded-tl-none border border-gray-100'
                                        }`}
                                >
                                    <Text className={`text-sm leading-6 font-medium ${isMe ? 'text-white' : 'text-gray-900'}`}>
                                        {msg.text}
                                    </Text>
                                    <Text className={`text-[8px] font-black uppercase tracking-widest mt-2 text-right ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Input Area */}
                <View style={{ paddingBottom: Math.max(insets.bottom, 16) }} className="px-6 py-4 border-t border-gray-50 bg-white">
                    <View className="flex-row items-center bg-gray-50 rounded-[28px] px-4 h-14 border border-gray-100">
                        <TouchableOpacity className="mr-3">
                            <Ionicons name="add" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                        <TextInput
                            className="flex-1 text-gray-900 text-sm font-medium"
                            placeholder="Type a message..."
                            placeholderTextColor="#9CA3AF"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim()}
                            className={`w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-emerald-500' : 'bg-gray-200'}`}
                        >
                            <Ionicons name="send" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
    }
});
