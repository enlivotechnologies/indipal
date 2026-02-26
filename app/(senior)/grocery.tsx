import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import GroceryView from '@/components/GroceryView';

export default function SeniorGroceryPage() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View className="px-6 pt-12 flex-row items-center justify-between mb-8">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
                >
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-xl font-black text-gray-900">Grocery List</Text>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Shopping Assistance</Text>
                </View>
                <View className="w-12" />
            </View>

            <GroceryView role="senior" />
        </View>
    );
}
