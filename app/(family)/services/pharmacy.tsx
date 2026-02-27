import PharmacyView from '@/components/PharmacyView';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FamilyPharmacyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <View
                className="px-6 pb-6 pt-4 bg-white border-b border-gray-50 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 16) }}
            >
                <TouchableOpacity
                    onPress={() => router.replace('/(family)/care' as any)}
                    className="w-10 h-10 items-center justify-center bg-gray-50 rounded-xl"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-xl font-black text-gray-900">Health Store</Text>
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pharmacy Hub</Text>
                </View>
                <View className="w-10" />
            </View>

            <PharmacyView role="family" />
        </View>
    );
}
