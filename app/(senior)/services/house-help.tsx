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



type HouseHelpService = {
    id: string;
    title: string;
    price: number;
    icon: string;
    image: string;
    category: 'Cleaning' | 'Cooking' | 'Maintenance';
    description: string;
    tasks: string[];
    rating: string;
    reviews: string;
};

const HELP_SERVICES: HouseHelpService[] = [
    {
        id: '1',
        title: 'Full Home Sanitization',
        price: 1200,
        icon: 'sparkles',
        category: 'Cleaning',
        image: 'https://images.unsplash.com/photo-1581578731522-aa7c04ced643?auto=format&fit=crop&q=80&w=400',
        description: 'Deep cleaning and sanitization of the entire home focusing on high-touch areas. Safe for seniors.',
        tasks: ['Kitchen Deep Clean', 'Floor Scrubbing', 'Bathroom Care'],
        rating: '4.8',
        reviews: '500+'
    },
    {
        id: '2',
        title: 'Nutritional Meal Prep',
        price: 800,
        icon: 'restaurant',
        category: 'Cooking',
        image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400',
        description: 'Preparation of healthy, balanced meals tailored for elderly dietary requirements (Low salt/sugar).',
        tasks: ['Lunch & Dinner', 'Kitchen Cleanup', 'Diet Planning'],
        rating: '4.9',
        reviews: '320+'
    },
    {
        id: '3',
        title: 'Daily Maintenance',
        price: 500,
        icon: 'hammer',
        category: 'Maintenance',
        image: 'https://images.unsplash.com/photo-1581578731522-aa7c04ced643?auto=format&fit=crop&q=80&w=400',
        description: 'Handling daily chores, minor repairs, and general upkeep of the senior residence.',
        tasks: ['Bed Making', 'Dusting', 'Appliance Check'],
        rating: '4.7',
        reviews: '1.2k+'
    }
];

