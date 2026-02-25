import { useAuthStore } from '@/store/authStore';
import { useGigStore } from '@/store/gigStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ESSENTIALS = [
    { id: 'milk', name: 'Milk', icon: 'water', color: '#3B82F6' },
    { id: 'meds', name: 'Meds', icon: 'medical', color: '#EF4444' },
    { id: 'veggies', name: 'Veggies', icon: 'leaf', color: '#10B981' },
    { id: 'bread', name: 'Bread', icon: 'restaurant', color: '#F59E0B' },
    { id: 'eggs', name: 'Eggs', icon: 'sunny', color: '#FCD34D' },
    { id: 'fruit', name: 'Fruits', icon: 'nutrition', color: '#FB7185' },
];

export default function SeniorGroceryPage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    const addGig = useGigStore((state) => state.addGig);
    const [selected, setSelected] = useState<string[]>([]);
    const [isRecording, setIsRecording] = useState(false);

    const toggleItem = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleRequest = () => {
        if (selected.length === 0) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const items = selected.map(id => ({
            id: Math.random().toString(36).substr(2, 9),
            name: ESSENTIALS.find(e => e.id === id)?.name || id,
            quantity: '1 Unit',
            checked: false
        }));

        addGig({
            seniorId: user?.phone || 'senior_1',
            seniorName: user?.name || 'Ramesh Chandra',
            status: 'pending_approval',
            category: 'Grocery',
            items,
        });

        router.replace('/(senior)/home');
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView
                contentContainerStyle={{
                    paddingTop: Math.max(insets.top, 20),
                    paddingBottom: insets.bottom + 40,
                    paddingHorizontal: 24
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100 mb-8"
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <Text className="text-3xl font-black text-gray-900 mb-2">Order Groceries</Text>
                <Text className="text-gray-500 font-bold text-sm mb-10">Select what you need today.</Text>

                <View className="flex-row flex-wrap justify-between">
                    {ESSENTIALS.map((item, idx) => {
                        const isActive = selected.includes(item.id);
                        return (
                            <Animated.View
                                key={item.id}
                                entering={FadeInUp.delay(idx * 50)}
                                className="w-[48%] mb-4"
                            >
                                <TouchableOpacity
                                    onPress={() => toggleItem(item.id)}
                                    activeOpacity={0.8}
                                    className={`h-36 rounded-[32px] items-center justify-center border-2 ${isActive ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-100'
                                        }`}
                                    style={{
                                        shadowColor: isActive ? '#F59E0B' : '#000',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: isActive ? 0.2 : 0.05,
                                        shadowRadius: 12,
                                        elevation: isActive ? 5 : 2
                                    }}
                                >
                                    <View
                                        style={{ backgroundColor: isActive ? '#F59E0B' : `${item.color}15` }}
                                        className="w-14 h-14 rounded-2xl items-center justify-center mb-3"
                                    >
                                        <Ionicons name={item.icon as any} size={28} color={isActive ? 'white' : item.color} />
                                    </View>
                                    <Text className={`font-black text-lg ${isActive ? 'text-orange-900' : 'text-gray-900'}`}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>

                <View className="mt-8 bg-gray-50 p-8 rounded-[40px] items-center border border-gray-100 mb-10">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6 text-center">Or Use Your Voice</Text>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                            setIsRecording(!isRecording);
                        }}
                        className={`w-24 h-24 rounded-full items-center justify-center border-4 ${isRecording ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'
                            }`}
                    >
                        <Ionicons name={isRecording ? "stop" : "mic"} size={40} color={isRecording ? "#EF4444" : "#F59E0B"} />
                    </TouchableOpacity>
                    <Text className={`mt-4 font-black text-sm ${isRecording ? 'text-red-500' : 'text-orange-500'}`}>
                        {isRecording ? 'Listening...' : 'Tap to Speak'}
                    </Text>
                </View>
            </ScrollView>

            <View
                className="absolute bottom-0 left-0 right-0 p-6 bg-white/80"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <TouchableOpacity
                    onPress={handleRequest}
                    disabled={selected.length === 0}
                    className={`h-20 rounded-[28px] items-center justify-center shadow-xl ${selected.length > 0 ? 'bg-orange-500 shadow-orange-200' : 'bg-gray-200 shadow-none'
                        }`}
                >
                    <Text className="text-white font-black text-xl uppercase tracking-widest">
                        Request {selected.length > 0 ? `(${selected.length})` : ''}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
