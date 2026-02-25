import { useErrandStore } from '@/store/errandStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
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
    FadeInUp,
    SlideInDown,
    SlideOutDown
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

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
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [viewItem, setViewItem] = useState<GroceryItem | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [search, setSearch] = useState('');
    const [address, setAddress] = useState('');
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
                <Animated.View entering={FadeInUp.duration(600).easing(Easing.inOut(Easing.ease))} className="items-center w-full">
                    <View className="w-24 h-24 bg-emerald-100 rounded-[40px] items-center justify-center mb-8 border border-emerald-200">
                        <Ionicons name="checkmark-circle" size={54} color="#10B981" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4">Order Placed!</Text>
                    <Text className="text-gray-500 text-center mb-10 font-medium">Your Pal has been notified and is heading to procurement.</Text>

                    <View className="w-full bg-emerald-50 rounded-[32px] p-8 mb-10 border border-emerald-100">
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                                <Ionicons name="wallet" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-emerald-900">₹{cartTotal} Escrow Secured</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                                <Ionicons name="notifications" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-emerald-900">Seniors Notified</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setCart({});
                            setOrderStatus('idle');
                            router.replace('/(family)/care' as any);
                        }}
                        className="bg-emerald-600 px-12 py-5 rounded-[24px] shadow-xl shadow-emerald-200 w-full"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-center">Return to Care Hub</Text>
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
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity
                    onPress={() => router.replace('/(family)/care' as any)}
                    className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-gray-900">Kitchen Essentials</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                        <Text className="text-emerald-600 text-[9px] font-black uppercase tracking-[2px]">Fresh & Quality Guaranteed</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setShowCart(true);
                    }}
                    className="w-12 h-12 items-center justify-center bg-emerald-50 rounded-2xl border border-emerald-100"
                >
                    <Ionicons name="cart-outline" size={22} color="#10B981" />
                    {Object.values(cart).filter(v => v > 0).length > 0 && (
                        <View className="absolute -top-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-[9px] font-black">{Object.keys(cart).length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
                className="flex-1"
            >
                {/* Clean Search */}
                <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mt-8 mb-6">
                    <View className="bg-gray-50 flex-row items-center px-6 py-4 rounded-[40px] border border-gray-100">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            placeholder="Find fresh groceries..."
                            className="ml-3 flex-1 text-gray-800 font-bold"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                </Animated.View>

                {/* Hero Promotion */}
                <Animated.View entering={FadeInUp.delay(150).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mb-10">
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={{ borderRadius: 15, overflow: 'hidden' }}
                        className="rounded-[44px] p-8 shadow-xl shadow-emerald-100"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1 mr-4">
                                <Text className="text-white/70 text-[10px] font-black uppercase tracking-[3px] mb-2">Quality First</Text>
                                <Text className="text-white text-2xl font-black mb-1">Direct Market Access</Text>
                                <Text className="text-white/70 text-xs font-medium">Your Pal hand-picks every item to ensure the best quality.</Text>
                            </View>
                            <View className="w-16 h-16 bg-white/20 rounded-3xl items-center justify-center border border-white/20 backdrop-blur-md">
                                <Ionicons name="leaf-outline" size={32} color="white" />
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Grid of Items */}
                <View className="px-6">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Daily Selections</Text>
                    <View className="flex-row flex-wrap justify-between ">
                        {filteredItems.map((item, idx) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInUp.delay(200 + idx * 100).duration(600).easing(Easing.inOut(Easing.ease))}
                                className={`mb-8 ${idx % 3 === 2 ? 'w-full' : 'w-[47%]'}`}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        setViewItem(item);
                                    }}
                                    className="bg-white rounded-[15px] border border-gray-100 p-5 shadow-sm"
                                >
                                    <Image source={{ uri: item.image }} className="w-full h-40 rounded-[12px] mb-4" />
                                    <View className="px-1">
                                        <Text className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">{item.category}</Text>
                                        <Text className="text-gray-900 font-bold text-base mb-3" numberOfLines={1}>{item.title}</Text>
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-gray-800 font-black text-lg">₹{item.price}</Text>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item.id);
                                                }}
                                                className={`w-10 h-10 rounded-2xl items-center justify-center ${cart[item.id] ? 'bg-emerald-600' : 'bg-gray-100'}`}
                                            >
                                                <Ionicons name={cart[item.id] ? "checkmark" : "add"} size={20} color={cart[item.id] ? "white" : "#4B5563"} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </View>

                {/* Delivery Information Section */}
                <Animated.View entering={FadeInUp.delay(450).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mt-4">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-4 ml-1">DELIVERY SETTINGS</Text>
                    <View className="bg-gray-50 rounded-[15px] p-8 border border-gray-100 mb-4">
                        <View className="flex-row items-center mb-8">
                            <View className="w-14 h-14 bg-white rounded-[22px] items-center justify-center shadow-sm border border-gray-100">
                                <Ionicons name="location" size={26} color="#10B981" />
                            </View>
                            <View className="ml-5 flex-1">
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DELIVERY ADDRESS</Text>
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
                            <View className="w-14 h-14 bg-white rounded-[22px] items-center justify-center shadow-sm border border-gray-100">
                                <Ionicons name="card" size={26} color="#10B981" />
                            </View>
                            <View className="ml-5 flex-1">
                                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PAYMENT METHOD</Text>
                                <View className="flex-row gap-x-3 mt-2">
                                    <TouchableOpacity
                                        onPress={() => setSelectedPayment('wallet')}
                                        className={`px-5 py-3 rounded-2xl border ${selectedPayment === 'wallet' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-100'}`}
                                    >
                                        <Text className={`text-[10px] font-black ${selectedPayment === 'wallet' ? 'text-white' : 'text-gray-400'}`}>WALLET</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setSelectedPayment('card')}
                                        className={`px-5 py-3 rounded-2xl border ${selectedPayment === 'card' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-100'}`}
                                    >
                                        <Text className={`text-[10px] font-black ${selectedPayment === 'card' ? 'text-white' : 'text-gray-400'}`}>CREDIT CARD</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className="flex-row items-center px-4 mb-4">
                        <Ionicons name="information-circle" size={14} color="#94A3B8" />
                        <Text className="text-gray-400 text-[10px] font-bold ml-2 italic">Note: Money will be paid only after completing the service</Text>
                    </View>
                </Animated.View>

                {/* Safety Promise */}
                <Animated.View entering={FadeInUp.delay(500).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mt-4">
                    <View className="bg-emerald-50 p-6 rounded-[24px] border border-emerald-100 flex-row items-center">
                        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-emerald-900 font-black">IndiPal Hygiene Code</Text>
                            <Text className="text-emerald-700/60 text-[11px] font-medium leading-4 mt-0.5">Contactless delivery and sanitized packaging is our standard.</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Float Action Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600).easing(Easing.inOut(Easing.ease))}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View className="bg-white border border-gray-100 rounded-[24px] p-6 flex-row items-center justify-between shadow-2xl">
                    <View className="ml-2">
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Basket Total</Text>
                        <Text className="text-gray-900 text-3xl font-black">₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowCart(true)}
                        disabled={cartTotal === 0}
                        activeOpacity={0.8}
                        className={`px-10 py-5 rounded-[24px] shadow-lg ${cartTotal > 0 ? 'bg-emerald-600 shadow-emerald-200' : 'bg-gray-200'}`}
                    >
                        <Text className="text-white font-black text-sm uppercase tracking-widest">SUBMIT BASKET</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Detail Modal */}
            <Modal
                visible={!!viewItem}
                transparent={true}
                animationType="none"
                onRequestClose={() => setViewItem(null)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setViewItem(null)} />
                    <Animated.View
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[50px] p-10 max-h-[85%] shadow-2xl"
                    >
                        {viewItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-10">
                                    <View className="w-16 h-1.5 bg-gray-100 rounded-full mb-10" />
                                    <Image source={{ uri: viewItem.image }} className="w-64 h-64 rounded-[40px] mb-8 shadow-lg" />
                                    <Text className="text-gray-900 font-black text-3xl text-center mb-2">{viewItem.title}</Text>
                                    <View className="flex-row items-center bg-emerald-50 px-4 py-2 rounded-full">
                                        <Text className="text-emerald-600 font-bold text-sm tracking-widest uppercase">{viewItem.weight}</Text>
                                    </View>
                                </View>

                                <View className="mb-10">
                                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-3">Product Description</Text>
                                    <Text className="text-gray-600 font-medium text-lg leading-7">{viewItem.description}</Text>
                                </View>

                                <View className="flex-row items-center justify-between mb-12">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Unit Price</Text>
                                        <Text className="text-gray-900 text-3xl font-black">₹{viewItem.price}</Text>
                                    </View>
                                    <View className="flex-row items-center bg-gray-50 rounded-3xl p-2 border border-gray-100">
                                        <TouchableOpacity
                                            onPress={() => removeFromCart(viewItem.id)}
                                            className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm"
                                        >
                                            <Ionicons name="remove" size={24} color="#1F2937" />
                                        </TouchableOpacity>
                                        <Text className="mx-6 text-xl font-black text-gray-900">{cart[viewItem.id] || 0}</Text>
                                        <TouchableOpacity
                                            onPress={() => addToCart(viewItem.id)}
                                            className="w-12 h-12 bg-emerald-600 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200"
                                        >
                                            <Ionicons name="add" size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setViewItem(null)}
                                    className="bg-gray-900 py-6 rounded-[28px] items-center mb-10"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest">Back to List</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </Animated.View>
                </View>
            </Modal>

            {/* Cart Modal */}
            <Modal
                visible={showCart}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowCart(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowCart(false)} />
                    <Animated.View
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[50px] p-8 max-h-[80%] shadow-2xl"
                    >
                        <View className="items-center mb-8">
                            <View className="w-16 h-1.5 bg-gray-100 rounded-full mb-6" />
                            <Text className="text-2xl font-black text-gray-900">Your Basket</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mb-8">
                            {GROCERY_ITEMS.filter(item => cart[item.id]).map((item) => (
                                <View key={item.id} className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                    <Image source={{ uri: item.image }} className="w-16 h-16 rounded-2xl" />
                                    <View className="ml-4 flex-1">
                                        <Text className="text-gray-900 font-bold text-base mb-1">{item.title}</Text>
                                        <Text className="text-emerald-600 font-black">₹{item.price}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <TouchableOpacity onPress={() => removeFromCart(item.id)} className="w-8 h-8 items-center justify-center bg-white rounded-xl border border-gray-100">
                                            <Ionicons name="remove" size={16} color="#1F2937" />
                                        </TouchableOpacity>
                                        <Text className="mx-3 font-black text-gray-900">{cart[item.id]}</Text>
                                        <TouchableOpacity onPress={() => addToCart(item.id)} className="w-8 h-8 items-center justify-center bg-emerald-600 rounded-xl">
                                            <Ionicons name="add" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        {cartTotal > 0 && (
                            <View className="bg-emerald-900 p-8 rounded-[32px] flex-row items-center justify-between">
                                <View>
                                    <Text className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1">Total</Text>
                                    <Text className="text-white text-3xl font-black">₹{cartTotal}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCart(false);
                                        handleConfirm();
                                    }}
                                    className="bg-white px-8 py-4 rounded-2xl shadow-xl shadow-black/20"
                                >
                                    <Text className="text-emerald-900 font-black uppercase tracking-widest text-xs">CHECKOUT</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <View style={{ height: insets.bottom + 20 }} />
                    </Animated.View>
                </View>
            </Modal>

            {/* Loading Modal */}
            {orderStatus === 'paying' && (
                <View className="absolute inset-0 bg-white/95 items-center justify-center z-50 backdrop-blur-3xl">
                    <ActivityIndicator size="large" color="#10B981" />
                    <Text className="text-2xl font-black text-gray-900 mt-8">Verifying Basket</Text>
                    <Text className="text-gray-400 font-bold mt-2">Connecting to Secure Gateway...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({});
