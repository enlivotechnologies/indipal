import { HapticTab } from "@/components/haptic-tab";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { Tabs, usePathname, useRouter } from "expo-router";
import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SeniorLayout() {
    const pathname = usePathname();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const isSosScreen = pathname.includes('sos');

    // Shared values for dragging
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const contextX = useSharedValue(0);
    const contextY = useSharedValue(0);

    const dragGesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = translateX.value;
            contextY.value = translateY.value;
        })
        .onUpdate((event) => {
            translateX.value = event.translationX + contextX.value;
            translateY.value = event.translationY + contextY.value;
        })
        .onEnd(() => {
            // Optional: Snap to edges or stay put
            // For now, stay put is more "senior friendly" if they want it in a specific spot
            translateX.value = withSpring(translateX.value);
            translateY.value = withSpring(translateY.value);
        });

    const animatedSosStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value }
        ]
    }));

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Tabs
                    backBehavior="history"
                    screenOptions={{
                        headerShown: false,
                        tabBarButton: HapticTab,
                        tabBarStyle: { display: 'none' } // Hide default tab bar for total control
                    }}
                >
                    <Tabs.Screen
                        name="home"
                        options={{ title: "Home" }}
                    />
                    <Tabs.Screen
                        name="medications/index"
                        options={{ title: "Medications" }}
                    />
                    <Tabs.Screen
                        name="medications/[id]"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="health"
                        options={{ title: "Health" }}
                    />
                    <Tabs.Screen
                        name="services"
                        options={{ title: "Services" }}
                    />
                    <Tabs.Screen
                        name="mood"
                        options={{ title: "Mood" }}
                    />
                    <Tabs.Screen
                        name="sos"
                        options={{ title: "SOS" }}
                    />
                    <Tabs.Screen
                        name="profile/index"
                        options={{ title: "Profile", href: null }}
                    />
                    <Tabs.Screen
                        name="profile/edit-personal"
                        options={{ title: "Edit Personal", href: null }}
                    />
                    <Tabs.Screen
                        name="profile/edit-medical"
                        options={{ title: "Edit Medical", href: null }}
                    />
                    <Tabs.Screen
                        name="profile/edit-emergency"
                        options={{ title: "Edit Emergency Contact", href: null }}
                    />
                    <Tabs.Screen
                        name="video"
                        options={{ title: "Video" }}
                    />
                    <Tabs.Screen
                        name="add-health"
                        options={{ title: "Add Health Data", href: null }}
                    />
                    <Tabs.Screen
                        name="service-detail"
                        options={{ title: "Service Details", href: null }}
                    />
                    <Tabs.Screen
                        name="tasks"
                        options={{ title: "Tasks", href: null }}
                    />
                    <Tabs.Screen
                        name="notifications"
                        options={{ title: "Notifications", href: null }}
                    />
                    <Tabs.Screen
                        name="grocery"
                        options={{ title: "Grocery", href: null }}
                    />
                    <Tabs.Screen
                        name="member-detail"
                        options={{ title: "Member Profiles", href: null }}
                    />
                </Tabs>

                {/* Persistent SOS Floating Button */}
                {!isSosScreen && (
                    <GestureDetector gesture={dragGesture}>
                        <Animated.View
                            className="bg-red-500 w-16 h-16 rounded-full items-center justify-center shadow-2xl shadow-red-500/50 border-4 border-white"
                            style={[
                                styles.sosContainer,
                                { bottom: Math.max(insets.bottom, 20) + 80, right: 20 },
                                animatedSosStyle
                            ]}
                        >
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                                    router.push({
                                        pathname: '/(senior)/sos',
                                        params: { auto: 'true' }
                                    } as any);
                                }}
                                style={StyleSheet.absoluteFill}
                                className="items-center justify-center"
                            >
                                <Ionicons name="alert" size={32} color="white" />
                                <Text className="text-white text-[8px] font-black uppercase tracking-tighter -mt-1">SOS</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </GestureDetector>
                )}
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    sosContainer: {
        position: 'absolute',
        zIndex: 9999,
    },
});
