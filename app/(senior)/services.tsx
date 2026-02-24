import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React from "react";
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BRAND_PURPLE = '#6E5BFF';

const SERVICES = [
    { id: '1', title: 'Home Nurse', desc: 'Expert Care', icon: 'person-add', color: '#10B981', image: 'https://images.unsplash.com/photo-1582750433449-64c3efdf1e6d?auto=format&fit=crop&q=80&w=400' },
    { id: '2', title: 'House Help', desc: 'Maintenance', icon: 'home', color: '#F59E0B', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400' },
    { id: '3', title: 'Grocery', desc: 'Essentials', icon: 'cart', color: '#06B6D4', image: 'https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=400' },
    { id: '4', title: 'Pharmacy', desc: 'Medicines', icon: 'bandage', color: '#6366F1', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400' },
];

export default function ServicesList() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('services') ? 'Services' :
            pathname.includes('health') ? 'Health' :
                pathname.includes('video') ? 'Video' : 'Services';

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home' as any);
        if (tab === 'Services') router.replace('/(senior)/services' as any);
        if (tab === 'Health') router.replace('/(senior)/health' as any);
        if (tab === 'Video') router.replace('/(senior)/video' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row justify-between items-center bg-white"
            >
                <View>
                    <Text className="text-xs font-bold text-indigo-400 uppercase tracking-widest">EnlivoCare</Text>
                    <Text className="text-2xl font-black text-gray-900">Services</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                >
                    <Ionicons name="chevron-back" size={20} color={BRAND_PURPLE} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 120
                }}
            >
                {/* Search Bar */}
                <View className="mb-8">
                    <View className="bg-gray-50 flex-row items-center px-6 py-4 rounded-[28px] border border-gray-200">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search for any care service..."
                            className="ml-3 flex-1 text-gray-800 font-bold"
                        />
                    </View>
                </View>

                {/* Core Services Grid */}
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Daily Essentials</Text>
                <View className="flex-row flex-wrap justify-between">
                    {SERVICES.map((service, idx) => (
                        <Animated.View
                            key={service.id}
                            entering={FadeInDown.delay(200 + idx * 50)}
                            className="w-[48%] mb-5"
                        >
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    router.push({
                                        pathname: '/(senior)/service-detail',
                                        params: { title: service.title, icon: service.icon, color: service.color }
                                    } as any);
                                }}
                                className="h-44 rounded-[24px] overflow-hidden shadow-2xl shadow-black/20 relative bg-gray-900"
                            >
                                <Image source={{ uri: service.image }} className="absolute inset-0 w-full h-full opacity-60" resizeMode="cover" />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
                                    className="absolute inset-0 p-6 justify-end"
                                >
                                    <View
                                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                        className="w-10 h-10 rounded-xl items-center justify-center mb-3 border border-white/20 backdrop-blur-md"
                                    >
                                        <Ionicons name={service.icon as any} size={20} color="white" />
                                    </View>
                                    <Text className="text-white font-black text-base leading-tight mb-0.5">{service.title}</Text>
                                    <Text className="text-white/50 text-[8px] font-black uppercase tracking-[2px]">{service.desc}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Coordinator Section */}
                <View className="mt-12 bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 items-center">
                    <Text className="text-indigo-900 font-black text-center text-lg mb-2">Need Custom Care?</Text>
                    <Text className="text-indigo-600/80 text-center text-sm font-medium mb-6">Talk to our health coordinator for personalized assistance.</Text>
                    <TouchableOpacity
                        className="bg-indigo-600 px-10 py-4 rounded-2xl shadow-lg shadow-indigo-200"
                    >
                        <Text className="text-white font-black text-sm uppercase tracking-widest">Call Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Custom Floating Bottom Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row justify-between items-center h-16 rounded-[28px] px-3 shadow-2xl">
                    <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
                    <TabButton icon="grid" label="Services" active={activeTab === 'Services'} onPress={() => handleTabPress('Services')} />
                    <TabButton icon="heart" label="Health" active={activeTab === 'Health'} onPress={() => handleTabPress('Health')} />
                    <TabButton icon="videocam" label="Video" active={activeTab === 'Video'} onPress={() => handleTabPress('Video')} />
                </View>
            </Animated.View>
        </View>
    );
}

function TabButton({ icon, label, active, onPress }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center px-4 py-2 rounded-2xl ${active ? 'bg-indigo-600' : ''}`}
        >
            <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
            {active && <Text className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
