import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ServiceType = 'Cleaning' | 'Cooking' | 'Laundry' | 'General Help';
type Duration = '2 hrs' | '4 hrs' | 'Full Day';

export default function BookingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { title } = useLocalSearchParams();

    const [serviceType, setServiceType] = useState<ServiceType>('Cleaning');
    const [duration, setDuration] = useState<Duration>('2 hrs');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [address, setAddress] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsConfirmed(false);
        });
        return unsubscribe;
    }, [navigation]);

    const handleConfirm = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setIsConfirmed(true);
        // In a real app, this would send a notification to the family store/API
    };

    const serviceOptions: ServiceType[] = ['Cleaning', 'Cooking', 'Laundry', 'General Help'];
    const durationOptions: Duration[] = ['2 hrs', '4 hrs', 'Full Day'];

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp} className="items-center">
                    <View className="w-24 h-24 bg-emerald-50 rounded-[40px] items-center justify-center mb-8 border border-emerald-100">
                        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4">Booking Requested!</Text>
                    <Text className="text-gray-500 text-center text-lg font-medium leading-7 mb-12">
                        Your request has been sent to your family for approval. You'll be notified once a Pal is assigned.
                    </Text>
                    <TouchableOpacity
                        onPress={() => {
                            setIsConfirmed(false);
                            router.replace('/(family)/care' as any);
                        }}
                        className="bg-gray-900 px-12 py-5 rounded-3xl shadow-xl shadow-black/20"
                    >
                        <Text className="text-white font-black uppercase tracking-widest">Back to Care Hub</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            {/* Elegant Header */}
            <View
                className="px-6 pb-6 pt-4 bg-white/80 backdrop-blur-xl border-b border-gray-100"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.replace('/(family)/care' as any)}
                        className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-2xl font-black text-gray-900">{title || 'House Help'}</Text>
                        <View className="flex-row items-center mt-1">
                            <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                            <Text className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Available Today</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.replace('/(family)/home')}
                        className="w-12 h-12 items-center justify-center bg-orange-50 rounded-2xl border border-orange-100"
                    >
                        <Ionicons name="home" size={20} color="#F59E0B" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
                className="flex-1 px-6 pt-8"
            >
                {/* Type of Service */}
                <Animated.View entering={FadeInDown.delay(100)} className="mb-10">
                    <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Type of Service</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {serviceOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setServiceType(option);
                                }}
                                className={`px-6 py-4 rounded-[24px] border-2 ${serviceType === option
                                    ? 'bg-orange-50 border-orange-500'
                                    : 'bg-white border-gray-100'
                                    }`}
                            >
                                <Text className={`font-black text-sm ${serviceType === option ? 'text-orange-600' : 'text-gray-400'
                                    }`}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Duration */}
                <Animated.View entering={FadeInDown.delay(200)} className="mb-10">
                    <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Duration</Text>
                    <View className="flex-row gap-x-3">
                        {durationOptions.map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setDuration(option);
                                }}
                                className={`flex-1 py-4 rounded-[24px] border-2 items-center ${duration === option
                                    ? 'bg-orange-50 border-orange-500'
                                    : 'bg-white border-gray-100'
                                    }`}
                            >
                                <Text className={`font-black text-sm ${duration === option ? 'text-orange-600' : 'text-gray-400'
                                    }`}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Schedule & Location */}
                <Animated.View entering={FadeInDown.delay(300)} className="mb-10">
                    <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Schedule & Location</Text>

                    <View className="flex-row gap-x-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Date</Text>
                            <TextInput
                                placeholder="e.g. Tomorrow"
                                value={date}
                                onChangeText={setDate}
                                className="bg-white p-5 rounded-2xl border border-gray-100 font-bold text-gray-900"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Time</Text>
                            <TextInput
                                placeholder="e.g. 10:00 AM"
                                value={time}
                                onChangeText={setTime}
                                className="bg-white p-5 rounded-2xl border border-gray-100 font-bold text-gray-900"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Delivery Address</Text>
                        <TextInput
                            placeholder="Enter your full home address"
                            value={address}
                            onChangeText={setAddress}
                            multiline
                            className="bg-white p-5 rounded-2xl border border-gray-100 font-bold text-gray-900 min-h-[100px]"
                            placeholderTextColor="#9CA3AF"
                            textAlignVertical="top"
                        />
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View
                className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl px-8 pt-6 border-t border-gray-100"
                style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Estimate</Text>
                        <Text className="text-gray-900 text-3xl font-black">₹{duration === '2 hrs' ? '450' : duration === '4 hrs' ? '800' : '1,500'}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        activeOpacity={0.8}
                        className="bg-orange-500 px-10 py-5 rounded-[24px] shadow-xl shadow-orange-200"
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">Confirm Booking</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({});
