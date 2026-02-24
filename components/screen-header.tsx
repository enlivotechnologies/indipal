import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    rightElement?: React.ReactNode;
}

export default function ScreenHeader({ title, showBack = true, rightElement }: ScreenHeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) }]}>
            <View style={styles.headerRow}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backBtn}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={24} color="#1E1E24" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>{title}</Text>
                </View>

                <View style={styles.rightContainer}>
                    {rightElement || <View style={{ width: 44 }} />}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F0FF",
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: 44,
    },
    leftContainer: {
        width: 44,
        alignItems: "flex-start",
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
    },
    rightContainer: {
        width: 44,
        alignItems: "flex-end",
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F5F3FF",
        justifyContent: "center",
        alignItems: "center",
    },
    titleText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E1E24",
    },
});
