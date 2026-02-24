import { useServiceStore } from '@/store/serviceStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NotificationType = 'senior' | 'pal' | 'system';

interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    senderImage?: string;
    senderName?: string;
    hasAction?: boolean;
    isAccepted?: boolean;
    orderId?: string;
    status?: string;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
    {
        id: '1',
        type: 'senior',
        title: 'Post-Op Nurse Secured',
        message: 'A Registered Nurse (Sister Mary) has been secured for Ramesh Chandra. Shift: 4th July (Day).',
        time: '5 mins ago',
        isRead: false,
        senderName: 'Ramesh Chandra',
        senderImage: 'https://i.pravatar.cc/150?u=mary'
    },
    {
        id: '1b',
        type: 'senior',
        title: 'Morning Vitals Logged',
        message: 'Ramesh Chandra logged his morning BP: 120/80 mmHg. Everything looks stable.',
        time: '12 mins ago',
        isRead: false,
        senderName: 'Ramesh Chandra',
        senderImage: 'https://i.pravatar.cc/100?u=ramesh'
    },
    {
        id: '2',
        type: 'pal',
        title: 'Grocery Pickup Started',
        message: 'Arjun Singh has arrived at "Nature\'s Basket" to pick up your weekly groceries.',
        time: '25 mins ago',
        isRead: false,
        senderName: 'Arjun Singh',
        senderImage: 'https://i.pravatar.cc/100?u=arjun'
    }
];

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { orders, updateOrderStatus } = useServiceStore();
    const [filter, setFilter] = useState<NotificationType | 'all'>('all');
    const [mockNotifications, setMockNotifications] = useState(MOCK_NOTIFICATIONS);
    const [selectedDetail, setSelectedDetail] = useState<any>(null);

    const realNotifications: AppNotification[] = orders.map(order => ({
        id: order.id,
        orderId: order.id,
        type: 'senior',
        title: `Service Request: ${order.serviceTitle}`,
        message: `${order.seniorName} has requested ${order.serviceTitle}. Status: ${order.status}`,
        time: new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        senderName: order.seniorName,
        senderImage: 'https://i.pravatar.cc/100?u=ramesh',
        hasAction: order.status === 'Pending',
        isAccepted: order.status !== 'Pending',
        status: order.status
    }));

    const allNotifications = [...realNotifications, ...mockNotifications];

    const handleAccept = (orderId: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Cycle through statuses for demo purposes
        updateOrderStatus(orderId, 'Paid');

        setTimeout(() => {
            updateOrderStatus(orderId, 'Confirmed');
        }, 3000);

        setTimeout(() => {
            updateOrderStatus(orderId, 'Shipped');
        }, 8000);
    };

    const filteredNotifications = filter === 'all'
        ? allNotifications
        : allNotifications.filter(n => n.type === filter);

    const getTypeColor = (type: NotificationType) => {
        switch (type) {
            case 'senior': return '#F59E0B';
            case 'pal': return '#3B82F6';
            case 'system': return '#10B981';
            default: return '#94A3B8';
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View
                className="px-6 pb-6 pt-4 bg-white/80 backdrop-blur-xl border-b border-gray-100"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/(family)/home')}
                        className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <Text className="text-xl font-black text-gray-900">Notifications</Text>

                    <View className="w-12" />
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-6 -mx-2"
                >
                    {(['all', 'senior', 'pal', 'system'] as const).map((t) => (
                        <TouchableOpacity
                            key={t}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setFilter(t);
                            }}
                            className={`mx-2 px-6 py-3 rounded-full border ${filter === t ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-100'
                                }`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === t ? 'text-white' : 'text-gray-400'
                                }`}>
                                {t}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {filteredNotifications.length === 0 ? (
                    <View className="flex-1 items-center justify-center mt-20 px-10">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                            <Ionicons name="notifications-off-outline" size={40} color="#CBD5E1" />
                        </View>
                        <Text className="text-gray-900 font-black text-lg text-center">All Quiet Here</Text>
                        <Text className="text-gray-400 text-sm text-center mt-2">No notifications found in this category.</Text>
                    </View>
                ) : (
                    <View className="px-6 pt-6">
                        {filteredNotifications.map((notification, idx) => (
                            <Animated.View
                                key={notification.id}
                                entering={FadeInDown.delay(idx * 100)}
                                className="mb-4"
                            >
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    className={`bg-white p-6 rounded-[32px] border ${notification.isRead ? 'border-gray-50' : 'border-blue-100 shadow-sm'
                                        } flex-row items-start`}
                                >
                                    <View className="relative">
                                        {notification.senderImage ? (
                                            <Image
                                                source={{ uri: notification.senderImage }}
                                                className="w-12 h-12 rounded-2xl"
                                            />
                                        ) : (
                                            <View
                                                style={{ backgroundColor: getTypeColor(notification.type) + '15' }}
                                                className="w-12 h-12 rounded-2xl items-center justify-center"
                                            >
                                                <Ionicons
                                                    name={notification.type === 'system' ? 'flash' : notification.type === 'senior' ? 'person' : 'star'}
                                                    size={24}
                                                    color={getTypeColor(notification.type)}
                                                />
                                            </View>
                                        )}
                                        {!notification.isRead && (
                                            <View className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                                        )}
                                    </View>

                                    <View className="flex-1 ml-4">
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: getTypeColor(notification.type) }}>
                                                {notification.type === 'senior' ? 'Enlivo Parent' : notification.type === 'pal' ? 'Pal Update' : 'System Alerts'}
                                            </Text>
                                            <Text className="text-[8px] font-bold text-gray-400 uppercase">{notification.time}</Text>
                                        </View>
                                        <Text className="text-gray-900 font-black text-base mb-1">{notification.title}</Text>
                                        <Text className="text-gray-500 text-xs leading-5 font-medium">{notification.message}</Text>

                                        {notification.hasAction && (
                                            <View className="mt-4 flex-row gap-x-3">
                                                <TouchableOpacity
                                                    onPress={() => handleAccept(notification.orderId || notification.id)}
                                                    className="flex-1 bg-orange-500 py-3 rounded-xl items-center shadow-lg shadow-orange-100"
                                                >
                                                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">Pay & Confirm</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                        setSelectedDetail(notification);
                                                    }}
                                                    className="px-5 bg-gray-50 py-3 rounded-xl items-center border border-gray-100"
                                                >
                                                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Details</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        {notification.isAccepted && (
                                            <View
                                                style={{ backgroundColor: notification.status === 'Shipped' ? '#ECFDF5' : '#EFF6FF' }}
                                                className="mt-4 p-3 rounded-xl border border-blue-100 flex-row items-center"
                                            >
                                                <Ionicons
                                                    name={notification.status === 'Shipped' ? 'checkmark-circle' : 'time'}
                                                    size={16}
                                                    color={notification.status === 'Shipped' ? '#10B981' : '#3B82F6'}
                                                />
                                                <Text className={`text-[10px] font-bold ml-2 ${notification.status === 'Shipped' ? 'text-emerald-700' : 'text-blue-700'}`}>
                                                    {notification.status === 'Paid' ? 'Payment Received • Processing' :
                                                        notification.status === 'Confirmed' ? 'Confirmed • Pal Assigned' :
                                                            notification.status === 'Shipped' ? 'Order Shipped • En-route' :
                                                                'Request Accepted'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Detail Modal Overlay */}
            {selectedDetail && (
                <Animated.View
                    entering={FadeInDown}
                    className="absolute inset-0 bg-white/95 backdrop-blur-xl z-50 overflow-hidden"
                    style={{ paddingTop: insets.top }}
                >
                    <View className="px-6 py-6 border-b border-gray-50 flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => setSelectedDetail(null)}
                            className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
                        >
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>
                        <Text className="text-xl font-black text-gray-900">Service Details</Text>
                        <View className="w-12" />
                    </View>

                    <ScrollView className="flex-1 px-8 pt-10" showsVerticalScrollIndicator={false}>
                        <View className="items-center mb-10">
                            <View className="w-20 h-20 bg-orange-50 rounded-[32px] items-center justify-center border border-orange-100 mb-4">
                                <Ionicons name="cart" size={40} color="#F59E0B" />
                            </View>
                            <Text className="text-2xl font-black text-gray-900 text-center">{selectedDetail.title}</Text>
                            <Text className="text-orange-600 font-bold uppercase tracking-widest text-[10px] mt-1">Requested by {selectedDetail.senderName}</Text>
                        </View>

                        <View className="bg-gray-50 rounded-[40px] p-8 border border-gray-100">
                            <DetailRow icon="list" label="Ordered Items" value="Milk (2L), Apples (1kg), Brown Bread, Multivitamins" />
                            <DetailRow icon="time" label="Schedule" value="Today, 04:00 PM - 06:00 PM" />
                            <DetailRow icon="location" label="Address" value="Sector 4, HSR Layout, Bangalore" />
                            <DetailRow icon="wallet" label="Estimate" value="₹450 (Escrow Protected)" />

                            <View className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex-row items-center">
                                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                                <Text className="text-emerald-700 text-[10px] font-bold ml-3 flex-1">Payment will be released only after Pal delivery verification.</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                handleAccept(selectedDetail.id);
                                setSelectedDetail(null);
                            }}
                            className="bg-gray-900 mt-10 py-6 rounded-[32px] items-center shadow-2xl shadow-black/20"
                        >
                            <Text className="text-white font-black uppercase tracking-[2px]">Approve & Assign Pal</Text>
                        </TouchableOpacity>

                        <View className="h-20" />
                    </ScrollView>
                </Animated.View>
            )}
        </View>
    );
}

function DetailRow({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <View className="mb-6">
            <View className="flex-row items-center mb-2">
                <Ionicons name={icon} size={14} color="#94A3B8" />
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{label}</Text>
            </View>
            <Text className="text-gray-900 font-bold text-sm leading-6 ml-6">{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({});
