import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainingScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const modules = [
        { id: '1', title: 'Hygiene Protocols', duration: '15 mins', icon: 'medical', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', progress: 100 },
        { id: '2', title: 'Emergency Handling', duration: '25 mins', icon: 'alert-circle', image: 'https://images.unsplash.com/photo-1582750433449-64c3efdf1e6d?auto=format&fit=crop&q=80&w=400', progress: 45 },
        { id: '3', title: 'Senior Psych 101', duration: '20 mins', icon: 'heart', image: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=400', progress: 0 },
        { id: '4', title: 'Nutrition & Diet', duration: '30 mins', icon: 'nutrition', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=400', progress: 0 },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center justify-between border-b border-gray-50 bg-white">
                <Text className="text-2xl font-black text-gray-900">Training</Text>
                <TouchableOpacity
                    onPress={() => router.push('/(pal)/profile' as any)}
                    className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                >
                    <Ionicons name="person-outline" size={20} color="#10B981" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}>
                <View className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 mb-10">
                    <Text className="text-indigo-900 text-xl font-black mb-2">Skill Up with Enlivo</Text>
                    <Text className="text-indigo-600/80 text-xs leading-5">Complete these certified modules to increase your gig acceptance rate and unlock premium high-payout opportunities.</Text>
                </View>

                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Curated Modules</Text>

                {modules.map((module, idx) => (
                    <Animated.View key={module.id} entering={FadeInUp.delay(idx * 100)}>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push({ pathname: '/(pal)/training-module', params: { id: module.id } } as any);
                            }}
                            className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-6"
                        >
                            <View className="h-40 w-full relative">
                                <Image source={{ uri: module.image }} className="w-full h-full" />
                                <View className="absolute inset-0 bg-black/20" />
                                <View className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full border border-white">
                                    <Text className="text-[10px] font-black uppercase text-gray-900">{module.duration}</Text>
                                </View>
                                {module.progress === 100 && (
                                    <View className="absolute top-4 right-4 bg-emerald-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
                                        <Ionicons name="checkmark" size={16} color="white" />
                                    </View>
                                )}
                            </View>
                            <View className="p-6">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-xl font-black text-gray-900">{module.title}</Text>
                                    <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                                </View>
                                <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <View style={{ width: `${module.progress}%` }} className="h-full bg-indigo-500" />
                                </View>
                                <View className="flex-row justify-between mt-3">
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{module.progress}% Completed</Text>
                                    <Text className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">{module.progress === 100 ? 'Certified' : 'Continue'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Custom Bottom Tab Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row items-center h-16 rounded-[28px] px-2 shadow-2xl">
                    <TabButton icon="home" label="Home" active={false} onPress={() => router.replace('/(pal)/home')} />
                    <TabButton icon="briefcase" label="Gig" active={false} onPress={() => router.replace('/(pal)/active-gig')} />
                    <TabButton icon="wallet" label="Earnings" active={false} onPress={() => router.replace('/(pal)/earnings')} />
                    <TabButton icon="school" label="Training" active={true} onPress={() => router.replace('/(pal)/training')} />
                </View>
            </Animated.View>
        </View>
    );
}

function TabButton({ icon, label, active, onPress }: any) {
    return (
        <View className="flex-1 h-full items-center justify-center">
            <TouchableOpacity
                onPress={onPress}
                className={`flex-row items-center justify-center px-4 h-10 rounded-2xl ${active ? 'bg-emerald-500' : ''}`}
            >
                <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
                {active && <Text numberOfLines={1} className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
