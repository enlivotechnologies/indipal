import { useAuthStore } from '@/store/authStore';
import { useHealthStore } from '@/store/healthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Premium Palette for Seniors
const BRAND_PURPLE = '#6E5BFF';
const SOFT_PURPLE = '#F5F3FF';
const DARK_PURPLE = '#4C3BFF';

export default function SeniorHomeScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    const healthRecords = useHealthStore((state) => state.records);

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('services') ? 'Services' :
            pathname.includes('health') ? 'Health' :
                pathname.includes('video') ? 'Video' : 'Home';

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home' as any);
        if (tab === 'Services') router.replace('/(senior)/services' as any);
        if (tab === 'Health') router.replace('/(senior)/health' as any);
        if (tab === 'Video') router.replace('/(senior)/video' as any);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header - Aligned with Family but Purple */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row justify-between items-center bg-white"
            >
                <View>
                    <Text className="text-xs font-bold text-indigo-400 uppercase tracking-widest">EnlivoCare</Text>
                    <Text className="text-2xl font-black text-gray-900">Health Hub</Text>
                </View>
                <View className="flex-row items-center gap-x-2">
                    <TouchableOpacity
                        onPress={() => router.push('/(senior)/notifications' as any)}
                        className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                    >
                        <Ionicons name="notifications-outline" size={20} color={BRAND_PURPLE} />
                        <View className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-yellow-400 rounded-full border border-white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(senior)/profile' as any)}
                        className="w-10 h-10 bg-indigo-100 rounded-[24px] items-center justify-center overflow-hidden border border-indigo-200"
                    >
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} className="w-full h-full" />
                        ) : (
                            <Ionicons name="person" size={20} color={BRAND_PURPLE} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 120
                }}
            >
                <View className="mt-4">
                    <Text className="text-xs font-bold text-gray-400 uppercase">{getGreeting()}, {user?.name || 'Vivek'}</Text>
                </View>

                {/* 1. Medication Hero Card - High Contrast & Large Elements */}
                <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.out(Easing.quad))} className="mb-8 mt-5">
                    <LinearGradient
                        colors={[BRAND_PURPLE, DARK_PURPLE]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-8 w-full rounded-[48px] shadow-2xl shadow-indigo-200"
                    >
                        <View className="flex-row justify-between items-start mb-6">
                            <View className="flex-row items-center flex-1">
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressRingBase} />
                                    <View className="items-center justify-center">
                                        <Text className="text-white text-xl font-black">1/2</Text>
                                        <Text className="text-white/60 text-[8px] font-bold uppercase">Done</Text>
                                    </View>
                                </View>
                                <View className="ml-5 flex-1">
                                    <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Upcoming Dose</Text>
                                    <Text className="text-white text-2xl font-black">Evening Meds</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="time-outline" size={14} color="white" className="opacity-80" />
                                        <Text className="text-white/90 text-sm font-medium ml-2">Due at 8:00 PM</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View className="flex-row gap-x-4">
                            <TouchableOpacity
                                onPress={() => router.push('/(senior)/medications' as any)}
                                style={styles.seniorButtonSecondary}
                                className="flex-1 py-4 rounded-[24px] items-center border border-white/20 bg-white/10"
                            >
                                <Text className="text-white font-bold text-sm">Schedule</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
                                style={styles.seniorButtonPrimary}
                                className="flex-1 py-4 rounded-[24px] items-center bg-white shadow-lg"
                            >
                                <Text style={{ color: BRAND_PURPLE }} className="font-black text-sm uppercase tracking-widest">Mark Taken</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Quick Actions - Senior Specific (Purple UI) */}
                <View className="flex-row justify-between mb-8">
                    <QuickActionItem
                        icon="heart"
                        label="Health"
                        onPress={() => router.push('/(senior)/health' as any)}
                        bg={SOFT_PURPLE}
                        delay={200}
                    />
                    <QuickActionItem
                        icon="medical"
                        label="Meds"
                        onPress={() => router.push('/(senior)/medications' as any)}
                        bg={SOFT_PURPLE}
                        delay={300}
                    />
                    <QuickActionItem
                        icon="briefcase"
                        label="Services"
                        onPress={() => router.push('/(senior)/services' as any)}
                        bg={SOFT_PURPLE}
                        delay={400}
                    />
                    <QuickActionItem
                        icon="happy"
                        label="Mood"
                        onPress={() => router.push('/(senior)/mood' as any)}
                        bg={SOFT_PURPLE}
                        delay={500}
                    />
                </View>

                {/* Emergency Card - High Visibility */}
                <Animated.View entering={FadeInUp.delay(600).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push('/(senior)/sos' as any)}
                        style={styles.sosCard}
                        className="bg-red-50 p-8 rounded-[40px] border border-red-100 flex-row items-center shadow-sm"
                    >
                        <View className="w-16 h-16 bg-white rounded-[24px] items-center justify-center shadow-lg shadow-red-200">
                            <Ionicons name="alert-circle" size={32} color="#EF4444" />
                        </View>
                        <View className="ml-6 flex-1">
                            <Text className="text-red-600 font-black text-2xl">Emergency SOS</Text>
                            <Text className="text-red-400 text-sm font-medium">Alert family & ambulance</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#EF4444" />
                    </TouchableOpacity>
                </Animated.View>

                {/* Care Circle - Real-time Sync with Family/Pals */}
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">My Care Circle</Text>
                <Animated.View entering={FadeInUp.delay(700).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
                    <View className="bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-indigo-900 font-black text-lg">Support Ready</Text>
                            <View className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                <Text className="text-emerald-600 text-[10px] font-black uppercase">Live Connect</Text>
                            </View>
                        </View>

                        <View className="gap-y-4">
                            <CircleMember
                                name="Vivek (Family)"
                                relation="Son"
                                status="active"
                                image="https://i.pravatar.cc/100?u=vivek"
                                delay={800}
                            />
                            <CircleMember
                                name="Arjun Singh"
                                relation="Care Pal"
                                status="active"
                                image="https://i.pravatar.cc/100?u=arjun"
                                delay={900}
                            />
                        </View>
                    </View>
                </Animated.View>

                <View className="h-20" />
            </ScrollView>

            {/* Custom Floating Bottom Bar - Aligned with Family but Purple Accent */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600).easing(Easing.out(Easing.quad))}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row justify-between items-center h-16 rounded-[28px] px-3 shadow-2xl">
                    <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
                    <TabButton icon="grid" label="Services" active={activeTab === 'Services'} onPress={() => handleTabPress('Services')} />
                    <TabButton icon="heart" label="Health" active={activeTab === 'Health'} onPress={() => handleTabPress('Health')} />
                    <TabButton icon="videocam" label="Video" active={activeTab === 'Video'} onPress={() => handleTabPress('Video')} />
                </View>
            </Animated.View>
        </View>
    );
}

