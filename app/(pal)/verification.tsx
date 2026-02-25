import { pickImageFromGallery, uploadFile } from "@/lib/uploadService";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function VerificationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, uploadVerificationDoc } = useAuthStore();

    const [selectedDoc, setSelectedDoc] = useState<any>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [isReuploading, setIsReuploading] = useState(false);

    const documents = user?.verificationDocuments || [];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Verified': return { bg: 'bg-emerald-100', bgRaw: '#D1FAE5', text: 'text-emerald-700', color: '#047857', icon: 'checkmark-circle' };
            case 'Pending': return { bg: 'bg-orange-100', bgRaw: '#FFEDD5', text: 'text-orange-700', color: '#C2410C', icon: 'time' };
            case 'Rejected': return { bg: 'bg-red-100', bgRaw: '#FEE2E2', text: 'text-red-700', color: '#B91C1C', icon: 'close-circle' };
            default: return { bg: 'bg-gray-100', bgRaw: '#F3F4F6', text: 'text-gray-700', color: '#374151', icon: 'help-circle' };
        }
    };

    const handleReupload = async (type: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const asset = await pickImageFromGallery();
        if (!asset) return;

        setIsReuploading(true);
        try {
            const url = await uploadFile(asset.uri);
            const result = await uploadVerificationDoc({
                documentType: type,
                fileUrl: url
            });

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setShowPreview(false);
                Alert.alert("Success", "Document re-uploaded and pending verification.");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to upload document. Please try again.");
        } finally {
            setIsReuploading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center border-b border-gray-50">
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(pal)/home')}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-black text-gray-900">Governance</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Trust Shield Verification</Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 40 }}>
                {/* Status Dashboard */}
                <View className="bg-gray-900 p-8 rounded-[40px] shadow-2xl mb-10 overflow-hidden relative">
                    <View className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10" />
                    <View className="flex-row items-center justify-between mb-6">
                        <View>
                            <Text className="text-white/50 text-[10px] uppercase font-black tracking-widest">Profile Status</Text>
                            <Text className="text-white text-2xl font-black mt-1">
                                {user?.trustShieldVerified ? 'Verified Pro' : 'Verification Pending'}
                            </Text>
                        </View>
                        <View className={`w-14 h-14 rounded-2xl items-center justify-center border ${user?.trustShieldVerified ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-orange-500/20 border-orange-500/30'}`}>
                            <Ionicons name="shield-checkmark" size={28} color={user?.trustShieldVerified ? '#10B981' : '#F59E0B'} />
                        </View>
                    </View>
                    <Text className="text-white/60 text-xs leading-5">Complete verification to build trust with families and unlock high-priority premium gigs.</Text>
                </View>

                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Documents Tracking</Text>

                {documents.length > 0 ? (
                    documents.map((doc, idx) => {
                        const style = getStatusStyle(doc.verificationStatus);
                        return (
                            <Animated.View key={doc.id} entering={FadeInUp.delay(idx * 100)}>
                                <TouchableOpacity
                                    className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center mb-4"
                                    activeOpacity={0.7}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSelectedDoc(doc);
                                        setShowPreview(true);
                                    }}
                                >
                                    <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
                                        <Ionicons name="document-text" size={24} color="#6B7280" />
                                    </View>
                                    <View className="flex-1 ml-4">
                                        <Text className="text-gray-900 font-black text-[13px] uppercase tracking-tight">{doc.documentType.split('_').join(' ')}</Text>
                                        <Text className="text-gray-400 text-[9px] font-bold mt-1 uppercase tracking-widest">Uploaded {doc.uploadDate}</Text>
                                    </View>
                                    <View className={`${style.bg} px-3 py-1.5 rounded-full flex-row items-center border border-white/50`}>
                                        <Ionicons name={style.icon as any} size={10} color={style.color} className="mr-2" />
                                        <Text className={`${style.text} text-[9px] font-black uppercase tracking-tight`}>{doc.verificationStatus}</Text>
                                    </View>
                                </TouchableOpacity>

                                {doc.verificationStatus === 'Rejected' && doc.adminRemarks && (
                                    <View className="bg-red-50 p-5 rounded-[24px] mb-6 mx-2 border border-red-100">
                                        <Text className="text-red-600 text-[10px] font-black uppercase mb-1">Rejection Reason</Text>
                                        <Text className="text-red-700/80 text-[11px] font-bold leading-5 italic">"{doc.adminRemarks}"</Text>

                                        <TouchableOpacity
                                            onPress={() => handleReupload(doc.documentType)}
                                            className="mt-4 bg-red-100 py-3 rounded-xl items-center border border-red-200"
                                        >
                                            <Text className="text-red-600 text-[10px] font-black uppercase">Re-upload Document</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </Animated.View>
                        );
                    })
                ) : (
                    <View className="bg-gray-50 p-12 rounded-[40px] border border-dashed border-gray-200 items-center justify-center">
                        <Ionicons name="cloud-upload-outline" size={40} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold text-sm mt-4">No documents uploaded yet.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Document Preview Modal */}
            <Modal visible={showPreview} transparent animationType="slide">
                <View className="flex-1 bg-black/90 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 h-[85%]">
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-2xl font-black text-gray-900 uppercase">Preview</Text>
                                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Trust Shield Asset</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowPreview(false)} className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center">
                                <Ionicons name="close" size={28} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <View className="flex-1 bg-gray-50 rounded-[40px] overflow-hidden border border-gray-100 items-center justify-center">
                            {selectedDoc?.fileUrl ? (
                                <Image source={{ uri: selectedDoc.fileUrl }} className="w-full h-full" resizeMode="contain" />
                            ) : (
                                <View className="items-center">
                                    <Ionicons name="document" size={80} color="#D1D5DB" />
                                    <Text className="text-gray-400 font-bold mt-4">No content available</Text>
                                </View>
                            )}

                            <View className="absolute top-6 right-6">
                                <View className={`${getStatusStyle(selectedDoc?.verificationStatus).bg} px-6 p-3 rounded-full border-2 border-white shadow-sm`}>
                                    <Text className={`${getStatusStyle(selectedDoc?.verificationStatus).text} text-[10px] font-black uppercase tracking-widest`}>
                                        {selectedDoc?.verificationStatus}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View className="mt-8 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Admin Remarks</Text>
                            <Text className="text-gray-900 font-bold text-xs leading-6 italic">
                                {selectedDoc?.adminRemarks || "No remarks from administrator yet. Please allow 24-48 hours for verification."}
                            </Text>
                        </View>

                        {selectedDoc?.verificationStatus === 'Rejected' && (
                            <TouchableOpacity
                                onPress={() => handleReupload(selectedDoc.documentType)}
                                disabled={isReuploading}
                                className="mt-8 bg-emerald-500 py-5 rounded-[24px] items-center flex-row justify-center shadow-xl shadow-emerald-200"
                            >
                                {isReuploading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload" size={20} color="white" />
                                        <Text className="text-white font-black uppercase tracking-widest ml-3">Upload Correct Version</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => setShowPreview(false)}
                            className="mt-4 bg-gray-900 py-5 rounded-[24px] items-center"
                        >
                            <Text className="text-white font-black uppercase tracking-widest">Done Viewing</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
    }
});
