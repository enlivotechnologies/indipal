import { captureImageWithCamera, pickDocument, pickImageFromGallery, uploadFile } from "@/lib/uploadService";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { Ionicons } from "@expo/vector-icons";
import { RecordingPresets, requestRecordingPermissionsAsync, useAudioPlayer, useAudioRecorder } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function ChatRoomScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { user } = useAuthStore();
    const { conversations, sendMessage, markAsRead, blockedUserIds } = useChatStore();
    const [inputText, setInputText] = useState('');
    const [showAttachments, setShowAttachments] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Audio Recording with expo-audio
    const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState(0);
    const recordTimer = useRef<any>(null);

    const conversation = conversations.find(c => c.id === id);
    const chatMessages = conversation?.messages || [];
    const isTyping = conversation?.isTyping || false;
    const isBlocked = blockedUserIds.includes(conversation?.contactId || '');

    useEffect(() => {
        if (id) {
            markAsRead(id as string);
        }
        return () => {
            if (id) markAsRead(id as string);
        };
    }, [id]);

    useEffect(() => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [chatMessages, isTyping]);

    const handleSendText = async () => {
        if (!inputText.trim() || !id || isSending) return;

        setIsSending(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await sendMessage(
            id as string,
            inputText.trim()
        );
        setInputText('');
        setIsSending(false);
    };

    const handleGallery = async () => {
        const asset = await pickImageFromGallery();
        if (asset) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAttachments(false);
            setIsSending(true);
            const url = await uploadFile(asset.uri);
            await sendMessage(
                id as string,
                "Sent an image",
                'image',
                { fileUrl: url }
            );
            setIsSending(false);
        }
    };

    const handleCamera = async () => {
        const asset = await captureImageWithCamera();
        if (asset) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAttachments(false);
            setIsSending(true);
            const url = await uploadFile(asset.uri);
            await sendMessage(
                id as string,
                "Sent a photo",
                'image',
                { fileUrl: url }
            );
            setIsSending(false);
        }
    };

    const handleLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Location permission is required to share your spot.');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowAttachments(false);
        setIsSending(true);
        const loc = await Location.getCurrentPositionAsync({});
        await sendMessage(
            id as string,
            "Shared current location",
            'location',
            { latitude: loc.coords.latitude, longitude: loc.coords.longitude }
        );
        setIsSending(false);
    };

    const handleFiles = async () => {
        const asset = await pickDocument();
        if (asset) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowAttachments(false);
            setIsSending(true);
            const url = await uploadFile(asset.uri);
            await sendMessage(
                id as string,
                `Sent file: ${asset.name}`,
                'file',
                { fileUrl: url, fileName: asset.name, fileSize: asset.size }
            );
            setIsSending(false);
        }
    };

    const startRecording = async () => {
        try {
            const { status } = await requestRecordingPermissionsAsync();
            if (status !== 'granted') return;

            // In expo-audio, recording presets are passed to prepareToRecordAsync
            await recorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
            recorder.record();

            setIsRecording(true);
            setRecordDuration(0);
            recordTimer.current = setInterval(() => {
                setRecordDuration(prev => prev + 1);
            }, 1000);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recorder) return;

        setIsRecording(false);
        if (recordTimer.current) clearInterval(recordTimer.current);

        await recorder.stop();
        const uri = recorder.uri;

        if (uri) {
            setIsSending(true);
            const url = await uploadFile(uri);
            await sendMessage(
                id as string,
                "Sent a voice message",
                'audio',
                { fileUrl: url, duration: recordDuration }
            );
            setIsSending(false);
        }
    };

    const handleCall = (type: 'voice' | 'video') => {
        if (isBlocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Contact Blocked", `Cannot start a ${type} call with a blocked contact.`);
            return;
        }
        if (!conversation) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // toggleCall(id as string, true, type);
        // Navigate to Call Screen
        router.push({
            pathname: '/(pal)/call',
            params: {
                type,
                partnerName: conversation.contactName,
                partnerAvatar: conversation.contactAvatar || ''
            }
        } as any);
    };

    if (!conversation) return null;

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                {/* Functional Header */}
                <View
                    style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
                    className="px-6 flex-row items-center border-b border-gray-100 bg-white"
                >
                    <TouchableOpacity onPress={() => router.replace('/(pal)/chat' as any)} className="mr-4">
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            router.push({
                                pathname: '/(pal)/contact-profile',
                                params: { id, participantId: conversation.contactId }
                            } as any);
                        }}
                        className="flex-row items-center flex-1"
                    >
                        <View className="w-10 h-10 bg-emerald-50 rounded-2xl items-center justify-center border border-emerald-100 overflow-hidden">
                            {conversation.contactAvatar ? (
                                <Image source={{ uri: conversation.contactAvatar }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={20} color={BRAND_GREEN} />
                            )}
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{conversation.contactName}</Text>
                            <View className="flex-row items-center">
                                <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Online</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View className="flex-row gap-x-3">
                        <TouchableOpacity
                            onPress={() => handleCall('voice')}
                            className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center"
                        >
                            <Ionicons name="call" size={18} color={BRAND_GREEN} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleCall('video')}
                            className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center"
                        >
                            <Ionicons name="videocam" size={18} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Real-time Message Area */}
                <FlatList
                    ref={flatListRef as any}
                    data={isTyping ? [...chatMessages, { id: 'typing', text: '', sender: 'them', timestamp: Date.now(), type: 'typing', isRead: false } as any] : chatMessages}
                    keyExtractor={(item) => item.id}
                    className="flex-1 px-6"
                    contentContainerStyle={{ paddingVertical: 24 }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    renderItem={({ item: msg }) => {
                        if (msg.type === 'typing') {
                            return (
                                <Animated.View
                                    entering={FadeInDown.duration(400)}
                                    className="flex-row justify-start mb-6"
                                >
                                    <View className="bg-gray-100 px-6 py-4 rounded-[28px] rounded-tl-none flex-row items-center">
                                        <View className="flex-row gap-x-1">
                                            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                                            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100" />
                                            <View className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200" />
                                        </View>
                                        <Text className="ml-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {conversation.contactName} is typing...
                                        </Text>
                                    </View>
                                </Animated.View>
                            );
                        }

                        const isMe = msg.sender === 'me';
                        return (
                            <View key={msg.id} className={`mb-6 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <View
                                    className={`max-w-[85%] px-5 py-4 rounded-[28px] ${isMe ? 'bg-emerald-500 rounded-tr-none shadow-sm shadow-emerald-200' : 'bg-gray-100 rounded-tl-none'
                                        }`}
                                >
                                    {msg.type === 'image' && msg.fileUrl && (
                                        <Image source={{ uri: msg.fileUrl }} className="w-64 h-48 rounded-2xl mb-2" resizeMode="cover" />
                                    )}
                                    {msg.type === 'location' && (
                                        <TouchableOpacity
                                            onPress={() => Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${msg.latitude},${msg.longitude}`)}
                                            className="bg-white/20 p-3 rounded-xl mb-2 flex-row items-center"
                                        >
                                            <Ionicons name="map" size={20} color={isMe ? 'white' : BRAND_GREEN} />
                                            <Text className={`ml-2 text-xs font-bold ${isMe ? 'text-white' : 'text-gray-800'}`}>View on Map</Text>
                                        </TouchableOpacity>
                                    )}
                                    {msg.type === 'file' && (
                                        <TouchableOpacity className="flex-row items-center bg-black/5 p-3 rounded-xl mb-2">
                                            <Ionicons name="document-text" size={24} color={isMe ? 'white' : '#6B7281'} />
                                            <View className="ml-3">
                                                <Text className={`text-xs font-bold ${isMe ? 'text-white' : 'text-gray-800'}`} numberOfLines={1}>{(msg as any).fileName}</Text>
                                                <Text className={`text-[8px] uppercase font-black ${isMe ? 'text-white/60' : 'text-gray-400'}`}>{(((msg as any).fileSize || 0) / 1024).toFixed(1)} KB</Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    {msg.type === 'audio' && (
                                        <AudioPlayer
                                            uri={msg.fileUrl!}
                                            duration={(msg as any).duration || 0}
                                            isMe={isMe}
                                        />
                                    )}

                                    <Text className={`text-[15px] font-medium leading-6 ${isMe ? 'text-white' : 'text-gray-800'}`}>
                                        {msg.text}
                                    </Text>

                                    <View className="flex-row items-center justify-end mt-2">
                                        <Text className={`text-[9px] font-bold uppercase tracking-widest ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                        {isMe && (
                                            <Ionicons
                                                name="checkmark-done"
                                                color={msg.isRead ? "#FFFFFF" : "rgba(255,255,255,0.4)"}
                                                size={12}
                                                style={{ marginLeft: 4 }}
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>
                        );
                    }}
                />

                {/* FUNCTIONAL ATTACHMENT MENU */}
                {showAttachments && (
                    <Animated.View
                        entering={FadeInDown.duration(200)}
                        exiting={FadeOutDown.duration(200)}
                        className="px-6 py-6 bg-gray-50 border-t border-gray-100 flex-row justify-between"
                    >
                        <AttachmentItem icon="images" label="Gallery" color="#3B82F6" onPress={handleGallery} />
                        <AttachmentItem icon="camera" label="Camera" color="#EF4444" onPress={handleCamera} />
                        <AttachmentItem icon="location" label="Location" color="#10B981" onPress={handleLocation} />
                        <AttachmentItem icon="document" label="Files" color="#6366F1" onPress={handleFiles} />
                    </Animated.View>
                )}

                {/* FULLY FUNCTIONAL INPUT */}
                {isBlocked ? (
                    <View
                        style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 16, paddingHorizontal: 16 }}
                        className="bg-gray-50 border-t border-gray-100 items-center justify-center py-6"
                    >
                        <View className="flex-row items-center bg-gray-200/50 px-6 py-3 rounded-full">
                            <Ionicons name="ban" size={16} color="#4B5563" />
                            <Text className="text-gray-500 font-bold text-xs ml-2 uppercase tracking-widest">You have blocked this contact</Text>
                        </View>
                    </View>
                ) : (
                    <View
                        style={{ paddingBottom: Math.max(insets.bottom, 16), paddingTop: 16, paddingHorizontal: 16 }}
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

                        {isRecording ? (
                            <View className="flex-1 bg-red-50 rounded-2xl px-6 h-12 flex-row items-center justify-between border border-red-100">
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-3" />
                                    <Text className="text-red-600 font-black uppercase text-[10px]">Recording {recordDuration}s</Text>
                                </View>
                                <TouchableOpacity onPress={() => setIsRecording(false)}>
                                    <Text className="text-gray-400 font-bold text-[10px] uppercase">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-1 border border-gray-100 min-h-[48px] justify-center">
                                <TextInput
                                    placeholder="Type a message..."
                                    placeholderTextColor="#9CA3AF"
                                    className="text-gray-800 font-medium"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    onFocus={() => setShowAttachments(false)}
                                    multiline
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            onLongPress={startRecording}
                            onPressOut={isRecording ? stopRecording : undefined}
                            onPress={inputText.trim() ? handleSendText : undefined}
                            disabled={isSending}
                            className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg ${inputText.trim() || isRecording ? 'bg-emerald-500 shadow-emerald-200' : 'bg-gray-200'}`}
                        >
                            {isSending ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <Ionicons name={inputText.trim() ? "send" : "mic"} size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
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

function AudioPlayer({ uri, duration, isMe }: { uri: string; duration: number; isMe: boolean }) {
    const player = useAudioPlayer(uri);
    const [position, setPosition] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            if (player.playing && player.duration > 0) {
                setPosition(player.currentTime / player.duration);
            } else if (!player.playing && player.currentTime === 0) {
                setPosition(0);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [player.playing, player.duration, player.currentTime]);

    const playPause = async () => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
    };

    return (
        <View className="flex-row items-center gap-x-3 mb-2 min-w-[150px]">
            <TouchableOpacity onPress={playPause}>
                <Ionicons
                    name={player.playing ? "pause-circle" : "play-circle"}
                    size={36}
                    color={isMe ? 'white' : BRAND_GREEN}
                />
            </TouchableOpacity>
            <View className="flex-1">
                <View className={`h-1 w-full rounded-full ${isMe ? 'bg-white/30' : 'bg-gray-200'}`}>
                    <View
                        style={{ width: `${position * 100}%` }}
                        className={`h-full rounded-full ${isMe ? 'bg-white' : BRAND_GREEN}`}
                    />
                </View>
                <View className="flex-row justify-between mt-1">
                    <Text className={`text-[7px] font-black ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                        {Math.floor((position * duration)) || 0}s
                    </Text>
                    <Text className={`text-[7px] font-black ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                        {duration}s
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({});
