import { useAuthStore } from "@/store/authStore";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";

export function NavigationGuard() {
    const { user, isLoaded } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (navigationState?.key) {
            setIsReady(true);
        }
    }, [navigationState?.key]);

    useEffect(() => {
        if (!isLoaded || !isReady) return;

        const inAuthGroup = segments[0] === "(auth)";
        const currentStep = (segments[1] as string) || '';
        const role = user?.role;

        if (!role) {
            const allowedScreens = ["welcome", "role-selection"];
            if (!inAuthGroup || !allowedScreens.includes(currentStep)) {
                router.replace("/(auth)/welcome");
            }
        } else if (!user?.phone) {
            const allowedScreens = ["welcome", "role-selection", "phone-entry", "otp-verify"];
            if (!inAuthGroup || !allowedScreens.includes(currentStep)) {
                router.replace("/(auth)/phone-entry");
            }
        } else if (!user?.name) {
            const allowedScreens = [
                "welcome",
                "role-selection",
                "phone-entry",
                "otp-verify",
                "register-senior",
                "register-family",
                "register-pal"
            ];
            if (!inAuthGroup || !allowedScreens.includes(currentStep)) {
                if (role === 'senior') router.replace("/(auth)/register-senior");
                else if (role === 'family') router.replace("/(auth)/register-family");
                else if (role === 'pal') router.replace("/(auth)/register-pal");
            }
        } else {
            const pathSegments = segments as string[];
            if (inAuthGroup || pathSegments.length === 0) {
                const roleRoutes = {
                    senior: "/(senior)/home",
                    family: "/(family)/home",
                    pal: "/(pal)/home",
                };
                // @ts-ignore
                const target = roleRoutes[role] || "/(auth)/welcome";
                router.replace(target as any);
            }
        }
    }, [user, isLoaded, isReady, segments, router]);

    return null;
}
