import { useAuthStore } from '@/store/authStore';
import { useGigStore } from '@/store/gigStore';
import { Medication, useHealthStore } from "@/store/healthStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, Dimensions, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BRAND_PURPLE = '#6E5BFF';

export default function MedicationsList() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const user = useAuthStore((state) => state.user);
    const { medications, addMedication, requestRefill, toggleMedicationTaken } = useHealthStore();
    const { addGig } = useGigStore();

    const activeMeds = medications.filter(m => m.status === 'active');
    const takenCount = activeMeds.filter(m => m.takenToday).length;
    const totalDoses = activeMeds.length;

    const [plusMenuOpen, setPlusMenuOpen] = useState(false);
    const [addMedModal, setAddMedModal] = useState(false);
    const [refillModal, setRefillModal] = useState(false);

    // Form State
    const [medName, setMedName] = useState('');
    const [medDosage, setMedDosage] = useState('');
    const [medFreq, setMedFreq] = useState('Daily');
    const [prescriptionPhoto, setPrescriptionPhoto] = useState<string | null>(null);

    const handleAddMedicine = () => {
        if (!medName || !medDosage) {
            Alert.alert('Error', 'Please fill name and dosage');
            return;
        }

        addMedication({
            name: medName,
            dosage: medDosage,
            frequency: medFreq,
            time: '08:00 AM',
            addedBy: 'senior',
            color: '#6E5BFF',
            prescriptionImage: prescriptionPhoto || 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=200',
        });

        setMedName('');
        setMedDosage('');
        setPrescriptionPhoto(null);
        setAddMedModal(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Medicine add request sent for family review');
    };

    const handleRefillRequest = (med: Medication) => {
        requestRefill(med.id);

        addGig({
            seniorId: user?.id || 'senior_1',
            seniorName: user?.name || 'Ramesh Chandra',
            familyId: user?.familyId || 'family_1',
            status: 'pending_approval',
            category: 'Medicine',
            items: [{ id: Math.random().toString(), name: `Refill: ${med.name} (${med.dosage})`, quantity: '1 Pack', checked: false }],
            type: 'Refill',
            medicationDetails: {
                name: med.name,
                dosage: med.dosage,
                frequency: med.frequency
            }
        });

        setRefillModal(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Refill Requested', `A request to refill ${med.name} has been sent to your family.`);
    };

    const activeTab = (pathname || '').includes('home') ? 'Home' :
        (pathname || '').includes('services') ? 'Services' :
            (pathname || '').includes('health') ? 'Health' :
                (pathname || '').includes('video') ? 'Video' : 'Home';

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home' as any);
        if (tab === 'Services') router.replace('/(senior)/services' as any);
        if (tab === 'Health') router.replace('/(senior)/health' as any);
        if (tab === 'Video') router.replace('/(senior)/video' as any);
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row justify-between items-center bg-white"
            >
                <View>
                    <Text className="text-xs font-bold text-indigo-400 uppercase tracking-widest">EnlivoCare</Text>
                    <Text className="text-2xl font-black text-gray-900">Medications</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                >
                    <Ionicons name="chevron-back" size={20} color={BRAND_PURPLE} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 120
                }}
            >
                {/* 1. Progress Hero Card */}
                <Animated.View entering={FadeInUp.delay(100).duration(600)} className="mb-8 mt-6">
                    <View className="bg-indigo-600 p-8 rounded-[40px] shadow-xl shadow-indigo-100">
                        <Text className="text-white/70 text-xs font-black uppercase tracking-[2px]">Daily Adherence</Text>
                        <View className="flex-row items-baseline mt-2">
                            <Text className="text-white text-5xl font-black">{takenCount} of {totalDoses}</Text>
                            <Text className="text-white/50 text-base font-bold ml-2">Doses Taken</Text>
                        </View>
                        <View className="h-2 w-full bg-white/10 rounded-full mt-6 overflow-hidden">
                            <View className="h-full bg-white rounded-full" style={{ width: totalDoses > 0 ? `${(takenCount / totalDoses) * 100}%` : '0%' }} />
                        </View>
                    </View>
                </Animated.View>

                {/* Daily Schedule List */}
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Today's Schedule</Text>

                <View className="gap-y-4">
                    {activeMeds.map((med, idx) => (
                        <Animated.View
                            key={med.id}
                            entering={FadeInUp.delay(200 + idx * 100).duration(600)}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    toggleMedicationTaken(med.id);
                                }}
                                activeOpacity={0.9}
                                className="bg-white p-5 rounded-[28px] border border-gray-100 flex-row items-center shadow-sm"
                            >
                                <View style={{ backgroundColor: med.color }} className="w-1.5 h-10 rounded-full" />
                                <View className="ml-5 flex-1">
                                    <Text className="text-gray-900 font-bold text-lg">{med.name}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-400 text-xs font-medium">{med.dosage}</Text>
                                        <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                                        <Text className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">{med.time}</Text>
                                    </View>
                                </View>
                                <View className={`px-4 py-2 rounded-2xl ${med.takenToday ? 'bg-emerald-50 border border-emerald-100' : 'bg-orange-50 border border-orange-100'}`}>
                                    <Text className={`text-[10px] font-black uppercase tracking-widest ${med.takenToday ? 'text-emerald-600' : 'text-orange-600'}`}>
                                        {med.takenToday ? 'Taken' : 'Pending'}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                    {activeMeds.length === 0 && (
                        <View className="items-center py-10">
                            <Ionicons name="medical-outline" size={48} color="#E2E8F0" />
                            <Text className="text-gray-400 font-bold mt-4">No medications scheduled for today</Text>
                        </View>
                    )}
                </View>

                {/* Refill Reminder */}
                <Animated.View entering={FadeInUp.delay(600).duration(600)} className="mt-12 bg-indigo-50/50 p-6 rounded-[32px] border border-indigo-100/50 flex-row items-center">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center border border-gray-100">
                        <Ionicons name="refresh" size={20} color={BRAND_PURPLE} />
                    </View>
                    <View className="ml-5 flex-1">
                        <Text className="text-gray-900 font-bold">Refill Needed Soon</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Amlodipine • 3 Days left</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            const medToRefill = medications.find(m => m.name.toLowerCase().includes('amlodipine')) || activeMeds[0];
                            if (medToRefill) {
                                handleRefillRequest(medToRefill);
                            } else {
                                setRefillModal(true);
                            }
                        }}
                        className="bg-white px-4 py-2 rounded-xl border border-indigo-100"
                    >
                        <Text className="text-indigo-600 text-[10px] font-black uppercase">Order</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            {/* Dual-Action '+' Menu */}
            {plusMenuOpen && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setPlusMenuOpen(false)}
                    className="absolute inset-0 bg-black/40 z-[100]"
                >
                    <Animated.View
                        entering={ZoomIn.duration(300)}
                        exiting={ZoomOut.duration(200)}
                        className="absolute bottom-72 right-8 gap-y-4"
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setPlusMenuOpen(false);
                                setRefillModal(true);
                            }}
                            style={{ backgroundColor: BRAND_PURPLE }}
                            className="px-6 py-4 rounded-[20px] shadow-lg flex-row items-center border border-white/20"
                        >
                            <Ionicons name="repeat" size={20} color="white" />
                            <Text className="text-white font-nunito-bold ml-3 uppercase tracking-widest text-xs">Refill Existing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setPlusMenuOpen(false);
                                setAddMedModal(true);
                            }}
                            style={{ backgroundColor: '#F3F0FF' }}
                            className="px-6 py-4 rounded-[20px] shadow-lg flex-row items-center border border-indigo-100"
                        >
                            <Ionicons name="add-circle" size={20} color={BRAND_PURPLE} />
                            <Text style={{ color: BRAND_PURPLE }} className="font-nunito-bold ml-3 uppercase tracking-widest text-xs">Add New Medicine</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            )}

            {/* Main FAB for '+' */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setPlusMenuOpen(!plusMenuOpen);
                }}
                style={{ backgroundColor: BRAND_PURPLE }}
                className="absolute bottom-40 right-8 w-16 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-indigo-300 z-[101]"
            >
                <Ionicons name={plusMenuOpen ? "close" : "add"} size={plusMenuOpen ? 28 : 32} color="white" />
            </TouchableOpacity>

            {/* Refill Modal */}
            <Modal visible={refillModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8 max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-1">Stock Refill</Text>
                                <Text className="text-indigo-900 font-nunito-bold text-2xl">Select Medicine</Text>
                            </View>
                            <TouchableOpacity onPress={() => setRefillModal(false)} className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <Ionicons name="close" size={24} color={BRAND_PURPLE} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {medications.filter(m => m.status === 'active').map((med) => (
                                <TouchableOpacity
                                    key={med.id}
                                    onPress={() => handleRefillRequest(med)}
                                    className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 flex-row items-center mb-4"
                                >
                                    <View style={{ backgroundColor: med.color }} className="w-1.5 h-10 rounded-full" />
                                    <View className="ml-5 flex-1">
                                        <Text className="text-gray-900 font-nunito-bold text-lg">{med.name}</Text>
                                        <Text className="text-gray-500 text-sm">{med.dosage}</Text>
                                    </View>
                                    <View className="bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-200">
                                        <Text className="text-indigo-600 text-[10px] font-black uppercase">Refill</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                            {medications.filter(m => m.status === 'active').length === 0 && (
                                <Text className="text-center text-gray-400 py-10">No active medications found.</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Add Medicine Modal */}
            <Modal visible={addMedModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-[#F3F0FF] rounded-t-[40px] p-8">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-indigo-400 font-black text-[10px] uppercase tracking-widest mb-1">New Prescription</Text>
                                <Text className="text-indigo-900 font-nunito-bold text-2xl">Add Medicine</Text>
                            </View>
                            <TouchableOpacity onPress={() => setAddMedModal(false)} className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                                <Ionicons name="close" size={24} color={BRAND_PURPLE} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="gap-y-6 mb-10">
                                <View>
                                    <Text className="text-indigo-900 font-black text-xs uppercase mb-3 ml-1 tracking-widest">Medicine Name</Text>
                                    <TextInput
                                        value={medName}
                                        onChangeText={setMedName}
                                        placeholder="e.g. Amlodipine"
                                        className="bg-white p-5 rounded-2xl border border-indigo-100 font-nunito-bold text-lg"
                                    />
                                </View>
                                <View className="flex-row gap-x-4">
                                    <View className="flex-1">
                                        <Text className="text-indigo-900 font-black text-xs uppercase mb-3 ml-1 tracking-widest">Dosage</Text>
                                        <TextInput
                                            value={medDosage}
                                            onChangeText={setMedDosage}
                                            placeholder="e.g. 5mg"
                                            className="bg-white p-5 rounded-2xl border border-indigo-100 font-nunito-bold text-lg"
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-indigo-900 font-black text-xs uppercase mb-3 ml-1 tracking-widest">Freq</Text>
                                        <TouchableOpacity className="bg-white p-5 rounded-2xl border border-indigo-100 items-center justify-center">
                                            <Text className="font-nunito-bold text-lg">{medFreq}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-indigo-900 font-black text-xs uppercase mb-3 ml-1 tracking-widest">Prescription Photo</Text>
                                    <TouchableOpacity
                                        onPress={() => setPrescriptionPhoto('https://images.unsplash.com/photo-1550572566-959b71b94420?q=80&w=400')}
                                        className="h-40 bg-white border-2 border-dashed border-indigo-200 rounded-3xl items-center justify-center overflow-hidden"
                                    >
                                        {prescriptionPhoto ? (
                                            <Image source={{ uri: prescriptionPhoto }} className="w-full h-full" />
                                        ) : (
                                            <>
                                                <Ionicons name="camera" size={32} color={BRAND_PURPLE} />
                                                <Text className="text-indigo-600 font-black mt-2">Tap to take photo</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleAddMedicine}
                                style={{ backgroundColor: BRAND_PURPLE }}
                                className="h-20 rounded-[28px] items-center justify-center shadow-xl shadow-indigo-200"
                            >
                                <Text className="text-white font-black text-lg uppercase tracking-widest">Add & Send for Review</Text>
                            </TouchableOpacity>
                            <View className="h-10" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
        </View>
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
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    },
    seniorFAB: {
        zIndex: 99,
    }
});
