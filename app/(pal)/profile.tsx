import { pickImageFromGallery, uploadFile } from "@/lib/uploadService";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function PalsProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, logout, updateUser, createSupportTicket } = useAuthStore();

    // UI States
    const [isEditing, setIsEditing] = useState(false);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
    const [ticketCategory, setTicketCategory] = useState<'Payment' | 'Verification' | 'Technical Issue' | 'Other'>('Payment');
    const [ticketDescription, setTicketDescription] = useState('');
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Edit Form State
    const [editName, setEditName] = useState(user?.name || '');
    const [editPhone, setEditPhone] = useState(user?.phone || '');
    const [editUpi, setEditUpi] = useState(user?.upiId || '');

    const handleSubmitTicket = async () => {
        if (!ticketDescription) {
            Alert.alert("Error", "Please provide a description");
            return;
        }

        setIsSubmittingTicket(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const result = await createSupportTicket({
            category: ticketCategory,
            description: ticketDescription,
        });

        setIsSubmittingTicket(false);
        if (result.success) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Ticket Raised", `Your ticket #${result.id} has been created.`);
            setShowRaiseTicketModal(false);
            setTicketDescription('');
        }
    };

    const handleLogout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out of your Pal account?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: () => {
                        logout();
                        router.replace('/(auth)/onboarding' as any);
                    }
                }
            ]
        );
    };

    const handleSaveProfile = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateUser({
            name: editName,
            phone: editPhone,
            upiId: editUpi
        });
        setIsEditing(false);
    };

    const handlePhotoUpdate = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const asset = await pickImageFromGallery();
        if (!asset) return;

        setIsUploadingPhoto(true);
        try {
            const url = await uploadFile(asset.uri);
            updateUser({ profileImage: url });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            Alert.alert("Error", "Failed to upload photo");
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row items-center justify-between bg-white"
            >
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(pal)/home')}
                        className="mr-4 w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center"
                    >
                        <Ionicons name="chevron-back" size={24} color={BRAND_GREEN} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black text-gray-900">Settings</Text>
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pal Account</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setEditName(user?.name || '');
                        setEditPhone(user?.phone || '');
                        setEditUpi(user?.upiId || '');
                        setIsEditing(true);
                    }}
                    className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                >
                    <Ionicons name="create-outline" size={20} color={BRAND_GREEN} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 100
                }}
            >
                {/* Profile Card */}
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="px-6 py-10 items-center">
                    <View className="relative">
                        <View className="w-32 h-32 bg-emerald-50 rounded-[48px] items-center justify-center border-2 border-emerald-100 p-1 overflow-hidden shadow-sm">
                            {user?.profileImage ? (
                                <Image source={{ uri: user.profileImage }} className="w-full h-full rounded-[44px]" />
                            ) : (
                                <View className="bg-emerald-50 w-full h-full items-center justify-center">
                                    <Ionicons name="person" size={56} color={BRAND_GREEN} />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={handlePhotoUpdate}
                            disabled={isUploadingPhoto}
                            className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 rounded-2xl items-center justify-center border-4 border-white shadow-sm"
                        >
                            {isUploadingPhoto ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="camera" size={18} color="white" />}
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-black text-gray-900 mt-6">{user?.name || 'Arjun Singh'}</Text>

                    {(() => {
                        const requiredDocs = ['id_proof', 'address_proof', 'bank_details'];
                        const allVerified = requiredDocs.every(type =>
                            user?.verificationDocuments?.find(d => d.documentType === type)?.verificationStatus === 'Verified'
                        );

                        if (allVerified) {
                            return (
                                <View className="flex-row items-center bg-emerald-50 px-4 py-2 rounded-full mt-3 border border-emerald-100">
                                    <Ionicons name="shield-checkmark" size={14} color={BRAND_GREEN} />
                                    <Text className="text-emerald-600 text-[10px] font-black uppercase tracking-widest ml-2">Verified Care Pal</Text>
                                </View>
                            );
                        }

                        return (
                            <TouchableOpacity
                                onPress={() => router.push('/(pal)/verification')}
                                className="flex-row items-center bg-orange-50 px-4 py-2 rounded-full mt-3 border border-orange-100"
                            >
                                <Ionicons name="time" size={14} color="#F59E0B" />
                                <Text className="text-orange-600 text-[10px] font-black uppercase tracking-widest ml-2">Verification Pending</Text>
                            </TouchableOpacity>
                        );
                    })()}
                </Animated.View>

                {/* Missing Photo Prompt */}
                {!user?.profileImage && (
                    <Animated.View entering={FadeInUp.delay(200)} className="px-6 mb-8">
                        <TouchableOpacity
                            onPress={handlePhotoUpdate}
                            className="bg-orange-50 border border-orange-100 p-6 rounded-[32px] flex-row items-center"
                        >
                            <View className="w-12 h-12 bg-orange-100 rounded-2xl items-center justify-center">
                                <Ionicons name="image" size={24} color="#D97706" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-orange-900 font-black text-sm uppercase">Complete Your Profile</Text>
                                <Text className="text-orange-700/60 text-[10px] font-bold mt-0.5">Please upload a profile photo to build trust.</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color="#D97706" />
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Stats */}
                <View className="px-6 flex-row gap-x-4 mb-10">
                    <StatBox label="Jobs" value="128" icon="briefcase" color={BRAND_GREEN} />
                    <StatBox label="Rating" value="4.9" icon="star" color="#F59E0B" />
                    <StatBox label="Points" value="2.4k" icon="flash" color="#A855F7" />
                </View>

                {/* Settings Section */}
                <View className="px-6">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Account & Governance</Text>

                    <View className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm">
                        <SettingsOption
                            icon="person"
                            label="Personal Details"
                            subLabel="Contact info, residential address"
                            onPress={() => setIsEditing(true)}
                        />
                        <SettingsOption
                            icon="wallet"
                            label="Earnings & Wallet"
                            subLabel={`₹ ${(user?.walletBalance || 0).toLocaleString()} available for withdrawal`}
                            onPress={() => router.replace('/(pal)/earnings')}
                        />
                        <SettingsOption
                            icon="document-text"
                            label="Verification Docs"
                            subLabel="Criminal Record, ID Verification"
                            onPress={() => router.push('/(pal)/verification')}
                        />
                        <SettingsOption
                            icon="help-circle"
                            label="Support Hub"
                            subLabel="FAQ, Admin Connect, Help"
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setShowSupportModal(true);
                            }}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.7}
                        className="mt-10 bg-red-50 p-6 rounded-[32px] border border-red-100 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                                <Ionicons name="log-out" size={24} color="#EF4444" />
                            </View>
                            <View className="ml-4">
                                <Text className="text-red-500 font-black text-base uppercase">Sign Out</Text>
                                <Text className="text-red-400 text-[10px] font-bold uppercase tracking-widest">End Current Session</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#FECACA" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Custom Bottom Tab Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row items-center h-16 rounded-[28px] px-2 shadow-2xl">
                    <TabButton icon="home" label="Home" active={false} onPress={() => router.replace('/(pal)/home')} />
                    <TabButton icon="briefcase" label="Gig" active={false} onPress={() => router.replace('/(pal)/active-gig')} />
                    <TabButton icon="wallet" label="Earnings" active={false} onPress={() => router.replace('/(pal)/earnings')} />
                    <TabButton icon="school" label="Training" active={false} onPress={() => router.replace('/(pal)/training')} />
                </View>
            </Animated.View>

            {/* Modals */}
            <Modal visible={isEditing} transparent animationType="fade">
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <Animated.View entering={ZoomIn.duration(400)} className="bg-white w-full rounded-[48px] p-8 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-2xl font-black text-gray-900">Edit Profile</Text>
                                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Update your Pal credentials</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsEditing(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                                <Ionicons name="close" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-5">
                            <InputField label="Full Name" value={editName} onChangeText={setEditName} icon="person" />
                            <InputField label="Phone Number" value={editPhone} onChangeText={setEditPhone} icon="call" keyboardType="phone-pad" />
                            <InputField label="UPI ID (Earnings)" value={editUpi} onChangeText={setEditUpi} icon="wallet" placeholder="user@upi" />
                        </View>

                        <TouchableOpacity
                            onPress={handleSaveProfile}
                            className="mt-10 bg-emerald-500 py-5 rounded-[24px] items-center shadow-xl shadow-emerald-500/30"
                        >
                            <Text className="text-white font-black uppercase tracking-widest">Save Changes</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* Support Hub Modal */}
            <Modal visible={showSupportModal} transparent animationType="fade">
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <Animated.View entering={ZoomIn.duration(400)} className="bg-white w-full rounded-[48px] p-8 shadow-2xl max-h-[85%]">
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-2xl font-black text-gray-900">Pal Support Hub</Text>
                                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Specialist Support Center</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowSupportModal(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                                <Ionicons name="close" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
                            <View className="flex-row gap-x-3 mb-8">
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setShowRaiseTicketModal(true);
                                    }}
                                    className="flex-1 bg-emerald-500 py-6 rounded-[32px] items-center justify-center shadow-lg shadow-emerald-200"
                                >
                                    <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-2">
                                        <Ionicons name="add" size={24} color="white" />
                                    </View>
                                    <Text className="text-white font-black text-[10px] uppercase">Raise Ticket</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-gray-50 py-6 rounded-[32px] items-center justify-center border border-gray-100"
                                >
                                    <View className="w-10 h-10 bg-white rounded-full items-center justify-center mb-2 shadow-sm">
                                        <Ionicons name="list" size={20} color="#1F2937" />
                                    </View>
                                    <Text className="text-gray-900 font-black text-[10px] uppercase">My Tickets</Text>
                                </TouchableOpacity>
                            </View>

                            <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Quick FAQ</Text>
                            <HelpItem q="How do payouts work?" a="Payouts are processed every Friday for all completed and confirmed gigs. Funds reach your linked UPI/Bank within 24 hours." />
                            <HelpItem q="What if a senior is unresponsive?" a="Immediately trigger the SOS in the app and call our 24/7 dispatcher via the 'Emergency Hub' button." />
                        </ScrollView>

                        <View className="flex-row gap-x-3">
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                                className="flex-1 bg-gray-900 py-4 rounded-2xl flex-row items-center justify-center"
                            >
                                <Ionicons name="call" size={18} color="white" />
                                <Text className="text-white font-black uppercase text-[10px] ml-2">Phone Admin</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                }}
                                className="flex-1 bg-gray-100 py-4 rounded-2xl flex-row items-center justify-center"
                            >
                                <Ionicons name="chatbubbles" size={18} color="#1F2937" />
                                <Text className="text-gray-900 font-black uppercase text-[10px] ml-2">WhatsApp</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* Raise Ticket Modal */}
            <Modal visible={showRaiseTicketModal} transparent animationType="fade">
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <Animated.View entering={ZoomIn.duration(400)} className="bg-white w-full rounded-[48px] p-8 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-2xl font-black text-gray-900">Raise Ticket</Text>
                                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Contact System Administrator</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowRaiseTicketModal(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                                <Ionicons name="close" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Issue Category</Text>
                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {(['Payment', 'Verification', 'Technical Issue', 'Other'] as const).map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setTicketCategory(cat)}
                                    className={`px-4 py-3 rounded-2xl border ${ticketCategory === cat ? 'bg-emerald-500 border-emerald-500' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <Text className={`text-[10px] font-black uppercase ${ticketCategory === cat ? 'text-white' : 'text-gray-400'}`}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Describe Issue</Text>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            value={ticketDescription}
                            onChangeText={setTicketDescription}
                            placeholder="Please describe your issue in detail..."
                            className="bg-gray-50 p-6 rounded-3xl border border-gray-100 text-gray-900 font-bold text-xs mb-8 min-h-[120px]"
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            onPress={handleSubmitTicket}
                            disabled={isSubmittingTicket || !ticketDescription}
                            className={`py-5 rounded-[28px] items-center shadow-xl ${isSubmittingTicket || !ticketDescription ? 'bg-gray-200' : 'bg-gray-900 shadow-gray-400'}`}
                        >
                            <Text className="text-white font-black uppercase tracking-widest">
                                {isSubmittingTicket ? "Submitting..." : "Send to Admin"}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

// Components
function StatBox({ label, value, icon, color }: any) {
    return (
        <View className="flex-1 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm items-center">
            <View style={{ backgroundColor: `${color}10` }} className="w-10 h-10 rounded-xl items-center justify-center mb-3">
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text className="text-xl font-black text-gray-900">{value}</Text>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</Text>
        </View>
    );
}

function SettingsOption({ icon, label, subLabel, onPress }: any) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} className="flex-row items-center p-5 border-b border-gray-50">
            <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
                <Ionicons name={icon} size={22} color="#10B981" />
            </View>
            <View className="ml-5 flex-1">
                <Text className="text-gray-900 font-black text-base uppercase leading-tight">{label}</Text>
                <Text className="text-gray-400 text-[10px] font-bold mt-1" numberOfLines={1}>{subLabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </TouchableOpacity>
    );
}

function InputField({ label, value, onChangeText, icon, placeholder, keyboardType }: any) {
    return (
        <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{label}</Text>
            <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4">
                <Ionicons name={icon} size={18} color="#9CA3AF" />
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    keyboardType={keyboardType}
                    className="flex-1 py-4 ml-3 font-bold text-gray-900"
                />
            </View>
        </View>
    );
}

function HelpItem({ q, a }: any) {
    return (
        <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-4">
            <Text className="font-black text-gray-900 text-sm mb-2 uppercase">{q}</Text>
            <Text className="text-gray-500 text-[11px] font-bold leading-5">{a}</Text>
        </View>
    );
}

function TabButton({ icon, label, active, onPress }: any) {
    return (
        <View className="flex-1 h-full items-center justify-center">
            <TouchableOpacity
                onPress={onPress}
                className={`flex-row items-center justify-center px-4 h-10 rounded-2xl ${active ? 'bg-emerald-500' : ''}`}
            >
                <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
                {active && <Text numberOfLines={1} className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
