import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterFamily() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { completeProfile } = useAuthStore();
    const [step, setStep] = useState(1);
    const [parentCount, setParentCount] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        relationshipToSenior: '',
        email: '',
        hasSmartphone: true,
        parentsDetails: [
            { name: '', age: '', gender: '', phone: '', address: '', hasSmartphone: true }
        ],
        upiId: '',
        upiVerified: false,
        profileImage: ''
    });

    const nextStep = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStep(prev => prev - 1);
    };

    const handleFinish = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        completeProfile(formData);
        router.replace('/(family)/home' as any);
    };

    const updateParentDetail = (index: number, key: string, value: any) => {
        const newParents = [...formData.parentsDetails];
        newParents[index] = { ...newParents[index], [key]: value };
        setFormData({ ...formData, parentsDetails: newParents });
    };

    const renderStepIndicator = () => (
        <View className="flex-row items-center justify-between mb-8 px-2">
            {[1, 2, 3, 4].map((i) => (
                <View key={i} className="flex-1 flex-row items-center">
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${step >= i ? 'bg-orange-500' : 'bg-gray-300'}`}>
                        {step > i ? <Ionicons name="checkmark" size={16} color="white" /> : <Text className={`font-bold ${step >= i ? 'text-white' : 'text-gray-600'}`}>{i}</Text>}
                    </View>
                    {i < 4 && <View className={`flex-1 h-[2px] mx-2 ${step > i ? 'bg-orange-500' : 'bg-gray-300'}`} />}
                </View>
            ))}
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <LinearGradient
                    colors={['#fce4dbff', '#FFFFFF']}
                    style={{ flex: 1, paddingHorizontal: 32, paddingTop: Math.max(insets.top, 20) }}
                >
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity onPress={() => {
                            if (step > 1) { prevStep(); }
                            else { router.canGoBack() ? router.back() : router.replace('/(auth)/verification/otp-verify' as any); }
                        }}>
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900 ml-4">Family Registration</Text>
                    </View>

                    {renderStepIndicator()}

                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        {step === 1 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-2xl font-bold text-gray-900 mb-2">Member Basic Info</Text>
                                <Text className="text-gray-500 mb-8">Tell us about yourself.</Text>

                                <View className="items-center mb-8">
                                    <TouchableOpacity className="w-24 h-24 bg-orange-50 rounded-full items-center justify-center border-2 border-dashed border-orange-200">
                                        <Ionicons name="camera" size={32} color="#F97316" />
                                    </TouchableOpacity>
                                    <Text className="text-[10px] font-bold text-orange-600 mt-2 uppercase">Upload Photo</Text>
                                </View>

                                <InputField label="Your Name" placeholder="e.g. Vikram Malhotra" value={formData.name} onChangeText={(t) => setFormData({ ...formData, name: t })} />
                                <InputField label="Relationship to Senior" placeholder="e.g. Son, Daughter" value={formData.relationshipToSenior} onChangeText={(t) => setFormData({ ...formData, relationshipToSenior: t })} />
                                <InputField label="Email Address" placeholder="vikram@example.com" keyboardType="email-address" value={formData.email} onChangeText={(t) => setFormData({ ...formData, email: t })} />

                                <View className="mb-8">
                                    <PreferenceToggle
                                        label="Using Smartphone?"
                                        subtitle="Will you use the App for updates?"
                                        value={formData.hasSmartphone}
                                        onValueChange={(v) => setFormData({ ...formData, hasSmartphone: v })}
                                    />
                                </View>

                                <TouchableOpacity onPress={nextStep} className="bg-orange-500 py-5 rounded-3xl items-center mt-4 shadow-lg shadow-orange-100">
                                    <Text className="text-white text-lg font-bold">Next Step</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {step === 2 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-2xl font-bold text-gray-900 mb-2">Parent Details</Text>
                                <Text className="text-gray-500 mb-6">The "Connection Keys" to link accounts.</Text>

                                <View className="mb-8">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">How many parents?</Text>
                                    <View className="flex-row gap-3">
                                        {[1, 2].map(count => (
                                            <TouchableOpacity
                                                key={count}
                                                onPress={() => {
                                                    setParentCount(count);
                                                    const newParents = [...formData.parentsDetails];
                                                    if (count === 2 && newParents.length === 1) {
                                                        newParents.push({ name: '', age: '', gender: '', phone: '', address: '', hasSmartphone: true });
                                                    } else if (count === 1 && newParents.length === 2) {
                                                        newParents.pop();
                                                    }
                                                    setFormData({ ...formData, parentsDetails: newParents });
                                                }}
                                                className={`px-8 py-4 rounded-2xl border ${parentCount === count ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-100'}`}
                                            >
                                                <Text className={`font-bold ${parentCount === count ? 'text-white' : 'text-gray-500'}`}>{count}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {formData.parentsDetails.map((parent, idx) => (
                                    <View key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-6">
                                        <Text className="text-lg font-bold text-gray-800 mb-6">Parent {idx + 1}</Text>
                                        <InputField label="Full Name" placeholder="Elder's name" value={parent.name} onChangeText={(t) => updateParentDetail(idx, 'name', t)} />

                                        <InputField label="Parent's Mobile (Connection Key)" placeholder="+91 XXXXX XXXXX" keyboardType="numeric" value={parent.phone} onChangeText={(t) => updateParentDetail(idx, 'phone', t)} />
                                        <Text className="text-[10px] text-gray-400 -mt-4 mb-4 italic px-1">* Must match what they use to log in.</Text>

                                        <InputField label="Residential Address" placeholder="Used for Pal briefing" value={parent.address} onChangeText={(t) => updateParentDetail(idx, 'address', t)} />

                                        <PreferenceToggle
                                            label="Has Smartphone?"
                                            subtitle="If NO, we enable SMS/Voice mode."
                                            value={parent.hasSmartphone}
                                            onValueChange={(v) => updateParentDetail(idx, 'hasSmartphone', v)}
                                        />
                                    </View>
                                ))}

                                <TouchableOpacity onPress={nextStep} className="bg-orange-500 py-5 rounded-3xl items-center mt-4 shadow-lg shadow-orange-100">
                                    <Text className="text-white text-lg font-bold">Next Step</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {step === 3 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-2xl font-bold text-gray-900 mb-2">Wallet Setup</Text>
                                <Text className="text-gray-500 mb-8">Establish payer credentials for Pal care.</Text>

                                <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-6">
                                    <InputField label="UPI ID for Payments" placeholder="e.g. name@upi" value={formData.upiId} onChangeText={(t) => setFormData({ ...formData, upiId: t })} />
                                    <TouchableOpacity
                                        className="bg-gray-50 py-3 rounded-xl items-center border border-gray-100"
                                        onPress={() => setFormData({ ...formData, upiVerified: true })}
                                    >
                                        <Text className="text-orange-600 font-bold">{formData.upiVerified ? '✓ Verified' : 'Verify UPI ID'}</Text>
                                    </TouchableOpacity>
                                </View>

                                <View className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons name="card-outline" size={20} color="#F97316" />
                                        <Text className="text-gray-800 font-bold ml-2">Secure Payments</Text>
                                    </View>
                                    <Text className="text-xs text-gray-500 italic">Payments are held in escrow and released only after the Pal finishes their gig.</Text>
                                </View>

                                <TouchableOpacity onPress={nextStep} className="bg-orange-500 py-5 rounded-3xl items-center mt-8 shadow-lg shadow-orange-100">
                                    <Text className="text-white text-lg font-bold">Review & Finish</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {step === 4 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-2xl font-bold text-gray-900 mb-2">Registration Complete</Text>
                                <Text className="text-gray-500 mb-8">Establishing the Enlivo Handshake...</Text>

                                <View className="items-center py-10">
                                    <View className="w-24 h-24 bg-orange-50 rounded-full items-center justify-center">
                                        <Ionicons name="hand-left-outline" size={48} color="#F97316" />
                                    </View>
                                    <Text className="text-lg font-bold text-gray-800 mt-6">Handshake Initialized</Text>
                                    <Text className="text-center text-gray-400 mt-2 px-6">Once your parent logs in with {formData.parentsDetails[0].phone}, your profiles will be automatically linked.</Text>
                                </View>

                                <TouchableOpacity onPress={handleFinish} className="bg-orange-500 py-5 rounded-3xl items-center mt-4 shadow-lg shadow-orange-100">
                                    <Text className="text-white text-lg font-bold">Finish Setup</Text>
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

function InputField({ label, placeholder, value, onChangeText, keyboardType }: {
    label: string;
    placeholder: string;
    value?: string;
    onChangeText?: (text: string) => void;
    keyboardType?: any;
}) {
    return (
        <View className="mb-6">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#A1A1AA"
                keyboardType={keyboardType}
                className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-base font-semibold text-gray-800"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
}

function PreferenceToggle({ label, subtitle, value, onValueChange }: {
    label: string;
    subtitle: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}) {
    return (
        <View className="flex-row items-center justify-between bg-gray-50 p-5 rounded-3xl border border-gray-100">
            <View className="flex-1 mr-4">
                <Text className="font-bold text-gray-800 text-base">{label}</Text>
                <Text className="text-xs text-gray-400 leading-4 mt-1">{subtitle}</Text>
            </View>
            <Switch value={value} onValueChange={onValueChange} thumbColor={value ? '#F97316' : '#D1D5DB'} trackColor={{ true: '#FFEDD5', false: '#F3F4F6' }} />
        </View>
    );
}
