import { useChatStore } from "@/store/chatStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface BottomTabProps {
    activeTab: 'Home' | 'Gig' | 'Earnings' | 'Connect' | 'Training';
}

export function BottomTab({ activeTab }: BottomTabProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { conversations } = useChatStore();

    const totalUnreadCount = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(pal)/home');
        if (tab === 'Gig') router.replace('/(pal)/active-gig');
        if (tab === 'Earnings') router.replace('/(pal)/earnings');
        if (tab === 'Connect') router.replace('/(pal)/chat');
        if (tab === 'Training') router.replace('/(pal)/training');
    };

    return (
        <Animated.View
            entering={FadeInUp.delay(200).duration(600)}
            className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
        >
            <View style={styles.tabBar} className="bg-gray-900/95 flex-row items-center h-16 rounded-[28px] px-2 shadow-2xl">
                <TabButton
                    icon="home"
                    label="Home"
                    active={activeTab === 'Home'}
                    onPress={() => handleTabPress('Home')}
                />
                <TabButton
                    icon="briefcase"
                    label="Gig"
                    active={activeTab === 'Gig'}
                    onPress={() => handleTabPress('Gig')}
                />
                <TabButton
                    icon="wallet"
                    label="Earnings"
                    active={activeTab === 'Earnings'}
                    onPress={() => handleTabPress('Earnings')}
                />
                <TabButton
                    icon="chatbubbles"
                    label="Connect"
                    active={activeTab === 'Connect'}
                    unreadCount={totalUnreadCount}
                    onPress={() => handleTabPress('Connect')}
                />
                <TabButton
                    icon="school"
                    label="Training"
                    active={activeTab === 'Training'}
                    onPress={() => handleTabPress('Training')}
                />
            </View>
        </Animated.View>
    );
}

function TabButton({ icon, label, active, onPress, unreadCount }: any) {
    return (
        <View className="flex-1 h-full items-center justify-center">
            <TouchableOpacity
                onPress={onPress}
                className={`flex-row items-center justify-center px-4 h-10 rounded-2xl ${active ? 'bg-emerald-500' : ''}`}
            >
                <View>
                    <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
                    {!active && unreadCount > 0 && (
                        <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-4 h-4 items-center justify-center border border-gray-900">
                            <Text className="text-[7px] text-white font-black">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                        </View>
                    )}
                </View>
                {active && <Text numberOfLines={1} className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
