import { HapticTab } from "@/components/haptic-tab";
import { Tabs } from "expo-router";
import React from "react";

export default function PalLayout() {
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
                name="chat"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="chat-room"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="active-gig"
                options={{ title: "Gig" }}
            />
            <Tabs.Screen
                name="earnings"
                options={{ title: "Earnings" }}
            />
            <Tabs.Screen
                name="training"
                options={{ title: "Training" }}
            />
            <Tabs.Screen
                name="profile"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="seniors"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="alerts"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="tasks"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="gig-detail"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="training-module"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="verification"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="notifications"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="notification-detail"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="call"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="contact-profile"
                options={{ href: null }}
            />
        </Tabs>
    );
}
