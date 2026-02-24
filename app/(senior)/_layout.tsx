import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
import React from "react";

export default function SeniorLayout() {
    return (
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
        </Tabs>
    );
}
