import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInUp,
    FadeOut,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { useBookingStore } from '../../../store/bookingStore';

type HelpService = {
    id: string;
    title: string;
    price: number;
    icon: string;
    image: string;
    category: 'Cooking' | 'Cleaning' | 'Companion';
    description: string;
    benefits: string[];
};

const HELP_SERVICES: HelpService[] = [
    {
        id: '1',
        title: 'Home Sanitization',
        price: 800,
        icon: 'sparkles',
        category: 'Cleaning',
        image: 'https://images.unsplash.com/photo-1581578731522-aa7c04ced643?auto=format&fit=crop&q=80&w=400',
        description: 'Deep cleaning and sanitization of high-touch areas. Includes floor mopping, dusting, and bathroom cleaning.',
        benefits: ['Eco-friendly chemicals', 'Verified Staff', 'Quick service']
    },
    {
        id: '2',
        title: 'Nutritious Meal Prep',
        price: 1200,
        icon: 'restaurant',
        category: 'Cooking',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400',
        description: 'Home-style cooking tailored to senior dietary needs. Includes chopping, cooking, and kitchen cleanup.',
        benefits: ['Low salt/sugar focus', 'Fresh ingredients', 'Kitchen cleanup']
    },
    {
        id: '3',
        title: 'Errand Companion',
        price: 600,
        icon: 'walk',
        category: 'Companion',
        image: 'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&q=80&w=400',
        description: 'Help with grocery shopping, bank visits, or just a walk in the park. Reliable companion for outdoor tasks.',
        benefits: ['Safety first', 'Patience & Care', 'Log update']
    }
];

