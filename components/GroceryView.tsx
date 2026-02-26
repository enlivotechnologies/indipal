import { useAuthStore } from '@/store/authStore';
import { useGroceryStore } from '@/store/groceryStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, SlideInRight, SlideOutRight } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface GroceryViewProps {
    role: 'senior' | 'family';
}

export default function GroceryView({ role }: GroceryViewProps) {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const {
        products, cart, addToCart, removeFromCart, updateCartQuantity,
        clearCart, createOrder, orders, forwardToPal
    } = useGroceryStore();

    const pendingRequests = useMemo(() => {
        return orders.filter(o => o.status === 'sent_to_family');
    }, [orders]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showCart, setShowCart] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const themeColor = role === 'senior' ? '#8B5CF6' : '#F97316'; // Purple vs Orange
    const secondaryColor = role === 'senior' ? '#EDE9FE' : '#FFF7ED';

    const categories = ['All', 'Dairy', 'Vegetables', 'Fruits', 'Bakery', 'Pharmacy'];

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
            // 90% success rate for simulation
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve(true);
                } else {
                    reject(new Error(Math.random() > 0.5 ? 'Network Error' : 'Server Error'));
                }
            }, 2000);
        });
    };

    const handleCheckout = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
                                const result = await createOrder(role, seniorId, familyId);
                                if (result.success) {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    Alert.alert("Success", "Order Booked Successfully! Notification sent to Pals.");
                                    setShowCart(false);
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
            const result = await createOrder(role, seniorId, familyId);
            setIsProcessing(false);
            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert("Request Sent", "Your grocery request has been sent to the family for approval.");
                setShowCart(false);
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
                        placeholder="Search groceries..."
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
                                        onPress={() => handleForwardRequest(order.id, order.totalAmount)}
                                        className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex-row items-center mb-4"
                                    >
                                        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                                            <Ionicons name="cart" size={24} color="#F97316" />
                                        </View>
                                        <View className="flex-1 ml-4 pr-4">
                                            <Text className="text-gray-900 font-bold text-sm">Review {order.seniorName}&apos;s List</Text>
                                            <Text className="text-gray-500 text-[10px]">{order.items.length} Items • ₹{order.totalAmount}</Text>
                                        </View>
                                        <View className="bg-orange-500 px-4 py-2 rounded-xl">
                                            <Text className="text-white font-black text-[10px] uppercase">Forward</Text>
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
                                        <Text className="text-gray-400 text-[8px] font-bold uppercase">{item.unit}</Text>
                                    </View>
                                    <Text className="text-gray-500 font-bold text-[10px] mb-4">₹{item.price}</Text>

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
                                            <Ionicons name="cart-outline" size={18} color="white" />
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
                        <Text className="text-gray-400 font-bold mt-4">No products found</Text>
                    </View>
                )}
            />

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
                                <Text className="text-white font-black text-[10px] uppercase tracking-widest">View Cart</Text>
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
                                <Text className="text-xl font-black text-gray-900">Your Cart</Text>
                                <TouchableOpacity onPress={clearCart}>
                                    <Text className="text-red-500 font-black text-[10px] uppercase">Clear</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView className="flex-1 px-6">
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
                                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Estimated Total</Text>
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
                                            {role === 'senior' ? 'Send to Family' : 'Confirm Order'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                                <Text className="text-center text-gray-400 font-bold text-[10px] mt-4 uppercase tracking-widest">
                                    {role === 'senior' ? 'Family will review and pay' : 'Payment will be deducted from your wallet'}
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
