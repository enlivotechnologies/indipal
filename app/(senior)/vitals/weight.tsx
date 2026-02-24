import { useHealthStore } from '@/store/healthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WeightTrackerScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { updateWeight, records } = useHealthStore();
    const [weight, setWeight] = useState(records.weight?.value.toString() || '');

    const handleSave = () => {
        const val = parseFloat(weight);
        if (isNaN(val)) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateWeight({
            value: val,
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
                <Text className="text-xl font-black text-gray-900">Weight Tracker</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100)} className="mt-10 bg-white p-8 rounded-[44px] shadow-sm border border-gray-50">
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-emerald-50 rounded-[28px] items-center justify-center mb-4">
                            <Ionicons name="barbell" size={40} color="#10B981" />
                        </View>
                        <Text className="text-gray-400 text-xs font-black uppercase tracking-widest">Current Weight</Text>
                        <Text className="text-4xl font-black text-gray-900 mt-2">
                            {records.weight ? records.weight.value : '--'}
                            <Text className="text-base text-gray-400 font-bold ml-2">kg</Text>
                        </Text>
                    </View>

                    <View className="mb-4">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Enter New Weight</Text>
                        <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex-row items-center">
                            <TextInput
                                keyboardType="numeric"
                                value={weight}
                                onChangeText={setWeight}
                                placeholder="e.g. 70.5"
                                className="flex-1 text-2xl font-black text-gray-900"
                            />
                        </View>
                    </View>
                </Animated.View>

                <TouchableOpacity
                    onPress={handleSave}
                    className="mt-10 bg-emerald-600 py-6 rounded-[32px] items-center shadow-xl shadow-emerald-100 mb-10"
                >
                    <Text className="text-white font-black uppercase tracking-[2px]">Save Entry</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
