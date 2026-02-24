import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_PURPLE = '#6E5BFF';

export default function EditEmergencyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, updateUser } = useAuthStore();

    const [form, setForm] = useState({
        name: user?.emergencyContact?.name || '',
        relationship: user?.emergencyContact?.relationship || '',
        phone: user?.emergencyContact?.phone || ''
    });

    const handleSave = () => {
        if (!form.name.trim()) {
            Alert.alert('Required field', 'Please enter the contact name');
            return;
        }
        if (!form.relationship.trim()) {
            Alert.alert('Required field', 'Please specify the relationship');
            return;
        }
        if (!form.phone.trim() || form.phone.length < 10) {
            Alert.alert('Invalid phone', 'Please enter a valid phone number');
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Update the user's emergencyContact object
        updateUser({
            emergencyContact: {
                name: form.name.trim(),
                relationship: form.relationship.trim(),
                phone: form.phone.trim()
            }
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
                    <Text className="text-2xl font-black text-gray-900">Emergency Contact</Text>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update SOS Details</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1 px-6 pt-8"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <Animated.View entering={FadeInUp.delay(100)} className="mb-8">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Contact Name</Text>
                        <TextInput
                            value={form.name}
                            onChangeText={(t) => setForm({ ...form, name: t })}
                            placeholder="e.g. Ramesh Chandra"
                            className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Relationship</Text>
                        <TextInput
                            value={form.relationship}
                            onChangeText={(t) => setForm({ ...form, relationship: t })}
                            placeholder="e.g. Son, Daughter, Friend"
                            className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900"
                        />
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(300)} className="mb-10">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Phone Number</Text>
                        <TextInput
                            value={form.phone}
                            onChangeText={(t) => setForm({ ...form, phone: t })}
                            placeholder="+91 00000 00000"
                            keyboardType="phone-pad"
                            className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900"
                        />
                    </Animated.View>

                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-indigo-600 py-6 rounded-[32px] items-center shadow-xl shadow-indigo-200"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-base">Save Contact</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
