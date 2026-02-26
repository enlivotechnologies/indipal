import { useBookingStore } from '@/store/bookingStore';
import { usePalStore } from '@/store/palStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [selectedPalId, setSelectedPalId] = useState<string | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const navigation = useNavigation();

    const { pals, updatePalAvailability, fetchPals, isLoading } = usePalStore();
    const selectedPal = pals.find(p => p.id === selectedPalId);

    useEffect(() => {
        fetchPals();
        const unsubscribe = navigation.addListener('blur', () => {
            setIsConfirmed(false);
        });
        return unsubscribe;
    }, [navigation, fetchPals]);

    const handleConfirm = () => {
        if (!selectedPalId || !date || !time) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const pal = pals.find(p => p.id === selectedPalId);

        useBookingStore.getState().addGig({
            title: title as string || "Care Session",
            description: `Required ${serviceType} service for ${duration}. Address: ${address}. Special instructions: ${date} at ${time}.`,
            dateTime: `${date} ${time}`,
            duration: duration,
            paymentAmount: duration === '2 hrs' ? 450 : duration === '4 hrs' ? 800 : 1500,
            price: duration === '2 hrs' ? 450 : duration === '4 hrs' ? 800 : 1500,
            location: { address: address || "HSR Layout, Bangalore" },
            familyId: "FAM_USER_001",
            clientName: "Senior Member",
            palId: selectedPalId,
            palName: pal?.name || "Assigned Pal",
            date: date,
            day: "Day TBD",
            time: time,
        });

        // Update Pal Availability
        updatePalAvailability(selectedPalId, date, time);

        setIsConfirmed(true);
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
                {/* 1. Select Pal */}
                <View className="mb-10">
                    <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Select Your Pal</Text>
                    {isLoading ? (
                        <View className="py-10 items-center justify-center">
                            <ActivityIndicator size="small" color="#F97316" />
                        </View>
                    ) : pals.length === 0 ? (
                        <View className="bg-gray-50 p-8 rounded-[32px] border border-dashed border-gray-200 items-center">
                            <Text className="text-gray-400 font-bold text-xs">No Pals available right now</Text>
                        </View>
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                            className="-mx-6"
                        >
                            {pals.map((pal) => (
                                <TouchableOpacity
                                    key={pal.id}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setSelectedPalId(pal.id);
                                        setDate('');
                                        setTime('');
                                    }}
                                    className={`w-48 p-5 rounded-[32px] border-2 mr-3 ${selectedPalId === pal.id ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-100'}`}
                                >
                                    <View className="items-center">
                                        <View className={`w-16 h-16 rounded-full mb-3 items-center justify-center overflow-hidden border-2 ${selectedPalId === pal.id ? 'border-orange-200 bg-orange-100' : 'border-gray-100 bg-gray-50'}`}>
                                            <Ionicons name="person" size={32} color={selectedPalId === pal.id ? "#F97316" : "#D1D5DB"} />
                                        </View>
                                        <Text className="text-gray-900 font-black text-sm text-center line-clamp-1">{pal.name}</Text>
                                        <Text className="text-[#A1A1AA] text-[9px] font-bold uppercase tracking-widest mb-2">{pal.experienceYears} Years Exp.</Text>
                                        <View className="flex-row items-center bg-white px-2 py-0.5 rounded-full border border-gray-100">
                                            <Ionicons name="star" size={10} color="#F59E0B" />
                                            <Text className="text-gray-500 text-[10px] font-black ml-1">{pal.rating}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* 2. Available Dates (Conditional) */}
                {selectedPal && (
                    <View className="mb-10">
                        <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Available Dates</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {(selectedPal.availability || []).map((av) => (
                                <TouchableOpacity
                                    key={av.date}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setDate(av.date);
                                        setTime('');
                                    }}
                                    className={`px-6 py-4 rounded-[24px] border-2 ${date === av.date ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-100'}`}
                                >
                                    <Text className={`font-black text-sm ${date === av.date ? 'text-orange-600' : 'text-gray-400'}`}>
                                        {av.date}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* 3. Available Slots (Conditional) */}
                {date && selectedPal?.availability && (
                    <View className="mb-10">
                        <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Select Time Slot</Text>
                        <View className="space-y-3">
                            {selectedPal.availability.find(av => av.date === date)?.slots?.map((slot) => (
                                <TouchableOpacity
                                    key={slot}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setTime(slot);
                                    }}
                                    className={`p-5 rounded-[24px] border-2 flex-row items-center justify-between ${time === slot ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-100'}`}
                                >
                                    <Text className={`font-black text-sm ${time === slot ? 'text-orange-600' : 'text-gray-400'}`}>
                                        {slot}
                                    </Text>
                                    {time === slot && <Ionicons name="checkmark-circle" size={20} color="#F97316" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Type of Service */}
                <Animated.View entering={FadeInDown.delay(200)} className="mb-10">
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

                {/* Service Duration */}
                <Animated.View entering={FadeInDown.delay(225)} className="mb-10">
                    <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Service Duration</Text>
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
                                <Text className={`font-black text-xs ${duration === option ? 'text-orange-600' : 'text-gray-400'
                                    }`}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Location */}
                <Animated.View entering={FadeInDown.delay(250)} className="mb-10">
                    <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-5 ml-1">Delivery Location</Text>
                    <View>
                        <Text className="text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Address</Text>
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
                        disabled={!selectedPalId || !date || !time}
                        activeOpacity={0.8}
                        className={`px-10 py-5 rounded-[24px] shadow-xl ${(!selectedPalId || !date || !time) ? 'bg-gray-200 shadow-none' : 'bg-orange-500 shadow-orange-200'}`}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">Confirm Booking</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
