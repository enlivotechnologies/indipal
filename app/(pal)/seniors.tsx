import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const BRAND_GREEN = '#10B981';

export default function PalsSeniorsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);

    const connectedSeniors = [
        {
            id: '1',
            name: 'Ramesh Chandra',
            age: 72,
            relation: 'Primary Care',
            image: 'https://images.unsplash.com/photo-1544144433-d50aff500b91?auto=format&fit=crop&q=80&w=400',
            address: 'Sector 4, HSR Layout, Bengaluru',
            status: 'At Home',
            lastVisit: 'Yesterday, 4:00 PM'
        },
        {
            id: '2',
            name: 'Mrs. Kapoor',
            age: 68,
            relation: 'Support Needed',
            image: 'https://images.unsplash.com/photo-1544126592-807daf21565c?auto=format&fit=crop&q=80&w=400',
            address: 'Koramangala 3rd Block, Bengaluru',
            status: 'Walking',
            lastVisit: '2 days ago'
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
                    <Text className="text-2xl font-black text-gray-900">Connections</Text>
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
                <Text className="text-xs font-black text-gray-400 uppercase tracking-[3px] mb-6">Linked Seniors</Text>

                {connectedSeniors.map((senior, index) => (
                    <Animated.View
                        key={senior.id}
                        entering={FadeInUp.delay(index * 100).duration(600)}
                        className="mb-6"
                    >
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden"
                            style={styles.card}
                        >
                            <View className="flex-row p-5">
                                <Image
                                    source={{ uri: senior.image }}
                                    className="w-20 h-20 rounded-3xl"
                                />
                                <View className="ml-5 flex-1 justify-center">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-xl font-black text-gray-900">{senior.name}</Text>
                                        <View className="bg-emerald-50 px-2 py-1 rounded-lg">
                                            <Text className="text-[10px] text-emerald-600 font-bold uppercase">{senior.age} Yrs</Text>
                                        </View>
                                    </View>
                                    <Text className="text-emerald-500 text-xs font-bold uppercase tracking-widest mt-1">{senior.relation}</Text>
                                    <View className="flex-row items-center mt-2">
                                        <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                                        <Text className="text-gray-500 text-[10px] font-bold">{senior.status}</Text>
                                    </View>
                                </View>
                            </View>

                            <View className="px-5 pb-5">
                                <View className="bg-gray-50 rounded-2xl p-4 flex-row items-center">
                                    <Ionicons name="location" size={16} color="#9CA3AF" />
                                    <Text className="text-gray-500 text-xs ml-3 flex-1" numberOfLines={1}>{senior.address}</Text>
                                </View>

                                <View className="flex-row justify-between items-center mt-4">
                                    <View>
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Last Check-in</Text>
                                        <Text className="text-gray-900 font-bold text-xs">{senior.lastVisit}</Text>
                                    </View>
                                    <View className="flex-row gap-x-2">
                                        <TouchableOpacity className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100">
                                            <Ionicons name="chatbubble-outline" size={18} color={BRAND_GREEN} />
                                        </TouchableOpacity>
                                        <TouchableOpacity className="w-10 h-10 bg-gray-900 rounded-xl items-center justify-center">
                                            <Ionicons name="chevron-forward" size={18} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                {/* Add New Connection Card */}
                <TouchableOpacity
                    className="border-2 border-dashed border-gray-200 rounded-[32px] p-8 items-center justify-center"
                >
                    <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-3">
                        <Ionicons name="add" size={24} color="#9CA3AF" />
                    </View>
                    <Text className="text-gray-400 font-bold text-sm">Link New Senior</Text>
                    <Text className="text-gray-300 text-[10px] uppercase tracking-widest mt-1">Requires Family Approval</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Custom Tab Bar - Copy from Home */}
            <CustomBottomTab activeTab="Seniors" router={router} insets={insets} />
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
    card: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 2,
    }
});
