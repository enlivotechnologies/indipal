import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_PURPLE = '#6E5BFF';

export default function SeniorProfileScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { user, logout, updateUser } = useAuthStore();

    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('services') ? 'Services' :
            pathname.includes('health') ? 'Health' :
                pathname.includes('video') ? 'Video' : 'Home';

    const handleLogout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        logout();
        router.replace('/(auth)/onboarding' as any);
    };

    const handleSupport = (type: 'chat' | 'call') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const url = type === 'chat' ? 'https://wa.me/919876543210' : 'tel:+919876543210';
        Linking.openURL(url);
    };

    const handlePhotoUpdate = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert("Profile Picture", "Would you like to change your profile picture?", [
            { text: "Camera", onPress: () => { } },
            { text: "Gallery", onPress: () => { } },
            { text: "Cancel", style: "cancel" }
        ]);
    };

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home' as any);
        if (tab === 'Services') router.replace('/(senior)/services' as any);
        if (tab === 'Health') router.replace('/(senior)/health' as any);
        if (tab === 'Video') router.replace('/(senior)/video' as any);
    };

    const handleActivityPress = (type: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (type === 'Medication') router.push('/(senior)/medications' as any);
        if (type === 'Vital Check') router.push('/(senior)/health' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View
                style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
                className="px-6 flex-row items-center border-b border-gray-50 bg-white"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color={BRAND_PURPLE} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-2xl font-black text-gray-900">Settings</Text>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Personal Account</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
            >
                {/* Profile Card */}
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="px-6 py-8 items-center">
                    <View className="relative">
                        <View className="w-28 h-28 bg-indigo-50 rounded-[40px] items-center justify-center border-2 border-indigo-100 p-1">
                            {user?.profileImage ? (
                                <Image source={{ uri: user.profileImage }} className="w-full h-full rounded-[38px]" />
                            ) : (
                                <Ionicons name="person" size={48} color={BRAND_PURPLE} />
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={handlePhotoUpdate}
                            className="absolute bottom-0 right-0 bg-indigo-600 w-10 h-10 rounded-2xl border-4 border-white items-center justify-center"
                        >
                            <Ionicons name="camera" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 mt-4">{user?.name || 'Senior User'}</Text>
                    <Text className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">
                        {user?.mobilityStatus || 'Independent'} • Senior Member
                    </Text>
                </Animated.View>

                {/* Recent Activity - Matching Family module's "My Recent Orders" */}
                <View className="px-6 mb-8">
                    <View className="flex-row items-center justify-between mb-4 ml-1">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Recent Activity</Text>
                        <TouchableOpacity>
                            <Text className="text-[10px] font-black text-indigo-600 uppercase">View All</Text>
                        </TouchableOpacity>
                    </View>

                    {[
                        { id: '1', type: 'Medication', action: 'Evening Dose Taken', time: '08:00 PM', date: 'Today', color: '#6E5BFF', icon: 'medical' },
                        { id: '2', type: 'Vital Check', action: 'Blood Pressure Logged', time: '10:30 AM', date: 'Today', color: '#3BB273', icon: 'heart' },
                    ].map((log, idx) => (
                        <Animated.View
                            key={log.id}
                            entering={FadeInUp.delay(200 + idx * 100).duration(600)}
                        >
                            <TouchableOpacity
                                onPress={() => handleActivityPress(log.type)}
                                className="bg-gray-50 p-5 rounded-[28px] border border-gray-100 flex-row items-center justify-between mb-3"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View style={{ backgroundColor: log.color + '10' }} className="w-10 h-10 rounded-xl items-center justify-center">
                                        <Ionicons name={log.icon as any} size={18} color={log.color} />
                                    </View>
                                    <View className="ml-4 flex-1">
                                        <Text className="font-bold text-gray-900 text-sm">{log.action}</Text>
                                        <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{log.date} • {log.time}</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                {/* Health & Medical Profile - Matching Registration Details */}
                <View className="px-6 mb-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Medical Registration</Text>
                    <View className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                        <ProfileOption
                            icon="medkit"
                            label="Medical Information"
                            subLabel="Health conditions, Mobility, Allergies"
                            onPress={() => router.push('/(senior)/profile/edit-medical' as any)}
                        />
                    </View>
                </View>

                {/* Account & Security */}
                <View className="px-6 mb-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Account Info</Text>
                    <View className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                        <ProfileOption
                            icon="person-outline"
                            label="Personal Information"
                            subLabel="Name, Phone, Address"
                            onPress={() => router.push('/(senior)/profile/edit-personal' as any)}
                        />
                        <ProfileOption
                            icon="people"
                            label="Emergency Contact"
                            subLabel={user?.emergencyContact ? `${user.emergencyContact.name} (${user.emergencyContact.relationship})` : 'Not set'}
                            onPress={() => router.push('/(senior)/profile/edit-emergency' as any)}
                        />
                    </View>
                </View>

                {/* App Preferences */}
                <View className="px-6 mb-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">App Preferences</Text>
                    <View className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                        <ProfileOption
                            icon="notifications"
                            label="Care Alerts"
                            value={notificationsEnabled}
                            isToggle
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setNotificationsEnabled(!notificationsEnabled);
                            }}
                        />
                        <ProfileOption
                            icon="language"
                            label="App Language"
                            subLabel={user?.language || 'English'}
                            onPress={() => setShowLanguageModal(true)}
                        />
                        <ProfileOption
                            icon="shield-checkmark"
                            label="Smartphone Mode"
                            value={user?.hasSmartphone}
                            isToggle
                            disabled
                        />
                    </View>
                </View>

                {/* Support & Support Center */}
                <View className="px-6 mb-8">
                    <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Help & Support</Text>
                    <View className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                        <ProfileOption
                            icon="help-circle"
                            label="Help Center"
                            onPress={() => handleSupport('chat')}
                        />
                        <ProfileOption
                            icon="chatbubble-ellipses"
                            label="Talk to Support"
                            onPress={() => handleSupport('call')}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <View className="px-6">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-red-50 p-6 rounded-[32px] border border-red-100 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-white rounded-xl items-center justify-center">
                                <Ionicons name="log-out" size={24} color="#EF4444" />
                            </View>
                            <View className="ml-4">
                                <Text className="font-black text-red-500 text-base">Sign Out</Text>
                                <Text className="text-red-400 text-[10px] font-bold uppercase tracking-widest">Exit your account</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Custom Floating Bottom Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
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

            {/* Language Modal */}
            <Modal
                visible={showLanguageModal}
                transparent
                animationType="fade"
            >
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <Animated.View
                        entering={ZoomIn.duration(600)}
                        className="bg-white w-full rounded-[48px] p-8 shadow-2xl"
                    >
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-2xl font-black text-gray-900">Language</Text>
                                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Choose your preference</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowLanguageModal(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <View className="gap-y-3">
                            {['English', 'Hindi', 'Bengali', 'Marathi'].map((lang) => (
                                <TouchableOpacity
                                    key={lang}
                                    onPress={() => {
                                        updateUser({ language: lang });
                                        setShowLanguageModal(false);
                                    }}
                                    className={`flex-row items-center justify-between p-5 rounded-2xl border ${user?.language === lang ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100'}`}
                                >
                                    <Text className={`font-bold ${user?.language === lang ? 'text-indigo-600' : 'text-gray-900'}`}>{lang}</Text>
                                    {user?.language === lang && (
                                        <Ionicons name="checkmark-circle" size={20} color={BRAND_PURPLE} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

function ProfileOption({ icon, label, subLabel, value, isToggle, onPress, disabled }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress || disabled}
            className="flex-row items-center justify-between p-5 border-b border-gray-50 bg-white"
        >
            <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center">
                    <Ionicons name={icon} size={22} color={BRAND_PURPLE} />
                </View>
                <View className="ml-4 flex-1">
                    <Text className="font-black text-gray-800 text-sm">{label}</Text>
                    {subLabel && <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{subLabel}</Text>}
                </View>
            </View>
            {isToggle ? (
                <Switch
                    value={value}
                    trackColor={{ true: '#DDD6FE', false: '#F3F4F6' }}
                    thumbColor={value ? BRAND_PURPLE : '#D1D5DB'}
                />
            ) : (
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            )}
        </TouchableOpacity>
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
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    }
});
