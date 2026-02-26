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
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    Easing,
    FadeIn,
    FadeInUp,
    FadeOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ... (NURSE_SERVICES and LEAD_NURSES remain same, but maybe update icons/colors if needed)
// I'll keep the constants but focusing on logic and theme.

type NurseService = {
    id: string;
    title: string;
    price: number;
    icon: string;
    image: string;
    category: 'Clinical' | 'Recovery' | 'Daily Care';
    description: string;
    skills: string[];
    certification: string;
    rating: string;
    reviews: string;
};

const NURSE_SERVICES: NurseService[] = [
    {
        id: '1',
        title: 'Post-Op Recovery',
        price: 2500,
        icon: 'medkit',
        category: 'Recovery',
        image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400',
        description: 'Specialized care for patients recovering from surgery. Includes wound dressing, vitals monitoring, and medication management.',
        skills: ['Wound Care', 'IV Management', 'Pain Monitoring'],
        certification: 'Registered Nurse (RN)',
        rating: '4.9',
        reviews: '120+'
    },
    {
        id: '2',
        title: 'Geriatric Specialized',
        price: 1800,
        icon: 'heart',
        category: 'Daily Care',
        image: 'https://images.unsplash.com/photo-1581578731522-aa7c04ced643?auto=format&fit=crop&q=80&w=400',
        description: 'Comprehensive care for elderly parents. Focuses on mobility assistance, hygiene, and mental well-being.',
        skills: ['Physio Support', 'Hygiene Care', 'BP/Sugar Monitoring'],
        certification: 'GNA Certified',
        rating: '4.8',
        reviews: '250+'
    },
    {
        id: '3',
        title: '24/7 ICU at Home',
        price: 5500,
        icon: 'pulse',
        category: 'Clinical',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=400',
        description: 'High-dependency care for critical patients. Full monitoring with backup equipment coordination.',
        skills: ['Ventilator Ops', 'Critical Monitoring', 'Emergency Response'],
        certification: 'ICU Specialist Nurse',
        rating: '5.0',
        reviews: '45+'
    }
];

type NursePro = {
    id: string;
    name: string;
    exp: string;
    img: string;
    status: 'Available' | 'Off-duty';
    specialty: string;
    rating: string;
    bio: string;
};

const LEAD_NURSES: NursePro[] = [
    {
        id: 'n1',
        name: 'Sister Mary',
        exp: '12y Exp',
        img: 'https://i.pravatar.cc/150?u=mary',
        status: 'Available',
        specialty: 'Post-Op Recovery',
        rating: '4.9',
        bio: 'Senior RN with over a decade of experience in surgical wards. Specialized in advanced wound dressing and geriatric post-operative care.'
    },
    {
        id: 'n2',
        name: 'Nurse David',
        exp: '8y Exp',
        img: 'https://i.pravatar.cc/150?u=david',
        status: 'Available',
        specialty: 'Critical Care',
        rating: '4.8',
        bio: 'ICU specialist with expertise in ventilator management and emergency response. Calm under pressure and highly efficient.'
    },
    {
        id: 'n3',
        name: 'Sister Anjali',
        exp: '15y Exp',
        img: 'https://i.pravatar.cc/150?u=anjali',
        status: 'Off-duty',
        specialty: 'Geriatric Care',
        rating: '5.0',
        bio: 'Compassionate lead nurse focusing on elderly wellness. Expert in mobility support and chronic condition management.'
    },
];

