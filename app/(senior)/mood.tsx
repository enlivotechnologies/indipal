import { useHealthStore } from "@/store/healthStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";


const BRAND_PURPLE = '#6E5BFF';

const MOODS = [
    { id: "great", emoji: "😆", label: "Great", color: "#3BB273" },
    { id: "good", emoji: "😊", label: "Good", color: BRAND_PURPLE },
    { id: "okay", emoji: "😐", label: "Okay", color: "#FFB800" },
    { id: "bad", emoji: "😔", label: "Low", color: "#FF5A5F" },
    { id: "angry", emoji: "😠", label: "Angry", color: "#9E2A2B" },
];

export default function MoodTracker() {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('services') ? 'Services' :
            pathname.includes('health') ? 'Health' :
                pathname.includes('video') ? 'Video' : 'Home';

    const { updateMood } = useHealthStore();

    const handleSave = () => {
        if (!selectedMood) return;

        const moodObj = MOODS.find(m => m.id === selectedMood);
        updateMood({
            type: moodObj?.label as any,
            note,
            timestamp: new Date().toISOString()
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/(senior)/home' as any);
    };

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
                    <Text className="text-2xl font-black text-gray-900">Daily Mood</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                >
                    <Ionicons name="chevron-back" size={20} color={BRAND_PURPLE} />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={{
                        paddingHorizontal: 24,
                        paddingBottom: insets.bottom + 120
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-gray-500 font-medium text-lg leading-7 mt-6 mb-8 text-center">
                        Checking in on your well-being helps your care team stay updated.
                    </Text>

                    <View className="flex-row justify-between mb-10">
                        {MOODS.map((mood) => (
                            <TouchableOpacity
                                key={mood.id}
                                style={[
                                    styles.moodCard,
                                    selectedMood === mood.id && { borderColor: mood.color, backgroundColor: `${mood.color}05`, borderWidth: 2 }
                                ]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSelectedMood(mood.id);
                                }}
                                className="w-[18%] aspect-[0.7] bg-white rounded-2xl items-center justify-center border border-gray-100"
                            >
                                <Text className="text-3xl mb-2">{mood.emoji}</Text>
                                <Text className={`text-[9px] font-black uppercase tracking-wider ${selectedMood === mood.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    {mood.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Add a Note (Optional)</Text>
                    <View className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm mb-10">
                        <TextInput
                            className="text-gray-900 text-base leading-6 h-32"
                            placeholder="How are you feeling today?"
                            placeholderTextColor="#9CA3AF"
                            multiline
                            textAlignVertical="top"
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>

                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Recent History</Text>
                    <View className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50">
                        <HistoryItem
                            emoji="😊"
                            date="Yesterday"
                            time="10:00 AM"
                            note="Felt good after walking in the park."
                        />
                        <View className="h-[1px] bg-indigo-100 my-4" />
                        <HistoryItem
                            emoji="😆"
                            date="22 Feb"
                            time="09:30 AM"
                            note="Family visited today!"
                        />
                    </View>

                    <TouchableOpacity
                        disabled={!selectedMood}
                        onPress={handleSave}
                        style={[styles.seniorButtonPrimary, !selectedMood && styles.disabledBtn]}
                        className="mt-12 bg-indigo-600 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-indigo-200"
                    >
                        <Text className="text-white font-black text-sm uppercase tracking-widest">Save Daily Entry</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

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

function HistoryItem({ emoji, date, time, note }: any) {
    return (
        <View className="flex-row items-center">
            <Text className="text-2xl">{emoji}</Text>
            <View className="ml-4 flex-1">
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{date} • {time}</Text>
                <Text className="text-gray-900 font-bold text-sm mt-0.5">{note}</Text>
            </View>
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
    },
    moodCard: {
        shadowColor: BRAND_PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    seniorButtonPrimary: {
        shadowColor: BRAND_PURPLE,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    disabledBtn: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0,
    }
});
