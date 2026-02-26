import { useAuthStore } from '@/store/authStore';
import { usePharmacyStore } from '@/store/pharmacyStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

export default function PharmacyOrderingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore(state => state.user);
    const {
        products, cart, addToCart, removeFromCart, updateCartQuantity,
        createOrder
    } = usePharmacyStore();

    const [search, setSearch] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [prescriptionUri, setPrescriptionUri] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showCart, setShowCart] = useState(false);
    const [showRxOptions, setShowRxOptions] = useState(false);
    const [prescriptionType, setPrescriptionType] = useState<'image' | 'camera' | 'pdf' | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            setIsConfirmed(false);
            setIsProcessing(false);
            setPrescriptionUri(null);
        });
        return unsubscribe;
    }, [navigation]);

    const filteredItems = useMemo(() => {
        let items = products;
        if (selectedCategory !== 'All') {
            items = items.filter(item => item.category === selectedCategory);
        }
        if (search) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.category.toLowerCase().includes(search.toLowerCase())
            );
        }
        return items;
    }, [search, selectedCategory, products]);

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
            setPrescriptionUri('https://images.unsplash.com/photo-1584017945516-107040a45455?auto=format&fit=crop&q=80&w=400');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Prescription Added", `Your ${type.toUpperCase()} has been securely attached.`);
        }, 1500);
    };

    const handleRemovePrescription = () => {
        setPrescriptionUri(null);
        setPrescriptionType(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleConfirm = async () => {
        if (cartTotal === 0 && !prescriptionUri) {
            Alert.alert("Selection Required", "Please add items or upload a prescription.");
            return;
        }

        const needsRx = cart.some(item => item.requiresPrescription);
        if (needsRx && !prescriptionUri) {
            Alert.alert(
                "Prescription Required",
                "Some items in your cart require a valid prescription. Please upload one to continue.",
                [{ text: "Upload Now", onPress: () => setShowRxOptions(true) }]
            );
            return;
        }

        setIsProcessing(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        await new Promise(resolve => setTimeout(resolve, 2500));

        const seniorId = user?.id || 'SENIOR_1';
        const familyId = 'FAM_1';

        try {
            const result = await createOrder('senior', seniorId, familyId, prescriptionUri || undefined);
            setIsProcessing(false);

            if (result.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setIsConfirmed(true);
            }
        } catch (error) {
            setIsProcessing(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert("Error", "Request failed. Please check your network.");
        }
    };

    if (isConfirmed) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <Animated.View entering={FadeInUp.duration(600).easing(Easing.inOut(Easing.ease))} className="items-center w-full">
                    <View className="w-24 h-24 bg-purple-100 rounded-[40px] items-center justify-center mb-8 border border-purple-200">
                        <Ionicons name="mail-unread" size={42} color="#A855F7" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4 text-purple-600">Request Sent!</Text>
                    <Text className="text-gray-500 text-center mb-10 leading-6 px-4 font-medium">
                        Your pharmacy request has been sent to your family. You will be notified once they approve and a Pal is assigned.
                    </Text>

                    <TouchableOpacity
                        onPress={() => {
                            setIsConfirmed(false);
                            router.replace('/(senior)/home' as any);
                        }}
                        className="bg-purple-600 py-5 rounded-[24px] shadow-xl shadow-purple-200 w-full"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-center">Back to Home</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <View
                className="px-6 pb-6 pt-4 bg-white/95 backdrop-blur-3xl border-b border-gray-50 flex-row items-center justify-between"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>

                <View className="items-center flex-1">
                    <Text className="text-xl font-black text-gray-900">Pharmacy</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                        <Text className="text-purple-600 text-[9px] font-black uppercase tracking-[2px]">Care Essentials</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => setShowCart(true)}
                    className="w-12 h-12 items-center justify-center bg-purple-50 rounded-2xl border border-purple-100"
                >
                    <Ionicons name="cart-outline" size={22} color="#A855F7" />
                    {cart.length > 0 && (
                        <View className="absolute -top-1 -right-1 bg-purple-600 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-[9px] font-black">{cart.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 180 }} className="flex-1">
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="px-6 mt-8 mb-6">
                    <View className="bg-gray-100 flex-row items-center px-6 py-5 rounded-[32px]">
                        <Ionicons name="search" size={22} color="#9CA3AF" />
                        <TextInput
                            placeholder="Find medicine or supplies..."
                            value={search}
                            onChangeText={setSearch}
                            className="ml-4 flex-1 text-gray-800 font-bold text-base"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </Animated.View>

                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
                        {['All', 'OTC', 'Supplements', 'Hygiene', 'Devices'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setSelectedCategory(cat)}
                                className={`mr-3 px-6 py-3 rounded-2xl border ${selectedCategory === cat ? 'bg-purple-600 border-purple-600 shadow-md shadow-purple-100' : 'bg-white border-gray-100'}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat ? 'text-white' : 'text-gray-400'}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <Animated.View entering={FadeInUp.delay(150).duration(600)} className="px-6 mb-10">
                    <TouchableOpacity
                        disabled={isUploading}
                        className={`p-8 rounded-[32px] flex-row items-center justify-between border-2 ${prescriptionUri ? 'bg-emerald-50 border-emerald-200' : 'bg-purple-600 border-purple-500'}`}
                        onPress={() => setShowRxOptions(true)}
                    >
                        <View className="flex-1">
                            <Text className={`${prescriptionUri ? 'text-emerald-600' : 'text-white/70'} text-[10px] font-black uppercase tracking-[3px] mb-2`}>
                                {prescriptionUri ? 'PRESCRIPTION ATTACHED' : 'PHARMACIST DIRECT'}
                            </Text>
                            <Text className={`${prescriptionUri ? 'text-emerald-900' : 'text-white'} text-2xl font-black mb-1`}>
                                {isUploading ? 'Securing...' : prescriptionUri ? 'Verified File' : 'Upload Rx'}
                            </Text>
                            {prescriptionUri && (
                                <TouchableOpacity onPress={handleRemovePrescription} className="mt-2 flex-row items-center">
                                    <View className="bg-emerald-200/50 px-3 py-1 rounded-full flex-row items-center">
                                        <Ionicons name="trash" size={12} color="#065F46" />
                                        <Text className="text-[#065F46] text-[10px] font-bold ml-1 uppercase">Remove</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View className={`w-16 h-16 rounded-[24px] items-center justify-center border-2 ${prescriptionUri ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-200' : 'bg-white/20 border-white/30'}`}>
                            {isUploading ? <ActivityIndicator color="white" /> : <Ionicons name={prescriptionUri ? "checkmark-done" : "document-text"} size={32} color="white" />}
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                <View className="px-6 flex-row flex-wrap justify-between">
                    {filteredItems.map((item, idx) => {
                        const inCartItem = cart.find(i => i.id === item.id);
                        return (
                            <Animated.View key={item.id} entering={FadeInUp.delay(idx * 100)} className="w-[47%] mb-8">
                                <TouchableOpacity
                                    onPress={() => setSelectedItem(item)}
                                    className={`rounded-[32px] overflow-hidden border-2 bg-white ${inCartItem ? 'border-purple-600 shadow-xl shadow-purple-100' : 'border-gray-50'}`}
                                >
                                    <Image source={{ uri: item.image }} className="w-full h-44" />
                                    <View className="p-4">
                                        <View className="flex-row items-center justify-between mb-1">
                                            <Text className="text-gray-900 font-bold text-sm flex-1 mr-2" numberOfLines={1}>{item.name}</Text>
                                            {item.requiresPrescription && <Ionicons name="document-text" size={14} color="#A855F7" />}
                                        </View>
                                        <Text className="text-purple-600 font-black text-lg">₹{item.price}</Text>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                inCartItem ? removeFromCart(item.id) : addToCart(item);
                                            }}
                                            className={`mt-3 h-12 rounded-2xl items-center justify-center ${inCartItem ? 'bg-red-50' : 'bg-purple-50'}`}
                                        >
                                            <Ionicons name={inCartItem ? "trash" : "add"} size={22} color={inCartItem ? "#EF4444" : "#A855F7"} />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            <Animated.View className="absolute bottom-0 left-0 right-0 px-6 bg-white/90 pb-10 pt-6 border-t border-gray-100">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Total</Text>
                        <Text className="text-gray-900 text-3xl font-black">₹{cartTotal}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={isProcessing}
                        className={`px-12 py-5 rounded-[24px] shadow-xl ${isProcessing ? 'bg-gray-300' : 'bg-purple-600 shadow-purple-200'}`}
                    >
                        {isProcessing ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-black text-base uppercase tracking-widest">Send Request</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <Modal visible={showCart} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8 max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-gray-900">Your Cart</Text>
                            <TouchableOpacity onPress={() => setShowCart(false)}>
                                <Ionicons name="close" size={28} color="#1F2937" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {cart.map(item => (
                                <View key={item.id} className="flex-row items-center mb-4 bg-gray-50 p-4 rounded-3xl">
                                    <Image source={{ uri: item.image }} className="w-16 h-16 rounded-xl" />
                                    <View className="ml-4 flex-1">
                                        <Text className="text-gray-900 font-bold">{item.name}</Text>
                                        <Text className="text-purple-600 font-black">₹{item.price * item.quantity}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity - 1)}>
                                            <Ionicons name="remove-circle-outline" size={24} color="#A855F7" />
                                        </TouchableOpacity>
                                        <Text className="mx-3 font-bold">{item.quantity}</Text>
                                        <TouchableOpacity onPress={() => updateCartQuantity(item.id, item.quantity + 1)}>
                                            <Ionicons name="add-circle-outline" size={24} color="#A855F7" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                            {cart.length === 0 && <Text className="text-center py-10 text-gray-400 font-bold">Cart is empty</Text>}
                        </ScrollView>
                        <TouchableOpacity
                            onPress={() => setShowCart(false)}
                            className="bg-purple-600 py-5 rounded-2xl mt-6 items-center shadow-lg shadow-purple-100"
                        >
                            <Text className="text-white font-black uppercase">Close Cart</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={showRxOptions} transparent animationType="fade">
                <View className="flex-1 bg-black/60 justify-center p-6">
                    <Animated.View entering={FadeInUp} className="bg-white rounded-[40px] p-8">
                        <View className="items-center mb-8">
                            <View className="w-16 h-16 bg-purple-50 rounded-2xl items-center justify-center mb-4">
                                <Ionicons name="document-text" size={32} color="#A855F7" />
                            </View>
                            <Text className="text-2xl font-black text-gray-900">Upload Prescription</Text>
                            <Text className="text-gray-400 text-center mt-2 px-4 leading-5 font-medium">Select a method to attach your prescription document.</Text>
                        </View>

                        <View className="gap-y-3">
                            <TouchableOpacity onPress={() => handleUploadPrescription('camera')} className="flex-row items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <Ionicons name="camera" size={24} color="#1F2937" />
                                <View className="ml-4">
                                    <Text className="text-gray-900 font-black">Use Camera</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Take a photo now</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleUploadPrescription('image')} className="flex-row items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <Ionicons name="image" size={24} color="#1F2937" />
                                <View className="ml-4">
                                    <Text className="text-gray-900 font-black">From Gallery</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Choose an image</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => handleUploadPrescription('pdf')} className="flex-row items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <Ionicons name="document" size={24} color="#1F2937" />
                                <View className="ml-4">
                                    <Text className="text-gray-900 font-black">Document (PDF)</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Upload PDF file</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowRxOptions(false)} className="mt-4 items-center py-4">
                                <Text className="text-gray-400 font-black uppercase tracking-[2px] text-[10px]">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {selectedItem && (
                <Modal visible={!!selectedItem} transparent animationType="slide">
                    <View className="flex-1 bg-black/60 justify-end">
                        <View className="bg-white rounded-t-[50px] p-10 max-h-[90%]">
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-8">
                                    <Image source={{ uri: selectedItem.image }} className="w-64 h-64 rounded-[40px] mb-6" />
                                    <Text className="text-4xl font-black text-gray-900 text-center">{selectedItem.name}</Text>
                                    <Text className="text-purple-600 text-2xl font-black mt-2">₹{selectedItem.price}</Text>
                                    <Text className="text-gray-500 mt-6 leading-6 text-center">{selectedItem.description}</Text>
                                </View>

                                <View className="bg-purple-50 p-6 rounded-[32px] mb-8">
                                    <Text className="text-purple-900 font-bold mb-2">Usage Guide</Text>
                                    <Text className="text-purple-700">{selectedItem.usage}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => setSelectedItem(null)}
                                    className="bg-gray-900 py-6 rounded-3xl items-center"
                                >
                                    <Text className="text-white font-black uppercase tracking-widest">Close Information</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            )}

            {isProcessing && (
                <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-white/95 items-center justify-center z-50">
                    <ActivityIndicator size="large" color="#A855F7" />
                    <Text className="text-[10px] font-black text-purple-500 uppercase tracking-[4px] mt-10">Security Protocol</Text>
                    <Text className="text-3xl font-black text-gray-900 mt-2 text-center">Syncing Request...</Text>
                    <Text className="text-gray-400 font-bold mt-2 px-10 text-center">We are securely sharing your medical list with your family for review.</Text>
                </Animated.View>
            )}
        </View>
    );
}
