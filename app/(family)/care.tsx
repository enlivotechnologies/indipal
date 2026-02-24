import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CORE_SERVICES = [
    { id: '1', title: 'Home Nurse', subtitle: 'Expert Care', icon: 'person-add', color: '#10B981', image: 'https://images.unsplash.com/photo-1582750433449-64c3efdf1e6d?auto=format&fit=crop&q=80&w=400', route: '/(family)/services/nurse' },
    { id: '2', title: 'House Help', subtitle: 'Maintenance', icon: 'home', color: '#F59E0B', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', route: '/(family)/services/house-help' },
    { id: '3', title: 'Grocery', subtitle: 'Essentials', icon: 'cart', color: '#10B981', image: 'https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=400', route: '/(family)/services/grocery' },
    { id: '4', title: 'Pharmacy', subtitle: 'Medicines', icon: 'bandage', color: '#6366F1', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400', route: '/(family)/services/pharmacy' },
];

const EXTENDED_SERVICES = [
    { id: '5', title: 'Doctor', icon: 'medical', color: '#3B82F6', image: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=400' },
    { id: '6', title: 'Lab Test', icon: 'flask', color: '#8B5CF6', image: 'https://images.unsplash.com/photo-1581093458791-9f3c3250bb8b?auto=format&fit=crop&q=80&w=400' },
    { id: '7', title: 'Ambulance', icon: 'bus', color: '#EF4444', image: 'https://images.unsplash.com/photo-1516550135131-fe3dcb0bedc7?auto=format&fit=crop&q=80&w=400' },
    { id: '8', title: 'Physio', icon: 'heart', color: '#EC4899', image: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&q=80&w=400' },
];

export default function CareHubScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('care') ? 'Care' :
            pathname.includes('tracking') ? 'Track' :
                pathname.includes('chat') ? 'Connect' : 'Care';

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.replace('/(family)/home' as any);
    };

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(family)/home' as any);
        if (tab === 'Care') router.replace('/(family)/care' as any);
        if (tab === 'Track') router.replace('/(family)/tracking' as any);
        if (tab === 'Connect') router.replace('/(family)/chat' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Premium Header */}
            <View
                className="px-6 flex-row justify-between items-center bg-white border-b border-gray-50"
                style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
            >
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-xl font-black text-gray-900">Care Hub</Text>
                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[3px]">Orchestrate Everything</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/(family)/account/notifications')}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
                >
                    <Ionicons name="notifications-outline" size={20} color="#1F2937" />
                    <View className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 24,
                    paddingBottom: insets.bottom + 100
                }}
            >
                {/* Search Bar */}
                <View className="px-6 mb-8">
                    <View className="bg-gray-50 flex-row items-center px-6 py-4 rounded-[28px] border border-gray-200">
                        <Ionicons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            placeholder="Search for any care service..."
                            className="ml-3 flex-1 text-gray-800 font-bold"
                        />
                    </View>
                </View>


                {/* Core Services Grid */}
                <View className="px-6 mb-10">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Daily Essentials</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {CORE_SERVICES.map((service, idx) => (
                            <Animated.View
                                key={service.id}
                                entering={FadeInDown.delay(200 + idx * 50)}
                                className="w-[48%] mb-5"
                            >
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        router.push(service.route as any);
                                    }}
                                    className="h-44 rounded-[24px] overflow-hidden shadow-2xl shadow-black/20 relative bg-gray-900"
                                >
                                    <Image source={{ uri: service.image }} className="absolute inset-0 w-full h-full opacity-60" resizeMode="cover" />
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
                                        className="absolute inset-0 p-6 justify-end"
                                    >
                                        <View
                                            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                                            className="w-10 h-10 rounded-xl items-center justify-center mb-3 border border-white/20 backdrop-blur-md"
                                        >
                                            <Ionicons name={service.icon as any} size={20} color="white" />
                                        </View>
                                        <Text className="text-white font-black text-base leading-tight mb-0.5">{service.title}</Text>
                                        <Text className="text-white/50 text-[8px] font-black uppercase tracking-[2px]">{service.subtitle}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </View>

                {/* Extended Services */}


            </ScrollView>

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

const styles = StyleSheet.create({
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
