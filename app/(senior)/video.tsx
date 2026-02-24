import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function VideoScreeningScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('services') ? 'Services' :
            pathname.includes('health') ? 'Health' :
                pathname.includes('video') ? 'Video' : 'Video';

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home' as any);
        if (tab === 'Services') router.replace('/(senior)/services' as any);
        if (tab === 'Health') router.replace('/(senior)/health' as any);
        if (tab === 'Video') router.replace('/(senior)/video' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
            <View
                style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
                className="px-6 flex-row items-center border-b border-gray-100 bg-white"
            >
                <View className="flex-1">
                    <Text className="text-2xl font-black text-gray-900">Virtual Care</Text>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connect with doctors</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/(senior)/profile' as any)}
                    className="w-12 h-12 bg-indigo-50 rounded-2xl items-center justify-center border-2 border-indigo-100/50"
                >
                    <Ionicons name="person" size={24} color="#6E5BFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
            >
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="mb-6">
                    <View className="bg-indigo-600 p-6 rounded-[32px] overflow-hidden">
                        <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mb-4">
                            <Ionicons name="videocam" size={32} color="white" />
                        </View>
                        <Text className="text-2xl font-black text-white mb-2">Consult a Doctor</Text>
                        <Text className="text-indigo-100 text-sm font-medium mb-6">Talk to a specialist from the comfort of your home.</Text>

                        <TouchableOpacity className="bg-white px-6 py-4 rounded-full items-center">
                            <Text className="text-indigo-600 font-black uppercase tracking-widest text-sm">Find Doctors</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(200).duration(600)} className="mb-4">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Upcoming Appointments</Text>
                    <View className="bg-white p-5 rounded-[28px] border border-gray-100 items-center justify-center py-10">
                        <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-500 font-bold mt-4">No upcoming appointments</Text>
                    </View>
                </Animated.View>
            </ScrollView>

            <Animated.View
                entering={FadeInUp.delay(300).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-transparent"
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

function TabButton({ icon, label, active, onPress }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center px-4 py-2 rounded-2xl ${active ? 'bg-indigo-600' : ''}`}
        >
            <Ionicons name={active ? icon : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
            {active && <Text className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
