import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { useChatStore } from '@/store/chatStore';
import { useTrackingStore } from '@/store/trackingStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { Dimensions, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function TrackingScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { bookings } = useBookingStore();
    const { activeTrackings } = useTrackingStore();

    // Find the active booking for this family (mocked)
    const activeBooking = bookings.find(b => b.familyId === "FAM_USER_001" && ["accepted", "on_the_way", "on_site", "in_progress"].includes(b.status));
    const activeTracking = activeBooking ? activeTrackings[activeBooking.id] : null;

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('care') ? 'Care' :
            pathname.includes('tracking') ? 'Track' :
                pathname.includes('chat') ? 'Connect' : 'Track';

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(family)/home' as any);
        }
    };

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(family)/home' as any);
        if (tab === 'Care') router.replace('/(family)/care' as any);
        if (tab === 'Track') router.replace('/(family)/tracking' as any);
        if (tab === 'Connect') router.replace('/(family)/chat' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            {/* Map Mock - Premium Styled */}
            <View style={styles.mapContainer}>
                <LinearGradient
                    colors={['#E5E7EB', '#F3F4F6', '#E5E7EB']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Stylized Grid Lines for "Technical" look */}
                <View style={styles.gridLineHorizontal} />
                <View style={[styles.gridLineHorizontal, { top: '40%' }]} />
                <View style={[styles.gridLineHorizontal, { top: '60%' }]} />
                <View style={styles.gridLineVertical} />
                <View style={[styles.gridLineVertical, { left: '40%' }]} />
                <View style={[styles.gridLineVertical, { left: '70%' }]} />

                {/* Pulsing Target (Senior Location) */}
                <View style={[styles.markerPos, { top: '35%', left: '45%' }]}>
                    <PulseMarker color="#F59E0B" label="Senior (Home)" />
                </View>

                {/* Moving Pal Marker - Only show if tracking is active */}
                {activeTracking && activeTracking.status !== 'idle' && (
                    <View style={[styles.markerPos, { top: '55%', left: '65%' }]}>
                        <PulseMarker color="#3B82F6" label={`${activeBooking?.palName} (Pal)`} />
                    </View>
                )}

                {/* Route Line Mock */}
                {activeTracking && activeTracking.status !== 'idle' && <View style={styles.routeLine} />}
            </View>

            {/* Float Header */}
            <View
                className="absolute top-0 left-0 right-0 px-6 flex-row justify-between items-center"
                style={{ paddingTop: Math.max(insets.top, 16) }}
            >
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-lg shadow-black/10"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="bg-white px-4 py-2 rounded-2xl shadow-lg shadow-black/10 border border-gray-50 items-center">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Status</Text>
                    <Text className="text-sm font-bold text-gray-900">
                        {activeBooking ? (activeTracking && activeTracking.status !== 'idle' ? `${activeBooking.palName} is ${activeBooking.status.replace('_', ' ')}` : 'Awaiting start') : 'No Active Session'}
                    </Text>
                </View>
            </View>

            {/* Status Card - Elevated slightly for bottom bar */}
            <View
                className="absolute left-6 right-6"
                style={{ bottom: 100 + insets.bottom / 2 }}
            >
                {activeBooking ? (
                    <Animated.View
                        entering={FadeInUp.duration(600)}
                        className="bg-white rounded-[40px] p-6 shadow-2xl shadow-black/20 overflow-hidden"
                    >
                        {/* Progress Detail */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100 overflow-hidden">
                                    <Ionicons name="person" size={24} color="#F59E0B" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-base font-bold text-gray-900">{activeBooking.palName}</Text>
                                    <Text className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Active Care Pal</Text>
                                </View>
                            </View>
                            <View className="flex-row items-center gap-x-2">
                                <TouchableOpacity
                                    onPress={() => {
                                        const userPhone = useAuthStore.getState().user?.phone || 'FAMILY_PHONE';
                                        const convId = useChatStore.getState().getOrCreateConversation(userPhone, {
                                            id: activeBooking.palId || 'PAL_001',
                                            name: activeBooking.palName,
                                            role: 'pal'
                                        });
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        router.push({ pathname: '/(family)/chat/[id]', params: { id: convId } } as any);
                                    }}
                                    className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-100 shadow-sm"
                                >
                                    <Ionicons name="chatbubble-outline" size={18} color="#1F2937" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        Linking.openURL('tel:+919876543210');
                                    }}
                                    className="w-10 h-10 bg-orange-500 rounded-xl items-center justify-center shadow-lg shadow-orange-100"
                                >
                                    <Ionicons name="call" size={18} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Stats */}
                        <View className="flex-row gap-x-3 mb-4">
                            <View className="flex-1 bg-gray-50 p-3 rounded-2xl">
                                <Text className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Distance</Text>
                                <Text className="text-sm font-black text-gray-800">{activeTracking && activeTracking.status !== 'idle' ? '1.2 KM' : '-- KM'}</Text>
                            </View>
                            <View className="flex-1 bg-gray-50 p-3 rounded-2xl">
                                <Text className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">ETA</Text>
                                <Text className="text-sm font-black text-gray-800">{activeTracking && activeTracking.status !== 'idle' ? '8 Mins' : '-- Mins'}</Text>
                            </View>
                        </View>

                        {/* Status Message */}
                        <View className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-4">
                            <Text className="text-orange-900 font-bold text-[11px] leading-4">
                                {activeTracking && activeTracking.status !== 'idle' ? `Arjun is currently on the way to the residence for ${activeBooking.title}.` : 'The Pal hasn\'t started the journey yet. You will be notified when they do.'}
                            </Text>
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={FadeInDown}
                        className="bg-white rounded-[40px] p-10 shadow-2xl items-center justify-center"
                    >
                        <View className="w-16 h-16 bg-gray-50 rounded-[28px] items-center justify-center mb-6">
                            <Ionicons name="navigate" size={32} color="#D1D5DB" />
                        </View>
                        <Text className="text-gray-900 font-black text-xl mb-2 text-center">No Active Tracking</Text>
                        <Text className="text-gray-400 text-sm text-center font-medium leading-5">Once a Pal starts their journey to your location, you can track them here in real-time.</Text>
                        <TouchableOpacity
                            onPress={() => router.replace('/(family)/care' as any)}
                            className="mt-8 bg-gray-900 px-8 py-4 rounded-2xl"
                        >
                            <Text className="text-white font-black uppercase tracking-widest text-[10px]">Book a Service</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>

            {/* Custom Floating Bottom Bar */}
            <View
                className="absolute left-4 right-4"
                style={{ bottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row justify-between items-center h-16 rounded-[28px] px-3 shadow-2xl">
                    <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
                    <TabButton icon="cart" label="Care" active={activeTab === 'Care'} onPress={() => handleTabPress('Care')} />
                    <TabButton icon="map" label="Track" active={activeTab === 'Track'} onPress={() => handleTabPress('Track')} />
                    <TabButton icon="chatbubbles" label="Connect" active={activeTab === 'Connect'} onPress={() => handleTabPress('Connect')} />
                </View>
            </View>
        </View>
    );
}

function TabButton({ icon, label, active, onPress }: { icon: any; label: string; active: boolean; onPress: () => void }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center px-4 py-2 rounded-2xl ${active ? 'bg-orange-500' : ''}`}
        >
            <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
            {active && <Text className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
        </TouchableOpacity>
    );
}

function PulseMarker({ color, label }: { color: string; label: string }) {
    return (
        <View className="items-center">
            <View className="bg-white px-3 py-1 rounded-full shadow-sm mb-2 border border-gray-100">
                <Text className="text-[10px] font-bold text-gray-800">{label}</Text>
            </View>
            <View className="items-center justify-center">
                <View
                    style={{ backgroundColor: color }}
                    className="w-5 h-5 rounded-full border-4 border-white shadow-lg"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        flex: 1,
        backgroundColor: '#E5E7EB',
    },
    gridLineHorizontal: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.4)',
        top: '20%',
    },
    gridLineVertical: {
        position: 'absolute',
        height: '100%',
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.4)',
        left: '20%',
    },
    markerPos: {
        position: 'absolute',
    },
    routeLine: {
        position: 'absolute',
        top: '35%',
        left: '45.5%',
        width: width * 0.35,
        height: height * 0.25,
        borderLeftWidth: 3,
        borderBottomWidth: 3,
        borderColor: '#3B82F6',
        borderStyle: 'dashed',
        opacity: 0.3,
        borderBottomLeftRadius: 50,
    },
    tabBar: {
        // Standard styles only
    }
});
