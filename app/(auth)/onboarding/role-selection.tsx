import { useAuthStore, UserRole } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RoleSelection() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const updateRole = useAuthStore((state) => state.updateRole);

    const roles: { id: UserRole; title: string; subtitle: string; icon: any; color: string }[] = [
        {
            id: 'senior',
            title: 'Senior',
            subtitle: 'I need care and monitoring for myself.',
            icon: 'heart-outline',
            color: '#8B5CF6'
        },
        {
            id: 'family',
            title: 'Family Member',
            subtitle: 'I want to monitor and support my parents.',
            icon: 'people-outline',
            color: '#F59E0B' // Updated to match family orange
        },
        {
            id: 'pal',
            title: 'Caretaker',
            subtitle: 'I am a professional providing care services.',
            icon: 'medical-outline',
            color: '#10B981'
        },
    ];

    const handleSelect = (role: UserRole) => {
        updateRole(role);
        router.push('/(auth)/verification/phone-entry' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <LinearGradient
                colors={['#F3E8FF', '#FFFFFF']}
                style={{ flex: 1, paddingHorizontal: 32, paddingTop: Math.max(insets.top, 20) }}
            >
                <Animated.View entering={FadeInDown.duration(600)}>
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/onboarding' as any)}
                        className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm mb-8"
                    >
                        <Ionicons name="arrow-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <Text className="text-3xl font-extrabold text-gray-900 mb-2">Who are you?</Text>
                    <Text className="text-lg text-gray-500 mb-10 font-medium">Select your role to personalize your experience.</Text>
                </Animated.View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View
                        className="gap-y-6"
                        style={{ paddingBottom: insets.bottom + 40 }}
                    >
                        {roles.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInDown.delay(200 + index * 100).duration(600)}
                            >
                                <TouchableOpacity
                                    onPress={() => handleSelect(item.id)}
                                    activeOpacity={0.7}
                                    className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex-row items-center"
                                >
                                    <View
                                        style={{ backgroundColor: `${item.color}15` }}
                                        className="w-16 h-16 rounded-2xl items-center justify-center mr-6"
                                    >
                                        <Ionicons name={item.icon} size={32} color={item.color} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xl font-bold text-gray-900 mb-1">{item.title}</Text>
                                        <Text className="text-sm text-gray-400 font-medium leading-5">{item.subtitle}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}
