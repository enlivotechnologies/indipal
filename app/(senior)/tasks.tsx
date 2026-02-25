import { useErrandStore } from '@/store/errandStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Premium Palette for Seniors
const BRAND_PURPLE = '#6E5BFF';
const DARK_PURPLE = '#4C3BFF';

export default function SeniorTasksScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { errands } = useErrandStore();

    const sortedErrands = useMemo(() => {
        const order: Record<string, number> = { 'in-progress': 0, 'pending': 1, 'completed': 2 };
        return [...errands].sort((a, b) => order[a.status] - order[b.status]);
    }, [errands]);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'in-progress': return { label: 'In Progress', color: '#6E5BFF', bg: '#F5F3FF' };
            case 'completed': return { label: 'Completed', color: '#10B981', bg: '#ECFDF5' };
            default: return { label: 'Assigned', color: '#F59E0B', bg: '#FFFBEB' };
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Pharmacy': return 'bandage-outline';
            case 'Grocery': return 'cart-outline';
            case 'Medical': return 'medkit-outline';
            default: return 'receipt-outline';
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <LinearGradient
                colors={['#F5F3FF', '#FFFFFF']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View
                className="px-6 pb-6 pt-4 bg-white/80 backdrop-blur-xl border-b border-gray-100"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <Text className="text-xl font-black text-gray-900">Today's Tasks</Text>

                    <View className="w-12" />
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, paddingTop: 24 }}
            >
                {/* Summary Card */}
                <Animated.View
                    entering={FadeInDown.duration(600)}
                    className="bg-gray-900 p-8 rounded-[40px] mb-8 shadow-2xl shadow-indigo-200"
                >
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Status Overview</Text>
                            <Text className="text-white font-black text-2xl">Daily Assistance</Text>
                        </View>
                        <View className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
                            <Text className="text-white font-black text-lg">
                                {errands.filter(e => e.status === 'completed').length}/{errands.length}
                            </Text>
                        </View>
                    </View>

                    <View className="h-[1px] bg-white/10 my-6" />

                    <View className="flex-row justify-between">
                        <View className="items-center">
                            <Text className="text-indigo-400 font-black text-xl">{errands.filter(e => e.status === 'in-progress').length}</Text>
                            <Text className="text-white/40 text-[8px] font-black uppercase tracking-widest mt-1">Active</Text>
                        </View>
                        <View className="w-[1px] h-8 bg-white/10" />
                        <View className="items-center">
                            <Text className="text-amber-400 font-black text-xl">{errands.filter(e => e.status === 'pending').length}</Text>
                            <Text className="text-white/40 text-[8px] font-black uppercase tracking-widest mt-1">Pending</Text>
                        </View>
                        <View className="w-[1px] h-8 bg-white/10" />
                        <View className="items-center">
                            <Text className="text-emerald-400 font-black text-xl">{errands.filter(e => e.status === 'completed').length}</Text>
                            <Text className="text-white/40 text-[8px] font-black uppercase tracking-widest mt-1">Done</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Tasks List */}
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Live Updates</Text>

                {sortedErrands.length === 0 ? (
                    <View className="items-center justify-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <Ionicons name="clipboard-outline" size={48} color="#CBD5E1" />
                        <Text className="text-gray-400 font-bold mt-4">No tasks assigned for today</Text>
                    </View>
                ) : (
                    sortedErrands.map((errand, idx) => {
                        const status = getStatusStyles(errand.status);
                        return (
                            <Animated.View
                                key={errand.id}
                                entering={FadeInDown.delay(idx * 150)}
                                layout={Layout.springify()}
                                className="mb-6"
                            >
                                <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                                    <View className="flex-row items-center mb-5">
                                        <View
                                            style={{ backgroundColor: status.bg }}
                                            className="w-14 h-14 rounded-2xl items-center justify-center"
                                        >
                                            <Ionicons name={getCategoryIcon(errand.category)} size={28} color={status.color} />
                                        </View>
                                        <View className="ml-5 flex-1">
                                            <Text className="text-gray-900 font-black text-lg">{errand.title}</Text>
                                            <View className="flex-row items-center mt-1">
                                                <Ionicons name="time-outline" size={14} color="#94A3B8" />
                                                <Text className="text-gray-400 text-xs font-bold ml-1">{errand.time}</Text>
                                            </View>
                                        </View>
                                        <View
                                            style={{ backgroundColor: status.bg }}
                                            className="px-3 py-1.5 rounded-xl border border-gray-100"
                                        >
                                            <Text style={{ color: status.color }} className="text-[10px] font-black uppercase tracking-tight">
                                                {status.label}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Pal Assignment Info */}
                                    {errand.palName && (
                                        <View className="flex-row items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                            <View className="flex-row items-center">
                                                <Image
                                                    source={{ uri: errand.palImage }}
                                                    className="w-10 h-10 rounded-full border-2 border-white"
                                                />
                                                <View className="ml-3">
                                                    <Text className="text-gray-900 font-black text-[12px]">{errand.palName}</Text>
                                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Your Care Pal</Text>
                                                </View>
                                            </View>

                                            <View className="flex-row items-center gap-x-2">
                                                <TouchableOpacity
                                                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                                                    className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-100"
                                                >
                                                    <Ionicons name="chatbubble-outline" size={20} color="#1F2937" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                                                    className="w-10 h-10 bg-gray-900 rounded-xl items-center justify-center"
                                                >
                                                    <Ionicons name="call" size={18} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {errand.status === 'in-progress' && (
                                        <View className="mt-4 flex-row items-center px-1">
                                            <View className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-2" />
                                            <Text className="text-indigo-600 font-bold text-[11px]">Pal is currently working on this task...</Text>
                                        </View>
                                    )}
                                </View>
                            </Animated.View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({});
