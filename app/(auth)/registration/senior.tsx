import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterSenior() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { completeProfile, user } = useAuthStore();
    const [step, setStep] = useState(1);
    const [searchingLink, setSearchingLink] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        gender: '',
        address: '',
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        },
        healthConditions: '',
        mobilityStatus: 'Independent',
        hasSmartphone: true,
        profileImage: '',
    });

    const nextStep = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (step === 1) {
            setSearchingLink(true);
            setTimeout(() => {
                setSearchingLink(false);
                setStep(2);
            }, 2500);
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleFinish = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        completeProfile(formData);
        router.replace('/(senior)/home' as any);
    };

    if (searchingLink) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-10">
                <Animated.View entering={FadeIn} className="items-center">
                    <View className="w-32 h-32 bg-purple-50 rounded-full items-center justify-center mb-8">
                        <Ionicons name="search" size={60} color="#8B5CF6" />
                    </View>
                    <Text className="text-2xl font-black text-gray-900 text-center">Linking You...</Text>
                    <Text className="text-gray-500 text-center mt-4 leading-6 font-medium"> We are searching our secure network for family accounts linked to your phone number <Text className="text-purple-600 font-bold">{user?.phone}</Text>.</Text>
                    <View className="mt-12 w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <Animated.View className="bg-purple-600 h-full w-1/2" />
                    </View>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <LinearGradient
                    colors={['#f3e8ffff', '#FFFFFF']}
                    style={{ flex: 1, paddingHorizontal: 32, paddingTop: Math.max(insets.top, 20) }}
                >
                    <View className="flex-row items-center mb-8">
                        <TouchableOpacity onPress={step > 1 ? () => setStep(prev => prev - 1) : () => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900 ml-4">Senior Registration</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        {step === 1 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-black text-gray-900 mb-2">Confirm Identity</Text>
                                <Text className="text-gray-500 mb-10 font-medium leading-6">This helps us match your profile with your family&apos;s records.</Text>

                                <View className="items-center mb-8">
                                    <TouchableOpacity className="w-28 h-28 bg-purple-50 rounded-[40px] items-center justify-center border-2 border-dashed border-purple-200">
                                        <Ionicons name="person" size={48} color="#8B5CF6" />
                                    </TouchableOpacity>
                                    <Text className="text-[10px] font-bold text-purple-600 mt-2 uppercase tracking-widest">Verify Face Recognition</Text>
                                </View>

                                <InputField label="Full Name" placeholder="e.g. Ramesh Chandra" value={formData.name} onChangeText={(t) => setFormData({ ...formData, name: t })} />
                                <InputField label="Residential Address" placeholder="Your home address" value={formData.address} onChangeText={(t) => setFormData({ ...formData, address: t })} />

                                <TouchableOpacity onPress={nextStep} className="bg-purple-600 py-5 rounded-3xl items-center mt-6 shadow-lg shadow-purple-200">
                                    <Text className="text-white text-lg font-bold">Search Family Link</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {step === 2 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-black text-gray-900 mb-2">Health Profile</Text>
                                <Text className="text-gray-500 mb-10 font-medium leading-6">Share details to help Pal caretakers provide better support.</Text>

                                <InputField label="Known Conditions" placeholder="e.g. Diabetes, BP" value={formData.healthConditions} onChangeText={(t) => setFormData({ ...formData, healthConditions: t })} />

                                <View className="mb-8">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Mobility Support</Text>
                                    <View className="flex-row gap-2">
                                        {['Independent', 'Need Cane', 'Wheelchair'].map(item => (
                                            <TouchableOpacity
                                                key={item}
                                                onPress={() => setFormData({ ...formData, mobilityStatus: item })}
                                                className={`flex-1 py-4 rounded-2xl border ${formData.mobilityStatus === item ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-100'}`}
                                            >
                                                <Text className={`text-center text-[10px] font-bold ${formData.mobilityStatus === item ? 'text-white' : 'text-gray-500'}`}>{item}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <PreferenceToggle
                                    label="Smartphone User?"
                                    subtitle="If NO, alerts will be via automated voice calls/SMS."
                                    value={formData.hasSmartphone}
                                    onValueChange={(v) => setFormData({ ...formData, hasSmartphone: v })}
                                />

                                <TouchableOpacity onPress={handleFinish} className="bg-purple-600 py-5 rounded-3xl items-center mt-12 shadow-lg shadow-purple-200">
                                    <Text className="text-white text-lg font-bold">Complete Setup</Text>
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
        <View className="mb-8">
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
        <View className="flex-row items-center justify-between bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <View className="flex-1 mr-4">
                <Text className="font-bold text-gray-800 text-base">{label}</Text>
                <Text className="text-xs text-gray-400 leading-4 mt-1">{subtitle}</Text>
            </View>
            <Switch value={value} onValueChange={onValueChange} thumbColor={value ? '#8B5CF6' : '#D1D5DB'} trackColor={{ true: '#DDD6FE', false: '#F3F4F6' }} />
        </View>
    );
}
