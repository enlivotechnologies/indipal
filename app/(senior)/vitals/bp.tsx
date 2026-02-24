import { useHealthStore } from '@/store/healthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BloodPressureScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { updateBloodPressure, records } = useHealthStore();
    const [systolic, setSystolic] = useState(records.bloodPressure?.systolic.toString() || '120');
    const [diastolic, setDiastolic] = useState(records.bloodPressure?.diastolic.toString() || '80');
    const [note, setNote] = useState(records.bloodPressure?.note || '');

    const handleSave = () => {
        const sys = parseInt(systolic);
        const dia = parseInt(diastolic);
        if (isNaN(sys) || isNaN(dia)) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateBloodPressure({
            systolic: sys,
            diastolic: dia,
            note: note,
            timestamp: new Date().toISOString()
        });
        router.back();
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <View
                className="px-6 pb-6 pt-4 bg-white border-b border-gray-100 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-gray-900">Blood Pressure</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100)} className="mt-10 bg-white p-8 rounded-[44px] shadow-sm border border-gray-50">
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-red-50 rounded-[28px] items-center justify-center mb-4">
                            <Ionicons name="heart" size={40} color="#EF4444" />
                        </View>
                        <Text className="text-gray-400 text-xs font-black uppercase tracking-widest">Last Reading</Text>
                        <Text className="text-4xl font-black text-gray-900 mt-2">
                            {records.bloodPressure ? `${records.bloodPressure.systolic}/${records.bloodPressure.diastolic}` : '--/--'}
                            <Text className="text-base text-gray-400 font-bold ml-2">mmHg</Text>
                        </Text>
                    </View>

                    <View className="flex-row gap-x-4 mb-8">
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Systolic</Text>
                            <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex-row items-center">
                                <TextInput
                                    keyboardType="numeric"
                                    value={systolic}
                                    onChangeText={setSystolic}
                                    placeholder="120"
                                    className="flex-1 text-2xl font-black text-gray-900"
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Diastolic</Text>
                            <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex-row items-center">
                                <TextInput
                                    keyboardType="numeric"
                                    value={diastolic}
                                    onChangeText={setDiastolic}
                                    placeholder="80"
                                    className="flex-1 text-2xl font-black text-gray-900"
                                />
                            </View>
                        </View>
                    </View>

                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Add Notes (Optional)</Text>
                    <TextInput
                        placeholder="e.g. Taken after 10 min rest"
                        value={note}
                        onChangeText={setNote}
                        className="bg-gray-50 rounded-3xl p-5 border border-gray-100 text-gray-900 font-bold"
                    />
                </Animated.View>

                <TouchableOpacity
                    onPress={handleSave}
                    className="mt-10 bg-red-500 py-6 rounded-[32px] items-center shadow-xl shadow-red-100 mb-10"
                >
                    <Text className="text-white font-black uppercase tracking-[2px]">Save Reading</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
