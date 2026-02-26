import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    Layout
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



type ErrandsStatus = 'pending' | 'in-progress' | 'completed';

interface Errand {
    id: string;
    title: string;
    category: 'Grocery' | 'Pharmacy' | 'Household' | 'Medical';
    time: string;
    status: ErrandsStatus;
    palName?: string;
    palId?: string;
    palImage?: string;
    items?: string[];
    priority?: 'high' | 'normal';
}

const INITIAL_ERRANDS: Errand[] = [
    {
        id: '1',
        title: 'Medicine Refill',
        time: 'Today, 10:30 AM',
        status: 'in-progress', // Changed from 'Ongoing' to match ErrandsStatus type
        category: 'Pharmacy',
        palName: 'Arjun Singh',
        // palId: '3', // Removed as palId is not in Errand interface
        palImage: 'https://i.pravatar.cc/100?u=arjun',
        // location: 'Apollo Pharmacy, Sector 4' // Removed as location is not in Errand interface
    },
    {
        id: '2',
        title: 'Weekly Fruit & Veggies',
        category: 'Grocery',
        time: 'Today, 11:30 AM',
        status: 'in-progress',
        palName: 'Arjun Singh',
        palId: '3',
        palImage: 'https://i.pravatar.cc/100?u=arjun',
        items: ['Apples', 'Bananas', 'Spinach'],
        priority: 'high'
    },
];

const PulseCircle = () => {
    return <View style={styles.pulse} />;
};

