import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_PURPLE = '#6E5BFF';

export default function MemberDetailScreen() {
    const { name, relation, image, icon, phone, bio, rating, specialization } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleCall = () => {
        if (phone) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Linking.openURL(`tel:${phone}`);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
                className="px-6 flex-row items-center justify-between bg-white border-b border-gray-50"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center"
                >
                    <Ionicons name="chevron-back" size={24} color={BRAND_PURPLE} />
                </TouchableOpacity>
                <Text className="text-lg font-black text-gray-900">Care Profile</Text>
                <TouchableOpacity
                    onPress={handleCall}
                    className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center"
                >
                    <Ionicons name="call" size={20} color="#10B981" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Profile Hero */}
                <View className="items-center pt-8 pb-4">
                    <View className="relative">
                        <View className="w-32 h-32 rounded-[48px] overflow-hidden bg-indigo-50 items-center justify-center border-4 border-white shadow-xl">
                            {image ? (
                                <Image source={{ uri: image as string }} className="w-full h-full" />
                            ) : (
                                <Ionicons name={(icon as any) || 'person'} size={60} color={BRAND_PURPLE} />
                            )}
                        </View>
                        <View className="absolute bottom-1 right-1 w-8 h-8 rounded-2xl border-4 border-white bg-emerald-500" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 mt-6">{name}</Text>
                    <View className="bg-indigo-50 px-4 py-1.5 rounded-full mt-2">
                        <Text className="text-indigo-600 text-xs font-black uppercase tracking-widest">{relation}</Text>
                    </View>
                </View>

                {/* Quick Stats */}
                <View className="flex-row justify-center gap-x-6 mb-10 px-6">
                    <View className="items-center">
                        <Text className="text-gray-900 font-black text-xl">{rating || '4.9'}</Text>
                        <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Rating</Text>
                    </View>
                    <View className="w-[1px] h-8 bg-gray-100 self-center" />
                    <View className="items-center">
                        <Text className="text-gray-900 font-black text-xl">Verified</Text>
                        <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Status</Text>
                    </View>
                    <View className="w-[1px] h-8 bg-gray-100 self-center" />
                    <View className="items-center">
                        <Text className="text-gray-900 font-black text-xl">Online</Text>
                        <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Live</Text>
                    </View>
                </View>

                {/* About Section */}
                <Animated.View entering={FadeInUp.delay(200)} className="px-8 mb-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">About Advisor</Text>
                    <Text className="text-gray-600 text-base leading-7 font-medium">
                        {bio || `${name} is a certified ${relation} dedicated to providing premium care and support. With years of experience in senior assistance, they ensure safety, comfort, and companionship.`}
                    </Text>
                </Animated.View>

                {/* Expertise */}
                <Animated.View entering={FadeInUp.delay(300)} className="px-8 mb-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Expertise</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {(specialization as string || 'Senior Care,Medical Help,Companionship').split(',').map((item, idx) => (
                            <View key={idx} className="bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
                                <Text className="text-gray-700 font-bold text-xs">{item.trim()}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Actions */}
                <Animated.View entering={FadeInUp.delay(400)} className="px-8">
                    <TouchableOpacity
                        onPress={handleCall}
                        className="bg-indigo-600 py-6 rounded-[28px] items-center shadow-xl shadow-indigo-200 mb-4 flex-row justify-center"
                    >
                        <Ionicons name="call" size={20} color="white" className="mr-3" />
                        <Text className="text-white font-black uppercase tracking-widest ml-2">Call {name}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-gray-900 py-6 rounded-[28px] items-center flex-row justify-center"
                    >
                        <Ionicons name="chatbubble" size={20} color="white" className="mr-3" />
                        <Text className="text-white font-black uppercase tracking-widest ml-2">Send Message</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
