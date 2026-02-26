import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BRAND_GREEN = '#10B981';

export default function PalsAlertsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);

    const alerts = [
        {
            id: '1',
            type: 'SOS',
            senior: 'Ramesh Chandra',
            time: '10 mins ago',
            message: 'Emergency SOS triggered by medication delay.',
            status: 'unacknowledged',
            severity: 'high'
        },
        {
            id: '2',
            type: 'Movement',
            senior: 'Mrs. Kapoor',
            time: '1h ago',
            message: 'Unusual movement detected in living room.',
            status: 'acknowledged',
            severity: 'medium'
        },
        {
            id: '3',
            type: 'Health',
            senior: 'Ramesh Chandra',
            time: '3h ago',
            message: 'Blood Pressure slightly above normal limit.',
            status: 'acknowledged',
            severity: 'low'
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
                    <Text className="text-2xl font-black text-gray-900">Alert Center</Text>
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
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px]">Active Notifications</Text>
                    <TouchableOpacity>
                        <Text className="text-emerald-600 text-[10px] font-black uppercase">Clear All</Text>
                    </TouchableOpacity>
                </View>

                {alerts.map((alert, index) => (
                    <Animated.View
                        key={alert.id}
                        entering={FadeInUp.delay(index * 100).duration(600)}
                        className="mb-4"
                    >
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className={`p-6 rounded-[32px] border flex-row items-start ${alert.status === 'unacknowledged'
                                ? 'bg-orange-50 border-orange-200 shadow-sm'
                                : 'bg-gray-50 border-gray-100 opacity-80'
                                }`}
                        >
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${alert.severity === 'high' ? 'bg-red-500' :
                                alert.severity === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                                }`}>
                                <Ionicons name={alert.type === 'SOS' ? 'alert-circle' : alert.type === 'Movement' ? 'walk' : 'heart'} size={24} color="white" />
                            </View>

                            <View className="ml-4 flex-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-gray-900 font-bold text-sm">{alert.senior}</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold">{alert.time}</Text>
                                </View>
                                <Text className="text-gray-600 text-[11px] leading-4 mb-3">{alert.message}</Text>

                                {alert.status === 'unacknowledged' ? (
                                    <TouchableOpacity className="bg-orange-600 self-start px-4 py-2 rounded-xl">
                                        <Text className="text-white text-[10px] font-black uppercase tracking-widest">Acknowledge</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="flex-row items-center">
                                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                        <Text className="text-emerald-600 text-[10px] font-bold ml-1 uppercase">Resolved</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                <View className="mt-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6">Alert History</Text>
                    <View className="items-center justify-center py-10 opacity-30">
                        <Ionicons name="refresh" size={40} color="#9CA3AF" />
                        <Text className="text-gray-500 font-bold text-xs mt-3">Load older alerts</Text>
                    </View>
                </View>
            </ScrollView>

            <CustomBottomTab activeTab="Alerts" router={router} insets={insets} />
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
