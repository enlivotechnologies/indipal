import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AVAILABILITY_DATA = [
    { day: 'Mon', date: '24 Feb', slots: ['09:00 AM', '02:00 PM', '06:00 PM'] },
    { day: 'Tue', date: '25 Feb', slots: ['10:00 AM', '03:00 PM'] },
    { day: 'Wed', date: '26 Feb', slots: ['09:00 AM', '11:00 AM', '04:00 PM', '07:00 PM'] },
    { day: 'Thu', date: '27 Feb', slots: ['01:00 PM', '05:00 PM'] },
    { day: 'Fri', date: '28 Feb', slots: ['09:00 AM', '12:00 PM', '03:00 PM'] },
];

export default function PalProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [selectedDay, setSelectedDay] = useState(2); // Default to tomorrow

    // Extract params safely
    const palId = useMemo(() => Array.isArray(params.id) ? params.id[0] : params.id, [params.id]);
    const palName = useMemo(() => Array.isArray(params.name) ? params.name[0] : params.name, [params.name]);
    const palImage = useMemo(() => Array.isArray(params.image) ? params.image[0] : params.image, [params.image]);

    // Simulated Pal Data based on selection or defaults
    const pal = useMemo(() => ({
        id: palId || '1',
        name: palName || 'Arjun Singh',
        image: palImage || 'https://i.pravatar.cc/150?u=arjun',
        rating: 4.9,
        reviews: 124,
        experience: '5+ Years',
        bio: 'Dedicated and compassionate caregiver with expertise in elderly support. Certified in basic life support and specialized in mobility assistance and companionship.',
        languages: ['Hindi', 'English', 'Kannada'],
        specialties: ['Post-op Care', 'Dementia Support', 'Mobility'],
        hourlyRate: '₹450',
        verified: true,
        certificates: [
            { id: 'c1', title: 'Advanced Caregiving', issuer: 'National Health Council', year: '2023' },
            { id: 'c2', title: 'CPR & First Aid', issuer: 'Red Cross Society', year: '2024' }
        ]
    }), [palId, palName, palImage]);

    const handleDateSelect = async (index: number) => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {
            // Haptics failed, continue anyway
        }
        setSelectedDay(index);
    };

    const handleBook = async () => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) { }
        // Booking logic would go here
    };

    const currentDayData = AVAILABILITY_DATA[selectedDay] || AVAILABILITY_DATA[0];

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header with Overlay */}
            <View className="relative h-80">
                <Image source={{ uri: pal.image }} className="w-full h-full" resizeMode="cover" />
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent', 'white']}
                    className="absolute inset-0"
                />

                {/* Top Controls */}
                <View
                    className="absolute left-0 right-0 px-6 flex-row justify-between"
                    style={{ top: Math.max(insets.top, 16) }}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30"
                    >
                        <Ionicons name="share-outline" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Floating Profile Info Overlay */}
                <View className="absolute bottom-0 left-0 right-0 px-6 translate-y-12">
                    <Animated.View
                        entering={FadeInDown.delay(100)}
                        className="bg-white rounded-[40px] p-6 shadow-2xl shadow-black/10 flex-row items-center border border-gray-50"
                    >
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <Text className="text-2xl font-black text-gray-900">{pal.name}</Text>
                                {pal.verified && (
                                    <View className="ml-2">
                                        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                                    </View>
                                )}
                            </View>
                            <View className="flex-row items-center mt-1">
                                <Ionicons name="star" size={14} color="#F59E0B" />
                                <Text className="text-gray-900 font-bold ml-1">{pal.rating.toString()}</Text>
                                <Text className="text-gray-400 text-xs ml-1">({pal.reviews.toString()} Reviews)</Text>
                                <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                                <Text className="text-gray-500 font-bold text-xs uppercase">{pal.experience}</Text>
                            </View>
                        </View>
                        <View className="bg-orange-50 px-4 py-3 rounded-2xl items-center justify-center border border-orange-100">
                            <Text className="text-orange-600 font-black text-lg">{pal.hourlyRate}</Text>
                            <Text className="text-orange-400 text-[8px] font-bold uppercase">per hour</Text>
                        </View>
                    </Animated.View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1 mt-14"
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 100 }}
            >
                {/* Bio */}
                <Animated.View entering={FadeInDown.delay(200)} className="mb-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">About Pal</Text>
                    <Text className="text-gray-600 leading-6 text-sm">
                        {pal.bio}
                    </Text>
                </Animated.View>

                {/* Certifications (Visual) */}
                <Animated.View entering={FadeInDown.delay(300)} className="mb-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Certifications & Verification</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {pal.certificates.map((cert) => (
                            <View key={cert.id} className="bg-gray-50 border border-gray-100 p-4 rounded-3xl flex-row items-center w-full">
                                <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-gray-50">
                                    <Ionicons name="ribbon-outline" size={24} color="#F59E0B" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-gray-900 font-bold text-sm">{cert.title}</Text>
                                    <Text className="text-gray-400 text-[10px] font-medium">{cert.issuer} • {cert.year}</Text>
                                </View>
                                <Ionicons name="document-text-outline" size={20} color="#D1D5DB" />
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Availability Calendar */}
                <Animated.View entering={FadeInDown.delay(400)} className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Availability</Text>
                        <Text className="text-orange-600 font-black text-[10px] uppercase">February 2026</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 mb-6">
                        {AVAILABILITY_DATA.map((item, index) => {
                            const isSelected = selectedDay === index;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleDateSelect(index)}
                                    className={`mr-4 items-center p-4 rounded-[32px] w-20 border ${isSelected
                                        ? 'bg-orange-500 border-orange-500 shadow-lg'
                                        : 'bg-gray-50 border-gray-100'
                                        }`}
                                >
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-gray-400'}`} style={{ opacity: isSelected ? 0.7 : 1 }}>
                                        {item.day}
                                    </Text>
                                    <Text className={`text-base font-black mt-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                        {item.date.split(' ')[0]}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Time Slots */}
                    <View className="flex-row flex-wrap gap-2">
                        {currentDayData.slots.map((slot, index) => (
                            <TouchableOpacity
                                key={index}
                                className="bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm"
                            >
                                <Text className="text-gray-900 font-bold text-xs">{slot}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>

                {/* Action Buttons */}
                <Animated.View entering={FadeInDown.delay(500)} className="flex-row gap-x-3">
                    <TouchableOpacity
                        className="flex-1 bg-gray-900 py-5 rounded-[28px] items-center justify-center shadow-xl shadow-gray-200"
                        onPress={handleBook}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-widest">Book Pal Now</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-16 bg-gray-50 rounded-[28px] items-center justify-center border border-gray-100"
                        onPress={() => router.push({ pathname: '/(family)/chat/[id]', params: { id: pal.id } })}
                    >
                        <Ionicons name="chatbubbles-outline" size={24} color="#1F2937" />
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            {/* Persistent Bottom Buffer */}
            <View style={{ height: 20 }} />
        </View>
    );
}

const styles = StyleSheet.create({});
