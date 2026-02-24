import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
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

const { width, height } = Dimensions.get('window');

type PharmacyItem = {
    id: string;
    title: string;
    price: number;
    icon: string;
    image: string;
    category: 'OTC' | 'Supplements' | 'Hygiene' | 'Devices';
    description: string;
    info: string;
    usage: string;
    sideEffects: string;
    expiry: string;
    stock: string;
};

const PHARMACY_ITEMS: PharmacyItem[] = [
    {
        id: '1',
        title: 'Paracetamol 650mg',
        price: 30,
        icon: 'medkit',
        category: 'OTC',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400',
        description: 'Advanced pain and fever relief tablets. Effective for headaches, body aches, and post-viral fever recovery.',
        info: 'Strip of 15 Tabs',
        usage: '1 tablet every 6 hours after meals. Maximum 4 tablets in 24 hours.',
        sideEffects: 'Mild drowsiness, skin rash in rare cases.',
        expiry: 'Dec 2026',
        stock: 'In Stock'
    },
    {
        id: '2',
        title: 'Vitamin C 500mg',
        price: 150,
        icon: 'leaf',
        category: 'Supplements',
        image: 'https://images.unsplash.com/photo-1616671285415-888469d4993a?auto=format&fit=crop&q=80&w=400',
        description: 'Pure Vitamin C with Rose Hips for boosted immunity and skin health.',
        info: 'Bottle of 30',
        usage: '1 tablet daily after breakfast. Chew thoroughly before swallowing.',
        sideEffects: 'None reported if taken as directed.',
        expiry: 'Mar 2027',
        stock: 'Limited'
    },
    {
        id: '3',
        title: 'Advanced Sanitizer',
        price: 90,
        icon: 'water',
        category: 'Hygiene',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
        description: 'Kills 99.9% germs instantly. Infused with Aloe Vera and Vitamin E.',
        info: '200ml Bottle',
        usage: 'Apply palmful to hands and rub until dry.',
        sideEffects: 'Slight dryness with frequent use.',
        expiry: 'Oct 2025',
        stock: 'In Stock'
    },
    {
        id: '4',
        title: 'Digital Thermometer',
        price: 250,
        icon: 'thermometer',
        category: 'Devices',
        image: 'https://images.unsplash.com/photo-1590812517618-9719460067ce?auto=format&fit=crop&q=80&w=400',
        description: 'Instant and highly accurate reading with memory function and fever alarm.',
        info: 'One Unit (Battery Incl.)',
        usage: 'Place under tongue or in armpit until beep sounds.',
        sideEffects: 'N/A',
        expiry: 'Life Expectancy 5y',
        stock: 'High Demand'
    },
    {
        id: '5',
        title: 'Multivitamin Gold',
        price: 550,
        icon: 'star',
        category: 'Supplements',
        image: 'https://images.unsplash.com/photo-1584017945516-107040a45455?auto=format&fit=crop&q=80&w=400',
        description: 'Comprehensive daily essential vitality mix specifically formulated for seniors.',
        info: 'Jar of 60 Capsules',
        usage: '1 capsule daily with lukewarm milk or water after dinner.',
        sideEffects: 'Mild stomach upset if taken on empty stomach.',
        expiry: 'Jan 2027',
        stock: 'In Stock'
    },
    {
        id: '6',
        title: 'N95 Protection Mask',
        price: 120,
        icon: 'shield-checkmark',
        category: 'Hygiene',
        image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=400',
        description: 'BFE/PFE 95%+ filtration. Ergonomic design for long-term comfort.',
        info: 'Pack of 3',
        usage: 'Secure over nose and chin. Replace after 30 hours of use.',
        sideEffects: 'N/A',
        expiry: 'Single Use',
        stock: 'In Stock'
    }
];

