import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Precise February 2026 data
const AVAILABILITY_DATA = [
    { day: 'Tue', date: '24 Feb', slots: ['09:00 AM', '12:00 PM', '03:00 PM', '06:00 PM'], isToday: true },
    { day: 'Wed', date: '25 Feb', slots: ['08:00 AM', '10:30 AM', '01:00 PM', '04:00 PM', '07:30 PM'] },
    { day: 'Thu', date: '26 Feb', slots: ['09:00 AM', '11:00 AM', '02:00 PM', '05:00 PM', '08:00 PM'] },
    { day: 'Fri', date: '27 Feb', slots: ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM'] },
    { day: 'Sat', date: '28 Feb', slots: ['09:00 AM', '12:00 PM', '03:00 PM'] },
];

export default function PalProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    const { addBooking, bookings } = useBookingStore();

    const [palInfo, setPalInfo] = useState({
        id: '3',
        name: 'Arjun Singh',
        image: 'https://i.pravatar.cc/150?u=arjun',
        specialty: 'Elderly Care Specialist'
    });

    const [activeTab, setActiveTab] = useState<'About' | 'Availability' | 'Review'>('About');

    useEffect(() => {
        if (params.id) {
            setPalInfo(prev => ({
                ...prev,
                id: (Array.isArray(params.id) ? params.id[0] : params.id) || '3',
                name: (Array.isArray(params.name) ? params.name[0] : params.name) || 'Arjun Singh',
                image: (Array.isArray(params.image) ? params.image[0] : params.image) || 'https://i.pravatar.cc/150?u=arjun'
            }));
        }
    }, [params.id, params.name, params.image]);

    // UI States
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

    const systemNow = new Date('2026-02-24T15:39:16');

    const palData = useMemo(() => ({
        ...palInfo,
        rating: 4.9,
        reviews: 124,
        experience: '5+ yrs',
        sessions: '1k+',
        bio: 'Dedicated and compassionate caregiver with expertise in elderly support. Certified in basic life support and specialized in mobility assistance and companionship.',
        hourlyRate: '450',
        verified: true,
        location: 'Seattle Memorial Hospital, US'
    }), [palInfo]);

    const currentDay = AVAILABILITY_DATA[selectedDayIndex] || AVAILABILITY_DATA[0];

    // Check if this slot already has a booking
    const activeBooking = useMemo(() => {
        return bookings.find(b =>
            b.palId === palData.id &&
            b.date === currentDay.date &&
            b.time === selectedTimeSlot &&
            (b.status === 'Pending' || b.status === 'Accepted')
        );
    }, [bookings, palData.id, currentDay.date, selectedTimeSlot]);

    const handleBooking = () => {
        if (!selectedTimeSlot) return;

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        addBooking({
            palId: palData.id,
            palName: palData.name,
            userName: user?.name || 'Member',
            date: currentDay.date,
            day: currentDay.day,
            time: selectedTimeSlot,
            price: palData.hourlyRate
        });

        // Optional: Navigate to home or show success modal
        // router.replace('/(family)/home');
    };

    const onDatePress = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
        setSelectedDayIndex(index);
        setSelectedTimeSlot(null);
    };

    const isSlotInPast = (dateStr: string, timeStr: string) => {
        try {
            const dayNum = parseInt(dateStr.split(' ')[0]);
            const [rawTime, ampm] = timeStr.split(' ');
            let [hh, mm] = rawTime.split(':').map(Number);
            if (ampm === 'PM' && hh !== 12) hh += 12;
            if (ampm === 'AM' && hh === 12) hh = 0;
            const targetDate = new Date(2026, 1, dayNum, hh, mm);
            return targetDate < systemNow;
        } catch (err) {
            return false;
        }
    };

    const StatItem = ({ icon, label, value }: { icon: string, label: string, value: string }) => (
        <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ width: 40, height: 40, backgroundColor: '#F9FAFB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                <Ionicons name={icon as any} size={20} color="#6B7280" />
            </View>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#111827' }}>{value}</Text>
            <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{label}</Text>
        </View>
    );

    const TabButton = ({ name }: { name: typeof activeTab }) => {
        const isActive = activeTab === name;
        return (
            <TouchableOpacity
                onPress={() => setActiveTab(name)}
                style={{
                    flex: 1,
                    height: 44,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isActive ? 'transparent' : '#F9FAFB',
                    borderWidth: 1,
                    borderColor: isActive ? '#F97316' : 'transparent',
                }}
            >
                <Text style={{ fontSize: 14, fontWeight: isActive ? '700' : '500', color: isActive ? '#F97316' : '#6B7280' }}>
                    {name}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            {/* Header */}
            <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, backgroundColor: 'white' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Profile</Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Profile Main */}
                <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <View style={{ width: 100, height: 100, borderRadius: 50, padding: 3, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 12 }}>
                        <Image source={{ uri: palData.image }} style={{ width: '100%', height: '100%', borderRadius: 50 }} />
                    </View>
                    <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827' }}>{palData.name}</Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>{palData.specialty}</Text>
                </View>

                {/* Stats */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F3F4F6', marginBottom: 24 }}>
                    <StatItem icon="time-outline" label="Experience" value={palData.experience} />
                    <StatItem icon="people-outline" label="Sessions" value={palData.sessions} />
                    <StatItem icon="star-outline" label="Rating" value={palData.rating.toString()} />
                </View>

                {/* Tabs */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
                    <TabButton name="About" />
                    <TabButton name="Availability" />
                    <TabButton name="Review" />
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
            >
                {activeTab === 'About' && (
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 }}>About</Text>
                        <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 22, marginBottom: 24 }}>
                            {palData.bio} <Text style={{ color: '#F97316', fontWeight: '700' }}>Show more</Text>
                        </Text>

                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>Schedule & Location</Text>
                        <View style={{ backgroundColor: '#F9FAFB', borderRadius: 24, padding: 20, gap: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 36, height: 36, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Ionicons name="calendar-outline" size={18} color="#F97316" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Date</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>Mon - Sat</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 36, height: 36, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Ionicons name="time-outline" size={18} color="#F97316" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Time</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>09:00 AM - 08:00 PM</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 36, height: 36, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Ionicons name="medical-outline" size={18} color="#F97316" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Specialty</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>Geriatric Care</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ width: 36, height: 36, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                    <Ionicons name="location-outline" size={18} color="#F97316" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Location</Text>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{palData.location}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {activeTab === 'Availability' && (
                    <View>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 }}>Select a Date & Time</Text>
                        <Text style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 24 }}>Choose a date and time that works for you</Text>

                        <View style={{ backgroundColor: '#F9FAFB', borderRadius: 24, padding: 20, marginBottom: 24 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>February 2026</Text>
                                <View style={{ flexDirection: 'row', gap: 16 }}>
                                    <Ionicons name="chevron-back" size={20} color="#111827" />
                                    <Ionicons name="chevron-forward" size={20} color="#111827" />
                                </View>
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -10 }}>
                                {AVAILABILITY_DATA.map((item, idx) => {
                                    const isChosen = selectedDayIndex === idx;
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            onPress={() => onDatePress(idx)}
                                            style={{
                                                width: 60,
                                                height: 80,
                                                backgroundColor: 'white',
                                                borderRadius: 30,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginHorizontal: 8,
                                                borderWidth: 1.5,
                                                borderColor: isChosen ? '#F97316' : '#F3F4F6',
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, color: isChosen ? '#F97316' : '#9CA3AF', fontWeight: '500', marginBottom: 4 }}>{item.day}</Text>
                                            <View style={{ width: 34, height: 34, backgroundColor: isChosen ? '#F97316' : 'transparent', borderRadius: 17, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 16, fontWeight: '700', color: isChosen ? 'white' : '#111827' }}>{item.date.split(' ')[0]}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 }}>Select a Time</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            {currentDay.slots.map((slot, sIdx) => {
                                const past = isSlotInPast(currentDay.date, slot);
                                const active = selectedTimeSlot === slot;
                                return (
                                    <TouchableOpacity
                                        key={sIdx}
                                        disabled={past}
                                        onPress={() => setSelectedTimeSlot(slot)}
                                        style={{
                                            paddingHorizontal: 20,
                                            paddingVertical: 12,
                                            borderRadius: 14,
                                            backgroundColor: active ? '#F97316' : 'white',
                                            borderWidth: 1.5,
                                            borderColor: active ? '#F97316' : '#F3F4F6',
                                            opacity: past ? 0.3 : 1
                                        }}
                                    >
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: active ? 'white' : past ? '#D1D5DB' : '#111827' }}>{slot}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {activeTab === 'Review' && (
                    <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>Reviews</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="star" size={16} color="#F59E0B" />
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginLeft: 4 }}>4.9</Text>
                                <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>(124)</Text>
                            </View>
                        </View>

                        {[1, 2].map((i) => (
                            <View key={i} style={{ marginBottom: 20, backgroundColor: '#F9FAFB', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#F3F4F6' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB' }} />
                                        <View>
                                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{i === 1 ? 'Meera K.' : 'Rahul S.'}</Text>
                                            <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{i === 1 ? '2 days ago' : '1 week ago'}</Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 2 }}>
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Ionicons key={s} name="star" size={12} color="#F59E0B" />
                                        ))}
                                    </View>
                                </View>
                                <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20 }}>
                                    {i === 1
                                        ? "Arjun is incredibly patient and kind. He took great care of my father during his recovery. Highly recommended!"
                                        : "Very professional and punctual. Great with communication and truly cares about the well-being of the elderly."}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Status Indicator for Current Selection */}
                {activeBooking && (
                    <View style={{ backgroundColor: activeBooking.status === 'Pending' ? '#FFFBEB' : '#ECFDF5', padding: 16, borderRadius: 20, marginTop: 24, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: activeBooking.status === 'Pending' ? '#FEF3C7' : '#D1FAE5' }}>
                        <Ionicons name={activeBooking.status === 'Pending' ? 'time' : 'checkmark-circle'} size={20} color={activeBooking.status === 'Pending' ? '#D97706' : '#059669'} />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: activeBooking.status === 'Pending' ? '#D97706' : '#059669' }}>
                                Appointment {activeBooking.status}
                            </Text>
                            <Text style={{ fontSize: 10, color: activeBooking.status === 'Pending' ? '#B45309' : '#065F46' }}>
                                Requested for {activeBooking.date} at {activeBooking.time}
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 20), paddingTop: 16, borderTopWidth: 1, borderColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(family)/chat/[id]', params: { id: palData.id } })}
                    style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#111827" />
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={(!selectedTimeSlot && activeTab === 'Availability') || !!activeBooking}
                    onPress={handleBooking}
                    style={{
                        flex: 1,
                        height: 56,
                        backgroundColor: (activeTab === 'Availability' && !selectedTimeSlot) || !!activeBooking ? '#F3F4F6' : '#F97316',
                        borderRadius: 20,
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: (activeTab === 'Availability' && !selectedTimeSlot) || !!activeBooking ? 'transparent' : '#F97316',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.2,
                        shadowRadius: 20,
                        elevation: 5
                    }}
                >
                    <Text style={{ color: (activeTab === 'Availability' && !selectedTimeSlot) || !!activeBooking ? '#9CA3AF' : 'white', fontWeight: '900', fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {activeBooking ? activeBooking.status : 'Book Appointment'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({});
