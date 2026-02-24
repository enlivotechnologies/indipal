import { MoodType, useHealthStore } from '@/store/healthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOODS: { type: MoodType; emoji: string; color: string }[] = [
    { type: 'Happy', emoji: '😊', color: '#FCD34D' },
    { type: 'Calm', emoji: '😐', color: '#93C5FD' },
    { type: 'Sad', emoji: '😔', color: '#A5B4FC' },
    { type: 'Stressed', emoji: '😡', color: '#F87171' },
    { type: 'Tired', emoji: '😴', color: '#F97316' },
];

export default function MoodTrackerScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { updateMood, records } = useHealthStore();
    const [selectedMood, setSelectedMood] = useState<MoodType | null>(records.mood?.type || null);
    const [note, setNote] = useState(records.mood?.note || '');

    const handleSave = () => {
        if (!selectedMood) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        updateMood({
            type: selectedMood,
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
                <Text className="text-xl font-black text-gray-900">Mood Tracker</Text>
                <View className="w-10 h-10" />
            </View>

            <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
                <View className="mt-8">
                    <Text className="text-2xl font-black text-gray-900 mb-2">How are you feeling?</Text>
                    <Text className="text-gray-400 text-sm font-medium mb-8">Select the emoji that best represents your current mood.</Text>

                    <View className="flex-row flex-wrap justify-between">
                        {MOODS.map((mood, idx) => (
                            <Animated.View key={mood.type} entering={FadeInDown.delay(idx * 100)} className="w-[30%] mb-6">
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSelectedMood(mood.type);
                                    }}
                                    className={`aspect-square rounded-[32px] items-center justify-center border-2 ${selectedMood === mood.type ? 'bg-white border-purple-500 shadow-xl shadow-purple-100' : 'bg-white border-gray-50'
                                        }`}
                                >
                                    <Text className="text-4xl mb-2">{mood.emoji}</Text>
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedMood === mood.type ? 'text-purple-600' : 'text-gray-400'}`}>{mood.type}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    <View className="mt-4">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Optional Notes</Text>
                        <TextInput
                            placeholder="What's on your mind? (Optional)"
                            multiline
                            numberOfLines={4}
                            value={note}
                            onChangeText={setNote}
                            className="bg-white p-6 rounded-[32px] border border-gray-100 text-gray-900 font-medium text-base h-40"
                            style={{ textAlignVertical: 'top' }}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={!selectedMood}
                    className={`mt-10 py-6 rounded-[32px] items-center shadow-xl mb-10 ${selectedMood ? 'bg-purple-600 shadow-purple-200' : 'bg-gray-200'}`}
                >
                    <Text className="text-white font-black uppercase tracking-[2px]">Save Mood Entry</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