export default function ErrandsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [errands, setErrands] = useState<Errand[]>(INITIAL_ERRANDS);
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const sortedErrands = useMemo(() => {
        const order: Record<ErrandsStatus, number> = { 'in-progress': 0, 'pending': 1, 'completed': 2 };
        return [...errands].sort((a, b) => order[a.status] - order[b.status]);
    }, [errands]);

    const handleAddTask = () => {
        if (!newTaskTitle.trim()) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const errand: Errand = {
            id: Date.now().toString(),
            title: newTaskTitle,
            category: 'Household',
            time: 'ASAP',
            status: 'pending'
        };
        setErrands([errand, ...errands]);
        setNewTaskTitle('');
        setIsAdding(false);
    };

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'Pharmacy': return { icon: 'bandage-outline', color: '#6366F1' };
            case 'Grocery': return { icon: 'cart-outline', color: '#10B981' };
            case 'Medical': return { icon: 'medkit-outline', color: '#EF4444' };
            default: return { icon: 'receipt-outline', color: '#F59E0B' };
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
            />

            {/* Premium Header */}
            <View
                className="px-6 pb-8 pt-4 bg-white/80 backdrop-blur-xl border-b border-gray-100"
                style={{ paddingTop: Math.max(insets.top, 20) }}
            >
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => {
                            if (isAdding) { setIsAdding(false); }
                            else if (router.canGoBack()) { router.back(); }
                            else { router.replace('/(family)/home'); }
                        }}
                        className="w-12 h-12 items-center justify-center bg-gray-50 rounded-2xl border border-gray-100"
                    >
                        <Ionicons name="chevron-back" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <View className="items-center">
                        <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Control Tower</Text>
                        <Text className="text-xl font-black text-gray-900">Today&apos;s Errands</Text>
                    </View>

                    <View className="w-12" />
                </View>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* Section: Live Progress */}
                <View className="px-6 mt-8">
                    <Animated.View
                        layout={Layout.springify()}
                        className="bg-gray-100 p-8 rounded-[24px] shadow-2xl shadow-black/5 border border-gray-300 flex-row items-center justify-between"
                    >
                        <View className="items-center">
                            <Text className="text-emerald-500 font-black text-2xl">{errands.filter(e => e.status === 'completed').length}</Text>
                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Finished</Text>
                        </View>
                        <View className="w-[1px] h-10 bg-gray-100" />
                        <View className="items-center">
                            <Text className="text-blue-500 font-black text-2xl">{errands.filter(e => e.status === 'in-progress').length}</Text>
                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Active</Text>
                        </View>
                        <View className="w-[1px] h-10 bg-gray-100" />
                        <View className="items-center">
                            <Text className="text-orange-500 font-black text-2xl">{errands.filter(e => e.status === 'pending').length}</Text>
                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">Next Up</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Task List */}
                <View className="px-6 mt-10">
                    {sortedErrands.map((errand, idx) => {
                        const { icon, color } = getCategoryStyles(errand.category);
                        const isFirstOfGroup = idx === 0 || sortedErrands[idx - 1].status !== errand.status;

                        return (
                            <View key={errand.id}>
                                {isFirstOfGroup && (
                                    <Animated.Text
                                        entering={FadeIn.delay(200)}
                                        className="text-[10px] font-black text-gray-400 uppercase tracking-[3px] mb-6 mt-4 ml-2"
                                    >
                                        {errand.status === 'in-progress' ? 'Running Right Now' : errand.status === 'pending' ? 'Coming Up Next' : 'Shadow History'}
                                    </Animated.Text>
                                )}

                                <Animated.View
                                    entering={FadeInDown.delay(idx * 150)}
                                    layout={Layout.springify()}
                                    className="mb-6"
                                >
                                    <View
                                        style={[
                                            styles.card,
                                            errand.status === 'completed' && { opacity: 0.6, transform: [{ scale: 0.98 }] }
                                        ]}
                                        className="bg-white p-6 rounded-[24px] border border-gray-300 shadow-sm"
                                    >
                                        <View className="flex-row items-center">
                                            {/* Status Icon Indicator */}
                                            <View className="relative">
                                                <View
                                                    style={{ backgroundColor: color + '15' }}
                                                    className="w-16 h-16 rounded-[22px] items-center justify-center border border-gray-50"
                                                >
                                                    <Ionicons name={icon as any} size={28} color={color} />
                                                </View>
                                                {errand.status === 'in-progress' && <PulseCircle />}
                                            </View>

                                            <View className="flex-1 ml-5">
                                                <View className="flex-row items-center justify-between">
                                                    <Text
                                                        style={errand.status === 'completed' && { textDecorationLine: 'line-through' }}
                                                        className="text-gray-900 font-black text-base"
                                                    >
                                                        {errand.title}
                                                    </Text>
                                                    {errand.priority === 'high' && (
                                                        <View className="bg-red-50 px-2 py-1 rounded-lg">
                                                            <Text className="text-red-500 font-black text-[7px] uppercase tracking-widest">Priority</Text>
                                                        </View>
                                                    )}
                                                </View>

                                                <View className="flex-row items-center mt-2">
                                                    <Ionicons name="time-outline" size={12} color="#94A3B8" />
                                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errand.time}</Text>
                                                    <View className="w-1 h-1 bg-gray-200 rounded-full mx-2" />
                                                    <Text className="text-gray-500 font-bold text-[10px]">{errand.category}</Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Assigned Pal Sub-Card */}
                                        {errand.palName && (
                                            <View className="bg-gray-50/50 mt-5 p-4 rounded-[28px] flex-row items-center justify-between border border-gray-100">
                                                <View className="flex-row items-center">
                                                    <Image
                                                        source={{ uri: errand.palImage }}
                                                        className="w-10 h-10 rounded-full border-2 border-white"
                                                    />
                                                    <View className="ml-3">
                                                        <Text className="text-gray-900 font-black text-[11px]">{errand.palName}</Text>
                                                        <Text className="text-gray-400 text-[8px] font-bold uppercase tracking-widest">Assigned Pal</Text>
                                                    </View>
                                                </View>

                                                <View className="flex-row items-center">
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                            router.push({ pathname: '/(family)/chat/[id]', params: { id: errand.palId || errand.id } });
                                                        }}
                                                        className="w-9 h-9 bg-white rounded-xl items-center justify-center border border-gray-100 shadow-sm mr-2"
                                                    >
                                                        <Ionicons name="chatbubble-outline" size={16} color="#1F2937" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                            Linking.openURL('tel:+919876543210');
                                                        }}
                                                        className="w-9 h-9 bg-gray-900 rounded-xl items-center justify-center shadow-lg"
                                                    >
                                                        <Ionicons name="call" size={16} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {errand.status === 'in-progress' && (
                                            <View className="mt-5 bg-blue-50/50 p-4 rounded-3xl border border-blue-100 flex-row items-center">
                                                <View className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                                                <Text className="text-blue-600 font-bold text-[10px] flex-1">Pal is moving toward the destination. Expected 14 mins.</Text>
                                                <TouchableOpacity onPress={() => router.push('/(family)/tracking')}>
                                                    <Text className="text-blue-600 font-black text-[10px] uppercase">Track Live</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                </Animated.View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Quick Add Bottom Bar */}
            <Animated.View
                entering={FadeInDown.delay(600)}
                className="absolute bottom-10 left-6 right-6"
            >
                <View className="bg-white  backdrop-blur-3xl p-4 rounded-[50px] border border-gray-300 shadow-2xl shadow-black/10 flex-row items-center">
                    <TextInput
                        placeholder="Assign a new quick task..."
                        placeholderTextColor="#686a6bff"
                        className="flex-1 px-4 py-2 font-black text-gray-900"
                        value={newTaskTitle}
                        onChangeText={setNewTaskTitle}
                    />
                    <TouchableOpacity
                        onPress={handleAddTask}
                        className="bg-gray-900 h-14 w-14 rounded-[28px] items-center justify-center shadow-lg"
                    >
                        <Ionicons name="arrow-up" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    pulse: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#3B82F6',
        borderWidth: 2,
        borderColor: 'white',
    }
});
