import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterPal() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { completeProfile } = useAuthStore();
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        name: '',
        age: '',
        languages: [] as string[],
        govtId: '',
        experience: '',
        workingRadius: 5,
        availability: 'Full-time',
        profileImage: '',
    });

    const nextStep = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStep(prev => prev + 1);
    };

    const handleFinish = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        completeProfile(formData);
        router.replace('/(pal)/home' as any);
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
                        <TouchableOpacity onPress={step > 1 ? () => setStep(prev => prev - 1) : () => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-900 ml-4">Caretaker Registration</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        {step === 1 && (
                            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                                <Text className="text-3xl font-black text-gray-900 mb-2">Operational ID</Text>
                                <Text className="text-gray-500 mb-8 font-medium">Create your professional care profile.</Text>

                                <View className="items-center mb-8">
                                    <TouchableOpacity className="w-28 h-28 bg-emerald-50 rounded-[40px] items-center justify-center border-2 border-dashed border-emerald-200">
                                        <Ionicons name="camera" size={48} color="#10B981" />
                                    </TouchableOpacity>
                                    <Text className="text-[10px] font-bold text-emerald-600 mt-3 uppercase tracking-widest">Profile Photo</Text>
                                </View>

                                <InputField label="Full Name" placeholder="Caretaker Name" value={formData.name} onChangeText={(t) => setFormData({ ...formData, name: t })} />
                                <InputField label="Working Experience" placeholder="e.g. 5 Years in Geriatrics" value={formData.experience} onChangeText={(t) => setFormData({ ...formData, experience: t })} />

                                <View className="mb-8">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Trust Shield Verification</Text>
                                    <TouchableOpacity className="flex-row items-center bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm">
                                        <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center">
                                            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                                        </View>
                                        <View className="ml-4 flex-1">
                                            <Text className="font-bold text-gray-800">Govt ID / Aadhaar</Text>
                                            <Text className="text-[10px] text-gray-400">Sync with Police Verification</Text>
                                        </View>
                                        <Ionicons name="add" size={20} color="#D1D5DB" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={nextStep} className="bg-emerald-600 py-5 rounded-3xl items-center mt-4 shadow-lg shadow-emerald-100">
                                    <Text className="text-white text-lg font-bold">Service Match</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {step === 2 && (
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
                                        <View className="h-full bg-emerald-500" style={{ width: '25%' }} />
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

                                <TouchableOpacity onPress={handleFinish} className="bg-emerald-600 py-5 rounded-3xl items-center mt-6 shadow-lg shadow-emerald-100">
                                    <Text className="text-white text-lg font-bold">Finish Registration</Text>
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
