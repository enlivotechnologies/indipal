import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
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

    const [selectedService, setSelectedService] = useState<NurseService | null>(null);
    const [viewItem, setViewItem] = useState<NurseService | null>(null);
    const [viewPro, setViewPro] = useState<NursePro | null>(null);
    const [selectedShift, setSelectedShift] = useState<'day' | 'night' | 'full'>('day');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [selectedPayment, setSelectedPayment] = useState<'wallet' | 'card'>('wallet');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsConfirmed(false);
            setOrderStatus('idle');
        });
        return unsubscribe;
    }, [navigation]);

    const handleConfirm = () => {
        if (!selectedService) {
            Alert.alert("Selection Required", "Please select a nursing specialization.");
            return;
        }
        setOrderStatus('paying');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => {
            setOrderStatus('confirmed');
            setIsConfirmed(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }, 3000);
    };

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp.duration(600).easing(Easing.inOut(Easing.ease))} className="items-center w-full">
                    <View className="w-24 h-24 bg-emerald-100 rounded-[40px] items-center justify-center mb-8 border border-emerald-200">
                        <Ionicons name="medical" size={48} color="#059669" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4">Nurse Secured!</Text>

                    <View className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">₹{selectedService?.price} Escrow Payment Paid</Text>
                        </View>
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                                <Ionicons name="notifications" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Parents Notified of Booking</Text>
                        </View>
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center">
                                <Ionicons name="people" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Pals Notified for Coordination</Text>
                        </View>
                        <View className="flex-row items-center opacity-40">
                            <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center">
                                <Ionicons name="shield-checkmark" size={16} color="gray" />
                            </View>
                            <Text className="ml-4 font-black text-gray-700 text-sm">Nurse Profile (Vetted) dispatched...</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setIsConfirmed(false);
                            setOrderStatus('idle');
                            router.replace('/(senior)/services' as any);
                        }}
                        className="bg-gray-900 px-12 py-5 rounded-[24px] shadow-xl shadow-black/20 w-full"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-center">Back to Services</Text>
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
                    onPress={() => router.replace('/(senior)/services' as any)}
                    className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-gray-900">Health Expert</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                        <Text className="text-emerald-600 text-[9px] font-black uppercase tracking-[2px]">Certified Medical Staff</Text>
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
                <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mt-8 mb-10">
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        className="rounded-[24px] p-8 shadow-2xl shadow-emerald-100 flex-row items-center"
                    >
                        <View className="flex-1">
                            <Text className="text-white/70 text-[10px] font-black uppercase tracking-[3px] mb-2">Hospital Grade</Text>
                            <Text className="text-white text-2xl font-black mb-1">Nursing Care</Text>
                            <Text className="text-white/60 text-[11px] font-bold">2,400+ Vetted Professionals</Text>
                        </View>
                        <View className="w-16 h-16 bg-white/20 rounded-[28px] items-center justify-center border border-white/20">
                            <Ionicons name="medkit" size={32} color="white" />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Lead Staff Section */}
                <View className="mb-10">
                    <Text className="px-6 text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Meet Lead Nurses</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
                        {LEAD_NURSES.map((nurse, i) => (
                            <Animated.View key={nurse.id} entering={FadeInUp.delay(200 + i * 100).duration(600).easing(Easing.inOut(Easing.ease))} className="mr-4 items-center">
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setViewPro(nurse);
                                    }}
                                    className="items-center"
                                >
                                    <View className="relative">
                                        <Image source={{ uri: nurse.img }} className="w-20 h-20 rounded-[30px] border-2 border-gray-100" />
                                        <View className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white items-center justify-center ${nurse.status === 'Available' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                            <Ionicons name={nurse.status === 'Available' ? "checkmark" : "time"} size={12} color="white" />
                                        </View>
                                    </View>
                                    <Text className="text-gray-900 font-black text-xs mt-3">{nurse.name}</Text>
                                    <Text className="text-gray-400 text-[9px] font-bold uppercase">{nurse.exp}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </View>

                {/* Specializations */}
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
                        {['All', 'Clinical', 'Recovery', 'Daily Care'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedCategory(cat);
                                }}
                                className={`mr-3 px-6 py-3 rounded-2xl border ${selectedCategory === cat ? 'bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-100' : 'bg-white border-gray-100'}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat ? 'text-white' : 'text-gray-400'}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Select Specialization</Text>
                    {NURSE_SERVICES.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((service, idx) => (
                        <Animated.View
                            key={service.id}
                            entering={FadeInUp.delay(200 + idx * 100).duration(600).easing(Easing.inOut(Easing.ease))}
                            className="mb-4"
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setViewItem(service);
                                }}
                                className={`rounded-[24px] p-6 border-2 flex-row items-center ${selectedService?.id === service.id ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-50'
                                    }`}
                            >
                                <View className="relative">
                                    <Image source={{ uri: service.image }} className="w-20 h-20 rounded-[24px]" />
                                    <View className="absolute inset-0 bg-black/10 rounded-[24px] items-center justify-center">
                                        <Ionicons name="expand" size={20} color="white" />
                                    </View>
                                </View>
                                <View className="ml-5 flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className="text-gray-900 font-black text-lg">{service.title}</Text>
                                        <Text className="text-emerald-600 font-black">₹{service.price}</Text>
                                    </View>
                                    <View className="flex-row items-center mb-2">
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase">{service.certification}</Text>
                                        <View className="w-1 h-1 bg-gray-200 rounded-full mx-2" />
                                        <Ionicons name="star" size={10} color="#F59E0B" />
                                        <Text className="text-gray-400 text-[10px] font-bold ml-1">{service.rating}</Text>
                                    </View>
                                    <View className="flex-row flex-wrap gap-2">
                                        {service.skills.slice(0, 2).map((skill, si) => (
                                            <View key={si} className="bg-white/60 px-2 py-1 rounded-lg border border-gray-100">
                                                <Text className="text-[8px] font-black text-gray-500 uppercase">{skill}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Safety Promise */}
                <Animated.View entering={FadeInUp.delay(400).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mb-10">
                    <View className="bg-gray-50 p-8 rounded-[24px] border border-gray-100 flex-row items-center">
                        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-gray-900 font-black">Compliance Guaranteed</Text>
                            <Text className="text-gray-500 text-[11px] font-medium leading-4 mt-0.5">All staff are background verified and clinically certified for senior emergency response.</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Shift Configuration */}
                <Animated.View entering={FadeInUp.delay(500).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Schedule & Shift</Text>
                    <View className="bg-gray-50 rounded-[24px] p-8 border border-gray-100">
                        <View className="flex-row gap-x-3">
                            {(['day', 'night', 'full'] as const).map((shift) => (
                                <TouchableOpacity
                                    key={shift}
                                    onPress={() => setSelectedShift(shift)}
                                    className={`flex-1 py-4 rounded-2xl items-center border ${selectedShift === shift ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 shadow-sm'
                                        }`}
                                >
                                    <Ionicons
                                        name={shift === 'day' ? 'sunny' : shift === 'night' ? 'moon' : 'calendar'}
                                        size={20}
                                        color={selectedShift === shift ? 'white' : '#9CA3AF'}
                                    />
                                    <Text className={`text-[10px] font-black uppercase mt-2 ${selectedShift === shift ? 'text-white' : 'text-gray-400'}`}>
                                        {shift}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Animated.View>

                {/* Payment & Security */}
                <Animated.View entering={FadeInUp.delay(600).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Secure Transaction</Text>
                    <View className="bg-gray-900 rounded-[24px] p-8 shadow-2xl">
                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center">
                                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-white font-black">Escrow Protection</Text>
                                <Text className="text-white/40 text-[10px] font-bold uppercase py-0.5">Funds released after service</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-x-3">
                            <TouchableOpacity
                                onPress={() => setSelectedPayment('wallet')}
                                className={`flex-1 py-5 rounded-2xl items-center border ${selectedPayment === 'wallet' ? 'bg-white border-white' : 'border-white/10'}`}
                            >
                                <Text className={`text-[10px] font-black ${selectedPayment === 'wallet' ? 'text-gray-900' : 'text-white/30'}`}>WALLET</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setSelectedPayment('card')}
                                className={`flex-1 py-5 rounded-2xl items-center border ${selectedPayment === 'card' ? 'bg-white border-white' : 'border-white/10'}`}
                            >
                                <Text className={`text-[10px] font-black ${selectedPayment === 'card' ? 'text-gray-900' : 'text-white/30'}`}>CREDIT CARD</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Nurse Detail Modal */}
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
                        key={`modal-item-${viewItem?.id}`}
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[60px] p-10 max-h-[92%] shadow-2xl"
                    >
                        {viewItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-10">
                                    <View className="w-20 h-2 bg-gray-100 rounded-full mb-10" />
                                    <View className="relative">
                                        <Image source={{ uri: viewItem.image }} className="w-64 h-64 rounded-[50px] mb-8" />
                                        <View className="absolute -bottom-4 -right-4 bg-emerald-600 w-16 h-16 rounded-full items-center justify-center border-4 border-white shadow-lg">
                                            <Ionicons name="medkit" size={28} color="white" />
                                        </View>
                                    </View>
                                    <Text className="text-[11px] font-black text-emerald-500 uppercase tracking-[4px] mb-3">{viewItem.category}</Text>
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
                                        <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-4">Core Competencies</Text>
                                        <View className="flex-row flex-wrap gap-3">
                                            {viewItem.skills.map((skill, si) => (
                                                <View key={si} className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                                                    <Text className="text-emerald-700 font-bold text-sm">{skill}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>

                                    <View className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100">
                                        <Text className="text-indigo-900 font-black text-base mb-1">Clinical Certification</Text>
                                        <Text className="text-indigo-700 font-medium">{viewItem.certification} • Verified by Health Board</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mb-12">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Base Rate</Text>
                                        <Text className="text-gray-900 text-4xl font-black">₹{viewItem.price}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedService(viewItem);
                                            setViewItem(null);
                                        }}
                                        className="bg-emerald-600 px-12 py-6 rounded-[28px] shadow-xl shadow-emerald-100"
                                    >
                                        <Text className="text-white font-black uppercase tracking-widest text-base">SELECT SPECIALTY</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Nurse Pro Modal */}
            <Modal
                visible={!!viewPro}
                transparent={true}
                animationType="none"
                onRequestClose={() => setViewPro(null)}
            >
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(300)}
                    className="flex-1 bg-black/70 justify-end"
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setViewPro(null)}
                    />
                    <Animated.View
                        key={`modal-pro-${viewPro?.id}`}
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[60px] p-10 max-h-[85%] shadow-2xl"
                    >
                        {viewPro && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-10">
                                    <View className="w-20 h-2 bg-gray-100 rounded-full mb-10" />
                                    <View className="relative">
                                        <Image source={{ uri: viewPro.img }} className="w-48 h-48 rounded-[40px] mb-6" />
                                        <View className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white items-center justify-center ${viewPro.status === 'Available' ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                            <Ionicons name={viewPro.status === 'Available' ? "checkmark" : "time"} size={18} color="white" />
                                        </View>
                                    </View>
                                    <Text className="text-3xl font-black text-gray-900 mb-1">{viewPro.name}</Text>
                                    <View className="flex-row items-center mb-4">
                                        <Text className="text-emerald-600 font-black text-xs uppercase tracking-widest">{viewPro.specialty}</Text>
                                        <View className="w-1 h-1 bg-gray-200 rounded-full mx-2" />
                                        <Text className="text-gray-400 font-bold text-xs">{viewPro.exp}</Text>
                                    </View>
                                    <View className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                        <Ionicons name="star" size={14} color="#F59E0B" />
                                        <Text className="text-gray-900 font-black text-sm ml-2">{viewPro.rating}</Text>
                                        <Text className="text-gray-400 font-bold text-xs ml-1">Rating</Text>
                                    </View>
                                </View>

                                <View className="gap-y-6 mb-10">
                                    <View>
                                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-3">Professional Bio</Text>
                                        <Text className="text-gray-600 font-medium text-lg leading-7">{viewPro.bio}</Text>
                                    </View>

                                    <View className="flex-row items-center bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                                        <Ionicons name="shield-checkmark" size={24} color="#059669" />
                                        <View className="ml-4 flex-1">
                                            <Text className="text-emerald-900 font-black text-sm">Background Verified</Text>
                                            <Text className="text-emerald-700 text-[10px] font-bold uppercase py-0.5">Documents & Criminal Record Clear</Text>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setViewPro(null)}
                                    className="bg-gray-900 py-6 rounded-[28px] items-center shadow-xl shadow-black/15 mb-10"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest">Close Profile</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Payment Processing Gateway Simulation */}
            {orderStatus === 'paying' && (
                <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-white items-center justify-center z-50">
                    <View className="items-center px-10">
                        <ActivityIndicator size="large" color="#10B981" />
                        <Text className="text-3xl font-black text-gray-900 mt-10 text-center">Security Protocol</Text>
                        <Text className="text-gray-500 font-medium text-center mt-4 leading-6">
                            Authorizing ₹{selectedService?.price} for medical care...
                        </Text>
                        <View className="mt-12 bg-gray-50 p-8 rounded-[40px] w-full border border-gray-100">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-400 font-bold">Banking Connect</Text>
                                <Ionicons name="lock-closed" size={16} color="#10B981" />
                            </View>
                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <Animated.View entering={FadeIn.duration(3000)} className="h-full bg-emerald-500 w-full" />
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}

            {/* Premium Action Float */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600).easing(Easing.inOut(Easing.ease))}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'white']}
                    className="rounded-[44px] border border-gray-100 p-8 flex-row items-center justify-between shadow-2xl shadow-black/15"
                >
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Fee</Text>
                        <Text className="text-gray-900 text-3xl font-black">₹{selectedService?.price || 0}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={!selectedService || orderStatus !== 'idle'}
                        activeOpacity={0.8}
                        className={`px-12 py-6 rounded-[28px] shadow-xl ${selectedService ? 'bg-emerald-600 shadow-emerald-200' : 'bg-gray-200 shadow-transparent'
                            }`}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">
                            {orderStatus === 'paying' ? 'SECURING...' : 'SECURE EXPERT'}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </View>
    );
}


