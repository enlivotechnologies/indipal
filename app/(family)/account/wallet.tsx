import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WalletScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('care') ? 'Care' :
            pathname.includes('tracking') ? 'Track' :
                pathname.includes('chat') ? 'Connect' : 'Home';

    const [balance, setBalance] = useState(5250);
    const [isTopUpVisible, setIsTopUpVisible] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [transactions, setTransactions] = useState([
        { id: '1', title: 'Pal Service - Arjun Singh', amount: '-₹850', date: '22 Feb, 10:30 AM', status: 'Escrow' },
        { id: '2', title: 'Grocery Refill - Priya', amount: '-₹1,200', date: '21 Feb, 04:15 PM', status: 'Completed' },
        { id: '3', title: 'Wallet Top-up', amount: '+₹5,000', date: '20 Feb, 09:00 AM', status: 'Success' },
        { id: '4', title: 'Pal Service - Ravi', amount: '-₹600', date: '19 Feb, 08:30 PM', status: 'Completed' },
    ]);

    const PRESET_AMOUNTS = ['500', '1000', '2000', '5000'];

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

    const handleTopUp = () => {
        if (!topUpAmount || isNaN(Number(topUpAmount))) return;

        setIsProcessing(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Simulate external app payment delay
        setTimeout(() => {
            const amount = Number(topUpAmount);
            setBalance(prev => prev + amount);

            const newTransaction = {
                id: Date.now().toString(),
                title: 'Wallet Top-up',
                amount: `+₹${amount.toLocaleString()}`,
                date: 'Just now',
                status: 'Success'
            };

            setTransactions(prev => [newTransaction, ...prev]);
            setIsProcessing(false);
            setIsTopUpVisible(false);
            setTopUpAmount('');
        }, 2000);
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                className="px-6 flex-row items-center justify-between bg-white border-b border-gray-50"
                style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
            >
                <TouchableOpacity
                    onPress={handleBack}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center font-bold"
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-2xl font-black text-gray-900">Enlivo Wallet</Text>
                <View className="w-10" />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 24,
                    paddingBottom: insets.bottom + 100
                }}
            >
                {/* Balance Card */}
                <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
                    <LinearGradient
                        colors={['#1F2937', '#111827']}
                        style={{ borderRadius: 15, overflow: 'hidden' }}
                        className="p-8 rounded-[40px] shadow-2xl shadow-black/20"
                    >
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Balance</Text>
                        <View className="flex-row items-end justify-between">
                            <Text className="text-white text-5xl font-black">₹ {balance.toLocaleString()}</Text>
                            <TouchableOpacity
                                className="bg-orange-500 px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/30"
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    setIsTopUpVisible(true);
                                }}
                            >
                                <Text className="text-white font-black text-xs uppercase tracking-widest">+ Top Up</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="mt-8 flex-row gap-x-6 border-t border-white/10 pt-6">
                            <View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">In Escrow</Text>
                                <Text className="text-white font-bold text-lg">₹ 850</Text>
                            </View>
                            <View>
                                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">Monthly Spent</Text>
                                <Text className="text-orange-400 font-bold text-lg">₹ 12,400</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* UPI Details */}
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Verified Payment Method</Text>
                <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 flex-row items-center mb-10">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-gray-100">
                        <Ionicons name="at" size={24} color="#F59E0B" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="font-bold text-gray-800">vikram@icici</Text>
                        <Text className="text-[10px] text-emerald-500 font-bold uppercase">Primary UPI Verified</Text>
                    </View>
                    <TouchableOpacity><Text className="text-gray-400 text-xs font-bold">Edit</Text></TouchableOpacity>
                </View>

                {/* History */}
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Transaction History</Text>
                    <TouchableOpacity><Text className="text-orange-600 font-bold text-xs">View All</Text></TouchableOpacity>
                </View>

                {transactions.map((item, idx) => (
                    <Animated.View key={item.id} entering={FadeInUp.delay(200 + idx * 100).duration(600).easing(Easing.out(Easing.quad))} className="mb-4">
                        <View className="bg-white p-5 rounded-[32px] flex-row items-center border border-gray-100 shadow-sm">
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${item.amount.startsWith('+') ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                                <Ionicons
                                    name={item.amount.startsWith('+') ? 'arrow-down' : 'card-outline'}
                                    size={20}
                                    color={item.amount.startsWith('+') ? '#059669' : '#4B5563'}
                                />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="font-bold text-gray-900" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-[10px] text-gray-400 font-medium">{item.date}</Text>
                            </View>
                            <View className="items-end">
                                <Text className={`font-black ${item.amount.startsWith('+') ? 'text-emerald-500' : 'text-gray-900'}`}>{item.amount}</Text>
                                <View className={`px-2 py-0.5 rounded-md mt-1 ${item.status === 'Escrow' ? 'bg-orange-50' : 'bg-gray-50'}`}>
                                    <Text className={`text-[8px] font-bold ${item.status === 'Escrow' ? 'text-orange-600 uppercase tracking-tighter' : 'text-gray-400'}`}>{item.status}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Top Up Modal */}
            <Modal
                visible={isTopUpVisible}
                transparent
                animationType="fade"
            >
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <Animated.View
                        entering={ZoomIn}
                        className="bg-white w-full rounded-[48px] p-8 shadow-2xl"
                    >
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-2xl font-black text-gray-900">Add Money</Text>
                                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Refill your Enlivo Wallet</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsTopUpVisible(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color="#1F2937" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Daily Top-up Limit: ₹ 50,000</Text>

                        <View className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8">
                            <View className="flex-row items-center">
                                <Text className="text-2xl font-black text-gray-900 mr-2">₹</Text>
                                <TextInput
                                    placeholder="0.00"
                                    value={topUpAmount}
                                    onChangeText={setTopUpAmount}
                                    keyboardType="numeric"
                                    className="flex-1 text-3xl font-black text-gray-900"
                                    placeholderTextColor="#CBD5E1"
                                />
                            </View>
                        </View>

                        <View className="flex-row flex-wrap gap-3 mb-10">
                            {PRESET_AMOUNTS.map(amount => (
                                <TouchableOpacity
                                    key={amount}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setTopUpAmount(amount);
                                    }}
                                    className={`px-6 py-3 rounded-2xl border ${topUpAmount === amount ? 'bg-orange-500 border-orange-500' : 'bg-white border-gray-100'
                                        }`}
                                >
                                    <Text className={`font-black text-xs ${topUpAmount === amount ? 'text-white' : 'text-gray-600'
                                        }`}>+ ₹ {amount}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Payment Sources</Text>
                        <View className="bg-orange-50/50 p-5 rounded-[32px] border border-orange-100 mb-10 flex-row items-center">
                            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-orange-100 shadow-sm">
                                <Ionicons name="flash" size={24} color="#F59E0B" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="font-black text-gray-900">Instant UPI</Text>
                                <Text className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">Connects to PhonePe / GPay</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleTopUp}
                            disabled={!topUpAmount || isProcessing}
                            className={`py-5 rounded-[24px] items-center shadow-xl ${!topUpAmount || isProcessing ? 'bg-gray-200 shadow-none' : 'bg-orange-500 shadow-orange-500/40'
                                }`}
                        >
                            {isProcessing ? (
                                <Text className="text-gray-400 font-bold uppercase tracking-widest italic">Processing Transaction...</Text>
                            ) : (
                                <Text className="text-white font-black uppercase tracking-widest">Proceed to Pay ₹ {topUpAmount || '0'}</Text>
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

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
