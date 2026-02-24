import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
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

const { width } = Dimensions.get('window');

type GroceryItem = {
    id: string;
    title: string;
    price: number;
    image: string;
    category: 'Essentials' | 'Nutrition' | 'Household';
    description: string;
    weight: string;
};

const GROCERY_ITEMS: GroceryItem[] = [
    {
        id: '1',
        title: 'Organic Apples',
        price: 180,
        category: 'Nutrition',
        image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400',
        description: 'Fresh organic apples sourced from local orchards. High in fiber and Vitamin C.',
        weight: '1 kg'
    },
    {
        id: '2',
        title: 'Whole Wheat Bread',
        price: 55,
        category: 'Essentials',
        image: 'https://images.unsplash.com/photo-1509440159596-024903c777e4?auto=format&fit=crop&q=80&w=400',
        description: 'Fiber-rich whole wheat bread, baked fresh daily. No added preservatives.',
        weight: '400g'
    },
    {
        id: '3',
        title: 'Herbal Green Tea',
        price: 350,
        category: 'Nutrition',
        image: 'https://images.unsplash.com/photo-1544787210-2211d7c86294?auto=format&fit=crop&q=80&w=400',
        description: 'Premium loose leaf green tea with jasmine hints. Rich in antioxidants.',
        weight: '250g'
    },
    {
        id: '4',
        title: 'Liquid Detergent',
        price: 420,
        category: 'Household',
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400',
        description: 'Tough on stains, gentle on fabrics. Hypoallergenic formula.',
        weight: '2 L'
    }
];