export default function PharmacyOrderingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<Record<string, number>>({});
    const [address, setAddress] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [selectedItem, setSelectedItem] = useState<PharmacyItem | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [prescriptionUri, setPrescriptionUri] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [selectedPayment, setSelectedPayment] = useState<'wallet' | 'card'>('wallet');
    const [showCart, setShowCart] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsConfirmed(false);
            setOrderStatus('idle');
            setCart({});
        });
        return unsubscribe;
    }, [navigation]);

    const toggleItem = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCart(prev => ({
            ...prev,
            [id]: prev[id] ? 0 : 1
        }));
    };

    const filteredItems = useMemo(() => {
        return PHARMACY_ITEMS.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    const cartTotal = useMemo(() => {
        return PHARMACY_ITEMS.reduce((sum, item) => {
            return sum + (cart[item.id] ? item.price : 0);
        }, 0);
    }, [cart]);

    const handleUploadPrescription = () => {
        setIsUploading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // Simulate high-fidelity upload
        setTimeout(() => {
            setIsUploading(false);
            setPrescriptionUri('https://images.unsplash.com/photo-1584017945516-107040a45455?auto=format&fit=crop&q=80&w=100');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 2000);
    };

    const handleConfirm = () => {
        if (cartTotal === 0) {
            Alert.alert("Selection Required", "Please add at least one item to your cart.");
            return;
        }
        setOrderStatus('paying');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Simulate Secure Payment Processing
        setTimeout(() => {
            setOrderStatus('confirmed');
            setIsConfirmed(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 3000);
    };

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp.duration(600).easing(Easing.inOut(Easing.ease))} className="items-center w-full">
                    <View className="w-24 h-24 bg-indigo-100 rounded-[40px] items-center justify-center mb-8 border border-indigo-200">
                        <Ionicons name="medical" size={48} color="#6366F1" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4">Meds Secured!</Text>

                    <View className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Escrow Payment (₹{cartTotal}) Paid</Text>
                        </View>
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-indigo-500 rounded-full items-center justify-center">
                                <Ionicons name="notifications" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Parents (Seniors) Notified</Text>
                        </View>

                        <View className="bg-white p-4 rounded-2xl border border-gray-100 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center">
                                    <Ionicons name="person" size={20} color="white" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-black text-sm">Priya Verma</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Assigned Pal</Text>
                                </View>
                            </View>
                            <View className="flex-row gap-x-2">
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        router.push({ pathname: '/(family)/chat/[id]', params: { id: '4' } });
                                    }}
                                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                                >
                                    <Ionicons name="chatbubble-outline" size={18} color="#6366F1" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        Linking.openURL('tel:+919876543210');
                                    }}
                                    className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                                >
                                    <Ionicons name="call" size={18} color="#10B981" />
                                </TouchableOpacity>
                            </View>
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
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Premium Header */}
            <View
                className="px-6 pb-6 pt-4 bg-white/95 backdrop-blur-3xl border-b border-gray-50 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity
                    onPress={() => router.replace('/(family)/care' as any)}
                    className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-gray-900">Pharmacy Hub</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                        <Text className="text-indigo-600 text-[9px] font-black uppercase tracking-[2px]">Verified Medical Supplies</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setShowCart(true);
                    }}
                    className="w-12 h-12 items-center justify-center bg-indigo-50 rounded-2xl border border-indigo-100"
                >
                    <Ionicons name="medical-outline" size={22} color="#6366F1" />
                    {Object.values(cart).filter(v => v > 0).length > 0 && (
                        <View className="absolute -top-1 -right-1 bg-indigo-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-[9px] font-black">{Object.values(cart).filter(v => v > 0).length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
                className="flex-1"
            >
                {/* Search Bar - PROMINENT */}
                <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mt-8 mb-4">
                    <View className="bg-gray-100 flex-row items-center px-6 py-5 rounded-[32px] border border-gray-100 shadow-sm shadow-black/5">
                        <Ionicons name="search" size={22} color="#9CA3AF" />
                        <TextInput
                            placeholder="Find medicine, equipment or supplies..."
                            value={search}
                            onChangeText={setSearch}
                            className="ml-4 flex-1 text-gray-800 font-bold text-base"
                            placeholderTextColor="#4f4f4fff"
                        />
                    </View>
                </Animated.View>

                {/* Prescription Upload Card - EXTREMELY INTERACTIVE */}
                <Animated.View entering={FadeInUp.delay(150).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mb-10">
                    <TouchableOpacity
                        disabled={isUploading}
                        className={`p-8 rounded-[24px] flex-row items-center justify-between shadow-2xl overflow-hidden border-2 transition-all ${prescriptionUri ? 'bg-emerald-50 border-emerald-200 shadow-emerald-50' : 'bg-indigo-600 border-indigo-400 shadow-indigo-100'
                            }`}
                        onPress={handleUploadPrescription}
                    >
                        <View className="flex-1">
                            <Text className={`${prescriptionUri ? 'text-emerald-600' : 'text-white/70'} text-[10px] font-black uppercase tracking-[3px] mb-2`}>
                                {prescriptionUri ? 'ANALYZED' : 'PHARMACIST DIRECT'}
                            </Text>
                            <Text className={`${prescriptionUri ? 'text-emerald-900' : 'text-white'} text-2xl font-black mb-1`}>
                                {isUploading ? 'Scanning Script...' : prescriptionUri ? 'Verified Prescription' : 'Upload Rx Photo'}
                            </Text>
                            <Text className={`${prescriptionUri ? 'text-emerald-600/60' : 'text-white/60'} text-[11px] font-bold`}>
                                {prescriptionUri ? 'Items will be added automatically' : 'Our Pals will verify with the pharmacist'}
                            </Text>
                        </View>
                        <View className={`w-16 h-16 rounded-[24px] items-center justify-center border-2 ${prescriptionUri ? 'bg-emerald-500 border-emerald-400' : 'bg-white/20 border-white/30'
                            }`}>
                            {isUploading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Ionicons name={prescriptionUri ? "checkmark-done" : "camera"} size={32} color="white" />
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Medical Items Masonry Grid */}
                <View className="px-6">
                    <View className="flex-row justify-between items-end mb-6">
                        <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] ml-1">Reliable Care Supplies</Text>
                        <Text className="text-[10px] font-bold text-indigo-600 uppercase">View All</Text>
                    </View>
                    <View className="flex-row flex-wrap justify-between">
                        {filteredItems.map((item, idx) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInUp.delay(200 + idx * 100).duration(600).easing(Easing.inOut(Easing.ease))}
                                className={`mb-8 ${idx % 3 === 2 ? 'w-full' : 'w-[47%]'}`}
                            >
                                <TouchableOpacity
                                    onPress={() => setSelectedItem(item)}
                                    activeOpacity={0.9}
                                    className={`rounded-[15px] overflow-hidden border-2 shadow-md ${cart[item.id] ? 'border-indigo-500 bg-indigo-50' : 'border-gray-50 bg-white'
                                        }`}
                                >
                                    <View className="h-44 relative bg-gray-100">
                                        <Image source={{ uri: item.image }} className="w-full h-full" />
                                        <LinearGradient
                                            colors={['rgba(0,0,0,0.1)', 'transparent']}
                                            className="absolute inset-0"
                                        />
                                        <View className="absolute top-4 left-4 right-4 flex-row justify-between items-start">
                                            <View className="bg-white/95 px-3 py-1.5 rounded-2xl border border-white/20 shadow-sm">
                                                <Text className="text-[8px] font-black text-indigo-900 uppercase tracking-widest">{item.category}</Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    toggleItem(item.id);
                                                }}
                                                className={`w-10 h-10 rounded-2xl items-center justify-center border-2 ${cart[item.id] ? 'bg-indigo-500 border-indigo-500' : 'bg-white/80 border-white'
                                                    } shadow-sm`}
                                            >
                                                <Ionicons name={cart[item.id] ? "checkmark" : "add"} size={20} color={cart[item.id] ? "white" : "#1F2937"} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View className="p-6">
                                        <Text className="text-gray-900 font-black text-base mb-1 leading-tight">{item.title}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold mb-4" numberOfLines={1}>{item.info}</Text>
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-indigo-600 font-black text-xl">₹{item.price}</Text>
                                            <View className="bg-gray-100 px-3 py-1 rounded-xl">
                                                <Text className="text-[9px] font-black text-gray-500 uppercase">See Info</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </View>

                {/* Delivery Information Section */}
                <Animated.View entering={FadeInUp.delay(500).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mt-4">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-4 ml-1">DELIVERY SETTINGS</Text>
                    <View className="bg-gray-50 rounded-[48px] p-8 border border-gray-100 mb-4">
                        <View className="flex-row items-center mb-8">
                            <View className="w-14 h-14 bg-white rounded-[22px] items-center justify-center shadow-sm border border-gray-100">
                                <Ionicons name="location" size={26} color="#6366F1" />
                            </View>
                            <View className="ml-5 flex-1">
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TARGET PHARMACY</Text>
                                <TextInput
                                    placeholder="e.g. Apollo Pharmacy, Sector 4"
                                    value={address}
                                    onChangeText={setAddress}
                                    className="text-gray-900 font-bold text-sm"
                                    placeholderTextColor="#CBD5E1"
                                />
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View className="w-14 h-14 bg-white rounded-[22px] items-center justify-center shadow-sm border border-gray-100">
                                <Ionicons name="card" size={26} color="#6366F1" />
                            </View>
                            <View className="ml-5 flex-1">
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PAYMENT METHOD</Text>
                                <View className="flex-row gap-x-3 mt-2">
                                    <TouchableOpacity
                                        onPress={() => setSelectedPayment('wallet')}
                                        className={`px-5 py-3 rounded-2xl border ${selectedPayment === 'wallet' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-100'}`}
                                    >
                                        <Text className={`text-[10px] font-black ${selectedPayment === 'wallet' ? 'text-white' : 'text-gray-400'}`}>WALLET</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setSelectedPayment('card')}
                                        className={`px-5 py-3 rounded-2xl border ${selectedPayment === 'card' ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-gray-100'}`}
                                    >
                                        <Text className={`text-[10px] font-black ${selectedPayment === 'card' ? 'text-white' : 'text-gray-400'}`}>CREDIT CARD</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className="flex-row items-center px-4 mb-10">
                        <Ionicons name="information-circle" size={14} color="#94A3B8" />
                        <Text className="text-gray-400 text-[10px] font-bold ml-2 italic">Note: Money will be paid only after completing the service</Text>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Medicine Detail Modal - HIGH FIDELITY */}
            <Modal
                visible={!!selectedItem}
                transparent={true}
                animationType="none"
                onRequestClose={() => setSelectedItem(null)}
            >
                <View className="flex-1 bg-black/70 justify-end">
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ flex: 1 }}
                        onPress={() => setSelectedItem(null)}
                    />
                    <Animated.View
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[60px] p-10 max-h-[90%] shadow-2xl"
                    >
                        {selectedItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-10">
                                    <View className="w-20 h-2 bg-gray-100 rounded-full mb-10" />
                                    <View className="relative">
                                        <Image source={{ uri: selectedItem.image }} className="w-64 h-64 rounded-[50px] mb-8" />
                                        <View className="absolute -bottom-4 -right-4 bg-indigo-600 w-16 h-16 rounded-full items-center justify-center border-4 border-white shadow-lg">
                                            <Ionicons name={selectedItem.icon as any} size={28} color="white" />
                                        </View>
                                    </View>
                                    <Text className="text-[11px] font-black text-indigo-500 uppercase tracking-[4px] mb-3">{selectedItem.category}</Text>
                                    <Text className="text-4xl font-black text-gray-900 text-center mb-2">{selectedItem.title}</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-gray-400 font-bold text-base">{selectedItem.info}</Text>
                                        <View className="w-1.5 h-1.5 bg-gray-200 rounded-full mx-4" />
                                        <Text className="text-emerald-500 font-bold text-base">{selectedItem.stock}</Text>
                                    </View>
                                </View>

                                <View className="gap-y-8 mb-12">
                                    <View>
                                        <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-3">Product Profile</Text>
                                        <Text className="text-gray-600 font-medium text-lg leading-7">{selectedItem.description}</Text>
                                    </View>

                                    <View className="flex-row justify-between border-y border-gray-100 py-6">
                                        <View>
                                            <Text className="text-[10px] font-black text-gray-400 uppercase mb-1">Expiry Date</Text>
                                            <Text className="font-bold text-gray-900">{selectedItem.expiry}</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[10px] font-black text-gray-400 uppercase mb-1">Verified By</Text>
                                            <Text className="font-bold text-indigo-600">Enlivo Health</Text>
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-4">Administration Guide</Text>
                                        <View className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex-row items-start">
                                            <View className="w-10 h-10 bg-indigo-500 rounded-2xl items-center justify-center">
                                                <Ionicons name="bulb" size={22} color="white" />
                                            </View>
                                            <View className="ml-5 flex-1">
                                                <Text className="text-indigo-900 font-bold text-base mb-1">Dosage & Usage</Text>
                                                <Text className="text-indigo-700/80 font-medium leading-6">{selectedItem.usage}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {selectedItem.sideEffects !== 'N/A' && (
                                        <View>
                                            <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-4">Safety Information</Text>
                                            <View className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex-row items-start">
                                                <View className="w-10 h-10 bg-orange-500 rounded-2xl items-center justify-center">
                                                    <Ionicons name="warning" size={22} color="white" />
                                                </View>
                                                <View className="ml-5 flex-1">
                                                    <Text className="text-orange-900 font-bold text-base mb-1">Potential Side Effects</Text>
                                                    <Text className="text-orange-700/80 font-medium leading-6">{selectedItem.sideEffects}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>

                                <View className="flex-row items-center justify-between mb-12">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pricing</Text>
                                        <Text className="text-gray-900 text-4xl font-black">₹{selectedItem.price}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            toggleItem(selectedItem.id);
                                            setSelectedItem(null);
                                        }}
                                        className={`px-12 py-6 rounded-[28px] shadow-xl ${cart[selectedItem.id] ? 'bg-red-500 shadow-red-100' : 'bg-indigo-600 shadow-indigo-100'}`}
                                    >
                                        <Text className="text-white font-black uppercase tracking-widest text-base">
                                            {cart[selectedItem.id] ? 'REMOVE ITEM' : 'ADD TO CART'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </Animated.View>
                </View>
            </Modal>

            {/* Premium Cart Drawer Modal */}
            <Modal
                visible={showCart}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowCart(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{ flex: 1 }}
                        onPress={() => setShowCart(false)}
                    />
                    <Animated.View
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[50px] p-8 max-h-[85%] shadow-2xl"
                    >
                        <View className="items-center mb-8">
                            <View className="w-16 h-1.5 bg-gray-100 rounded-full mb-6" />
                            <Text className="text-2xl font-black text-gray-900">Medical Cart</Text>
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Review verified supplies</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
                            {PHARMACY_ITEMS.filter(item => cart[item.id]).length > 0 ? (
                                PHARMACY_ITEMS.filter(item => cart[item.id]).map((item) => (
                                    <View key={item.id} className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                        <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl" />
                                        <View className="ml-4 flex-1">
                                            <Text className="text-gray-900 font-bold text-base mb-1">{item.title}</Text>
                                            <Text className="text-indigo-600 font-black">₹{item.price}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => toggleItem(item.id)}
                                            className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-100"
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            ) : (
                                <View className="items-center py-20">
                                    <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="cart-outline" size={32} color="#D1D5DB" />
                                    </View>
                                    <Text className="text-gray-400 font-bold text-lg">Your cart is empty</Text>
                                    <Text className="text-gray-400 text-xs mt-1">Add medicines to review them here</Text>
                                </View>
                            )}
                        </ScrollView>

                        {cartTotal > 0 && (
                            <View className="bg-gray-900 p-8 rounded-[38px] flex-row items-center justify-between">
                                <View>
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Hub Price</Text>
                                    <Text className="text-white text-3xl font-black">₹{cartTotal}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCart(false);
                                        handleConfirm();
                                    }}
                                    className="bg-indigo-500 px-8 py-4 rounded-2xl"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest text-[11px]">CHECKOUT</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={{ height: insets.bottom + 20 }} />
                    </Animated.View>
                </View>
            </Modal>

            {/* Payment Processing Gateway Simulation */}
            {orderStatus === 'paying' && (
                <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-white items-center justify-center z-50">
                    <View className="items-center px-10">
                        <ActivityIndicator size="large" color="#6366F1" />
                        <Text className="text-3xl font-black text-gray-900 mt-10 text-center">Secure Transaction</Text>
                        <Text className="text-gray-500 font-medium text-center mt-4 leading-6">
                            Authorizing ₹{cartTotal} from your {selectedPayment === 'wallet' ? 'Enlivo Wallet' : 'Credit Card'}...
                        </Text>
                        <View className="mt-12 bg-gray-50 p-8 rounded-[40px] w-full border border-gray-100">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-400 font-bold">Encrypted Connection</Text>
                                <Ionicons name="lock-closed" size={16} color="#10B981" />
                            </View>
                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <Animated.View entering={SlideInDown.duration(3000)} className="h-full bg-indigo-500 w-full" />
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}

            {/* Ultimate Control Float Action Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600).easing(Easing.inOut(Easing.ease))}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.9)', 'white']}
                    style={{ borderRadius: 15, overflow: 'hidden' }}
                    className="rounded-[44px] border border-gray-100 p-8 flex-row items-center justify-between shadow-2xl shadow-black/15"
                >
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Grand Total</Text>
                        <Text className="text-gray-900 text-3xl font-black">₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={cartTotal === 0 || orderStatus !== 'idle'}
                        activeOpacity={0.8}
                        className={`px-12 py-6 rounded-[28px] shadow-xl ${cartTotal > 0 ? 'bg-indigo-600 shadow-indigo-200' : 'bg-gray-200 shadow-transparent'
                            }`}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">
                            {orderStatus === 'paying' ? 'AUTHORIZING' : 'PLACE ORDER'}
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({});
