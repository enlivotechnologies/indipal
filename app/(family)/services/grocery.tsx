import { useAuthStore } from '@/store/authStore';
import { useErrandStore } from '@/store/errandStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeInUp
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



type GroceryItem = {
    id: string;
    title: string;
    price: number;
    image: string;
    category: 'Fresh' | 'Dairy' | 'Pantry' | 'Household';
    description: string;
    weight: string;
};

const GROCERY_ITEMS: GroceryItem[] = [
    {
        id: '1',
        title: 'Organic Bananas',
        price: 60,
        category: 'Fresh',
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=400',
        description: 'Naturally ripened, premium organic bananas sourced from certified farms. Rich in potassium.',
        weight: '1 kg'
    },
    {
        id: '2',
        title: 'Fresh Whole Milk',
        price: 75,
        category: 'Dairy',
        image: 'https://images.unsplash.com/photo-1550583724-125581fe2f8a?auto=format&fit=crop&q=80&w=400',
        description: 'Farm-fresh homogenized whole milk. Processed with high hygiene standards.',
        weight: '1 L'
    },
    {
        id: '3',
        title: 'Whole Wheat Atta',
        price: 450,
        category: 'Pantry',
        image: 'https://images.unsplash.com/photo-1509440159596-024903c777e4?auto=format&fit=crop&q=80&w=400',
        description: '100% whole wheat flour, stone-ground for maximum nutrition and fiber content.',
        weight: '5 kg'
    },
    {
        id: '4',
        title: 'Natural Honey',
        price: 320,
        category: 'Pantry',
        image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
        description: 'Pure, unprocessed wild forest honey. No added sugar or preservatives.',
        weight: '500g'
    },
    {
        id: '5',
        title: 'Liquid Dishwash',
        price: 180,
        category: 'Household',
        image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=400',
        description: 'Lemon-fresh deep cleaning liquid. Tough on grease, gentle on hands.',
        weight: '750ml'
    },
    {
        id: '6',
        title: 'Farm Fresh Eggs',
        price: 90,
        category: 'Dairy',
        image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=400',
        description: 'Protein-rich brown eggs from free-range chickens. Weekly quality checks.',
        weight: 'Pack of 6'
    }
];

