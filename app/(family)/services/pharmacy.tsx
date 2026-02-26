import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { PharmacyOrder, usePharmacyStore } from '@/store/pharmacyStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
    FadeIn,
    FadeInUp,
    FadeOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FamilyPharmacyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore(state => state.user);
    const {
        products, cart, addToCart, removeFromCart, updateCartQuantity,
        clearCart, createOrder, orders, forwardToPal
    } = usePharmacyStore();

    const [search, setSearch] = useState('');
    const [address, setAddress] = useState(user?.parentsDetails?.[0]?.address || 'Sector 4, HSR Layout');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [prescriptionUri, setPrescriptionUri] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'wallet' | 'card'>('wallet');
    const [showCart, setShowCart] = useState(false);
    const [showRxOptions, setShowRxOptions] = useState(false);
    const [prescriptionType, setPrescriptionType] = useState<'image' | 'camera' | 'pdf' | null>(null);
    const [showRxViewer, setShowRxViewer] = useState(false);
    const [viewingRxUri, setViewingRxUri] = useState<string | null>(null);
    const [pendingOrders, setPendingOrders] = useState<PharmacyOrder[]>([]);

    useEffect(() => {
        const pOrders = orders.filter(o => o.status === 'sent_to_family');
        setPendingOrders(pOrders);
    }, [orders]);

    useFocusEffect(
        useCallback(() => {
            return () => {
                setIsConfirmed(false);
                setIsProcessing(false);
            };
        }, [])
    );

    const filteredItems = useMemo(() => {
        return products.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, products]);

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    const handleUploadPrescription = (type: 'image' | 'camera' | 'pdf') => {
        setIsUploading(true);
        setPrescriptionType(type);
        setShowRxOptions(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setTimeout(() => {
            setIsUploading(false);
            setPrescriptionUri('https://images.unsplash.com/photo-1584017945516-107040a45455?auto=format&fit=crop&q=80&w=600');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Prescription Added", `Your ${type.toUpperCase()} has been securely attached.`);
        }, 1500);
    };

    const handleRemovePrescription = () => {
        setPrescriptionUri(null);
        setPrescriptionType(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const simulatePayment = async () => {
        // 20% chance of network error, 10% chance of server error
        const chance = Math.random();
        await new Promise(resolve => setTimeout(resolve, 3000));

        if (chance < 0.1) throw new Error('SERVER_ERROR');
        if (chance < 0.3) throw new Error('NETWORK_ERROR');
        return true;
    };

    const handleCheckout = async () => {
        if (cartTotal === 0 && !prescriptionUri) {
            Alert.alert("Selection Required", "Please add items or a prescription.");
            return;
        }

        setIsProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const { deductBalance } = useAuthStore.getState();
            const payRes = await deductBalance(cartTotal, "Pharmacy Order");
            if (!payRes.success) {
                Alert.alert("Payment Failed", payRes.message);
                setIsProcessing(false);
                return;
            }

            await simulatePayment();
            const result = await createOrder('family', 'SENIOR_1', user?.id || 'FAM_1', prescriptionUri || undefined);
            setIsProcessing(false);

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setIsConfirmed(true);
                clearCart();
            }
        } catch (error: any) {
            setIsProcessing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (error.message === 'NETWORK_ERROR') {
                Alert.alert("Payment Failed", "Network Error: Could not reach the payment gateway.");
            } else {
                Alert.alert("Payment Failed", "Server Error: Our payment processor is currently down.");
            }
        }
    };

    const handleApproveRequest = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        setIsProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        try {
            const { deductBalance } = useAuthStore.getState();
            const payRes = await deductBalance(order.totalAmount, `Pharmacy Request: ${order.seniorName}`);
            if (!payRes.success) {
                Alert.alert("Payment Failed", payRes.message);
                setIsProcessing(false);
                return;
            }

            await simulatePayment();
            const success = await forwardToPal(orderId);
            setIsProcessing(false);
            if (success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setIsConfirmed(true);
            }
        } catch (error: any) {
            setIsProcessing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Transaction Failed", "Wallet deduction failed. Please check your balance.");
        }
    };

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp.duration(600)}>
                    <View className="items-center w-full">
                        <View className="w-24 h-24 bg-orange-100 rounded-[40px] items-center justify-center mb-8 border border-orange-200">
                            <Ionicons name="card" size={48} color="#F97316" />
                        </View>
                        <Text className="text-3xl font-black text-gray-900 text-center mb-4">Order Placed!</Text>
                        <Text className="text-gray-500 text-center mb-10 leading-6">
                            The pharmacy order has been confirmed. A Pal has been notified and will collect the medicines shortly.
                        </Text>

                        <View className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
                            <View className="flex-row items-center mb-4">
                                <View className="w-10 h-10 bg-orange-500 rounded-full items-center justify-center">
                                    <Ionicons name="person" size={20} color="white" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-black text-sm">Priya Verma</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold">Assigned Pal</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    const userPhone = user?.phone || 'FAMILY_PHONE';
                                    const convId = useChatStore.getState().getOrCreateConversation(userPhone, {
                                        id: 'PAL_PRIYA',
                                        name: 'Priya Verma',
                                        role: 'pal',
                                        avatar: 'https://i.pravatar.cc/100?u=priya'
                                    });
                                    router.push({ pathname: '/(family)/chat/[id]', params: { id: convId } } as any);
                                }}
                                className="bg-white py-4 rounded-2xl items-center border border-gray-100"
                            >
                                <Text className="text-orange-600 font-black uppercase tracking-widest text-[11px]">Chat with Priya</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                setIsConfirmed(false);
                                router.replace('/(family)/care' as any);
                            }}
                            className="bg-orange-500 px-12 py-5 rounded-[24px] shadow-xl shadow-orange-200 w-full"
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
                className="px-6 pb-6 pt-4 bg-white/95 border-b border-gray-50 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity
                    onPress={() => router.replace('/(family)/care' as any)}
                    className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-gray-900">Family Pharmacy</Text>
                </View>

                <TouchableOpacity
                    onPress={() => setShowCart(true)}
                    className="w-12 h-12 items-center justify-center bg-orange-50 rounded-2xl"
                >
                    <Ionicons name="cart-outline" size={22} color="#F97316" />
                    {cart.length > 0 && (
                        <View className="absolute -top-1 -right-1 bg-orange-600 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-[9px] font-black">{cart.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                {/* Requests Needing Review */}
                {pendingOrders.length > 0 && (
                    <Animated.View entering={FadeInUp}>
                        <View className="px-6 mt-8">
                            <Text className="text-[11px] font-black text-orange-500 uppercase tracking-[3px] mb-4">Requests Needing Review</Text>
                            {pendingOrders.map(order => (
                                <View key={order.id} className="bg-white p-6 rounded-[32px] border border-orange-200 shadow-xl shadow-orange-50 relative overflow-hidden mb-4">
                                    <View className="absolute top-0 right-0 w-24 h-24 bg-orange-50 -mr-8 -mt-8 rounded-full opacity-50" />
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View>
                                            <Text className="text-gray-900 font-black text-lg">{order.seniorName}'s List</Text>
                                            <Text className="text-orange-700/60 text-[10px] font-bold uppercase tracking-widest">{order.items.length} Items • ₹{order.totalAmount}</Text>
                                        </View>
                                        <View className="bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                                            <Text className="text-orange-600 text-[8px] font-black uppercase">Pending Approval</Text>
                                        </View>
                                    </View>
                                    {order.prescriptionImage && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                setViewingRxUri(order.prescriptionImage!);
                                                setShowRxViewer(true);
                                            }}
                                            className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100"
                                        >
                                            <Ionicons name="eye" size={18} color="#F97316" />
                                            <Text className="ml-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">View Attached Prescription</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleApproveRequest(order.id)}
                                        className="bg-gray-900 py-5 rounded-2xl items-center shadow-lg"
                                    >
                                        <Text className="text-white font-black uppercase tracking-widest text-[11px]">Pay & Dispatch Order</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Prescription Upload for direct family order */}
                <Animated.View entering={FadeInUp.delay(100)}>
                    <View className="px-6 mt-8 mb-6">
                        <TouchableOpacity
                            onPress={() => setShowRxOptions(true)}
                            disabled={isUploading}
                            className={`p-10 rounded-[40px] flex-row items-center border-2 border-dashed ${prescriptionUri ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}
                        >
                            <View className="flex-1">
                                <Text className={`${prescriptionUri ? 'text-emerald-500' : 'text-orange-500'} text-[10px] font-black uppercase tracking-[3px] mb-1`}>Family Direct</Text>
                                <Text className={`${prescriptionUri ? 'text-emerald-900' : 'text-orange-900'} text-3xl font-black`}>{isUploading ? 'Securing...' : prescriptionUri ? 'Rx Verified' : 'Upload Rx'}</Text>
                                {prescriptionUri && (
                                    <TouchableOpacity onPress={handleRemovePrescription} className="mt-2 bg-emerald-200/50 self-start px-3 py-1 rounded-full">
                                        <Text className="text-emerald-800 text-[9px] font-black uppercase">Remove File</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View className={`w-16 h-16 rounded-3xl items-center justify-center ${prescriptionUri ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-orange-500 shadow-lg shadow-orange-200'}`}>
                                {isUploading ? <ActivityIndicator color="white" /> : <Ionicons name={prescriptionUri ? "checkmark-done" : "document-attach"} size={32} color="white" />}
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Products */}
                <View className="px-6 mb-4">
                    <TextInput
                        placeholder="Search medicines..."
                        value={search}
                        onChangeText={setSearch}
                        className="bg-gray-100 px-6 py-4 rounded-2xl font-bold"
                    />
                </View>

                <View className="px-6 flex-row flex-wrap justify-between">
                    {filteredItems.map(item => {
                        const inCart = cart.find(i => i.id === item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => setSelectedItem(item)}
                                className="w-[47%] bg-white rounded-3xl border border-gray-100 mb-6 overflow-hidden"
                            >
                                <Image source={{ uri: item.image }} className="w-full h-32" />
                                <View className="p-4">
                                    <Text className="font-bold text-gray-900" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-orange-600 font-black">₹{item.price}</Text>
                                    <TouchableOpacity
                                        onPress={() => inCart ? removeFromCart(item.id) : addToCart(item)}
                                        className={`mt-2 py-3 rounded-2xl items-center ${inCart ? 'bg-red-50' : 'bg-orange-50'}`}
                                    >
                                        <Ionicons name={inCart ? "trash" : "add"} size={22} color={inCart ? "#EF4444" : "#F97316"} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Float Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-white/90 border-t border-gray-100">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase">Grand Total</Text>
                        <Text className="text-gray-900 text-3xl font-black">₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleCheckout}
                        disabled={isProcessing}
                        className={`px-12 py-5 rounded-[24px] shadow-xl ${isProcessing ? 'bg-gray-300' : 'bg-orange-500 shadow-orange-200'}`}
                    >
                        {isProcessing ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase tracking-widest">Confirm & Pay</Text>}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Security Gateway Overlay */}
            {isProcessing && (
                <Animated.View entering={FadeIn} exiting={FadeOut}>
                    <View className="absolute inset-0 bg-white/95 items-center justify-center z-50">
                        <ActivityIndicator size="large" color="#F97316" />
                        <Text className="text-[10px] font-black text-orange-500 uppercase tracking-[4px] mt-10">Security Gateway</Text>
                        <Text className="text-3xl font-black text-gray-900 mt-2 text-center">Processing...</Text>
                        <Text className="text-gray-400 font-bold mt-2 px-10 text-center">We are authorizing your transaction with your banking partner.</Text>
                    </View>
                </Animated.View>
            )}

            {/* Cart Modal */}
            <Modal visible={showCart} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[50px] p-8 max-h-[85%]">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-3xl font-black text-gray-900">Review Cart</Text>
                            <TouchableOpacity onPress={() => setShowCart(false)}>
                                <View className="bg-gray-100 p-2 rounded-full">
                                    <Ionicons name="close" size={24} color="#1F2937" />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {cart.map(item => (
                                <View key={item.id} className="flex-row items-center mb-4 bg-gray-50 p-5 rounded-[32px] border border-gray-100">
                                    <Image source={{ uri: item.image }} className="w-16 h-16 rounded-2xl" />
                                    <View className="ml-4 flex-1">
                                        <Text className="font-bold text-gray-900">{item.name}</Text>
                                        <Text className="text-orange-600 font-black">₹{item.price * item.quantity}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity - 1)}><Ionicons name="remove-circle-outline" size={32} color="#F97316" /></TouchableOpacity>
                                        <Text className="mx-3 font-black text-lg">{item.quantity}</Text>
                                        <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity + 1)}><Ionicons name="add-circle-outline" size={32} color="#F97316" /></TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                            {cart.length === 0 && (
                                <View className="items-center py-20">
                                    <Ionicons name="cart-outline" size={64} color="#E5E7EB" />
                                    <Text className="text-gray-400 font-bold mt-4">Cart is currently empty</Text>
                                </View>
                            )}
                        </ScrollView>
                        {cart.length > 0 && (
                            <TouchableOpacity onPress={handleCheckout} className="bg-orange-500 py-6 rounded-[24px] mt-6 items-center shadow-xl shadow-orange-200">
                                <Text className="text-white font-black uppercase tracking-widest">Confirm & Pay ₹{cartTotal}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal visible={showRxOptions} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center p-6">
                    <Animated.View entering={FadeInUp}>
                        <View className="bg-white rounded-[40px] p-8">
                            <View className="items-center mb-8">
                                <View className="w-16 h-16 bg-orange-50 rounded-2xl items-center justify-center mb-4">
                                    <Ionicons name="document-text" size={32} color="#F97316" />
                                </View>
                                <Text className="text-2xl font-black text-gray-900 text-center">Upload Prescription</Text>
                            </View>
                            <View className="gap-y-3">
                                <TouchableOpacity onPress={() => handleUploadPrescription('camera')} className="flex-row items-center bg-gray-50 p-6 rounded-3xl">
                                    <Ionicons name="camera" size={24} color="#1F2937" />
                                    <View className="ml-4"><Text className="text-gray-900 font-black">Camera</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleUploadPrescription('image')} className="flex-row items-center bg-gray-50 p-6 rounded-3xl">
                                    <Ionicons name="image" size={24} color="#1F2937" />
                                    <View className="ml-4"><Text className="text-gray-900 font-black">Gallery</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleUploadPrescription('pdf')} className="flex-row items-center bg-gray-50 p-6 rounded-3xl">
                                    <Ionicons name="document" size={24} color="#1F2937" />
                                    <View className="ml-4"><Text className="text-gray-900 font-black">Upload PDF</Text></View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowRxOptions(false)} className="mt-4 items-center py-4">
                                    <Text className="text-gray-400 font-black uppercase tracking-[2px] text-[10px]">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* Prescription Viewer Modal */}
            <Modal visible={showRxViewer} transparent animationType="fade">
                <View className="flex-1 bg-black/90 items-center justify-center p-6">
                    <TouchableOpacity onPress={() => setShowRxViewer(false)} className="absolute top-12 right-6 z-10 bg-white/20 p-3 rounded-full">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="w-full aspect-[3/4] bg-white rounded-3xl overflow-hidden">
                        <Image source={{ uri: viewingRxUri || '' }} className="w-full h-full" resizeMode="contain" />
                    </View>
                    <View className="mt-8 items-center">
                        <Text className="text-white text-xl font-black">Prescription Verified</Text>
                        <Text className="text-white/60 text-center mt-2 px-10 leading-5">This document was uploaded by the senior and will be shared with the pharmacist.</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
