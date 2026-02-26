import { useAuthStore } from '@/store/authStore';
import { useGroceryStore } from '@/store/groceryStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

export default function GroceryOrderScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    // Auth and Store
    const user = useAuthStore((state) => state.user);
    const {
        products,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder
    } = useGroceryStore();

    const [viewItem, setViewItem] = useState<any>(null);
    const [showCart, setShowCart] = useState(false);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsConfirmed(false);
            setOrderStatus('idle');
        });
        return unsubscribe;
    }, [navigation]);

    const filteredItems = products.filter(item =>
        selectedCategory === 'All' || item.category === selectedCategory
    );

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleConfirm = async () => {
        if (cart.length === 0) return;

        setIsProcessing(true);
        setOrderStatus('paying');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Simulate a slight delay for senior workflow
        setTimeout(async () => {
            const result = await createOrder(
                'senior',
                user?.id || 'SENIOR_001',
                user?.familyId || 'FAM_001'
            );

            if (result.success) {
                setOrderStatus('confirmed');
                setIsConfirmed(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } else {
                setOrderStatus('idle');
            }
            setIsProcessing(false);
        }, 2000);
    };

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp.duration(600).easing(Easing.inOut(Easing.ease))} className="items-center w-full">
                    <View className="w-24 h-24 bg-purple-100 rounded-[40px] items-center justify-center mb-8 border border-purple-200">
                        <Ionicons name="cart" size={48} color="#A855F7" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4 text-purple-600">Request Sent!</Text>
                    <Text className="text-gray-500 text-center mb-10 font-medium">
                        Your grocery list has been shared with your family for approval and procurement.
                    </Text>

                    <View className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-purple-500 rounded-full items-center justify-center">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">List Shared with Family</Text>
                        </View>
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                                <Ionicons name="notifications" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Notification Sent</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-purple-600 rounded-full items-center justify-center">
                                <Ionicons name="time" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Waiting for Payment</Text>
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
                    onPress={() => router.back()}
                    className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-gray-900">Grocery Hub</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                        <Text className="text-purple-600 text-[9px] font-black uppercase tracking-[2px]">Fresh Essentials Only</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setShowCart(true);
                    }}
                    className="w-12 h-12 items-center justify-center bg-purple-50 rounded-2xl border border-purple-100"
                >
                    <Ionicons name="cart-outline" size={22} color="#A855F7" />
                    {cartCount > 0 && (
                        <View className="absolute -top-1 -right-1 bg-purple-600 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-[9px] font-black">{cartCount}</Text>
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
                        colors={['#A855F7', '#7C3AED']}
                        className="rounded-[24px] p-8 shadow-2xl shadow-purple-100 flex-row items-center"
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
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
                        {['All', 'Essentials', 'Nutrition', 'Dairy', 'Bakery', 'Fruits', 'Vegetables'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedCategory(cat);
                                }}
                                className={`mr-3 px-6 py-3 rounded-2xl border ${selectedCategory === cat ? 'bg-purple-600 border-purple-600 shadow-md shadow-purple-100' : 'bg-white border-gray-100'}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat ? 'text-white' : 'text-gray-400'}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Daily Selections</Text>
                    <View className="flex-row flex-wrap justify-between">
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
                                    className="bg-white rounded-[40px] border border-gray-100 p-4 shadow-sm"
                                >
                                    <View className="h-40 bg-gray-100 rounded-[32px] overflow-hidden">
                                        <Image source={{ uri: item.image }} className="w-full h-full" />
                                    </View>
                                    <View className="px-2 mt-4">
                                        <Text className="text-[8px] font-black text-purple-600 uppercase tracking-widest mb-1">{item.category}</Text>
                                        <Text className="text-gray-900 font-black text-base" numberOfLines={1}>{item.name}</Text>
                                        <View className="flex-row justify-between items-center mt-3">
                                            <Text className="text-gray-400 font-bold text-sm">₹{item.price}</Text>
                                            <TouchableOpacity
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item);
                                                }}
                                                className="w-10 h-10 bg-purple-600 rounded-2xl items-center justify-center shadow-lg shadow-purple-200"
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
                            <Ionicons name="sparkles" size={24} color="#A855F7" />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-gray-900 font-black">Direct Family Billing</Text>
                            <Text className="text-gray-500 text-[11px] font-medium leading-4 mt-0.5">Your family will review and pay for the items. We'll handle the rest.</Text>
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
                        <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Queue Total</Text>
                        <Text className="text-white text-3xl font-black">₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowCart(true)}
                        disabled={cartTotal === 0}
                        activeOpacity={0.8}
                        className={`px-12 py-6 rounded-[28px] shadow-xl ${cartTotal > 0 ? 'bg-purple-600 shadow-purple-200' : 'bg-white/10 shadow-transparent'}`}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">SEND TO FAMILY</Text>
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
                                    <Text className="text-[11px] font-black text-purple-600 uppercase tracking-[4px] mb-3">{viewItem.category}</Text>
                                    <Text className="text-4xl font-black text-gray-900 text-center mb-2">{viewItem.name}</Text>
                                    <Text className="text-gray-400 font-bold text-lg">{viewItem.unit}</Text>
                                </View>

                                <View className="gap-y-6 mb-12">
                                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px]">Product Profile</Text>
                                    <Text className="text-gray-600 font-medium text-lg leading-7">Essential daily item managed by senior care experts. Quality assured and family tracked.</Text>
                                </View>

                                <View className="flex-row items-center justify-between mb-12">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pricing</Text>
                                        <Text className="text-gray-900 text-4xl font-black">₹{viewItem.price}</Text>
                                    </View>

                                    <View className="flex-row items-center bg-gray-50 rounded-3xl p-2 border border-gray-100">
                                        <TouchableOpacity
                                            onPress={() => removeFromCart(viewItem.id)}
                                            className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm"
                                        >
                                            <Ionicons name="remove" size={24} color="#1F2937" />
                                        </TouchableOpacity>
                                        <Text className="mx-6 text-xl font-black text-gray-900">{cart.find(i => i.id === viewItem.id)?.quantity || 0}</Text>
                                        <TouchableOpacity
                                            onPress={() => addToCart(viewItem)}
                                            className="w-12 h-12 bg-purple-600 rounded-2xl items-center justify-center shadow-lg shadow-purple-100"
                                        >
                                            <Ionicons name="add" size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setViewItem(null)}
                                    className="bg-gray-900 py-6 rounded-[28px] items-center shadow-xl shadow-black/15 mb-10"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest">Close Detail</Text>
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
                            <Text className="text-2xl font-black text-gray-900">Grocery Queue</Text>
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Review items for family share</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
                            {cart.length > 0 ? (
                                cart.map((item) => (
                                    <View key={item.id} className="flex-row items-center mb-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                        <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl" />
                                        <View className="ml-4 flex-1">
                                            <Text className="text-gray-900 font-bold text-base mb-1">{item.name}</Text>
                                            <Text className="text-purple-600 font-black">₹{item.price}</Text>
                                        </View>
                                        <View className="flex-row items-center bg-white rounded-2xl border border-gray-100 p-1">
                                            <TouchableOpacity onPress={() => removeFromCart(item.id)} className="w-8 h-8 items-center justify-center">
                                                <Ionicons name="remove" size={16} color="#4B5563" />
                                            </TouchableOpacity>
                                            <Text className="mx-3 font-black text-gray-900 text-base">{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => addToCart(item)} className="w-8 h-8 items-center justify-center">
                                                <Ionicons name="add" size={16} color="#A855F7" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className="items-center py-20">
                                    <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="cart-outline" size={32} color="#D1D5DB" />
                                    </View>
                                    <Text className="text-gray-400 font-bold text-lg">Your queue is empty</Text>
                                    <Text className="text-gray-400 text-xs mt-1">Add items to share them with family</Text>
                                </View>
                            )}
                        </ScrollView>

                        {cartTotal > 0 && (
                            <View className="bg-gray-900 p-8 rounded-[38px] flex-row items-center justify-between">
                                <View>
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Queue Total</Text>
                                    <Text className="text-white text-3xl font-black">₹{cartTotal}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowCart(false);
                                        handleConfirm();
                                    }}
                                    className="bg-purple-600 px-8 py-4 rounded-2xl"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest text-[11px]">SEND LIST</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={{ height: insets.bottom + 20 }} />
                    </Animated.View>
                </View>
            </Modal>

            {/* Payment Processing Gateway Simulation */}
            {(orderStatus === 'paying' || isProcessing) && (
                <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-white items-center justify-center z-50">
                    <View className="items-center px-10">
                        <ActivityIndicator size="large" color="#A855F7" />
                        <Text className="text-3xl font-black text-gray-900 mt-10 text-center">Syncing Request</Text>
                        <Text className="text-gray-500 font-medium text-center mt-4 leading-6">
                            Sharing your grocery list with family for procurement details...
                        </Text>
                        <View className="mt-12 bg-gray-50 p-8 rounded-[40px] w-full border border-gray-100">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-400 font-bold">Cloud Sync</Text>
                                <Ionicons name="cloud-upload" size={16} color="#A855F7" />
                            </View>
                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <Animated.View entering={FadeIn.duration(2000)} className="h-full bg-purple-600 w-full" />
                            </View>
                        </View>
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({});


