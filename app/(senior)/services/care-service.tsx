import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GenericServiceScreen() {
    const { title, icon, color } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                className="px-6 pb-6 pt-4 bg-white border-b border-gray-100 flex-row items-center"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View className="ml-4">
                    <Text className="text-xl font-black text-gray-900">{title || 'Service'}</Text>
                    <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">EnlivoCare Premium</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-8">
                <View
                    style={{ backgroundColor: (color as string) || '#6366F1' }}
                    className="w-20 h-20 rounded-[30px] items-center justify-center mb-8 shadow-xl"
                >
                    <Ionicons name={(icon as any) || 'medical'} size={40} color="white" />
                </View>

                <Text className="text-3xl font-black text-gray-900 mb-6">Expert {title} is Coming Soon</Text>
                <Text className="text-gray-500 text-lg leading-7 mb-10">
                    We are currently onboarding top-tier certified professionals for {title} in your area.
                    We prioritize quality and safety above all else.
                </Text>

                <View className="bg-gray-50 p-8 rounded-[32px] border border-gray-100 mb-10">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="notifications-outline" size={20} color="#6366F1" />
                        <Text className="ml-3 font-black text-gray-900">Get Notified</Text>
                    </View>
                    <Text className="text-gray-500 text-sm leading-6">
                        We'll alert you the moment our first certified specialist for {title} becomes available.
                    </Text>
                </View>

                <TouchableOpacity
                    className="bg-gray-900 py-6 rounded-[28px] items-center shadow-xl"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-black uppercase tracking-widest">Check Other Services</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
