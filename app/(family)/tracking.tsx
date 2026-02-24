import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { Dimensions, Image, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function TrackingScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

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
                    <PulseMarker color="#F59E0B" label="Dad (Home)" />
                </View>

                {/* Moving Pal Marker */}
                <View style={[styles.markerPos, { top: '55%', left: '65%' }]}>
                    <PulseMarker color="#3B82F6" label="Arjun (Pal)" />
                </View>

                {/* Route Line Mock */}
                <View style={styles.routeLine} />
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
                <View className="bg-white px-4 py-2 rounded-2xl shadow-lg shadow-black/10 border border-gray-50">
                    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Live Mode</Text>
                    <Text className="text-sm font-bold text-gray-900">Arjun is en route</Text>
                </View>

            </View>

            {/* Status Card - Elevated slightly for bottom bar */}
            <View
                className="absolute left-6 right-6"
                style={{ bottom: 100 + insets.bottom / 2 }}
            >
                <Animated.View
                    entering={FadeInDown.duration(800)}
                    className="bg-white rounded-[40px] p-6 shadow-2xl shadow-black/20 overflow-hidden"
                >
                    {/* Progress Detail */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center">
                                <Image source={{ uri: 'https://i.pravatar.cc/100?u=arjun' }} className="w-10 h-10 rounded-xl" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-base font-bold text-gray-900">Arjun Singh</Text>
                                <Text className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Certified Pal</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-x-2">
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    router.push({ pathname: '/(family)/chat/[id]', params: { id: '3' } });
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
                            <Text className="text-[8px] font-bold text-gray-400 uppercase">Distance</Text>
                            <Text className="text-sm font-black text-gray-800">1.2 KM</Text>
                        </View>
                        <View className="flex-1 bg-gray-50 p-3 rounded-2xl">
                            <Text className="text-[8px] font-bold text-gray-400 uppercase">ETA</Text>
                            <Text className="text-sm font-black text-gray-800">8 Mins</Text>
                        </View>
                    </View>

                    {/* Action Bar */}
                    <TouchableOpacity
                        className="w-full bg-gray-900 py-4 rounded-[20px] items-center"
                        onPress={() => router.push({ pathname: '/(family)/chat/[id]', params: { id: '3' } })}
                    >
                        <Text className="text-white font-bold text-sm">Message Pal</Text>
                    </TouchableOpacity>
                </Animated.View>
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
    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: withRepeat(withSequence(withTiming(1.5, { duration: 1500 }), withTiming(1, { duration: 1500 })), -1) }],
        opacity: withRepeat(withTiming(0, { duration: 1500 }), -1),
    }));

    return (
        <View className="items-center">
            <View className="bg-white px-3 py-1 rounded-full shadow-sm mb-2 border border-gray-100">
                <Text className="text-[10px] font-bold text-gray-800">{label}</Text>
            </View>
            <View className="items-center justify-center">
                <Animated.View
                    style={[pulseStyle, { backgroundColor: color }]}
                    className="w-14 h-14 rounded-full absolute"
                />
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
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
