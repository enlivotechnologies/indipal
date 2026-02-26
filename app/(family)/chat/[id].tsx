import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Types ─────────────────────────────────────────────────────────────


// ── Component ─────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { conversations, sendMessage, markAsRead } = useChatStore();
  const flatListRef = useRef<FlatList>(null);

  const conversation = conversations.find(c => c.id === id);
  const chatMessages = conversation?.messages || [];
  const isTyping = conversation?.isTyping || false;

  useEffect(() => {
    if (id) markAsRead(id as string);
  }, [id, chatMessages.length]);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatMessages, isTyping]);

  const [input, setInput] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);

  const handleSend = () => {
    if (!input.trim() || !id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendMessage(id as string, input.trim());
    setInput("");
  };

  const sendImage = (uri: string) => {
    if (!id) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    sendMessage(
      id as string,
      "Sent an image",
      'image',
      { fileUrl: uri }
    );
    setShowAttachments(false);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(family)/chat' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Enlivo Premium Header - Fixed at Top */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
        className="px-6 flex-row items-center border-b border-gray-100 bg-white z-10"
      >
        <TouchableOpacity onPress={handleBack} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(family)/profiles/caretaker' as any);
          }}
          className="flex-row items-center flex-1"
        >
          <View className="w-10 h-10 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100 overflow-hidden">
            {conversation?.contactAvatar ? (
              <Image source={{ uri: conversation.contactAvatar }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={20} color="#F59E0B" />
            )}
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{conversation?.contactName || 'User'}</Text>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Online</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row gap-x-3">
          <TouchableOpacity
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Linking.openURL('tel:+919876543210');
            }}
            className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center"
          >
            <Ionicons name="call" size={18} color="#F59E0B" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }}
            className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center"
          >
            <Ionicons name="videocam" size={18} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* CHAT LIST */}
        <FlatList
          ref={flatListRef}
          data={isTyping ? [...chatMessages, { id: 'typing', text: '', sender: 'them', timestamp: Date.now(), type: 'typing', isRead: false }] : chatMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if ((item as any).type === 'typing') {
              return (
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  className="self-start mb-4"
                >
                  <View className="bg-gray-100 px-5 py-3 rounded-[24px] rounded-tl-none flex-row items-center">
                    <View className="flex-row gap-x-1">
                      <View className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      <View className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-50" />
                      <View className="w-1.5 h-1.5 bg-gray-400 rounded-full opacity-25" />
                    </View>
                    <Text className="ml-2 text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      {conversation?.contactName} is typing...
                    </Text>
                  </View>
                </Animated.View>
              );
            }
            const isMe = item.sender === 'me';
            const isUnreadReceived = !isMe && !item.isRead;

            return (
              <View
                className={`mb-4 max-w-[85%] rounded-[28px] overflow-hidden ${isMe
                  ? "self-end shadow-sm shadow-orange-100"
                  : "self-start shadow-sm shadow-gray-100"
                  }`}
              >
                <View className={`p-4 ${isMe ? 'bg-orange-500 rounded-tr-none' : isUnreadReceived ? 'bg-orange-50 rounded-tl-none border border-orange-100' : 'bg-gray-100 rounded-tl-none'}`}>
                  {item.type === 'text' ? (
                    <Text className={`text-[15px] font-medium leading-5 ${isMe ? 'text-white' : 'text-gray-800'}`}>
                      {item.text}
                    </Text>
                  ) : item.type === 'image' ? (
                    <View>
                      <Image
                        source={{ uri: item.fileUrl }}
                        className="w-64 h-48 rounded-2xl mb-2"
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <Text className="italic text-xs text-gray-400">Attached Media</Text>
                  )}
                  <View className="flex-row items-center justify-end mt-2">
                    <Text className={`text-[9px] font-bold uppercase tracking-tighter ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {isMe && (
                      <Ionicons
                        name={item.isRead ? "checkmark-done" : "checkmark"}
                        color={item.isRead ? "#FFFFFF" : "rgba(255,255,255,0.4)"}
                        size={12}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                    {isUnreadReceived && (
                      <View className="w-1.5 h-1.5 bg-orange-500 rounded-full ml-1" />
                    )}
                  </View>
                </View>
              </View>
            );
          }}
        />

        {/* ATTACHMENT MENU */}
        {
          showAttachments && (
            <Animated.View
              entering={FadeInDown.duration(200)}
              exiting={FadeOutDown.duration(200)}
              className="px-6 py-6 bg-gray-50 border-t border-gray-100 flex-row justify-between"
            >
              <AttachmentItem
                icon="images"
                label="Gallery"
                color="#3B82F6"
                onPress={() => sendImage('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400')}
              />
              <AttachmentItem
                icon="camera"
                label="Camera"
                color="#EF4444"
                onPress={() => sendImage('https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=400')}
              />
              <AttachmentItem
                icon="location"
                label="Location"
                color="#10B981"
                onPress={() => {
                  setShowAttachments(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Mock Location Send
                  sendMessage(
                    id as string,
                    "📍 Shared current location: 12.9716, 77.5946",
                    'location',
                    { latitude: 12.9716, longitude: 77.5946 }
                  );
                }}
              />
              <AttachmentItem
                icon="document"
                label="Files"
                color="#6366F1"
                onPress={() => {
                  setShowAttachments(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                }}
              />
            </Animated.View>
          )
        }

        {/* INPUT SECTION - Fixed at Bottom */}
        <View
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 16,
            paddingHorizontal: 16
          }}
          className="bg-white border-t border-gray-50 flex-row items-end gap-x-3"
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAttachments(!showAttachments);
            }}
            className={`w-12 h-12 rounded-2xl items-center justify-center ${showAttachments ? 'bg-gray-200' : 'bg-gray-50'}`}
          >
            <Ionicons name={showAttachments ? "close" : "add"} size={24} color={showAttachments ? "#1F2937" : "#4B5563"} />
          </TouchableOpacity>

          <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-1 border border-gray-100 min-h-[48px] justify-center">
            <TextInput
              placeholder="Message..."
              placeholderTextColor="#9CA3AF"
              className="text-gray-800 font-medium"
              value={input}
              onChangeText={setInput}
              onFocus={() => setShowAttachments(false)}
              multiline
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            className="w-12 h-12 bg-orange-500 rounded-2xl items-center justify-center shadow-lg shadow-orange-200"
          >
            <Ionicons name={input.trim() ? "send" : "mic"} size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView >
    </View >
  );
}

function AttachmentItem({ icon, label, color, onPress }: { icon: any; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center">
      <View style={{ backgroundColor: color + '15' }} className="w-14 h-14 rounded-2xl items-center justify-center mb-2">
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</Text>
    </TouchableOpacity>
  );
}