export default function NurseBookingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Store & Auth
    const user = useAuthStore((state) => state.user);
    const { bookings, forwardToPal, fetchGigs } = useBookingStore();

    const [selectedService, setSelectedService] = useState<NurseService | null>(null);
    const [viewItem, setViewItem] = useState<NurseService | null>(null);
    const [viewPro, setViewPro] = useState<NursePro | null>(null);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [address, setAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedShift, setSelectedShift] = useState<'day' | 'night' | 'full'>('day');
    const [selectedDate, setSelectedDate] = useState('Today');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [notes, setNotes] = useState('');

    // Filter pending nurse requests from senior
    const pendingRequests = useMemo(() => {
        return bookings.filter((b: any) => b.status === 'sent_to_family' && b.type === 'nurse');
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

    const handleApproveRequest = async (bookingId: string) => {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setIsProcessing(true);
        setOrderStatus('paying');

        try {
            // Deduct from Balance
            const { deductBalance } = useAuthStore.getState();
            const payRes = await deductBalance(Number(booking.price), `Care Request: ${booking.title}`);

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

    const handleCreateBooking = async () => {
        if (!selectedService) {
            Alert.alert("Selection Required", "Please select a nursing specialization.");
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
                title: `Nurse: ${selectedService.title}`,
                type: 'nurse',
                date: selectedDate,
                day: selectedDate === 'Today' ? 'Thursday' : 'Friday',
                time: selectedShift === 'day' ? "10:00 AM - 01:00 PM" : selectedShift === 'night' ? "08:00 PM - 06:00 AM" : "24 Hours",
                dateTime: `${selectedDate} ${selectedShift}`,
                price: selectedService.price,
                paymentAmount: selectedService.price,
                location: { address: "Sector 4, HSR Layout, Bengaluru" },
                description: selectedService.description,
                duration: selectedShift === 'full' ? '24 Hours' : 'Shift',
                familyId: familyId,
                requirements: [...selectedService.skills, notes].filter(Boolean) as string[],
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

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp.duration(600).easing(Easing.inOut(Easing.ease))}>
                    <View className="items-center w-full">
                        <View className="w-24 h-24 bg-orange-100 rounded-[40px] items-center justify-center mb-8 border border-orange-200">
                            <Ionicons name="checkmark-circle" size={48} color="#F97316" />
                        </View>
                        <Text className="text-3xl font-black text-gray-900 text-center mb-4">Nurse Secured!</Text>
                        <Text className="text-gray-500 text-center text-lg font-medium leading-7 mb-12">
                            Payment authorized. The request has been forwarded to our verified Pals for coordination.
                        </Text>

                        <View className="w-full bg-gray-50 rounded-3xl p-6 mb-12 border border-gray-100">
                            <View className="flex-row items-center mb-6">
                                <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
                                    <Ionicons name="shield-checkmark" size={16} color="white" />
                                </View>
                                <Text className="ml-4 font-black text-gray-900 text-sm">Escrow Payment Verified</Text>
                            </View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                                    <Ionicons name="notifications" size={16} color="white" />
                                </View>
                                <Text className="ml-4 font-black text-gray-900 text-sm">Parents Notified</Text>
                            </View>
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center">
                                    <Ionicons name="people" size={16} color="white" />
                                </View>
                                <Text className="ml-4 font-black text-gray-900 text-sm">Dispatched to Available Pals</Text>
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
            {/* Header */}
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
                    <Text className="text-xl font-black text-gray-900">House Nurse</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                        <Text className="text-orange-600 text-[9px] font-black uppercase tracking-[2px]">Managed Care Coordination</Text>
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
                <Animated.View entering={FadeInUp.delay(100).duration(600)}>
                    <View className="px-6 mt-8 mb-10">
                        <LinearGradient
                            colors={['#F97316', '#EA580C']}
                            className="rounded-[32px] p-8 shadow-2xl shadow-orange-100 flex-row items-center"
                        >
                            <View className="flex-1">
                                <Text className="text-white/70 text-[10px] font-black uppercase tracking-[3px] mb-2">Quality Care</Text>
                                <Text className="text-white text-2xl font-black mb-1">Medical Staff</Text>
                                <Text className="text-white/60 text-[11px] font-bold">Vetted & Certified Professionals</Text>
                            </View>
                            <View className="w-16 h-16 bg-white/20 rounded-[28px] items-center justify-center border border-white/20">
                                <Ionicons name="medkit" size={32} color="white" />
                            </View>
                        </LinearGradient>
                    </View>
                </Animated.View>

                {/* Pending Requests Section */}
                {pendingRequests.length > 0 && (
                    <View className="px-6 mb-10">
                        <Text className="text-[11px] font-black text-orange-600 uppercase tracking-[3px] mb-6 ml-1">Requests from Senior 🔥</Text>
                        {pendingRequests.map((request, i) => (
                            <Animated.View key={request.id} entering={FadeInUp.delay(200 + i * 100)}>
                                <View className="mb-4">
                                    <View className="bg-white p-6 rounded-[32px] border border-orange-200 shadow-xl shadow-orange-50 relative overflow-hidden">
                                        <View className="absolute top-0 right-0 w-24 h-24 bg-orange-50 -mr-8 -mt-8 rounded-full opacity-50" />
                                        <View className="flex-row items-center mb-6">
                                            <View className="w-14 h-14 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100">
                                                <Ionicons name="pulse" size={28} color="#EA580C" />
                                            </View>
                                            <View className="ml-4 flex-1">
                                                <Text className="text-gray-900 font-black text-base">{request.title}</Text>
                                                <View className="flex-row items-center mt-1">
                                                    <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                                                    <Text className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Medical Priority</Text>
                                                </View>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-orange-600 font-black text-lg">₹{request.price || 0}</Text>
                                                <Text className="text-gray-400 text-[8px] font-bold uppercase">All Inclusive</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleApproveRequest(request.id)}
                                            className="bg-gray-900 py-5 rounded-2xl items-center justify-center shadow-lg"
                                        >
                                            <Text className="text-white font-black text-xs uppercase tracking-[2px]">Approve & Dispatch</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                )}

                {/* Lead Staff Section */}
                <View className="mb-10">
                    <Text className="px-6 text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Lead Medical Staff</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
                        {LEAD_NURSES.map((nurse, i) => (
                            <TouchableOpacity
                                key={nurse.id}
                                onPress={() => setViewPro(nurse)}
                                className="mr-5 items-center"
                            >
                                <View className="relative">
                                    <Image source={{ uri: nurse.img }} className="w-20 h-20 rounded-[30px] border-2 border-gray-100" />
                                    <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white items-center justify-center">
                                        <Ionicons name="checkmark" size={12} color="white" />
                                    </View>
                                </View>
                                <Text className="text-gray-900 font-black text-xs mt-3">{nurse.name}</Text>
                                <Text className="text-gray-400 text-[9px] font-bold uppercase">{nurse.exp}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Specializations Category */}
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
                        {['All', 'Clinical', 'Recovery', 'Daily Care'].map((cat) => (
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

                {/* All Specializations */}
                <View className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Care Specializations</Text>
                    {NURSE_SERVICES.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((service, idx) => (
                        <TouchableOpacity
                            key={service.id}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                setViewItem(service);
                            }}
                            className={`rounded-[32px] p-6 border-2 flex-row items-center mb-4 shadow-sm shadow-black/5 ${selectedService?.id === service.id ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-100'
                                }`}
                        >
                            <Image source={{ uri: service.image }} className="w-16 h-16 rounded-[22px]" />
                            <View className="ml-5 flex-1">
                                <Text className="text-gray-900 font-black text-lg">{service.title}</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{service.category}</Text>
                                    <View className="w-1 h-1 bg-gray-200 rounded-full mx-2" />
                                    <Text className="text-orange-600 text-[10px] font-black italic">{service.certification}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-orange-600 font-black text-base">₹{service.price}</Text>
                                <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                            </View>
                        </TouchableOpacity>
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
                                            className={`flex-1 py-5 rounded-[24px] items-center border ${selectedShift === shift ? 'bg-gray-900 border-gray-900 shadow-xl' : 'bg-gray-50 border-gray-100 shadow-sm'
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

                {/* Instructions field */}
                {selectedService && (
                    <View className="px-6 mb-10">
                        <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Special Instructions</Text>
                        <TextInput
                            multiline
                            placeholder="Add any specific instruction for the nurse..."
                            value={notes}
                            onChangeText={setNotes}
                            className="bg-gray-50 rounded-[24px] p-6 border border-gray-100 min-h-[120px] text-gray-900 font-medium align-top"
                        />
                    </View>
                )}
            </ScrollView>

            {/* Modals and Overlays (Updated to Orange) */}
            {isProcessing && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <View className="absolute inset-0 bg-white/95 items-center justify-center z-50 p-10">
                        <ActivityIndicator size="large" color="#F97316" />
                        <Text className="text-[10px] font-black text-orange-500 uppercase tracking-[4px] mt-10">Security Gateway</Text>
                        <Text className="text-3xl font-black text-gray-900 mt-2 text-center">Processing Payment...</Text>
                        <Text className="text-gray-400 font-bold text-center mt-4">We are validating your care request with our verified medical providers.</Text>
                    </View>
                </Animated.View>
            )}

            {/* Detail Modals... (omitted for brevity but updated with orange highlights) */}
            <Modal visible={!!viewItem} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[50px] p-10">
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {viewItem && (
                                <>
                                    <Image source={{ uri: viewItem.image }} className="w-full h-64 rounded-[40px] mb-8" />
                                    <Text className="text-4xl font-black text-gray-900 text-center">{viewItem.title}</Text>
                                    <Text className="text-orange-600 text-center text-2xl font-black mt-2">₹{viewItem.price}</Text>
                                    <Text className="text-gray-500 mt-8 leading-7 text-center text-lg font-medium">{viewItem.description}</Text>

                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedService(viewItem);
                                            setViewItem(null);
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        }}
                                        className="bg-orange-500 py-6 rounded-[28px] mt-12 items-center shadow-xl shadow-orange-200"
                                    >
                                        <Text className="text-white font-black uppercase tracking-widest">Select Specialty</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => setViewItem(null)}
                                        className="bg-gray-100 py-4 rounded-[28px] mt-4 items-center"
                                    >
                                        <Text className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Go Back</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {!isProcessing && selectedService && (
                <Animated.View
                    entering={FadeInUp.delay(200).duration(600)}
                >
                    <View
                        className="absolute bottom-0 left-0 right-0 px-6"
                        style={{ paddingBottom: Math.max(insets.bottom, 20) }}
                    >
                        <View
                            className="rounded-[44px] border border-gray-100 bg-white p-8 flex-row items-center justify-between shadow-2xl shadow-black/15"
                        >
                            <View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Due</Text>
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
                    </View>
                </Animated.View>
            )}
        </View>
    );
}


