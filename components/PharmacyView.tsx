import { useAuthStore } from '@/store/authStore';
import { usePharmacyStore } from '@/store/pharmacyStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, SlideInRight, SlideOutRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface PharmacyViewProps {
    role: 'senior' | 'family';
}

export default function PharmacyView({ role }: PharmacyViewProps) {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const {
        products, cart, addToCart, removeFromCart, updateCartQuantity,
        clearCart, createOrder, orders, forwardToPal
    } = usePharmacyStore();

    const pendingRequests = useMemo(() => {
        return orders.filter(o => o.status === 'sent_to_family');
    }, [orders]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showCart, setShowCart] = useState(false);
    const [reviewingOrder, setReviewingOrder] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [prescriptionUri, setPrescriptionUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const themeColor = role === 'senior' ? '#8B5CF6' : '#F97316'; // Purple vs Orange
    const secondaryColor = role === 'senior' ? '#EDE9FE' : '#FFF7ED';

    const categories = ['All', 'OTC', 'Supplements', 'Hygiene', 'Devices', 'Antibiotics'];

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, selectedCategory]);

    const totalInCart = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const simulatePayment = async () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve(true);
                } else {
                    reject(new Error(Math.random() > 0.5 ? 'Network Error' : 'Server Error'));
                }
            }, 2000);
        });
    };

    const handleUploadPrescription = () => {
        setIsUploading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        setTimeout(() => {
            setIsUploading(false);
            setPrescriptionUri('https://images.unsplash.com/photo-1584017945516-107040a45455?auto=format&fit=crop&q=80&w=600');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Prescription Added", "Your prescription has been securely attached and verified.");
        }, 1500);
    };

    const handleCheckout = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Mandatory prescription check for certain items
        const needsRx = cart.some(item => item.requiresPrescription);
        if (needsRx && !prescriptionUri) {
            Alert.alert("Prescription Required", "Some items in your cart require a valid prescription. Please upload one before proceeding.");
            return;
        }

        const seniorId = role === 'senior' ? user?.id || 'SENIOR_1' : 'SENIOR_1';
        const familyId = role === 'family' ? user?.id || 'FAM_1' : 'FAM_1';

        if (role === 'family') {
            Alert.alert(
                "Confirm Payment",
                `Total amount ₹${cartTotal} will be deducted from your wallet. Proceed?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Pay & Confirm",
                        onPress: async () => {
                            setIsProcessing(true);
                            try {
                                await simulatePayment();
                                const result = await createOrder(role, seniorId, familyId, prescriptionUri || undefined);
                                if (result.success) {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    Alert.alert("Success", "Order Booked Successfully! Notification sent to Pals.");
                                    setShowCart(false);
                                    setPrescriptionUri(null);
                                }
                            } catch (error: any) {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                                Alert.alert("Error", error.message || "Something went wrong. Please try again.");
                            } finally {
                                setIsProcessing(false);
                            }
                        }
                    }
                ]
            );
        } else {
            // Senior flow
            setIsProcessing(true);
            const result = await createOrder(role, seniorId, familyId, prescriptionUri || undefined);
            setIsProcessing(false);
            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert("Request Sent", "Your pharmacy request has been sent to the family for approval.");
                setShowCart(false);
                setPrescriptionUri(null);
            }
        }
    };

    const handleForwardRequest = async (orderId: string, amount: number) => {
        Alert.alert(
            "Confirm Order",
            `Approve this request? ₹${amount} will be deducted for this order.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm & Pay",
                    onPress: async () => {
                        setIsProcessing(true);
                        try {
                            await simulatePayment();
                            const success = await forwardToPal(orderId);
                            if (success) {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                Alert.alert("Booked", "Order placed successfully! Notification sent to Pals.");
                            }
                        } catch (error: any) {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                            Alert.alert("Payment Failed", error.message || "Server Error. Please try again manually.");
                        } finally {
                            setIsProcessing(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Search Header */}
            <View className="px-6 pb-4">
                <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-100 px-4">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search medicines..."
                        className="flex-1 py-4 ml-3 font-bold text-gray-900"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Categories */}
            <View className="mb-6">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`mr-3 px-6 py-3 rounded-xl border ${selectedCategory === cat
                                ? `bg-gray-900 border-gray-900`
                                : 'bg-white border-gray-100'
                                }`}
                        >
                            <Text className={`font-black text-[10px] uppercase tracking-widest ${selectedCategory === cat ? 'text-white' : 'text-gray-400'
                                }`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <View className="w-12" />
                </ScrollView>
            </View>

            {/* Product Grid */}
            <FlatList
                data={filteredProducts}
                numColumns={2}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
                ListHeaderComponent={() => (
                    <View>
                        {role === 'family' && pendingRequests.length > 0 && (
                            <View className="mb-8">
                                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Requests Needing Approval ⚠️</Text>
                                {pendingRequests.map(order => (
                                    <TouchableOpacity
                                        key={order.id}
                                        onPress={() => setReviewingOrder(order)}
                                        className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex-row items-center mb-4"
                                    >
                                        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                                            <Ionicons name="medkit" size={24} color="#F97316" />
                                        </View>
                                        <View className="flex-1 ml-4 pr-4">
                                            <Text className="text-gray-900 font-bold text-sm">Review {order.seniorName}&apos;s List</Text>
                                            <Text className="text-gray-500 text-[10px]">{order.items.length} Items • ₹{order.totalAmount}</Text>
                                        </View>
                                        <View className="bg-orange-500 px-4 py-2 rounded-xl">
                                            <Text className="text-white font-black text-[10px] uppercase">Review</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Catalog</Text>
                    </View>
                )}
                renderItem={({ item, index }) => {
                    const inCartItem = cart.find(i => i.id === item.id);
                    return (
                        <Animated.View
                            entering={FadeInUp.delay(index * 50)}
                            style={{ width: '50%', padding: 6 }}
                        >
                            <View className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                                <Image source={{ uri: item.image }} className="w-full h-40" resizeMode="cover" />
                                <View className="p-4">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className="text-gray-900 font-black text-sm flex-1 mr-2" numberOfLines={1}>{item.name}</Text>
                                        {item.requiresPrescription && (
                                            <View className="bg-red-50 px-2 py-0.5 rounded-md">
                                                <Text className="text-red-500 text-[6px] font-black uppercase">Rx</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-gray-500 font-bold text-[10px] mb-4">₹{item.price} • {item.unit}</Text>

                                    {inCartItem ? (
                                        <View className="flex-row items-center justify-between bg-gray-50 rounded-2xl p-1">
                                            <TouchableOpacity
                                                onPress={() => updateCartQuantity(item.id, inCartItem.quantity - 1)}
                                                className="w-8 h-8 bg-white rounded-xl items-center justify-center shadow-sm"
                                            >
                                                <Ionicons name="remove" size={16} color={themeColor} />
                                            </TouchableOpacity>
                                            <Text className="font-black text-sm text-gray-900 mx-2">{inCartItem.quantity}</Text>
                                            <TouchableOpacity
                                                onPress={() => updateCartQuantity(item.id, inCartItem.quantity + 1)}
                                                className="w-8 h-8 bg-white rounded-xl items-center justify-center shadow-sm"
                                            >
                                                <Ionicons name="add" size={16} color={themeColor} />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                addToCart(item);
                                            }}
                                            style={{ backgroundColor: themeColor }}
                                            className="h-12 rounded-2xl flex-row items-center justify-center shadow-lg shadow-gray-200"
                                        >
                                            <Ionicons name="add" size={18} color="white" />
                                            <Text className="text-white font-black text-[10px] uppercase ml-2">Add</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </Animated.View>
                    );
                }}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-20">
                        <Ionicons name="search-outline" size={60} color="#E5E7EB" />
                        <Text className="text-gray-400 font-bold mt-4">No medicines found</Text>
                    </View>
                )}
            />

            {/* Review Modal for Family */}
            {reviewingOrder && (
                <View className="absolute inset-0 z-[60] bg-white">
                    <Animated.View
                        entering={SlideInRight}
                        exiting={SlideOutRight}
                        style={{ flex: 1 }}
                    >
                        <View className="flex-1">
                            <View className="px-6 pt-12 flex-row justify-between items-center mb-10">
                                <TouchableOpacity onPress={() => setReviewingOrder(null)} className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
                                    <Ionicons name="close" size={24} color="#1F2937" />
                                </TouchableOpacity>
                                <Text className="text-xl font-black text-gray-900">Review Request</Text>
                                <View className="w-12" />
                            </View>

                            <View className="px-6 mb-8">
                                <View className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
                                    <Text className="text-orange-600 font-black text-[10px] uppercase tracking-widest mb-1">Requested By</Text>
                                    <Text className="text-gray-900 font-black text-xl">{reviewingOrder.seniorName}</Text>
                                    <View className="flex-row items-center mt-2">
                                        <View className="px-3 py-1 bg-white rounded-full border border-orange-100">
                                            <Text className="text-orange-600 text-[8px] font-black uppercase">Pending Approval</Text>
                                        </View>
                                        {reviewingOrder.prescriptionUrl && (
                                            <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 ml-2 flex-row items-center">
                                                <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                                                <Text className="text-emerald-600 text-[8px] font-black uppercase ml-1">Rx Attached</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>

                            <ScrollView className="flex-1 px-6">
                                {reviewingOrder.prescriptionUrl && (
                                    <View className="mb-8">
                                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Prescription Check</Text>
                                        <View className="h-48 bg-gray-100 rounded-[32px] overflow-hidden border border-gray-100">
                                            <Image source={{ uri: reviewingOrder.prescriptionUrl }} className="w-full h-full" resizeMode="cover" />
                                            <View className="absolute bottom-4 right-4 bg-black/60 px-4 py-2 rounded-xl">
                                                <Text className="text-white text-[8px] font-black uppercase">View Full</Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Items in this list</Text>
                                {reviewingOrder.items.map((item: any) => (
                                    <View key={item.id} className="flex-row items-center mb-4 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                                        <Image source={{ uri: item.image }} className="w-16 h-16 rounded-2xl" />
                                        <View className="flex-1 ml-4">
                                            <Text className="text-gray-900 font-bold text-sm">{item.name}</Text>
                                            <Text className="text-gray-400 font-medium text-[10px]">₹{item.price} • Qty: {item.quantity}</Text>
                                        </View>
                                        <Text className="text-gray-900 font-black text-sm">₹{item.price * item.quantity}</Text>
                                    </View>
                                ))}
                            </ScrollView>

                            <View className="p-8 border-t border-gray-50 bg-white">
                                <View className="flex-row justify-between items-center mb-8">
                                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Total to Pay</Text>
                                    <Text className="text-gray-900 font-black text-2xl">₹{reviewingOrder.totalAmount.toLocaleString()}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={async () => {
                                        const orderId = reviewingOrder.id;
                                        setReviewingOrder(null);
                                        await handleForwardRequest(orderId, reviewingOrder.totalAmount);
                                    }}
                                    disabled={isProcessing}
                                    style={{ backgroundColor: isProcessing ? '#94A3B8' : '#F97316' }}
                                    className="h-20 rounded-[28px] items-center justify-center shadow-xl shadow-gray-200"
                                >
                                    <Text className="text-white font-black text-base uppercase tracking-widest">Approve & Forward to Pal</Text>
                                </TouchableOpacity>
                                <Text className="text-center text-gray-400 font-bold text-[10px] mt-4 uppercase tracking-widest">
                                    Funds will be deducted from your wallet
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            )}

            {/* Cart Bar */}
            {totalInCart > 0 && (
                <View className="absolute bottom-8 left-6 right-6">
                    <TouchableOpacity
                        onPress={() => setShowCart(true)}
                        style={{ backgroundColor: themeColor }}
                        className="flex-row items-center justify-between h-20 rounded-[30px] px-8 shadow-2xl shadow-gray-300"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                                <Text className="text-white font-black text-sm">{totalInCart}</Text>
                            </View>
                            <View className="ml-4">
                                <Text className="text-white font-black text-[10px] uppercase tracking-widest">View Prescription & Cart</Text>
                                <Text className="text-white/80 text-[10px]">₹{cartTotal.toLocaleString()}</Text>
                            </View>
                        </View>
                        <Ionicons name="arrow-forward" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            )}

            {/* Cart Modal */}
            {showCart && (
                <View className="absolute inset-0 z-50 bg-white">
                    <Animated.View
                        entering={SlideInRight}
                        exiting={SlideOutRight}
                        style={{ flex: 1 }}
                    >
                        <View className="flex-1">
                            <View className="px-6 pt-12 flex-row justify-between items-center mb-10">
                                <TouchableOpacity onPress={() => setShowCart(false)} className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
                                    <Ionicons name="close" size={24} color="#1F2937" />
                                </TouchableOpacity>
                                <Text className="text-xl font-black text-gray-900">Pharmacy Cart</Text>
                                <TouchableOpacity onPress={clearCart}>
                                    <Text className="text-red-500 font-black text-[10px] uppercase">Clear</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="flex-1 px-6">
                                {/* Prescription Section */}
                                <View className="mb-8">
                                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Prescription Upload</Text>
                                    <TouchableOpacity
                                        onPress={handleUploadPrescription}
                                        disabled={isUploading}
                                        className={`p-6 rounded-[32px] border-2 border-dashed flex-row items-center ${prescriptionUri ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}
                                    >
                                        <View className={`w-12 h-12 rounded-2xl items-center justify-center ${prescriptionUri ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                                            {isUploading ? <ActivityIndicator size="small" color="white" /> : <Ionicons name={prescriptionUri ? "checkmark" : "document-attach"} size={24} color="white" />}
                                        </View>
                                        <View className="ml-4 flex-1">
                                            <Text className="text-gray-900 font-black text-sm">{prescriptionUri ? 'Prescription Verified' : 'Upload Valid Rx'}</Text>
                                            <Text className="text-gray-400 text-[10px] font-bold">Required for restricted medicines</Text>
                                        </View>
                                        {prescriptionUri && (
                                            <TouchableOpacity onPress={() => setPrescriptionUri(null)} className="p-2">
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Items List</Text>
                                {cart.map(item => (
                                    <View key={item.id} className="flex-row items-center mb-6 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                        <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl" />
                                        <View className="flex-1 ml-6">
                                            <Text className="text-gray-900 font-black text-sm">{item.name}</Text>
                                            <Text className="text-gray-400 font-bold text-[10px] mb-3">₹{item.price} • {item.unit}</Text>

                                            <View className="flex-row items-center justify-between bg-white rounded-xl p-1 w-[100px]">
                                                <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity - 1)}>
                                                    <Ionicons name="remove" size={16} color={themeColor} />
                                                </TouchableOpacity>
                                                <Text className="font-black text-xs text-gray-900">{item.quantity}</Text>
                                                <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity + 1)}>
                                                    <Ionicons name="add" size={16} color={themeColor} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Text className="text-gray-900 font-black text-sm">₹{item.price * item.quantity}</Text>
                                    </View>
                                ))}
                            </ScrollView>

                            <View className="p-8 border-t border-gray-50 bg-white">
                                <View className="flex-row justify-between items-center mb-8">
                                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Order Total</Text>
                                    <Text className="text-gray-900 font-black text-2xl">₹{cartTotal.toLocaleString()}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={handleCheckout}
                                    disabled={isProcessing}
                                    style={{ backgroundColor: isProcessing ? '#94A3B8' : themeColor }}
                                    className="h-20 rounded-[28px] items-center justify-center shadow-xl shadow-gray-200"
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-black text-lg uppercase tracking-widest">
                                            {role === 'senior' ? 'Request Family' : 'Confirm Order'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                <Text className="text-center text-gray-400 font-bold text-[10px] mt-4 uppercase tracking-widest">
                                    {role === 'senior' ? 'Family will review prescription & pay' : 'Safe & Secure Transaction'}
                                </Text>
                            </View>
                        </View>

                        {isProcessing && (
                            <View className="absolute inset-0 bg-white/60 items-center justify-center z-[100]">
                                <View className="bg-white p-8 rounded-[40px] shadow-2xl items-center border border-gray-100">
                                    <ActivityIndicator size="large" color={themeColor} />
                                    <Text className="mt-4 font-black text-gray-900 uppercase tracking-widest text-[10px]">Processing Transaction...</Text>
                                    <Text className="mt-1 text-gray-400 font-bold text-[8px] uppercase">Please do not close the app</Text>
                                </View>
                            </View>
                        )}
                    </Animated.View>
                </View>
            )}
        </View>
    );
}
