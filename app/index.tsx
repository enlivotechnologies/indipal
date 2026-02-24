import { useAuthStore } from '@/store/authStore';
import { SplashScreen, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function RootIndex() {
    const { user, isLoaded, hasCompletedProfile } = useAuthStore();
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (navigationState?.key) {
            setIsReady(true);
        }
    }, [navigationState?.key]);

    useEffect(() => {
        if (!isLoaded || !isReady || !navigationState?.key) return;

        const performRedirect = async () => {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                // Ignore splash screen errors
            }

            const role = user?.role;
            const phone = user?.phone;

            if (!role) {
                router.replace("/(auth)/onboarding" as any);
            } else if (!phone) {
                router.replace("/(auth)/verification/phone-entry" as any);
            } else if (!hasCompletedProfile) {
                if (role === 'senior') router.replace("/(auth)/registration/senior" as any);
                else if (role === 'family') router.replace("/(auth)/registration/family" as any);
                else if (role === 'pal') router.replace("/(auth)/registration/pal" as any);
            } else {
                const roleRoutes: Record<string, string> = {
                    senior: "/(senior)/home",
                    family: "/(family)/home",
                    pal: "/(pal)/home",
                };
                const target = roleRoutes[role] || "/(auth)/onboarding";
                router.replace(target as any);
            }
        };

        // Delay to ensure the component is fully settled and navigation is stable
        const timeout = setTimeout(performRedirect, 0);
        return () => clearTimeout(timeout);
    }, [user, isLoaded, isReady, hasCompletedProfile, navigationState?.key]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
        </View>
    );
}
