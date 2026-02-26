import { pickImageFromGallery, uploadFile } from '@/lib/uploadService';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterPal() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { completeProfile } = useAuthStore();
    const [step, setStep] = useState(1);
    const [isUploading, setIsUploading] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        languages: [] as string[],
        govtId: '',
        experience: '',
        workingRadius: 5,
        availability: 'Full-time',
        profileImage: '',
        verificationDocuments: [] as { documentType: string; fileUrl: string }[],
    });

    const nextStep = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStep(prev => prev + 1);
    };

    const handleFinish = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Map local docs to the store's structure
        const mappedDocs = formData.verificationDocuments.map(d => ({
            id: Math.random().toString(36).substring(2, 11).toUpperCase(),
            documentType: d.documentType as any,
            verificationStatus: 'Pending' as const,
            fileUrl: d.fileUrl,
            uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        }));

        completeProfile({
            ...formData,
            verificationDocuments: mappedDocs
        });
        router.replace('/(pal)/home' as any);
    };

    const handleUpload = async (type: 'id_proof' | 'address_proof' | 'bank_details' | 'police_verification' | 'profile_photo') => {
        const uri = await pickImageFromGallery();
        if (!uri) return;

        setIsUploading(type);
        const url = await uploadFile(uri.uri);
        setIsUploading(null);

        if (type === 'profile_photo') {
            setFormData({ ...formData, profileImage: url });
        } else {
            const newDocs = formData.verificationDocuments.filter(d => d.documentType !== type);
            newDocs.push({ documentType: type, fileUrl: url });
            setFormData({ ...formData, verificationDocuments: newDocs });
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const getDocStatus = (type: string) => {
        return formData.verificationDocuments.find(d => d.documentType === type) ? 'Uploaded' : 'Action Required';
    };

    const toggleLanguage = (lang: string) => {
        const newLangs = formData.languages.includes(lang)
            ? formData.languages.filter(l => l !== lang)
            : [...formData.languages, lang];
        setFormData({ ...formData, languages: newLangs });
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <LinearGradient
                    colors={['#ecfdf5ff', '#FFFFFF']}
                    style={{ flex: 1, paddingHorizontal: 32, paddingTop: Math.max(insets.top, 20) }}
                >
                    <View className="flex-row items-center mb-8">
                        <TouchableOpacity onPress={step > 1 ? () => setStep(prev => prev - 1) : () => router.canGoBack() ? router.back() : router.replace('/(auth)/onboarding' as any)}>
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <View className="ml-4">
                            <Text className="text-xl font-bold text-gray-900">Pal Registration</Text>
                            <Text className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Step {step} of 3</Text>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        {step === 1 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-black text-gray-900 mb-2">Basic Info</Text>
                                <Text className="text-gray-500 mb-8 font-medium">Let&apos;s get the essentials out of the way.</Text>

                                <View className="items-center mb-10">
                                    <TouchableOpacity
                                        onPress={() => handleUpload('profile_photo')}
                                        className="w-32 h-32 bg-emerald-50 rounded-[48px] items-center justify-center border-2 border-dashed border-emerald-200 overflow-hidden"
                                    >
                                        {formData.profileImage ? (
                                            <Image source={{ uri: formData.profileImage }} className="w-full h-full" />
                                        ) : isUploading === 'profile_photo' ? (
                                            <ActivityIndicator color="#10B981" />
                                        ) : (
                                            <Ionicons name="camera" size={48} color="#10B981" />
                                        )}
                                    </TouchableOpacity>
                                    <Text className="text-[10px] font-black text-emerald-600 mt-4 uppercase tracking-widest">Profile Photo</Text>
                                </View>

                                <InputField label="Full Name" placeholder="Caretaker Name" value={formData.name} onChangeText={(t) => setFormData({ ...formData, name: t })} />
                                <InputField label="Working Experience" placeholder="e.g. 5 Years in Geriatrics" value={formData.experience} onChangeText={(t) => setFormData({ ...formData, experience: t })} />

                                <TouchableOpacity onPress={nextStep} className="bg-emerald-600 py-5 rounded-3xl items-center mt-10 shadow-lg shadow-emerald-100">
                                    <Text className="text-white text-lg font-black uppercase tracking-widest">Next Phase</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {step === 2 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-black text-gray-900 mb-2">Verification</Text>
                                <Text className="text-gray-500 mb-8 font-medium">Upload documents for Trust Shield verification.</Text>

                                <View className="mb-10">
                                    <DocUploadItem
                                        label="Government ID"
                                        subText="Aadhaar / PAN Card / Passport"
                                        onPress={() => handleUpload('id_proof')}
                                        status={getDocStatus('id_proof')}
                                        loading={isUploading === 'id_proof'}
                                        icon="card"
                                    />
                                    <DocUploadItem
                                        label="Address Proof"
                                        subText="Utility Bill / Rent Agreement"
                                        onPress={() => handleUpload('address_proof')}
                                        status={getDocStatus('address_proof')}
                                        loading={isUploading === 'address_proof'}
                                        icon="home"
                                    />
                                    <DocUploadItem
                                        label="Bank Details"
                                        subText="Mandatory for Wallet Withdrawals"
                                        onPress={() => handleUpload('bank_details')}
                                        status={getDocStatus('bank_details')}
                                        loading={isUploading === 'bank_details'}
                                        icon="cash"
                                    />
                                </View>

                                <TouchableOpacity onPress={nextStep} className="bg-emerald-600 py-5 rounded-3xl items-center shadow-lg shadow-emerald-100">
                                    <Text className="text-white text-lg font-bold uppercase tracking-widest">Trust Verification</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {step === 3 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-black text-gray-900 mb-2">Service Match</Text>
                                <Text className="text-gray-500 mb-10 font-medium">Define your boundaries and expertise.</Text>

                                <View className="mb-8">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Languages Known</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'].map(lang => (
                                            <TouchableOpacity
                                                key={lang}
                                                onPress={() => toggleLanguage(lang)}
                                                className={`px-6 py-3 rounded-full border ${formData.languages.includes(lang) ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-100'}`}
                                            >
                                                <Text className={`text-[10px] font-bold ${formData.languages.includes(lang) ? 'text-white' : 'text-gray-500'}`}>{lang}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View className="mb-8 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Working Radius</Text>
                                    <Text className="text-2xl font-black text-emerald-600 mb-2">{formData.workingRadius} KM</Text>
                                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <View className="h-full bg-emerald-500" style={{ width: `${(formData.workingRadius / 20) * 100}%` }} />
                                    </View>
                                </View>

                                <View className="mb-8">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Availability</Text>
                                    <View className="flex-row gap-3">
                                        {['Full-time', 'Part-time'].map(type => (
                                            <TouchableOpacity
                                                key={type}
                                                onPress={() => setFormData({ ...formData, availability: type })}
                                                className={`flex-1 py-4 rounded-2xl border ${formData.availability === type ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-100'}`}
                                            >
                                                <Text className={`text-center text-[10px] font-bold ${formData.availability === type ? 'text-white' : 'text-gray-500'}`}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <TouchableOpacity onPress={handleFinish} className="bg-gray-900 py-5 rounded-3xl items-center mt-6 shadow-xl">
                                    <Text className="text-white text-lg font-black uppercase tracking-widest">Enroll as Pal</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        <View style={{ height: insets.bottom + 40 }} />
                    </ScrollView>
                </LinearGradient>
            </KeyboardAvoidingView>
        </View>
    );
}

function InputField({ label, placeholder, value, onChangeText }: { label: string; placeholder: string; value?: string; onChangeText?: (text: string) => void }) {
    return (
        <View className="mb-8">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#A1A1AA"
                className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-base font-semibold text-gray-800"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}

function DocUploadItem({ label, subText, onPress, status, loading, icon }: { label: string; subText: string; onPress: () => void; status: string; loading: boolean; icon: any }) {
    const isUploaded = status === 'Uploaded';
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center p-5 rounded-[28px] border mb-4 ${isUploaded ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'}`}
        >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isUploaded ? 'bg-emerald-500' : 'bg-gray-100'}`}>
                <Ionicons name={icon} size={22} color={isUploaded ? 'white' : '#9CA3AF'} />
            </View>
            <View className="ml-4 flex-1">
                <Text className={`font-black text-sm ${isUploaded ? 'text-emerald-900' : 'text-gray-800'}`}>{label}</Text>
                <Text className="text-[10px] text-gray-400 font-medium">{subText}</Text>
            </View>
            {loading ? (
                <ActivityIndicator color="#10B981" />
            ) : (
                <View className={`px-3 py-1.5 rounded-full ${isUploaded ? 'bg-emerald-100' : 'bg-gray-50'}`}>
                    <Text className={`text-[8px] font-black uppercase tracking-widest ${isUploaded ? 'text-emerald-600' : 'text-gray-400'}`}>
                        {status}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
