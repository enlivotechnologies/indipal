import { AppNotification, useErrandStore } from '@/store/errandStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SeniorNotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { notifications, markNotificationRead } = useErrandStore();

    const handleNotificationPress = (notif: AppNotification) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        markNotificationRead(notif.id);
        if (notif.type === 'errand' || notif.type === 'service') {
            router.push('/(senior)/tasks');
        }
    };

    const getNotificationStyle = (type: string) => {
        switch (type) {
            case 'errand': return { icon: 'briefcase', color: '#6366F1', label: 'Family Task', bg: '#EEF2FF', border: '#E0E7FF' };
            case 'service': return { icon: 'star', color: '#10B981', label: 'Service Secure', bg: '#ECFDF5', border: '#D1FAE5' };
            case 'alert': return { icon: 'alert-circle', color: '#F59E0B', label: 'Priority Update', bg: '#FFFBEB', border: '#FEF3C7' };
            default: return { icon: 'information-circle', color: '#4C3BFF', label: 'Update', bg: '#F5F3FF', border: '#EDE9FE' };
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            <LinearGradient
                colors={['#F5F3FF', '#FFFFFF']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View
                className="px-6 pb-6 pt-4 bg-white/80 backdrop-blur-xl border-b border-gray-100"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-xl font-black text-gray-900">Notifications</Text>
                        <Text className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Family Live Updates</Text>
                    </View>

                    <View className="w-12" />
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 24 }}
            >
                {notifications.length === 0 ? (
                    <View className="items-center justify-center py-20 px-10">
                        <View className="w-24 h-24 bg-indigo-50 rounded-[40px] items-center justify-center mb-8 border border-indigo-100 shadow-sm shadow-indigo-100">
                            <Ionicons name="notifications-off-outline" size={48} color="#818CF8" />
                        </View>
                        <Text className="text-gray-900 font-black text-xl text-center">All Caught Up</Text>
                        <Text className="text-gray-400 text-sm text-center mt-3 leading-6">Any updates from your family, Care Pals, or services will appear here in real-time.</Text>
                    </View>
                ) : (
                    notifications.map((notif, idx) => {
                        const style = getNotificationStyle(notif.type);
                        return (
                            <Animated.View
                                key={notif.id}
                                entering={FadeInDown.delay(idx * 100)}
                                className="mb-5"
                            >
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => handleNotificationPress(notif)}
                                    className={`p-6 rounded-[32px] border ${notif.read ? 'bg-white border-gray-100' : 'bg-white border-indigo-200 shadow-xl shadow-indigo-100'} flex-row items-start relative overflow-hidden`}
                                >
                                    {!notif.read && (
                                        <View className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                                    )}

                                    <View
                                        style={{ backgroundColor: style.bg }}
                                        className="w-14 h-14 rounded-2xl items-center justify-center border border-gray-100 shadow-sm"
                                    >
                                        <Ionicons
                                            name={style.icon as any}
                                            size={28}
                                            color={style.color}
                                        />
                                    </View>
                                    <View className="flex-1 ml-5">
                                        <View className="flex-row justify-between items-center mb-1.5">
                                            <Text style={{ color: style.color }} className="text-[10px] font-black uppercase tracking-[2px]">{style.label}</Text>
                                            <Text className="text-gray-400 text-[10px] font-bold">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                        </View>
                                        <Text className="text-gray-900 font-black text-lg mb-1">{notif.title}</Text>
                                        <Text className="text-gray-500 text-sm font-medium leading-5">{notif.message}</Text>

                                        {!notif.read && (
                                            <View className="mt-4 flex-row items-center">
                                                <View className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2" />
                                                <Text className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">New Update</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}
