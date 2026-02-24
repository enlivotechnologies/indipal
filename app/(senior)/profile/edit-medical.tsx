import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_PURPLE = '#6E5BFF';

export default function EditMedicalScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, updateUser } = useAuthStore();

    const [form, setForm] = useState({
        medicalConditions: user?.medicalConditions?.join(', ') || '',
        mobilityStatus: user?.mobilityStatus || 'Independent',
        allergies: user?.allergies || '',
        regularMedication: user?.regularMedication || false,
        regularMedicationDetails: (user as any)?.regularMedicationDetails || ''
    });

    const handleSave = () => {
        if (!form.medicalConditions.trim()) {
            Alert.alert("Required Field", "Please specify health conditions or write 'None'");
            return;
        }
        if (form.regularMedication && !form.regularMedicationDetails.trim()) {
            Alert.alert("Required Field", "Please provide details for your regular medication.");
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateUser({
            ...form,
            medicalConditions: form.medicalConditions.split(',').map(s => s.trim()).filter(s => s !== '')
        });
        router.back();
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
                className="px-6 flex-row items-center border-b border-gray-50 bg-white"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color={BRAND_PURPLE} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-2xl font-black text-gray-900">Medical Profile</Text>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Health registration details</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1 px-6 pt-8"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <Animated.View entering={FadeInUp.delay(100)} className="mb-8">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Health Conditions</Text>
                    <TextInput
                        value={form.medicalConditions}
                        onChangeText={(t) => setForm({ ...form, medicalConditions: t })}
                        placeholder="e.g. Diabetes, BP (comma separated)"
                        className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900"
                    />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Mobility Status</Text>
                    <View className="flex-row gap-2">
                        {['Independent', 'Assisted', 'Bedridden'].map(item => (
                            <TouchableOpacity
                                key={item}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setForm({ ...form, mobilityStatus: item });
                                }}
                                className={`flex-1 py-4 rounded-2xl border ${form.mobilityStatus === item ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}
                            >
                                <Text className={`text-center text-[10px] font-black ${form.mobilityStatus === item ? 'text-white' : 'text-gray-500'}`}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300)} className="mb-8">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Known Allergies</Text>
                    <TextInput
                        value={form.allergies}
                        onChangeText={(t) => setForm({ ...form, allergies: t })}
                        placeholder="e.g. Peanuts, Penicillin"
                        className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900"
                    />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400)} className="mb-10">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Regular Medication</Text>
                    <View className="flex-row gap-2">
                        {[true, false].map(val => (
                            <TouchableOpacity
                                key={val.toString()}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setForm({ ...form, regularMedication: val });
                                }}
                                className={`flex-1 py-4 rounded-2xl border ${form.regularMedication === val ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-100'}`}
                            >
                                <Text className={`text-center text-[10px] font-black ${form.regularMedication === val ? 'text-white' : 'text-gray-500'}`}>
                                    {val ? 'YES' : 'NO'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {form.regularMedication && (
                        <Animated.View entering={FadeInUp.duration(300)} className="mt-4">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Medication Details</Text>
                            <TextInput
                                value={form.regularMedicationDetails}
                                onChangeText={(t) => setForm({ ...form, regularMedicationDetails: t })}
                                placeholder="e.g., Aspirin 75mg daily"
                                className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900"
                            />
                        </Animated.View>
                    )}
                </Animated.View>

                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-indigo-600 py-6 rounded-[32px] items-center shadow-xl shadow-indigo-200"
                >
                    <Text className="text-white font-black uppercase tracking-widest text-base">Update Medical Profile</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
