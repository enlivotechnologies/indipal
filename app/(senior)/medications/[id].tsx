import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BRAND_PURPLE = '#6E5BFF';

export default function MedicationDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Mock data based on id
    const med = {
        name: id === "1" ? "Amlodipine" : "Metformin",
        dosage: id === "1" ? "5mg" : "500mg",
        time: "08:00 AM",
        frequency: "Once Daily",
        doctor: "Dr. Smith (Cardiologist)",
        notes: "Take after breakfast. Do not skip even if feeling better.",
        remaining: "14 tabs",
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
                    <Text className="text-2xl font-black text-gray-900">Details</Text>
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
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 40
                }}
            >
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="items-center mt-10 mb-10">
                    <View className="w-24 h-24 bg-indigo-50 rounded-[32px] items-center justify-center mb-6 shadow-sm">
                        <Ionicons name="medical" size={44} color={BRAND_PURPLE} />
                    </View>
                    <Text className="text-gray-900 font-black text-3xl">{med.name}</Text>
                    <Text className="text-indigo-500 font-black text-lg mt-1">{med.dosage}</Text>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(600)} className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm gap-y-8">
                    <DetailRow label="Time" value={med.time} icon="time-outline" />
                    <DetailRow label="Frequency" value={med.frequency} icon="repeat-outline" />
                    <DetailRow label="Doctor" value={med.doctor} icon="person-outline" />
                    <DetailRow label="Stock" value={med.remaining} icon="cube-outline" />
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(300).duration(600)} className="mt-10">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Instructions</Text>
                    <View className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/30">
                        <Text className="text-gray-700 text-base leading-6 font-medium">
                            {med.notes}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(400).duration(600)} className="flex-row gap-x-4 mt-12">
                    <TouchableOpacity
                        style={styles.actionBtn}
                        className="flex-1 h-16 rounded-[24px] bg-indigo-50 items-center justify-center border border-indigo-100"
                    >
                        <Text className="text-indigo-600 font-black text-xs uppercase tracking-widest">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.deleteBtn]}
                        className="flex-1 h-16 rounded-[24px] bg-red-50 items-center justify-center border border-red-100"
                    >
                        <Text className="text-red-600 font-black text-xs uppercase tracking-widest">Delete</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

function DetailRow({ label, value, icon }: { label: string; value: string; icon: any }) {
    return (
        <View className="flex-row items-center">
            <View className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center">
                <Ionicons name={icon} size={22} color={BRAND_PURPLE} />
            </View>
            <View className="ml-5">
                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{label}</Text>
                <Text className="text-gray-900 font-bold text-lg mt-0.5">{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    actionBtn: {
        shadowColor: BRAND_PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 2,
    },
    deleteBtn: {
        shadowColor: '#EF4444',
    }
});
