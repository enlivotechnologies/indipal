import { Message, useChatStore } from '@/store/chatStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Dimensions, Image, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const BRAND_ORANGE = '#F97316';

export default function FamilyContactProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id, participantId } = useLocalSearchParams();
    const { conversations, toggleBlockUser, blockedUserIds } = useChatStore();
    const conversation = conversations.find(c => c.id === id);
    const isBlocked = blockedUserIds.includes(conversation?.contactId || (participantId as string));

    const [activeTab, setActiveTab] = useState<'Media' | 'Files' | 'Links'>('Media');
    const [showReportModal, setShowReportModal] = useState(false);

    const chatMessages: Message[] = (conversation?.messages || []);

    const mediaMessages = useMemo(() => chatMessages.filter(m => m.type === 'image'), [chatMessages]);
    const fileMessages = useMemo(() => chatMessages.filter(m => m.type === 'file'), [chatMessages]);
    const linkMessages = useMemo(() => chatMessages.filter(m => m.type === 'text' && (m.text.includes('http') || m.text.includes('www'))), [chatMessages]);

    const handleCall = () => {
        if (isBlocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Contact Blocked", "You cannot initiate a call to a blocked contact.");
            return;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Linking.openURL('tel:+919876543210');
    };

    const handleReport = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setShowReportModal(true);
    };

    const submitReport = (reason: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowReportModal(false);
        Alert.alert("Report Submitted", "Thank you for your feedback. Our safety team will review this contact.");
    };

    if (!conversation) return null;

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View className="relative">
                    <View style={{ width: width, height: width * 1.1 }} className="bg-gray-100 items-center justify-center">
                        {conversation.contactAvatar ? (
                            <Image
                                source={{ uri: conversation.contactAvatar }}
                                style={{ width: width, height: width * 1.1 }}
                            />
                        ) : (
                            <View className="w-full h-full bg-slate-200 items-center justify-center">
                                <Ionicons name="person" size={120} color="#94A3B8" />
                            </View>
                        )}
                    </View>
                    <LinearGradient
                        colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'white']}
                        className="absolute inset-0"
                    />

                    {/* Floating Back Button */}
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace({ pathname: '/(family)/chat/[id]', params: { id } } as any)}
                        style={{ top: Math.max(insets.top, 20) }}
                        className="absolute left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Profile Summary */}
                    <View className="absolute bottom-0 left-0 right-0 p-8">
                        <Animated.View entering={FadeInDown.delay(100)}>
                            <View className="flex-row items-center mb-2">
                                <View className="w-2 h-2 bg-orange-500 rounded-full mr-2 shadow-sm shadow-orange-500" />
                                <Text className="text-orange-500 font-black text-[10px] uppercase tracking-widest">Available</Text>
                            </View>
                            <Text className="text-4xl font-black text-gray-900 mb-1">{conversation.contactName}</Text>
                            <Text className="text-gray-500 font-bold text-lg uppercase tracking-tight">{conversation.contactRole} • Trusted Member</Text>
                        </Animated.View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-6 -mt-8 relative z-10 flex-row justify-between">
                    <ActionButton
                        icon="call"
                        label="Call"
                        color={BRAND_ORANGE}
                        onPress={handleCall}
                        delay={200}
                    />
                    <ActionButton
                        icon="videocam"
                        label="Video"
                        color="#3B82F6"
                        onPress={() => {
                            if (isBlocked) {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                Alert.alert("Contact Blocked", "Video calls are disabled for blocked contacts.");
                                return;
                            }
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            router.push({
                                pathname: '/(family)/call',
                                params: { type: 'video', partnerName: conversation.contactName, partnerAvatar: conversation.contactAvatar || '' }
                            } as any);
                        }}
                        delay={300}
                    />
                    <ActionButton
                        icon="alert-circle"
                        label="Report"
                        color="#EF4444"
                        onPress={handleReport}
                        delay={400}
                    />
                    <ActionButton
                        icon={isBlocked ? "checkmark-circle" : "ban"}
                        label={isBlocked ? "Unblock" : "Block"}
                        color={isBlocked ? BRAND_ORANGE : "#000000"}
                        onPress={() => {
                            if (isBlocked) {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                toggleBlockUser(conversation.contactId);
                            } else {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                Alert.alert("Block User", "Are you sure you want to block this user?", [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Block", style: "destructive", onPress: () => toggleBlockUser(conversation.contactId) }
                                ]);
                            }
                        }}
                        delay={500}
                    />
                </View>

                {/* Details Section */}
                <View className="px-6 py-10">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Contact Information</Text>
                    <DetailRow icon="phone-portrait-outline" label="Phone" value="+91 98765 43210" />
                    <DetailRow icon="mail-outline" label="Email" value={`${(conversation.contactName || 'User').toLowerCase().replace(' ', '.')}@enlivo.care`} />
                    <DetailRow icon="briefcase-outline" label="Related Hub" value="Indipal Care Service" />
                    <DetailRow icon="star-outline" label="Rating" value="4.9 (24 Reviews)" />
                </View>

                {/* Shared Content Tabs */}
                <View className="px-6 mb-12">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Shared Content</Text>
                    </View>

                    <View className="flex-row gap-x-6 mb-8 border-b border-gray-100 pb-2">
                        {['Media', 'Files', 'Links'].map((tab) => (
                            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)}>
                                <Text className={`text-xs font-black uppercase tracking-widest ${activeTab === tab ? 'text-orange-500' : 'text-gray-300'}`}>
                                    {tab}
                                </Text>
                                {activeTab === tab && <View className="h-0.5 bg-orange-500 mt-2" />}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {activeTab === 'Media' && (
                        <View className="flex-row flex-wrap gap-3">
                            {mediaMessages.length > 0 ? mediaMessages.map((m, idx) => (
                                <Animated.Image
                                    key={m.id}
                                    entering={FadeInRight.delay(idx * 50)}
                                    source={{ uri: m.fileUrl }}
                                    style={{ width: (width - 48 - 24) / 3, height: (width - 48 - 24) / 3 }}
                                    className="rounded-2xl bg-gray-100"
                                />
                            )) : <EmptyState icon="images" label="No media shared yet" />}
                        </View>
                    )}

                    {activeTab === 'Files' && (
                        <View className="gap-y-3">
                            {fileMessages.length > 0 ? fileMessages.map((m, idx) => (
                                <Animated.View key={m.id} entering={FadeInRight.delay(idx * 50)}>
                                    <TouchableOpacity className="flex-row items-center bg-gray-50 p-4 rounded-[24px] border border-gray-100">
                                        <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center">
                                            <Ionicons name="document-text" size={20} color="#6366F1" />
                                        </View>
                                        <View className="ml-4 flex-1">
                                            <Text className="text-gray-900 font-bold text-xs" numberOfLines={1}>{m.fileName}</Text>
                                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{((m.fileSize || 0) / 1024).toFixed(1)} KB</Text>
                                        </View>
                                        <Ionicons name="download-outline" size={18} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </Animated.View>
                            )) : <EmptyState icon="document" label="No files shared yet" />}
                        </View>
                    )}

                    {activeTab === 'Links' && (
                        <View className="gap-y-3">
                            {linkMessages.length > 0 ? linkMessages.map((m, idx) => (
                                <Animated.View key={m.id} entering={FadeInRight.delay(idx * 50)}>
                                    <TouchableOpacity
                                        onPress={() => Linking.openURL(m.text.includes('http') ? m.text : `https://${m.text}`)}
                                        className="bg-gray-50 p-5 rounded-[24px] border border-gray-100"
                                    >
                                        <View className="flex-row items-center mb-2">
                                            <Ionicons name="link" size={14} color={BRAND_ORANGE} />
                                            <Text className="text-orange-600 font-black text-[10px] uppercase ml-2 tracking-widest">Link Shared</Text>
                                        </View>
                                        <Text className="text-gray-900 font-medium text-xs underline" numberOfLines={2}>{m.text}</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )) : <EmptyState icon="link" label="No links shared yet" />}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Report Modal */}
            <Modal
                visible={showReportModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowReportModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ flex: 1 }}
                        onPress={() => setShowReportModal(false)}
                    />
                    <Animated.View
                        entering={FadeInDown}
                        className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl"
                    >
                        <View className="w-12 h-1.5 bg-gray-100 rounded-full self-center mb-8" />
                        <Text className="text-2xl font-black text-gray-900 mb-2">Report Profile</Text>
                        <Text className="text-gray-500 font-medium mb-8">Tell us why you're reporting {conversation.contactName}. Your report is anonymous.</Text>

                        <View className="gap-y-3">
                            {['Spam or Harassment', 'Inappropriate Content', 'Suspicious Activity', 'Other'].map((reason) => (
                                <TouchableOpacity
                                    key={reason}
                                    onPress={() => submitReport(reason)}
                                    className="flex-row items-center justify-between bg-gray-50 p-6 rounded-[24px] border border-gray-100"
                                >
                                    <Text className="text-gray-800 font-bold text-sm">{reason}</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowReportModal(false)}
                            className="mt-8 py-5 items-center"
                        >
                            <Text className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Cancel</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

function ActionButton({ icon, label, color, delay, onPress }: { icon: any; label: string; color: string; delay: number; onPress: () => void }) {
    return (
        <Animated.View entering={FadeInDown.delay(delay)}>
            <TouchableOpacity onPress={onPress} className="items-center">
                <View
                    style={{
                        backgroundColor: 'white',
                        shadowColor: color,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.1,
                        shadowRadius: 20,
                        elevation: 5
                    }}
                    className="w-14 h-14 rounded-2xl items-center justify-center border border-gray-50"
                >
                    <Ionicons name={icon} size={24} color={color} />
                </View>
                <Text className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3">{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <View className="flex-row items-center mb-8">
            <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4 border border-gray-100">
                <Ionicons name={icon} size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</Text>
                <Text className="text-gray-900 font-bold text-sm">{value}</Text>
            </View>
        </View>
    );
}

function EmptyState({ icon, label }: { icon: any; label: string }) {
    return (
        <View className="w-full py-12 items-center justify-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <Ionicons name={icon} size={32} color="#D1D5DB" />
            <Text className="text-gray-400 font-bold text-xs mt-4 uppercase tracking-[4px]">{label}</Text>
        </View>
    );
}
