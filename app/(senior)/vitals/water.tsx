import { useHealthStore } from '@/store/healthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WaterTrackerScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { updateWater, records } = useHealthStore();
    const water = records.water || { glasses: 0, goal: 8, timestamp: new Date().toISOString() };

    const handleAdd = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        updateWater({
            ...water,
            glasses: water.glasses + 1,
            timestamp: new Date().toISOString()
        });
    };

    const handleReset = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        updateWater({
            ...water,
            glasses: 0,
            timestamp: new Date().toISOString()
        });
    };

    const progress = Math.min((water.glasses / water.goal) * 100, 100);

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <View
                className="px-6 pb-6 pt-4 bg-white border-b border-gray-100 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-gray-900">Water Tracker</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100)} className="mt-10 bg-white p-10 rounded-[50px] shadow-sm border border-gray-50 items-center">
                    <View className="relative w-48 h-48 items-center justify-center">
                        {/* Mock Circular Progress */}
                        <View className="absolute inset-0 rounded-full border-[12px] border-blue-50" />
                        <View
                            className="absolute inset-0 rounded-full border-[12px] border-blue-500"
                            style={{
                                borderLeftColor: 'transparent',
                                borderBottomColor: 'transparent',
                                transform: [{ rotate: `${(progress / 100) * 360}deg` }]
                            }}
                        />
                        <View className="items-center">
                            <Ionicons name="water" size={48} color="#3B82F6" />
                            <Text className="text-4xl font-black text-gray-900 mt-2">{water.glasses}</Text>
                            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">of {water.goal} glasses</Text>
                        </View>
                    </View>

                    <Text className="text-gray-900 font-black text-xl mt-10">{(water.glasses * 0.25).toFixed(1)}L / {(water.goal * 0.25).toFixed(1)}L Goal</Text>
                </Animated.View>

                <View className="flex-row gap-x-4 mt-8">
                    <TouchableOpacity
                        onPress={handleAdd}
                        className="flex-1 bg-blue-600 py-6 rounded-[32px] items-center flex-row justify-center shadow-xl shadow-blue-100"
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text className="text-white font-black uppercase tracking-[2px] ml-2">Add 250ml</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleReset}
                        className="w-20 bg-gray-100 rounded-[32px] items-center justify-center"
                    >
                        <Ionicons name="refresh" size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <Animated.View entering={FadeInDown.delay(300)} className="mt-8 bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex-row">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <View className="ml-4 flex-1">
                        <Text className="text-blue-900 font-black text-sm mb-1">Why stay hydrated?</Text>
                        <Text className="text-blue-700/60 text-[11px] font-bold leading-4">Drinking enough water regulates body temperature, keeps joints lubricated, and prevents dangerous infections.</Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
