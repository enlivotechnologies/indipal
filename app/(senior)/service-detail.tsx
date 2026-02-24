import { useServiceStore } from '@/store/serviceStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GenericSeniorServiceScreen() {
    const { title, icon, color } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const addOrder = useServiceStore((state) => state.addOrder);

    const [isBooking, setIsBooking] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [address, setAddress] = useState('Sector 4, HSR Layout, Bengaluru');
    const [notes, setNotes] = useState('');

    const BRAND_PURPLE = '#6E5BFF';
    const mainColor = (color as string) || BRAND_PURPLE;

    const handlePlaceOrder = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addOrder({
            serviceTitle: title as string,
            serviceIcon: icon as string,
            seniorName: 'Ramesh Chandra',
            color: mainColor,
            amount: '450',
            details: {
                address,
                type: notes || 'Regular Service',
                date: 'Today',
                time: 'ASAP'
            }
        });
        setIsConfirmed(true);
    };

    if (isConfirmed) {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }} className="items-center justify-center p-8">
                <Animated.View entering={FadeInUp} className="items-center">
                    <View className="w-24 h-24 bg-emerald-50 rounded-[40px] items-center justify-center mb-8 border border-emerald-100">
                        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4">Request Sent!</Text>
                    <Text className="text-gray-500 text-center text-lg font-medium leading-7 mb-12">
                        We've notified your family about your {title} request. They will approve and pay for the service shortly.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.replace('/(senior)/services' as any)}
                        className="bg-gray-900 px-12 py-5 rounded-3xl shadow-xl shadow-black/20"
                    >
                        <Text className="text-white font-black uppercase tracking-widest">Done</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    if (isBooking) {
        return (
            <View style={{ flex: 1, backgroundColor: 'white' }}>
                <View
                    style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
                    className="px-6 flex-row items-center border-b border-gray-50 bg-white"
                >
                    <TouchableOpacity
                        onPress={() => setIsBooking(false)}
                        className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-4"
                    >
                        <Ionicons name="chevron-back" size={24} color={BRAND_PURPLE} />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-xl font-black text-gray-900">Request {title}</Text>
                    </View>
                </View>

                <ScrollView className="flex-1 px-6 pt-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Confirm Details</Text>

                    <View className="mb-6">
                        <Text className="text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Service Address</Text>
                        <TextInput
                            value={address}
                            onChangeText={setAddress}
                            className="bg-gray-50 p-5 rounded-2xl border border-gray-100 font-bold text-gray-900"
                        />
                    </View>

                    <View className="mb-10">
                        <Text className="text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Specific Instructions (Optional)</Text>
                        <TextInput
                            placeholder="e.g. Please bring fresh apples..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            className="bg-gray-50 p-5 rounded-2xl border border-gray-100 font-bold text-gray-900 min-h-[120px]"
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handlePlaceOrder}
                        className="bg-gray-900 py-6 rounded-[28px] items-center shadow-xl mb-10"
                    >
                        <Text className="text-white font-black uppercase tracking-widest">Send Request to Family</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
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
                    <Text className="text-2xl font-black text-gray-900">{title || 'Service'}</Text>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">EnlivoCare Select</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="flex-1 px-6 pt-8">
                <Animated.View entering={FadeInUp.delay(100)} className="mb-8 items-center">
                    <View
                        style={{ backgroundColor: `${mainColor}20` }}
                        className="w-24 h-24 rounded-full items-center justify-center mb-6 border-4 border-white shadow-sm"
                    >
                        <Ionicons name={(icon as any) || 'medical'} size={48} color={mainColor} />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center leading-10">
                        {title}
                        {"\n"}
                        <Text className="text-indigo-600">Available Now</Text>
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200)} className="mb-10">
                    <Text className="text-gray-500 text-center text-lg leading-7 px-4">
                        Request {title} at your doorstep. We prioritize quality and safety for our senior members above all else.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300)} className="bg-indigo-50 p-8 rounded-[32px] border border-indigo-100 mb-10">
                    <View className="flex-row items-center justify-center mb-4 gap-3">
                        <View className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm">
                            <Ionicons name="shield-checkmark" size={20} color={BRAND_PURPLE} />
                        </View>
                        <Text className="font-black text-indigo-900 text-lg">Family Approved</Text>
                    </View>
                    <Text className="text-indigo-600/80 text-center text-sm font-medium leading-6">
                        Once you request this service, your family will be notified to confirm and pay for it.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400)}>
                    <TouchableOpacity
                        className="bg-indigo-600 py-6 rounded-[28px] items-center shadow-xl mb-4"
                        onPress={() => setIsBooking(true)}
                    >
                        <Text className="text-white font-black uppercase tracking-widest">Request This Service</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-100 py-6 rounded-[28px] items-center"
                        onPress={() => router.back()}
                    >
                        <Text className="text-gray-900 font-black uppercase tracking-widest">Back</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