function QuickActionItem({ icon, label, onPress, bg, delay }: any) {
    return (
        <Animated.View entering={FadeInUp.delay(delay).duration(500)}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                className="items-center"
            >
                <View style={{ backgroundColor: bg }} className="w-16 h-16 rounded-[24px] items-center justify-center shadow-sm">
                    <Ionicons name={icon} size={28} color={BRAND_PURPLE} />
                </View>
                <Text className="text-gray-900 font-bold text-[11px] mt-3 uppercase tracking-wider">{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

function CircleMember({ name, relation, status, image, delay }: any) {
    return (
        <Animated.View entering={FadeInUp.delay(delay).duration(600)} className="flex-row items-center bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
            <View className="relative">
                <Image source={{ uri: image }} className="w-12 h-12 rounded-full" />
                <View className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500" />
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-gray-900 font-bold text-base">{name}</Text>
                <Text className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">{relation}</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center">
                <Ionicons name="chatbubble-outline" size={18} color={BRAND_PURPLE} />
            </TouchableOpacity>
        </Animated.View>
    );
}

function TabButton({ icon, label, active, onPress }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center px-4 py-2 rounded-2xl ${active ? 'bg-indigo-600' : ''}`}
        >
            <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
            {active && <Text className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    },
    progressContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressRingBase: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 5,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    seniorButtonPrimary: {
        shadowColor: BRAND_PURPLE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    seniorButtonSecondary: {
        // No specific override needed
    },
    sosCard: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    }
});
