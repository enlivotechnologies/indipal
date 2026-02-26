import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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

type HouseHelpService = {
    id: string;
    title: string;
    price: number;
    icon: string;
    image: string;
    category: 'Cleaning' | 'Cooking' | 'Maintenance';
    description: string;
    tasks: string[];
    rating: string;
    reviews: string;
};

const HELP_SERVICES: HouseHelpService[] = [
    {
        id: '1',
        title: 'Full Home Sanitization',
        price: 1200,
        icon: 'sparkles',
        category: 'Cleaning',
        image: 'https://images.unsplash.com/photo-1581578731522-aa7c04ced643?auto=format&fit=crop&q=80&w=400',
        description: 'Deep cleaning and sanitization of the entire home focusing on high-touch areas. Safe for seniors.',
        tasks: ['Kitchen Deep Clean', 'Floor Scrubbing', 'Bathroom Care'],
        rating: '4.8',
        reviews: '500+'
    },
    {
        id: '2',
        title: 'Nutritional Meal Prep',
        price: 800,
        icon: 'restaurant',
        category: 'Cooking',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400',
        description: 'Preparation of healthy, balanced meals tailored for elderly dietary requirements (Low salt/sugar).',
        tasks: ['Lunch & Dinner', 'Kitchen Cleanup', 'Diet Planning'],
        rating: '4.9',
        reviews: '320+'
    },
    {
        id: '3',
        title: 'Daily Maintenance',
        price: 500,
        icon: 'hammer',
        category: 'Maintenance',
        image: 'https://images.unsplash.com/photo-1581578731522-aa7c04ced643?auto=format&fit=crop&q=80&w=400',
        description: 'Handling daily chores, minor repairs, and general upkeep of the senior residence.',
        tasks: ['Bed Making', 'Dusting', 'Appliance Check'],
        rating: '4.7',
        reviews: '1.2k+'
    }
];

