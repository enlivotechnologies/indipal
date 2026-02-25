import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TrainingModuleScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const [currentStep, setCurrentStep] = useState(0);

    const steps = [
        { title: 'The Importance of Sanitization', content: 'As an EnlivoCare Pal, your first priority upon arrival is sanitizing your hands and equipment. This protects both you and the senior from potential infections.' },
        { title: 'Proper Mask Usage', content: 'Always wear a medical-grade mask when within 2 meters of the senior. Change masks every 4 hours or if they become damp.' },
        { title: 'Waste Management', content: 'Dispose of medical waste separately from household trash. Use the provided red biohazard bags for any bandages or needles.' },
    ];

    const handleNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(pal)/training');
            }
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }]} className="px-6 flex-row items-center border-b border-gray-50">
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(pal)/training')}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-black text-gray-900">Module {id}</Text>
                    <View className="h-1 bg-gray-100 rounded-full mt-2 w-24 overflow-hidden">
                        <View style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} className="h-full bg-indigo-500" />
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 40 }}>
                <Animated.View key={currentStep} entering={FadeInUp.duration(600)}>
                    <View className="w-20 h-20 bg-indigo-50 rounded-[32px] items-center justify-center mb-8 border border-indigo-100">
                        <Ionicons name="book" size={32} color="#6366F1" />
                    </View>
                    <Text className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Lesson {currentStep + 1} of {steps.length}</Text>
                    <Text className="text-3xl font-black text-gray-900 mb-6 leading-tight">{steps[currentStep].title}</Text>
                    <Text className="text-gray-500 text-lg leading-8 font-medium">{steps[currentStep].content}</Text>
                </Animated.View>

                {/* Decorative visual */}
                <View className="h-64 bg-gray-50 rounded-[40px] mt-10 border border-dashed border-gray-200 items-center justify-center">
                    <Ionicons name="play" size={48} color="#D1D5DB" />
                    <Text className="text-gray-400 font-bold text-xs mt-4 uppercase tracking-[4px]">Concept Video</Text>
                </View>
            </ScrollView>

            <View style={{ paddingBottom: Math.max(insets.bottom, 24) }} className="px-6 pt-4 bg-white border-t border-gray-50">
                <TouchableOpacity
                    onPress={handleNext}
                    className="bg-gray-900 py-6 rounded-[24px] items-center"
                >
                    <Text className="text-white font-black uppercase tracking-widest text-sm">
                        {currentStep === steps.length - 1 ? 'Complete & Close' : 'Save & Continue'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: 'white',
    }
});
