import { useGigStore } from '@/store/gigStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface GigChecklistProps {
    gigId: string;
    items: any[];
}

export const GigChecklist: React.FC<GigChecklistProps> = ({ gigId, items }) => {
    const toggleItem = useGigStore((state) => state.toggleItem);

    if (!items || items.length === 0) return null;

    return (
        <View className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 mb-10">
            {items.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleItem(gigId, item.id);
                    }}
                    className="flex-row items-center mb-6 last:mb-0"
                >
                    <View className={`w-8 h-8 rounded-full border-2 items-center justify-center ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-200'
                        }`}>
                        {item.checked && <Ionicons name="checkmark" size={16} color="white" />}
                    </View>
                    <View className="ml-5 flex-1">
                        <Text className={`text-lg font-bold ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{item.name}</Text>
                        <Text className="text-xs text-gray-400 font-bold uppercase">{item.quantity}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );
};
