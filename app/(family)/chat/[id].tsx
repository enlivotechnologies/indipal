import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Types ─────────────────────────────────────────────────────────────
type BaseMessage = { id: string; sender: string; seen: boolean; time: string };
type TextMessage = BaseMessage & { type: "text"; text: string };
type ImageMessage = BaseMessage & { type: "image"; uri: string; caption?: string };
type Message = TextMessage | ImageMessage;

// ── Mock Data ──────────────────────────────────────────────────────────
const chatData = [
  { id: '1', name: 'Anitha Suresh', image: 'https://i.pravatar.cc/150?u=anitha' },
  { id: '2', name: 'Dr. Sameer', image: 'https://i.pravatar.cc/150?u=sameer' },
  { id: '3', name: 'Arjun Singh', image: 'https://i.pravatar.cc/150?u=arjun' },
  { id: '4', name: 'Priya Verma', image: 'https://i.pravatar.cc/150?u=priya' }
];

// ── Component ─────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const person = chatData.find(p => p.id === id) || chatData[0];

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello! I am with your mother now.", sender: "other", seen: true, type: "text", time: '10:30 AM' },
    { id: "2", text: "She has finished her breakfast and taken the morning meds.", sender: "other", seen: true, type: "text", time: '10:31 AM' },
    { id: "3", text: `Great, thanks for the update ${person.name}!`, sender: "me", seen: true, type: "text", time: '10:35 AM' },
  ]);

  const [input, setInput] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newMessage: TextMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "me",
      seen: false,
      type: "text",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const sendImage = (uri: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newMessage: ImageMessage = {
      id: Date.now().toString(),
      uri: uri,
      sender: "me",
      seen: false,
      type: "image",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, newMessage]);
    setShowAttachments(false);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(family)/chat' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Enlivo Premium Header - Responsive */}
        <View
          style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
          className="px-6 flex-row items-center border-b border-gray-100 bg-white"
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
            <Image source={{ uri: person.image }} className="w-10 h-10 rounded-2xl" />

            <View className="ml-3 flex-1">
              <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{person.name}</Text>
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
                // Video call placeholder logic
              }}
              className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center"
            >
              <Ionicons name="videocam" size={18} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* CHAT LIST */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              className={`mb-4 max-w-[85%] rounded-[28px] overflow-hidden ${item.sender === "me"
                ? "self-end shadow-sm shadow-orange-100"
                : "self-start"
                }`}
            >
              <View className={`p-4 ${item.sender === 'me' ? 'bg-orange-500 rounded-tr-none' : 'bg-gray-100 rounded-tl-none'}`}>
                {item.type === 'text' ? (
                  <Text className={`text-[15px] font-medium leading-5 ${item.sender === 'me' ? 'text-white' : 'text-gray-800'}`}>
                    {item.text}
                  </Text>
                ) : (
                  <View>
                    <Image
                      source={{ uri: item.uri }}
                      className="w-64 h-48 rounded-2xl mb-2"
                      resizeMode="cover"
                    />
                    {item.caption && (
                      <Text className={`text-[14px] font-medium ${item.sender === 'me' ? 'text-white' : 'text-gray-800'}`}>
                        {item.caption}
                      </Text>
                    )}
                  </View>
                )}
                <View className="flex-row items-center justify-end mt-2">
                  <Text className={`text-[9px] font-bold uppercase tracking-tighter ${item.sender === 'me' ? 'text-white/70' : 'text-gray-400'}`}>
                    {item.time}
                  </Text>
                  {item.sender === "me" && (
                    <Ionicons
                      name="checkmark-done"
                      color={item.seen ? "#FFFFFF" : "rgba(255,255,255,0.4)"}
                      size={12}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
              </View>
            </View>
          )}
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
                  setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    text: "📍 Shared current location: 12.9716, 77.5946",
                    sender: "me",
                    seen: false,
                    type: "text",
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }]);
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

        {/* INPUT SECTION - Responsive Bottom */}
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
            onPress={sendMessage}
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

const styles = StyleSheet.create({});