export default function HouseHelpScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [selectedService, setSelectedService] = useState<HouseHelpService | null>(null);
    const [viewItem, setViewItem] = useState<HouseHelpService | null>(null);
    const [orderStatus, setOrderStatus] = useState<'idle' | 'paying' | 'confirmed'>('idle');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isConfirmed, setIsConfirmed] = useState(false);
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
            Alert.alert("Selection Required", "Please select a service specialization.");
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
                    <View className="w-24 h-24 bg-orange-100 rounded-[40px] items-center justify-center mb-8 border border-orange-200">
                        <Ionicons name="home" size={48} color="#F59E0B" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 text-center mb-4">Request Secured!</Text>

                    <View className="w-full bg-gray-50 rounded-[32px] p-6 mb-10 border border-gray-100">
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-orange-500 rounded-full items-center justify-center">
                                <Ionicons name="checkmark" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">₹{selectedService?.price} Escrow Payment Paid</Text>
                        </View>
                        <View className="flex-row items-center mb-6">
                            <View className="w-8 h-8 bg-blue-500 rounded-full items-center justify-center">
                                <Ionicons name="notifications" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Service Booked for Today</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-gray-700 rounded-full items-center justify-center">
                                <Ionicons name="people" size={16} color="white" />
                            </View>
                            <Text className="ml-4 font-black text-gray-900 text-sm">Pal Coordinating Dispatch</Text>
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
            </View>
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
                    <Text className="text-xl font-black text-gray-900">House Help</Text>
                    <View className="flex-row items-center mt-1">
                        <View className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2" />
                        <Text className="text-orange-600 text-[9px] font-black uppercase tracking-[2px]">Premium Home Services</Text>
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
                        colors={['#F59E0B', '#D97706']}
                        className="rounded-[24px] p-8 shadow-2xl shadow-orange-100 flex-row items-center"
                    >
                        <View className="flex-1">
                            <Text className="text-white/70 text-[10px] font-black uppercase tracking-[3px] mb-2">Impeccable Care</Text>
                            <Text className="text-white text-2xl font-black mb-1">Domestic Help</Text>
                            <Text className="text-white/60 text-[11px] font-bold">Reliable & Verified Staff</Text>
                        </View>
                        <View className="w-16 h-16 bg-white/20 rounded-[28px] items-center justify-center border border-white/20">
                            <Ionicons name="home" size={32} color="white" />
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Categories */}
                <View className="mb-8">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6" contentContainerStyle={{ paddingRight: 40 }}>
                        {['All', 'Cleaning', 'Cooking', 'Maintenance'].map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedCategory(cat);
                                }}
                                className={`mr-3 px-6 py-3 rounded-2xl border ${selectedCategory === cat ? 'bg-orange-600 border-orange-600 shadow-md shadow-orange-100' : 'bg-white border-gray-100'}`}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${selectedCategory === cat ? 'text-white' : 'text-gray-400'}`}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Services List */}
                <View className="px-6 mb-10">
                    <Text className="text-[11px] font-black text-gray-400 uppercase tracking-[3px] mb-6 ml-1">Daily Home Operations</Text>
                    {HELP_SERVICES.filter(s => selectedCategory === 'All' || s.category === selectedCategory).map((service, idx) => (
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
                                className={`rounded-[24px] p-6 border-2 flex-row items-center ${selectedService?.id === service.id ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-50'
                                    }`}
                            >
                                <Image source={{ uri: service.image }} className="w-20 h-20 rounded-[24px]" />
                                <View className="ml-5 flex-1">
                                    <View className="flex-row justify-between items-start mb-1">
                                        <Text className="text-gray-900 font-black text-lg">{service.title}</Text>
                                        <Text className="text-orange-600 font-black">₹{service.price}</Text>
                                    </View>
                                    <View className="flex-row items-center mb-2">
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase">{service.category}</Text>
                                        <View className="w-1 h-1 bg-gray-200 rounded-full mx-2" />
                                        <Ionicons name="star" size={10} color="#F59E0B" />
                                        <Text className="text-gray-400 text-[10px] font-bold ml-1">{service.rating}</Text>
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
                            <Ionicons name="shield-checkmark" size={24} color="#F59E0B" />
                        </View>
                        <View className="ml-5 flex-1">
                            <Text className="text-gray-900 font-black">Vetted Professionals</Text>
                            <Text className="text-gray-500 text-[11px] font-medium leading-4 mt-0.5">Every staff member undergoes intense identity verification and criminal record checks.</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Service Detail Modal */}
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
                        key={`modal-help-${viewItem?.id}`}
                        entering={SlideInDown.duration(600).easing(Easing.inOut(Easing.ease))}
                        exiting={SlideOutDown.duration(500).easing(Easing.inOut(Easing.ease))}
                        className="bg-white rounded-t-[60px] p-10 max-h-[85%] shadow-2xl"
                    >
                        {viewItem && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="items-center mb-10">
                                    <View className="w-20 h-2 bg-gray-100 rounded-full mb-10" />
                                    <Image source={{ uri: viewItem.image }} className="w-64 h-64 rounded-[50px] mb-8" />
                                    <Text className="text-[11px] font-black text-orange-500 uppercase tracking-[4px] mb-3">{viewItem.category}</Text>
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
                                        <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-4">Included Tasks</Text>
                                        <View className="flex-row flex-wrap gap-3">
                                            {viewItem.tasks.map((task, si) => (
                                                <View key={si} className="bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                                    <Text className="text-gray-700 font-bold text-sm">{task}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row items-center justify-between mb-12">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pricing</Text>
                                        <Text className="text-gray-900 text-4xl font-black">₹{viewItem.price}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedService(viewItem);
                                            setViewItem(null);
                                        }}
                                        className="bg-orange-600 px-12 py-6 rounded-[28px] shadow-xl shadow-orange-100"
                                    >
                                        <Text className="text-white font-black uppercase tracking-widest text-base">SELECT SERVICE</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        )}
                    </Animated.View>
                </Animated.View>
            </Modal>

            {/* Payment Processing Gateway Simulation */}
            {orderStatus === 'paying' && (
                <Animated.View entering={FadeIn} exiting={FadeOut} className="absolute inset-0 bg-white items-center justify-center z-50">
                    <View className="items-center px-10">
                        <ActivityIndicator size="large" color="#F59E0B" />
                        <Text className="text-3xl font-black text-gray-900 mt-10 text-center">Security Protocol</Text>
                        <Text className="text-gray-500 font-medium text-center mt-4 leading-6">
                            Authorizing ₹{selectedService?.price} for domestic care...
                        </Text>
                        <View className="mt-12 bg-gray-50 p-8 rounded-[40px] w-full border border-gray-100">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-gray-400 font-bold">Banking Connect</Text>
                                <Ionicons name="lock-closed" size={16} color="#F59E0B" />
                            </View>
                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <Animated.View entering={FadeIn.duration(3000)} className="h-full bg-orange-500 w-full" />
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
                <View className="bg-gray-900 rounded-[44px] border border-white/10 p-8 flex-row items-center justify-between shadow-2xl">
                    <View>
                        <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Total Fee</Text>
                        <Text className="text-white text-3xl font-black">₹{selectedService?.price || 0}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleConfirm}
                        disabled={!selectedService}
                        activeOpacity={0.8}
                        className={`px-12 py-6 rounded-[28px] shadow-xl ${selectedService ? 'bg-orange-500 shadow-orange-200' : 'bg-white/10 shadow-transparent'
                            }`}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">
                            {orderStatus === 'paying' ? 'PREPARING...' : 'SECURE HELP'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}


