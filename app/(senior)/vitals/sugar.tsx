import { useHealthStore } from '@/store/healthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BloodSugarScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { updateBloodSugar, records } = useHealthStore();
    const [level, setLevel] = useState(records.bloodSugar?.level.toString() || '');
    const [type, setType] = useState<'Fasting' | 'Post-meal'>(records.bloodSugar?.type || 'Fasting');

    const handleSave = () => {
        const val = parseInt(level);
        if (isNaN(val)) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateBloodSugar({
            level: val,
            type: type,
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
                <Text className="text-xl font-black text-gray-900">Blood Sugar</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100)} className="mt-10 bg-white p-8 rounded-[44px] shadow-sm border border-gray-50">
                    <View className="items-center mb-8">
                        <View className="w-20 h-20 bg-blue-50 rounded-[28px] items-center justify-center mb-4">
                            <Ionicons name="water" size={40} color="#3B82F6" />
                        </View>
                        <Text className="text-gray-400 text-xs font-black uppercase tracking-widest">Last Reading</Text>
                        <Text className="text-4xl font-black text-gray-900 mt-2">
                            {records.bloodSugar ? records.bloodSugar.level : '--'}
                            <Text className="text-base text-gray-400 font-bold ml-2">mg/dL</Text>
                        </Text>
                    </View>

                    <View className="mb-8">
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Glucose Level</Text>
                        <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex-row items-center">
                            <TextInput
                                keyboardType="numeric"
                                value={level}
                                onChangeText={setLevel}
                                placeholder="e.g. 95"
                                className="flex-1 text-2xl font-black text-gray-900"
                            />
                        </View>
                    </View>

                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Measurement Type</Text>
                    <View className="flex-row gap-x-4">
                        {(['Fasting', 'Post-meal'] as const).map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setType(t);
                                }}
                                className={`flex-1 py-4 rounded-2xl border-2 items-center ${type === t ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-50'
                                    }`}
                            >
                                <Text className={`font-black uppercase tracking-widest text-[10px] ${type === t ? 'text-blue-600' : 'text-gray-400'
                                    }`}>{t}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                <TouchableOpacity
                    onPress={handleSave}
                    className="mt-10 bg-blue-600 py-6 rounded-[32px] items-center shadow-xl shadow-blue-100 mb-10"
                >
                    <Text className="text-white font-black uppercase tracking-[2px]">Save Reading</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