export default function HouseHelpBookingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { createRequest } = useBookingStore();
    const { user } = useAuthStore();

    const [selectedService, setSelectedService] = useState<HelpService | null>(null);
    const [viewItem, setViewItem] = useState<HelpService | null>(null);
    const [selectedDuration, setSelectedDuration] = useState<'2h' | '4h' | 'full'>('2h');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'sending' | 'confirmed'>('idle');
    const [notes, setNotes] = useState('');
    const [selectedDate, setSelectedDate] = useState('Today');

    const handleConfirm = async () => {
        if (!selectedService) {
            Alert.alert("Selection Required", "Please select a service specialization.");
            return;
        }

        setOrderStatus('sending');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            const res = await createRequest({
                clientName: user?.name || "Senior Member",
                title: `House Help: ${selectedService.title}`,
                type: 'house_help',
                date: selectedDate,
                day: selectedDate === 'Today' ? 'Thursday' : 'Friday',
                time: selectedDuration === '2h' ? "10:00 AM - 12:00 PM" : selectedDuration === '4h' ? "10:00 AM - 02:00 PM" : "09:00 AM - 06:00 PM",
                dateTime: `${selectedDate} ${selectedDuration}`,
                price: selectedService.price,
                paymentAmount: selectedService.price,
                location: { address: user?.address || "HSR Layout, Sector 7" },
                description: selectedService.description,
                duration: selectedDuration === 'full' ? '9 Hours' : selectedDuration,
                familyId: user?.familyId || "FAM_USER",
                requirements: [...selectedService.benefits, notes].filter(Boolean) as string[],
            });

            if (res.success) {
                setTimeout(() => {
                    setOrderStatus('confirmed');
                    setIsConfirmed(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }, 1500);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to send request. Check your connection.");
            setOrderStatus('idle');
        }
    };

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp.duration(600).easing(Easing.inOut(Easing.ease))} className="items-center w-full">
                    <View className="w-24 h-24 bg-purple-100 rounded-[40px] items-center justify-center mb-8 border border-purple-200">
                        <Ionicons name="send" size={48} color="#A855F7" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4 text-purple-600">Request Sent!</Text>
                    <Text className="text-gray-500 text-center mb-10 font-medium">Your house help request has been sent for family approval.</Text>

                    <View className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">₹{selectedService?.price} Est. Price</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                                <Ionicons name="notifications" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Family Notified</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setIsConfirmed(false);
                            setOrderStatus('idle');
                            router.replace('/(senior)/home' as any);
                        }}
                        className="bg-purple-600 px-12 py-5 rounded-[24px] shadow-xl shadow-purple-200 w-full"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-center">Back to Home</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View >
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View
                className="px-6 pb-6 pt-4 bg-white border-b border-gray-50 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-gray-900">Elite Help</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                        <Text className="text-purple-600 text-[9px] font-black uppercase tracking-[2px]">Verified Professionals</Text>
                    </View>
                </View>

                <View className="w-12 h-12" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
                className="flex-1"
            >
                {/* Visual Intro */}
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="px-6 mt-8 mb-10">
                    <LinearGradient
                        colors={['#A855F7', '#7C3AED']}
                        className="rounded-[24px] p-8 shadow-2xl shadow-purple-100 flex-row items-center"
                    >
                        <View className="flex-1">
                            <Text className="text-white/70 text-[10px] font-black uppercase tracking-[3px] mb-2">Premium Help</Text>
                            <Text className="text-white text-2xl font-black mb-1">House Support</Text>
                            <Text className="text-white/60 text-[11px] font-bold">Reliable & Verified Staff</Text>
                        </View>
                        <View className="w-16 h-16 bg-white/20 rounded-[28px] items-center justify-center border border-white/20">
                            <Ionicons name="home" size={32} color="white" />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Service Cards */}
                <View className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Choose Service</Text>
                    {HELP_SERVICES.map((service, idx) => (
                        <Animated.View
                            key={service.id}
                            entering={FadeInUp.delay(200 + idx * 100).duration(600)}
                            className="mb-4"
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setViewItem(service);
                                }}
                                className={`rounded-[24px] p-6 border-2 flex-row items-center ${selectedService?.id === service.id ? 'bg-purple-50 border-purple-500' : 'bg-white border-gray-50'
                                    }`}
                            >
                                <View className="relative">
                                    <Image source={{ uri: service.image }} className="w-20 h-20 rounded-[24px]" />
                                </View>
                                <View className="ml-5 flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className="text-gray-900 font-black text-lg">{service.title}</Text>
                                        <Text className="text-purple-600 font-black">₹{service.price}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <View className="bg-white/60 px-2 py-1 rounded-lg border border-gray-100">
                                            <Text className="text-[8px] font-black text-gray-500 uppercase">{service.category}</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Schedule Configuration */}
                <Animated.View entering={FadeInUp.delay(500).duration(600)} className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Set Schedule</Text>
                    <View className="bg-gray-50 rounded-[24px] p-6 border border-gray-100">
                        {/* Date Selection */}
                        <View className="flex-row gap-x-3 mb-6">
                            {['Today', 'Tomorrow', 'Other'].map((date) => (
                                <TouchableOpacity
                                    key={date}
                                    onPress={() => setSelectedDate(date)}
                                    className={`flex-1 py-3 rounded-2xl items-center border ${selectedDate === date ? 'bg-purple-600 border-purple-600 shadow-lg' : 'bg-white border-gray-100'}`}
                                >
                                    <Text className={`text-[10px] font-black uppercase ${selectedDate === date ? 'text-white' : 'text-gray-400'}`}>{date}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Duration Selection */}
                        <View className="flex-row gap-x-3">
                            {(['2h', '4h', 'full'] as const).map((dur) => (
                                <TouchableOpacity
                                    key={dur}
                                    onPress={() => setSelectedDuration(dur)}
                                    className={`flex-1 py-4 rounded-2xl items-center border ${selectedDuration === dur ? 'bg-purple-600 border-purple-600 shadow-lg' : 'bg-white border-gray-100'}`}
                                >
                                    <Ionicons
                                        name={dur === 'full' ? 'calendar' : 'time'}
                                        size={20}
                                        color={selectedDuration === dur ? 'white' : '#9CA3AF'}
                                    />
                                    <Text className={`text-[10px] font-black uppercase mt-2 ${selectedDuration === dur ? 'text-white' : 'text-gray-400'}`}>
                                        {dur}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Animated.View>

                {/* Notes */}
                <View className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Special Notes</Text>
                    <TextInput
                        multiline
                        placeholder="Eg: Deep clean the kitchen, Use less oil in meals..."
                        value={notes}
                        onChangeText={setNotes}
                        className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 min-h-[120px] text-gray-900 font-medium align-top"
                    />
                </View>
            </ScrollView>

            {/* Service Detail Modal */}
            <Modal
                visible={!!viewItem}
                transparent={true}
                animationType="none"
                onRequestClose={() => setViewItem(null)}
            >
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    className="flex-1 bg-black/70 justify-end"
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setViewItem(null)}
                    />
                    <Animated.View
                        key={`modal-help-${viewItem?.id}`}
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[60px] p-10 max-h-[92%] shadow-2xl"
                    >
                        {viewItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-10">
                                    <View className="w-20 h-2 bg-gray-100 rounded-full mb-10" />
                                    <Image source={{ uri: viewItem.image }} className="w-64 h-64 rounded-[50px] mb-8" />
                                    <Text className="text-[11px] font-black text-purple-500 uppercase tracking-[4px] mb-3">{viewItem.category}</Text>
                                    <Text className="text-4xl font-black text-gray-900 text-center mb-2">{viewItem.title}</Text>
                                    <Text className="text-gray-600 font-medium text-lg text-center leading-7">{viewItem.description}</Text>
                                </View>

                                <View className="gap-y-6 mb-12">
                                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-2">Key Benefits</Text>
                                    {viewItem.benefits.map((benefit, bi) => (
                                        <View key={bi} className="flex-row items-center bg-gray-50 px-6 py-4 rounded-[20px] border border-gray-100 mb-2">
                                            <Ionicons name="checkmark-circle" size={20} color="#A855F7" />
                                            <Text className="ml-4 text-gray-800 font-bold">{benefit}</Text>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedService(viewItem);
                                        setViewItem(null);
                                    }}
                                    className="bg-purple-600 py-6 rounded-[28px] items-center mb-10"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest">Select Service</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Sending state simulation */}
            {orderStatus === 'sending' && (
                <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-white items-center justify-center z-50">
                    <View className="items-center px-10">
                        <ActivityIndicator size="large" color="#A855F7" />
                        <Text className="text-3xl font-black text-gray-900 mt-10 text-center">Contacting Family</Text>
                        <Text className="text-gray-500 font-medium text-center mt-4 leading-6 font-medium">
                            Forwarding your house help request to family members...
                        </Text>
                        <View className="mt-12 bg-gray-50 p-8 rounded-[40px] w-full border border-gray-100">
                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <Animated.View entering={FadeIn.duration(1500)} className="h-full bg-purple-500 w-full" />
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}

            {/* Action Float */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View
                    className="rounded-[44px] border border-gray-100 bg-white p-8 flex-row items-center justify-between shadow-2xl shadow-black/15"
                >
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Est. Price</Text>
                        <Text className="text-gray-900 text-3xl font-black">₹{selectedService?.price || 0}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={!selectedService || orderStatus !== 'idle'}
                        activeOpacity={0.8}
                        className={`px-12 py-6 rounded-[28px] shadow-xl ${selectedService ? 'bg-purple-600 shadow-purple-200' : 'bg-gray-200 shadow-transparent'
                            }`}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">
                            {orderStatus === 'sending' ? 'SENDING...' : 'SEND REQUEST'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}