export default function GroceryOrderScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [cart, setCart] = useState<{ [key: string]: number }>({});
    const [viewItem, setViewItem] = useState<GroceryItem | null>(null);
    const [showCart, setShowCart] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsConfirmed(false);
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

    const handleConfirm = () => {
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
                    <View className="w-24 h-24 bg-cyan-100 rounded-[40px] items-center justify-center mb-8 border border-cyan-200">
                        <Ionicons name="cart" size={48} color="#0891B2" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4">Order Placed!</Text>

                    <View className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">₹{cartTotal} Escrow Payment Paid</Text>
                        </View>
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                                <Ionicons name="notifications" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Pal Notified for Procurement</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center">
                                <Ionicons name="map" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Live Tracking Initiated</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            setCart({});
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
                    <Text className="text-xl font-black text-gray-900">Grocery Hub</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-cyan-500 rounded-full mr-2" />
                        <Text className="text-cyan-600 text-[9px] font-black uppercase tracking-[2px]">Fresh Essentials Only</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setShowCart(true);
                    }}
                    className="w-12 h-12 items-center justify-center bg-cyan-50 rounded-2xl border border-cyan-100"
                >
                    <Ionicons name="cart-outline" size={22} color="#0891B2" />
                    {Object.values(cart).length > 0 && (
                        <View className="absolute -top-1 -right-1 bg-cyan-600 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-[9px] font-black">{Object.values(cart).length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
                className="flex-1"
            >
                {/* Visual Intro */}
                <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mt-8 mb-10">
                    <LinearGradient
                        colors={['#06B6D4', '#0891B2']}
                        className="rounded-[24px] p-8 shadow-2xl shadow-cyan-100 flex-row items-center"
                    >
                        <View className="flex-1">
                            <Text className="text-white/70 text-[10px] font-black uppercase tracking-[3px] mb-2">Quality Check</Text>
                            <Text className="text-white text-2xl font-black mb-1">Kitchen Stock</Text>
                            <Text className="text-white/60 text-[11px] font-bold">Hygiene-led Procurement</Text>
                        </View>
                        <View className="w-16 h-16 bg-white/20 rounded-[28px] items-center justify-center border border-white/20">
                            <Ionicons name="restaurant" size={32} color="white" />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Categories */}
                <View className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Organic Selection</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {GROCERY_ITEMS.map((item, idx) => (
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
                                    className="bg-white rounded-[40px] border border-gray-100 p-4 shadow-sm"
                                >
                                    <Image source={{ uri: item.image }} className="w-full h-40 rounded-[32px] mb-5" />
                                    <View className="px-2">
                                        <Text className="text-[8px] font-black text-cyan-600 uppercase tracking-widest mb-1">{item.category}</Text>
                                        <Text className="text-gray-900 font-black text-base" numberOfLines={1}>{item.title}</Text>
                                        <View className="flex-row justify-between items-center mt-3">
                                            <Text className="text-gray-400 font-bold text-sm">₹{item.price}</Text>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item.id);
                                                }}
                                                className="w-10 h-10 bg-cyan-600 rounded-2xl items-center justify-center shadow-lg shadow-cyan-200"
                                            >
                                                <Ionicons name="add" size={20} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </View>

                {/* Safety Promise */}
                <Animated.View entering={FadeInUp.delay(500).duration(600).easing(Easing.inOut(Easing.ease))} className="px-6 mt-4">
                    <View className="bg-gray-50 p-8 rounded-[24px] border border-gray-100 flex-row items-center">
                        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                            <Ionicons name="sparkles" size={24} color="#0891B2" />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-gray-900 font-black">Strict Hygiene Protocol</Text>
                            <Text className="text-gray-500 text-[11px] font-medium leading-4 mt-0.5">Every item is sanitized and quality-checked twice before dispatch.</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Custom Bottom Actions */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600).easing(Easing.inOut(Easing.ease))}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View className="bg-gray-900/95 rounded-[44px] border border-white/10 p-8 flex-row items-center justify-between shadow-2xl">
                    <View>
                        <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Hub Total</Text>
                        <Text className="text-white text-3xl font-black">₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowCart(true)}
                        disabled={cartTotal === 0}
                        activeOpacity={0.8}
                        className={`px-12 py-6 rounded-[28px] shadow-xl ${cartTotal > 0 ? 'bg-cyan-600 shadow-cyan-200' : 'bg-white/10 shadow-transparent'}`}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">REVIEW CART</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Product Detail Modal */}
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
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setViewItem(null)} />
                    <Animated.View
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[60px] p-10 max-h-[85%] shadow-2xl"
                    >
                        {viewItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-10">
                                    <View className="w-20 h-2 bg-gray-100 rounded-full mb-10" />
                                    <Image source={{ uri: viewItem.image }} className="w-64 h-64 rounded-[50px] mb-8" />
                                    <Text className="text-[11px] font-black text-cyan-600 uppercase tracking-[4px] mb-3">{viewItem.category}</Text>
                                    <Text className="text-4xl font-black text-gray-900 text-center mb-2">{viewItem.title}</Text>
                                    <Text className="text-gray-400 font-bold text-lg">{viewItem.weight}</Text>
                                </View>

                                <View className="gap-y-6 mb-12">
                                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px]">Product Profile</Text>
                                    <Text className="text-gray-600 font-medium text-lg leading-7">{viewItem.description}</Text>
                                </View>

                                <View className="flex-row items-center justify-between mb-12">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Hub Price</Text>
                                        <Text className="text-gray-900 text-4xl font-black">₹{viewItem.price}</Text>
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
                                            className="w-12 h-12 bg-cyan-600 rounded-2xl items-center justify-center shadow-lg shadow-cyan-100"
                                        >
                                            <Ionicons name="add" size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setViewItem(null)}
                                    className="bg-gray-900 py-6 rounded-[28px] items-center shadow-xl shadow-black/15 mb-10"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest">Done Exploring</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Cart Drawer Modal */}
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
                            <Text className="text-2xl font-black text-gray-900">Grocery Basket</Text>
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Review verified essentials</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
                            {GROCERY_ITEMS.filter(item => cart[item.id]).length > 0 ? (
                                GROCERY_ITEMS.filter(item => cart[item.id]).map((item) => (
                                    <View key={item.id} className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                        <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl" />
                                        <View className="ml-4 flex-1">
                                            <Text className="text-gray-900 font-bold text-base mb-1">{item.title}</Text>
                                            <Text className="text-cyan-600 font-black">₹{item.price}</Text>
                                        </View>
                                        <View className="flex-row items-center bg-white rounded-2xl border border-gray-100 p-1">
                                            <TouchableOpacity onPress={() => removeFromCart(item.id)} className="w-8 h-8 items-center justify-center">
                                                <Ionicons name="remove" size={16} color="#4B5563" />
                                            </TouchableOpacity>
                                            <Text className="mx-3 font-black text-gray-900 text-base">{cart[item.id]}</Text>
                                            <TouchableOpacity onPress={() => addToCart(item.id)} className="w-8 h-8 items-center justify-center">
                                                <Ionicons name="add" size={16} color="#0891B2" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className="items-center py-20">
                                    <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="cart-outline" size={32} color="#D1D5DB" />
                                    </View>
                                    <Text className="text-gray-400 font-bold text-lg">Your cart is empty</Text>
                                    <Text className="text-gray-400 text-xs mt-1">Add items to review them here</Text>
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
                                    className="bg-cyan-600 px-8 py-4 rounded-2xl"
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
                        <ActivityIndicator size="large" color="#0891B2" />
                        <Text className="text-3xl font-black text-gray-900 mt-10 text-center">Security Protocol</Text>
                        <Text className="text-gray-500 font-medium text-center mt-4 leading-6">
                            Authorizing ₹{cartTotal} for order procurement...
                        </Text>
                        <View className="mt-12 bg-gray-50 p-8 rounded-[40px] w-full border border-gray-100">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-400 font-bold">Banking Connect</Text>
                                <Ionicons name="lock-closed" size={16} color="#0891B2" />
                            </View>
                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <Animated.View entering={FadeIn.duration(3000)} className="h-full bg-cyan-600 w-full" />
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({});