export default function GroceryOrderScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Auth State - Primary Senior Logic
    const user = useAuthStore((state) => state.user);
    const parentAddress = user?.parentsDetails?.[0]?.address || 'Sector 4, HSR Layout, Bengaluru';

    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [viewItem, setViewItem] = useState<GroceryItem | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [search, setSearch] = useState('');
    const [address, setAddress] = useState(parentAddress);
    const [selectedPayment, setSelectedPayment] = useState<'wallet' | 'card'>('wallet');
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setOrderStatus('idle');
        });
        return unsubscribe;
    }, [navigation]);

    const addToCart = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    };

    const removeFromCart = (id: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCart(prev => {
            const next = { ...prev };
            if (next[id] > 1) next[id] -= 1;
            else delete next[id];
            return next;
        });
    };

    const cartTotal = GROCERY_ITEMS.reduce((sum, item) => sum + (item.price * (cart[item.id] || 0)), 0);

    const { addNotification } = useErrandStore();

    const handleConfirm = () => {
        setOrderStatus('paying');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => {
            setOrderStatus('confirmed');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            // Notify Senior
            addNotification({
                title: 'Grocery Order Placed',
                message: `Your family has ordered essentials for you. Arjun Singh will deliver them shortly.`,
                type: 'service',
            });
        }, 3000);
    };

    const filteredItems = useMemo(() => {
        return GROCERY_ITEMS.filter(item =>
            item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [search]);

    if (orderStatus === 'confirmed') {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp} className="items-center">
                    <View className="w-24 h-24 bg-emerald-50 rounded-[40px] items-center justify-center mb-8 border border-emerald-100">
                        <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4">Order Confirmed!</Text>
                    <Text className="text-gray-500 text-center text-lg font-medium leading-7 mb-12">
                        We&apos;ve notified Ramesh Chandra. Arjun Singh is being assigned to pick up the items.
                    </Text>

                    <View className="w-full bg-gray-50 rounded-3xl p-6 mb-12 border border-gray-100">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-gray-400 font-bold">Total Paid</Text>
                            <Text className="text-gray-900 font-black">₹{cartTotal}</Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                            <Text className="text-gray-400 font-bold">Delivery To</Text>
                            <Text className="text-gray-900 font-black" numberOfLines={1}>{address || 'Sector 4, HSR'}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.replace('/(family)/home')}
                        className="bg-gray-900 px-12 py-5 rounded-2xl shadow-xl shadow-black/20"
                    >
                        <Text className="text-white font-black uppercase tracking-widest">Done</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <View
                className="px-6 pb-6 pt-4 bg-white border-b border-gray-50 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 16) }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center bg-gray-50 rounded-xl"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-xl font-black text-gray-900">Essentials</Text>
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Grocery Hub</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowCart(true)}
                    className="w-10 h-10 items-center justify-center bg-gray-50 rounded-xl"
                >
                    <Ionicons name="cart-outline" size={22} color="#1F2937" />
                    {Object.keys(cart).length > 0 && (
                        <View className="absolute -top-1 -right-1 bg-orange-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-[10px] font-black">{Object.keys(cart).length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Visual Intro */}
                <View className="h-64 mb-8">
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600' }}
                        className="w-full h-full"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        className="absolute inset-0 p-8 justify-end"
                    >
                        <Text className="text-white text-3xl font-black">Fresh Every Day</Text>
                        <Text className="text-white/80 font-bold">Premium selection for your loved ones.</Text>
                    </LinearGradient>
                </View>

                {/* Search */}
                <View className="px-6 mb-8">
                    <View className="bg-gray-100 flex-row items-center px-6 py-4 rounded-2xl border border-gray-100">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search fresh items..."
                            value={search}
                            onChangeText={setSearch}
                            className="ml-3 flex-1 text-gray-800 font-bold"
                            placeholderTextColor="#4f4f4fff"
                        />
                    </View>
                </View>

                <View className="px-6">
                    <View className="flex-row flex-wrap justify-between">
                        {filteredItems.map((item, idx) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInUp.delay(idx * 100)}
                                className="w-[47%] mb-8"
                            >
                                <TouchableOpacity
                                    onPress={() => setViewItem(item)}
                                    activeOpacity={0.9}
                                    className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-50"
                                >
                                    <View className="h-40 bg-gray-100">
                                        <Image source={{ uri: item.image }} className="w-full h-full" />
                                        <TouchableOpacity
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                addToCart(item.id);
                                            }}
                                            className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full items-center justify-center shadow-lg"
                                        >
                                            <Ionicons name="add" size={24} color="#1F2937" />
                                        </TouchableOpacity>
                                    </View>
                                    <View className="p-4">
                                        <Text className="text-gray-900 font-black text-sm mb-1">{item.title}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold mb-3">{item.weight}</Text>
                                        <Text className="text-gray-900 font-black text-lg">₹{item.price}</Text>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </View>

                {/* Checkout Summary Section */}
                <View className="px-6 mt-4">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Delivery Details</Text>
                    <View className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 mb-8">
                        <View className="flex-row items-center mb-6">
                            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                                <Ionicons name="location" size={24} color="#F59E0B" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-[10px] font-black text-gray-400 uppercase">Deliver To</Text>
                                <TextInput
                                    placeholder="Enter parent's address..."
                                    value={address}
                                    onChangeText={setAddress}
                                    className="text-gray-900 font-bold text-sm"
                                    placeholderTextColor="#CBD5E1"
                                />
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                                <Ionicons name="card" size={24} color="#F59E0B" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-[10px] font-black text-gray-400 uppercase">Payment Method</Text>
                                <View className="flex-row gap-x-3 mt-1">
                                    <TouchableOpacity
                                        onPress={() => setSelectedPayment('wallet')}
                                        className={`px-4 py-2 rounded-xl border ${selectedPayment === 'wallet' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-100'}`}
                                    >
                                        <Text className={`text-[10px] font-black ${selectedPayment === 'wallet' ? 'text-white' : 'text-gray-400'}`}>WALLET</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setSelectedPayment('card')}
                                        className={`px-4 py-2 rounded-xl border ${selectedPayment === 'card' ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-100'}`}
                                    >
                                        <Text className={`text-[10px] font-black ${selectedPayment === 'card' ? 'text-white' : 'text-gray-400'}`}>CARD</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Float Checkout Bar */}
            <View
                className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-50"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold">Total Bill</Text>
                        <Text className="text-gray-900 text-3xl font-black">₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={cartTotal === 0 || orderStatus !== 'idle'}
                        className={`px-10 py-5 rounded-2xl shadow-xl ${cartTotal > 0 ? 'bg-orange-500 shadow-orange-100' : 'bg-gray-200 shadow-transparent'}`}
                    >
                        <Text className="text-white font-black uppercase tracking-widest">
                            {orderStatus === 'paying' ? 'Paying...' : 'Place Order'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Item Detail Modal */}
            <Modal
                visible={!!viewItem}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setViewItem(null)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8 pb-12">
                        {viewItem && (
                            <>
                                <View className="items-center mb-8">
                                    <View className="w-16 h-1.5 bg-gray-100 rounded-full mb-8" />
                                    <Image source={{ uri: viewItem.image }} className="w-full h-64 rounded-3xl mb-6" />
                                    <Text className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">{viewItem.category}</Text>
                                    <Text className="text-3xl font-black text-gray-900 text-center">{viewItem.title}</Text>
                                    <Text className="text-gray-400 font-bold text-lg mt-1">{viewItem.weight}</Text>
                                </View>

                                <Text className="text-gray-500 text-center text-lg font-medium leading-7 px-4 mb-10">
                                    {viewItem.description}
                                </Text>

                                <View className="flex-row items-center justify-between">
                                    <Text className="text-gray-900 text-4xl font-black">₹{viewItem.price}</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            addToCart(viewItem.id);
                                            setViewItem(null);
                                        }}
                                        className="bg-orange-500 px-12 py-5 rounded-2xl shadow-xl shadow-orange-100"
                                    >
                                        <Text className="text-white font-black uppercase tracking-widest">Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Shopping Cart Modal */}
            <Modal
                visible={showCart}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCart(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8 max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-2xl font-black text-gray-900">Your Cart</Text>
                            <TouchableOpacity onPress={() => setShowCart(false)}>
                                <Ionicons name="close" size={28} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {Object.entries(cart).map(([id, quantity]) => {
                                const item = GROCERY_ITEMS.find(i => i.id === id);
                                if (!item) return null;
                                return (
                                    <View key={id} className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                        <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl" />
                                        <View className="ml-4 flex-1">
                                            <Text className="text-gray-900 font-bold text-base mb-1">{item.title}</Text>
                                            <Text className="text-orange-500 font-black">₹{item.price}</Text>
                                        </View>
                                        <View className="flex-row items-center bg-white rounded-xl border border-gray-100 p-1">
                                            <TouchableOpacity onPress={() => removeFromCart(id)} className="w-8 h-8 items-center justify-center">
                                                <Ionicons name="remove" size={18} color="#1F2937" />
                                            </TouchableOpacity>
                                            <Text className="px-3 font-black text-gray-900">{quantity}</Text>
                                            <TouchableOpacity onPress={() => addToCart(id)} className="w-8 h-8 items-center justify-center">
                                                <Ionicons name="add" size={18} color="#1F2937" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}

                            {Object.keys(cart).length === 0 && (
                                <View className="items-center py-20">
                                    <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
                                    <Text className="text-gray-400 font-bold text-lg mt-4">Your cart is empty</Text>
                                </View>
                            )}
                        </ScrollView>

                        {cartTotal > 0 && (
                            <View className="mt-8 border-t border-gray-100 pt-8">
                                <View className="flex-row justify-between items-center mb-8">
                                    <Text className="text-gray-400 font-bold text-lg">Total Amount</Text>
                                    <Text className="text-gray-900 text-3xl font-black">₹{cartTotal}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCart(false);
                                        handleConfirm();
                                    }}
                                    className="bg-orange-500 py-6 rounded-2xl shadow-xl shadow-orange-100 items-center"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest">Pay & Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={{ height: insets.bottom }} />
                    </View>
                </View>
            </Modal>

            {/* Payment Processing Overlay */}
            {orderStatus === 'paying' && (
                <View className="absolute inset-0 bg-white/90 items-center justify-center z-50">
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text className="text-2xl font-black text-gray-900 mt-6">Processing Payment...</Text>
                    <Text className="text-gray-400 font-bold mt-2">Connecting to secure gateway</Text>
                </View>
            )}
        </View>
    );
}