export default function HouseHelpScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Store & Auth
    const user = useAuthStore((state) => state.user);
    const { bookings, forwardToPal, fetchGigs, addGig } = useBookingStore();

    const [selectedService, setSelectedService] = useState<HouseHelpService | null>(null);
    const [viewItem, setViewItem] = useState<HouseHelpService | null>(null);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'wallet' | 'card'>('wallet');
    const [address, setAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedShift, setSelectedShift] = useState<'day' | 'night' | 'full'>('day');
    const [selectedDate, setSelectedDate] = useState('Today');
    const [notes, setNotes] = useState('');

    // Filter pending requests for house help from senior
    const pendingRequests = useMemo(() => {
        return bookings.filter((b: any) => b.status === 'sent_to_family' && b.type === 'house_help');
    }, [bookings]);

    useFocusEffect(
        useCallback(() => {
            fetchGigs();
            return () => {
                setIsConfirmed(false);
                setOrderStatus('idle');
            };
        }, [fetchGigs])
    );

    const handleCreateBooking = async () => {
        if (!selectedService) {
            Alert.alert("Selection Required", "Please select a service specialization.");
            return;
        }

        setIsProcessing(true);
        setOrderStatus('paying');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            // Deduct from Balance
            const { deductBalance } = useAuthStore.getState();
            const payRes = await deductBalance(selectedService.price, `Direct Booking: ${selectedService.title}`);

            if (!payRes.success) {
                Alert.alert("Payment Failed", payRes.message);
                setOrderStatus('idle');
                return;
            }

            // Simulate Payment Gateway Delay
            await new Promise(r => setTimeout(r, 2500));

            const seniorId = "SENIOR_1"; // Default linked senior or from store
            const familyId = user?.id || "FAM_USER";

            const { createRequest } = useBookingStore.getState();
            const res = await createRequest({
                clientName: "Ramesh Chandra", // Linked Senior Name
                title: `House Help: ${selectedService.title}`,
                type: 'house_help',
                date: selectedDate,
                day: selectedDate === 'Today' ? 'Thursday' : 'Friday',
                time: selectedShift === 'day' ? "10:00 AM - 01:00 PM" : selectedShift === 'night' ? "08:00 PM - 06:00 AM" : "24 Hours",
                dateTime: `${selectedDate} ${selectedShift}`,
                price: selectedService.price,
                paymentAmount: selectedService.price,
                location: { address: address || "Sector 4, HSR Layout, Bengaluru" },
                description: selectedService.description,
                duration: selectedShift === 'full' ? '24 Hours' : 'Shift',
                familyId: familyId,
                requirements: [...selectedService.tasks, notes].filter(Boolean) as string[],
            });

            if (res.success) {
                // Since Family is booking, we can immediately forward to Pal
                await forwardToPal(res.id);
                setOrderStatus('confirmed');
                setIsConfirmed(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error: any) {
            Alert.alert("Booking Failed", "Payment gateway error. Please try again.");
            setOrderStatus('idle');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleApproveRequest = async (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsProcessing(true);
        setOrderStatus('paying');

        try {
            // Deduct from Balance
            const { deductBalance } = useAuthStore.getState();
            const payRes = await deductBalance(Number(booking.price), `Domestic Care: ${booking.title}`);

            if (!payRes.success) {
                Alert.alert("Payment Failed", payRes.message);
                setOrderStatus('idle');
                return;
            }

            // Simulate Payment Gateway Delay
            await new Promise(r => setTimeout(r, 2000));
            const success = await forwardToPal(bookingId);
            if (success) {
                setOrderStatus('confirmed');
                setIsConfirmed(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error: any) {
            Alert.alert("Approval Failed", error.message);
            setOrderStatus('idle');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp.duration(600).easing(Easing.inOut(Easing.ease))}>
                    <View className="items-center w-full">
                        <View className="w-24 h-24 bg-orange-100 rounded-[40px] items-center justify-center mb-8 border border-orange-200">
                            <Ionicons name="home" size={48} color="#F59E0B" />
                        </View>
                        <Text className="text-3xl font-black text-gray-900 text-center mb-4">Request Secured!</Text>

                        <View className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
                            <View className="flex-row items-center mb-6">
                                <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
                                    <Ionicons name="checkmark" size={16} color="white" />
                                </View>
                                <Text className="ml-4 font-black text-gray-900 text-sm">₹{selectedService?.price} Escrow Payment Paid</Text>
                            </View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                                    <Ionicons name="notifications" size={16} color="white" />
                                </View>
                                <Text className="ml-4 font-black text-gray-900 text-sm">Service Booked for Today</Text>
                            </View>
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center">
                                    <Ionicons name="people" size={16} color="white" />
                                </View>
                                <Text className="ml-4 font-black text-gray-900 text-sm">Pal Coordinating Dispatch</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                setIsConfirmed(false);
                                setOrderStatus('idle');
                                router.replace('/(family)/care' as any);
                            }}
                            className="bg-gray-900 px-12 py-5 rounded-[24px] shadow-xl shadow-black/20 w-full"
                        >
                            <Text className="text-white font-black uppercase tracking-widest text-center">Back to Care Hub</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View
                className="px-6 pb-6 pt-4 bg-white border-b border-gray-50 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity
                    onPress={() => router.replace('/(family)/care' as any)}
                    className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-gray-900">House Help</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                        <Text className="text-orange-600 text-[9px] font-black uppercase tracking-[2px]">Premium Home Services</Text>
                    </View>
                </View>

                <View className="w-12 h-12" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                className="flex-1"
            >
                {/* Visual Intro */}
                <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.inOut(Easing.ease))}>
                    <View className="px-6 mt-8 mb-10">
                        <LinearGradient
                            colors={['#F59E0B', '#F97316']}
                            className="rounded-[32px] p-8 shadow-2xl shadow-orange-100 flex-row items-center"
                        >
                            <View className="flex-1">
                                <Text className="text-white/70 text-[10px] font-black uppercase tracking-[3px] mb-2">Impeccable Care</Text>
                                <Text className="text-white text-2xl font-black mb-1">Domestic Help</Text>
                                <Text className="text-white/60 text-[11px] font-bold">Reliable & Verified Staff</Text>
                            </View>
                            <View className="w-16 h-16 bg-white/20 rounded-[28px] items-center justify-center border border-white/20">
                                <Ionicons name="home" size={32} color="white" />
                            </View>
                        </LinearGradient>
                    </View>
                </Animated.View>

                {/* Pending Requests Section */}
                {pendingRequests.length > 0 && (
                    <View className="px-6 mb-10">
                        <Text className="text-[11px] font-black text-orange-600 uppercase tracking-[3px] mb-6 ml-1">Requests from Senior 🔥</Text>
                        {pendingRequests.map((request: any, i) => (
                            <Animated.View key={request.id} entering={FadeInUp.delay(200 + i * 100)}>
                                <View className="mb-4">
                                    <View className="bg-white p-6 rounded-[32px] border border-orange-200 shadow-xl shadow-orange-50 relative overflow-hidden">
                                        <View className="absolute top-0 right-0 w-24 h-24 bg-orange-50 -mr-8 -mt-8 rounded-full opacity-50" />
                                        <View className="flex-row items-center mb-6">
                                            <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100">
                                                <Ionicons name="flash" size={24} color="#F97316" />
                                            </View>
                                            <View className="ml-4 flex-1">
                                                <Text className="text-gray-900 font-black text-base">{request.title}</Text>
                                                <View className="flex-row items-center mt-1">
                                                    <View className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Awaits Approval</Text>
                                                </View>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-orange-600 font-black text-lg">₹{request.price || 0}</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row items-center gap-x-2">
                                            <TouchableOpacity
                                                onPress={() => handleApproveRequest(request.id)}
                                                className="flex-1 bg-gray-900 py-5 rounded-2xl items-center justify-center shadow-lg"
                                            >
                                                <Text className="text-white font-black text-[10px] uppercase tracking-widest">Confirm & Book Now</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                )}

                {/* Service Categories */}
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
                        {['All', 'Cleaning', 'Cooking', 'Maintenance'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedCategory(cat);
                                }}
                                className={`mr-3 px-6 py-3 rounded-2xl border ${selectedCategory === cat ? 'bg-orange-600 border-orange-600' : 'bg-white border-gray-100'}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat ? 'text-white' : 'text-gray-400'}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Services List */}
                <View className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Daily Home Operations</Text>
                    {HELP_SERVICES.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((service, idx) => (
                        <Animated.View
                            key={service.id}
                            entering={FadeInUp.delay(200 + idx * 100).duration(600).easing(Easing.inOut(Easing.ease))}
                        >
                            <View className="mb-4">
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        setViewItem(service);
                                    }}
                                    className={`rounded-[32px] p-6 border-2 flex-row items-center ${selectedService?.id === service.id ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-100 shadow-sm shadow-black/5'
                                        }`}
                                >
                                    <Image source={{ uri: service.image }} className="w-20 h-20 rounded-[24px]" />
                                    <View className="ml-5 flex-1">
                                        <View className="flex-row justify-between items-start mb-1">
                                            <Text className="text-gray-900 font-black text-lg">{service.title}</Text>
                                            <Text className="text-orange-600 font-black">₹{service.price}</Text>
                                        </View>
                                        <View className="flex-row items-center mb-2">
                                            <Text className="text-gray-400 text-[10px] font-bold uppercase">{service.category}</Text>
                                            <View className="w-1 h-1 bg-gray-200 rounded-full mx-2" />
                                            <Ionicons name="star" size={10} color="#F59E0B" />
                                            <Text className="text-gray-400 text-[10px] font-bold ml-1">{service.rating}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}
                </View>

                {/* Date & Shift Configuration */}
                {selectedService && (
                    <Animated.View entering={FadeInUp.delay(300).duration(600)}>
                        <View className="px-6 mb-10">
                            <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Schedule & Shift</Text>
                            <View className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                                {/* Date Selection */}
                                <View className="flex-row gap-x-3 mb-6">
                                    {['Today', 'Tomorrow', 'Other'].map((date) => (
                                        <TouchableOpacity
                                            key={date}
                                            onPress={() => setSelectedDate(date)}
                                            className={`flex-1 py-4 rounded-2xl items-center border ${selectedDate === date ? 'bg-orange-600 border-orange-600 shadow-lg shadow-orange-200' : 'bg-white border-gray-100'}`}
                                        >
                                            <Text className={`text-[10px] font-black uppercase ${selectedDate === date ? 'text-white' : 'text-gray-400'}`}>{date}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {/* Shift Selection */}
                                <View className="flex-row gap-x-3">
                                    {(['day', 'night', 'full'] as const).map((shift) => (
                                        <TouchableOpacity
                                            key={shift}
                                            onPress={() => setSelectedShift(shift)}
                                            className={`flex-1 py-5 rounded-[24px] items-center border ${selectedShift === shift ? 'bg-gray-900 border-gray-900 shadow-xl' : 'bg-gray-50 border-gray-100'
                                                }`}
                                        >
                                            <Ionicons
                                                name={shift === 'day' ? 'sunny' : shift === 'night' ? 'moon' : 'calendar'}
                                                size={22}
                                                color={selectedShift === shift ? '#F59E0B' : '#9CA3AF'}
                                            />
                                            <Text className={`text-[10px] font-black uppercase mt-2 ${selectedShift === shift ? 'text-white' : 'text-gray-400'}`}>
                                                {shift}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Service Configuration Section */}
                <Animated.View entering={FadeInUp.delay(550).duration(600).easing(Easing.inOut(Easing.ease))}>
                    <View className="px-6 mt-4">
                        <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-4 ml-1">SERVICE SETTINGS</Text>
                        <View className="bg-white rounded-[40px] p-8 border border-gray-100 mb-4 shadow-sm">
                            <View className="flex-row items-center mb-8">
                                <View className="w-14 h-14 bg-orange-50 rounded-[22px] items-center justify-center border border-orange-100">
                                    <Ionicons name="location" size={26} color="#F59E0B" />
                                </View>
                                <View className="ml-5 flex-1">
                                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SERVICE LOCATION</Text>
                                    <TextInput
                                        placeholder="e.g. 402, Sunshine Apts, Sector 4"
                                        value={address}
                                        onChangeText={setAddress}
                                        className="text-gray-900 font-bold text-sm"
                                        placeholderTextColor="#CBD5E1"
                                    />
                                </View>
                            </View>
                            <View className="flex-row items-center">
                                <View className="w-14 h-14 bg-orange-50 rounded-[22px] items-center justify-center border border-orange-100">
                                    <Ionicons name="chatbox-ellipses" size={26} color="#F59E0B" />
                                </View>
                                <View className="ml-5 flex-1">
                                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">NOTES / REQUIREMENTS</Text>
                                    <TextInput
                                        placeholder="Any specific requests?"
                                        value={notes}
                                        onChangeText={setNotes}
                                        className="text-gray-900 font-bold text-sm"
                                        placeholderTextColor="#CBD5E1"
                                    />
                                </View>
                            </View>
                        </View>
                        <View className="flex-row items-center px-4 mb-4">
                            <Ionicons name="information-circle" size={14} color="#94A3B8" />
                            <Text className="text-gray-400 text-[10px] font-bold ml-2 italic">Note: Money will be paid only after completing the service</Text>
                        </View>
                    </View>
                </Animated.View>
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
                        className="bg-white rounded-t-[15px] p-10 max-h-[85%] shadow-2xl"
                    >
                        {viewItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-10">
                                    <View className="w-20 h-2 bg-gray-100 rounded-full mb-10" />
                                    <Image source={{ uri: viewItem.image }} className="w-64 h-64 rounded-[50px] mb-8" />
                                    <Text className="text-[11px] font-black text-orange-500 uppercase tracking-[4px] mb-3">{viewItem.category}</Text>
                                    <Text className="text-4xl font-black text-gray-900 text-center mb-2">{viewItem.title}</Text>
                                    <View className="flex-row items-center">
                                        <Ionicons name="star" size={16} color="#F59E0B" />
                                        <Text className="text-gray-900 font-black text-lg ml-2">{viewItem.rating}</Text>
                                        <Text className="text-gray-400 font-bold text-base ml-2">({viewItem.reviews} reviews)</Text>
                                    </View>
                                </View>

                                <View className="gap-y-8 mb-12">
                                    <View>
                                        <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-3">Service Profile</Text>
                                        <Text className="text-gray-600 font-medium text-lg leading-7">{viewItem.description}</Text>
                                    </View>

                                    <View>
                                        <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-4">Included Tasks</Text>
                                        <View className="flex-row flex-wrap gap-3">
                                            {viewItem.tasks.map((task, si) => (
                                                <View key={si} className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                                    <Text className="text-gray-700 font-bold text-sm">{task}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mt-12">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pricing</Text>
                                        <Text className="text-gray-900 text-4xl font-black">₹{viewItem.price}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedService(viewItem);
                                            setViewItem(null);
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        }}
                                        className="bg-orange-600 px-12 py-6 rounded-[28px] shadow-xl shadow-orange-100"
                                    >
                                        <Text className="text-white font-black uppercase tracking-widest text-base">SELECT SERVICE</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setViewItem(null)}
                                    className="bg-gray-100 py-4 rounded-[28px] mt-6 items-center"
                                >
                                    <Text className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Go Back</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Payment Processing Gateway Simulation */}
            {orderStatus === 'paying' && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <View className="absolute inset-0 bg-white/95 items-center justify-center z-50">
                        <View className="items-center px-10">
                            <ActivityIndicator size="large" color="#F59E0B" />
                            <Text className="text-3xl font-black text-gray-900 mt-10 text-center">Security Protocol</Text>
                            <Text className="text-gray-500 font-medium text-center mt-4 leading-6">
                                Authorizing ₹{selectedService?.price} for domestic care...
                            </Text>
                            <View className="mt-12 bg-gray-50 p-8 rounded-[40px] w-full border border-gray-100">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-gray-400 font-bold">Banking Connect</Text>
                                    <Ionicons name="lock-closed" size={16} color="#F59E0B" />
                                </View>
                                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <Animated.View entering={FadeIn.duration(3000)} className="h-full bg-orange-500 w-full" />
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}

            {/* Premium Action Float */}
            {!isProcessing && selectedService && (
                <Animated.View
                    entering={FadeInUp.delay(200).duration(600).easing(Easing.inOut(Easing.ease))}
                    className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                    style={{ paddingBottom: Math.max(insets.bottom, 20) }}
                >
                    <View className="rounded-[44px] border border-gray-100 bg-white p-8 flex-row items-center justify-between shadow-2xl shadow-black/15">
                        <View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Fee</Text>
                            <Text className="text-gray-900 text-3xl font-black">₹{selectedService.price}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleCreateBooking}
                            disabled={isProcessing}
                            activeOpacity={0.8}
                            className="bg-orange-500 px-10 py-6 rounded-[28px] shadow-xl shadow-orange-200"
                        >
                            <Text className="text-white font-black text-base uppercase tracking-widest">
                                Confirm & Pay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}


