import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function PalsTasksScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);

    const tasks = [
        {
            id: '1',
            title: 'Grocery Pickup',
            senior: 'Ramesh Chandra',
            dueDate: 'Today, 2:00 PM',
            status: 'active',
            priority: 'medium',
            items: ['Milk (2L)', 'Whole Wheat Bread', 'Vicks Vaporub']
        },
        {
            id: '2',
            title: 'House Help Supervision',
            senior: 'Mrs. Kapoor',
            dueDate: 'Today, 4:30 PM',
            status: 'pending',
            priority: 'low',
            note: 'Monitor cleaning of the kitchen area.'
        },
        {
            id: '3',
            title: 'Medicine Delivery',
            senior: 'Ramesh Chandra',
            dueDate: 'Yesterday',
            status: 'completed',
            priority: 'high'
        }
    ];

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row justify-between items-center bg-white"
            >
                <View>
                    <Text className="text-xs font-bold text-emerald-400 uppercase tracking-widest">EnlivoCare</Text>
                    <Text className="text-2xl font-black text-gray-900">Task Board</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/(pal)/profile' as any)}
                    className="w-10 h-10 bg-emerald-100 rounded-[24px] items-center justify-center overflow-hidden border border-emerald-200"
                >
                    {user?.profileImage ? (
                        <Image source={{ uri: user.profileImage }} className="w-full h-full" />
                    ) : (
                        <Ionicons name="person" size={20} color={BRAND_GREEN} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 24,
                    paddingBottom: insets.bottom + 100
                }}
            >
                <View className="mb-10">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6">Active Tasks</Text>

                    {tasks.filter(t => t.status !== 'completed').map((task, index) => (
                        <Animated.View
                            key={task.id}
                            entering={FadeInUp.delay(index * 100).duration(600)}
                            className="mb-6"
                        >
                            <TouchableOpacity
                                activeOpacity={0.9}
                                className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6"
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center">
                                            <Ionicons name={task.title.includes('Grocery') ? 'cart' : 'shield-checkmark'} size={20} color={BRAND_GREEN} />
                                        </View>
                                        <View className="ml-4">
                                            <Text className="text-gray-900 font-bold text-base">{task.title}</Text>
                                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">For {task.senior}</Text>
                                        </View>
                                    </View>
                                    <View className={`px-2 py-1 rounded-lg ${task.priority === 'high' ? 'bg-red-50' : 'bg-gray-50'}`}>
                                        <Text className={`text-[8px] font-black uppercase ${task.priority === 'high' ? 'text-red-500' : 'text-gray-400'}`}>{task.priority}</Text>
                                    </View>
                                </View>

                                {task.items && (
                                    <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                                        {task.items.map((item, i) => (
                                            <View key={i} className="flex-row items-center mb-1">
                                                <Ionicons name="ellipse" size={6} color="#10B981" />
                                                <Text className="text-gray-600 text-xs ml-2">{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-[10px] font-bold ml-1 uppercase">{task.dueDate}</Text>
                                    </View>
                                    <TouchableOpacity className="bg-emerald-600 px-6 py-3 rounded-2xl">
                                        <Text className="text-white text-[10px] font-black uppercase tracking-widest">Complete</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View>
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6">Completed Recently</Text>
                    {tasks.filter(t => t.status === 'completed').map((task) => (
                        <View key={task.id} className="flex-row items-center bg-gray-50 p-4 rounded-3xl mb-3 opacity-60">
                            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center">
                                <Ionicons name="checkmark" size={16} color={BRAND_GREEN} />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-gray-500 font-bold text-sm tracking-tight">{task.title}</Text>
                                <Text className="text-gray-400 text-[9px] font-bold flex-1">Completed for {task.senior}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <CustomBottomTab activeTab="Tasks" router={router} insets={insets} />
        </View>
    );
}

function CustomBottomTab({ activeTab, router, insets }: any) {
    const handleTabPress = (tab: string) => {
        if (tab === 'Home') router.replace('/(pal)/home');
        if (tab === 'Seniors') router.replace('/(pal)/seniors');
        if (tab === 'Alerts') router.replace('/(pal)/alerts');
        if (tab === 'Tasks') router.replace('/(pal)/tasks');
    };

    return (
        <Animated.View entering={FadeInUp.delay(200).duration(600)} className="absolute bottom-0 left-0 right-0 px-6 bg-white/10" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <View style={styles.tabBar} className="bg-gray-900/95 flex-row items-center h-16 rounded-[28px] px-2 shadow-2xl">
                <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
                <TabButton icon="people" label="Seniors" active={activeTab === 'Seniors'} onPress={() => handleTabPress('Seniors')} />
                <TabButton icon="notifications" label="Alerts" active={activeTab === 'Alerts'} onPress={() => handleTabPress('Alerts')} />
                <TabButton icon="list" label="Tasks" active={activeTab === 'Tasks'} onPress={() => handleTabPress('Tasks')} />
            </View>
        </Animated.View>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    },
});
