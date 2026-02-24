import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Dimensions, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SHARED_MEDIA = [
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1576091160550-217359f42f8c?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1582750433449-64c3efdf1e6d?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400',
];

export default function CaretakerProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleCall = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Linking.openURL('tel:+919876543210');
    };

    const handleWhatsApp = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Linking.openURL('whatsapp://send?phone=+919876543210&text=Hello Ravi');
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View className="relative">
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/500?u=Ravi' }}
                        style={{ width: width, height: width * 1.1 }}
                        className="bg-gray-100"
                    />
                    <LinearGradient
                        colors={['rgba(0,0,0,0.6)', 'transparent', 'transparent', 'white']}
                        className="absolute inset-0"
                    />

                    {/* Floating Back Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ top: Math.max(insets.top, 20) }}
                        className="absolute left-6 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/30"
                    >
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>

                    {/* Profile Summary */}
                    <View className="absolute bottom-0 left-0 right-0 p-8">
                        <Animated.View entering={FadeInDown.delay(100)}>
                            <View className="flex-row items-center mb-2">
                                <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-sm shadow-emerald-500" />
                                <Text className="text-emerald-500 font-black text-[10px] uppercase tracking-widest">Active Now</Text>
                            </View>
                            <Text className="text-4xl font-black text-gray-900 mb-1">Caretaker Ravi</Text>
                            <Text className="text-gray-500 font-bold text-lg">Senior Care Specialist • 5 Years Exp.</Text>
                        </Animated.View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="px-6 -mt-8 relative z-10 flex-row justify-between">
                    <ActionButton
                        icon="call"
                        label="Call"
                        color="#F59E0B"
                        onPress={handleCall}
                        delay={200}
                    />
                    <ActionButton
                        icon="logo-whatsapp"
                        label="WhatsApp"
                        color="#25D366"
                        onPress={handleWhatsApp}
                        delay={300}
                    />
                    <ActionButton
                        icon="videocam"
                        label="Video"
                        color="#3B82F6"
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)}
                        delay={400}
                    />

                </View>

                {/* Details Section */}
                <View className="px-6 py-10">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Caretaker Details</Text>
                    <DetailRow icon="phone-portrait-outline" label="Phone" value="+91 98765 43210" />
                    <DetailRow icon="mail-outline" label="Email" value="ravi.kumar@enlivo.care" />
                    <DetailRow icon="location-outline" label="Serving At" value="Sector 4, HSR Layout, Bengaluru" />
                    <DetailRow icon="shield-checkmark-outline" label="Verification" value="Govt ID & Police Verified" />
                </View>

                {/* Shared Media */}
                <View className="px-6 mb-12">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Shared Media</Text>
                        <TouchableOpacity>
                            <Text className="text-orange-500 text-[10px] font-black uppercase">View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row flex-wrap gap-3">
                        {SHARED_MEDIA.map((uri, idx) => (
                            <Animated.Image
                                key={idx}
                                entering={FadeInRight.delay(600 + idx * 50)}
                                source={{ uri }}
                                style={{ width: (width - 48 - 24) / 3, height: (width - 48 - 24) / 3 }}
                                className="rounded-2xl bg-gray-100"
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function ActionButton({ icon, label, color, delay, onPress }: { icon: any; label: string; color: string; delay: number; onPress: () => void }) {
    return (
        <Animated.View entering={FadeInDown.delay(delay)}>
            <TouchableOpacity
                onPress={onPress}
                className="items-center"
            >
                <View
                    style={{
                        backgroundColor: 'white',
                        shadowColor: color,
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.15,
                        shadowRadius: 20,
                        elevation: 10
                    }}
                    className="w-16 h-16 rounded-[24px] items-center justify-center border border-gray-50"
                >
                    <Ionicons name={icon} size={28} color={color} />
                </View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-3">{label}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <View className="flex-row items-center mb-8">
            <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4 border border-gray-100">
                <Ionicons name={icon} size={20} color="#6B7280" />
            </View>
            <View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</Text>
                <Text className="text-gray-900 font-bold text-sm">{value}</Text>
            </View>
        </View>
    );
}
