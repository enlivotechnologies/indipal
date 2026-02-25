import { useAuthStore } from "@/store/authStore";
import { useBookingStore } from "@/store/bookingStore";
import { useGigStore } from "@/store/gigStore";
import { useHealthStore } from "@/store/healthStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PalHome() {
    const user = useAuthStore((state) => state.user);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const healthRecords = useHealthStore((state) => state.records);
    const { bookings, updateBookingStatus } = useBookingStore();
    const { gigs, assignPal } = useGigStore();

    const activeGig = gigs.find(g => ['approved_and_assigned', 'matched', 'active'].includes(g.status));
    const availableGigs = gigs.filter(g => g.status === 'approved_and_assigned');

    // Filter bookings for this Pal (simulated, usually would check palId)
    const pendingAppointments = bookings.filter(b => b.status === 'Pending');

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: Math.max(insets.top, 20),
                    paddingBottom: insets.bottom + 40,
                    paddingHorizontal: 24
                }}
            >
                {/* Header - Emerald Theme for Caretakers */}
                <View className="flex-row justify-between items-center mb-10">
                    <View className="flex-1 mr-4">
                        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Job Dashboard</Text>
                        <Text className="text-3xl font-black text-gray-900" numberOfLines={1}>Hello {user?.name?.split(' ')[0] || 'Pal'}! ✨</Text>
                    </View>
                    <TouchableOpacity className="w-14 h-14 bg-emerald-100 rounded-[22px] items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        <Ionicons name="notifications" size={24} color="#059669" />
                        {pendingAppointments.length > 0 && (
                            <View className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Earning Overview */}
                <Animated.View entering={FadeInDown.delay(100)}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-8 rounded-[40px] shadow-xl shadow-emerald-200 mb-10"
                    >
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="stats-chart" size={16} color="rgba(255,255,255,0.7)" />
                            <Text className="text-white/70 text-xs font-bold uppercase tracking-widest ml-2">Total Earnings This Week</Text>
                        </View>
                        <View className="flex-row justify-between items-end">
                            <Text className="text-white text-4xl font-black">₹ 8,400</Text>
                            <View className="bg-white/20 px-3 py-1 rounded-full">
                                <Text className="text-white text-[10px] font-bold">12 Gigs Completed</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Quality Service Requests - Dynamic Queue */}
                <Animated.View entering={FadeInDown.delay(100)} className="mb-10">
                    <Text className="text-xs font-bold text-orange-600 uppercase tracking-[3px] mb-4 ml-1">Opportunity Queue 🔥</Text>

                    {/* Dynamic Appointment Requests */}
                    {pendingAppointments.map((booking) => (
                        <Animated.View key={booking.id} entering={FadeInDown} className="bg-orange-50 border-2 border-orange-200 rounded-[40px] p-6 mb-4 relative">
                            <View className="flex-row items-center mb-4">
                                <View className="w-12 h-12 bg-orange-500 rounded-2xl items-center justify-center shadow-sm">
                                    <Ionicons name="calendar" size={24} color="white" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="font-black text-gray-900">Care Appointment</Text>
                                    <Text className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">New Request • ₹{booking.price}/hr</Text>
                                </View>
                            </View>
                            <Text className="text-gray-500 text-xs font-bold leading-5 mb-4">
                                Appointment requested by <Text className="text-gray-900">{booking.userName}</Text> for <Text className="text-gray-900">{booking.date} at {booking.time}</Text>.
                            </Text>
                            <View className="flex-row gap-x-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                        updateBookingStatus(booking.id, 'Accepted');
                                    }}
                                    className="flex-1 bg-emerald-600 py-4 rounded-2xl items-center"
                                >
                                    <Text className="text-white font-black text-xs uppercase tracking-widest">Accept</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                        updateBookingStatus(booking.id, 'Declined');
                                    }}
                                    className="flex-1 bg-gray-200 py-4 rounded-2xl items-center"
                                >
                                    <Text className="text-gray-500 font-black text-xs uppercase tracking-widest">Decline</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}

                    {/* Grocery Task (Restored) */}
                    <View className="bg-emerald-50 border-2 border-emerald-200 rounded-[40px] p-6 mb-4 relative">
                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 bg-emerald-500 rounded-2xl items-center justify-center shadow-sm">
                                <Ionicons name="cart" size={24} color="white" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="font-black text-gray-900">Grocery Fulfillment</Text>
                                <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Fresh Pack • Accepted</Text>
                            </View>
                        </View>
                        <Text className="text-gray-500 text-xs font-bold leading-5 mb-4">
                            Pick up essential weekly pack for <Text className="text-gray-900">Ramesh Chandra</Text>. Delivery due by 05:00 PM.
                        </Text>
                        <TouchableOpacity className="bg-emerald-600 py-4 rounded-2xl items-center">
                            <Text className="text-white font-black text-xs uppercase tracking-widest">Start Delivery</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Medical Coordination Task */}
                    <View className="bg-indigo-50 border-2 border-indigo-200 rounded-[40px] p-6 mb-4 relative">
                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 bg-indigo-500 rounded-2xl items-center justify-center shadow-sm">
                                <Ionicons name="medical" size={24} color="white" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="font-black text-gray-900">Nurse Coordination</Text>
                                <Text className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Medical Escrow Confirmed</Text>
                            </View>
                        </View>
                        <Text className="text-gray-500 text-xs font-bold leading-5 mb-4">
                            Coordinate medical intake for <Text className="text-gray-900">Ramesh Chandra</Text>. Post-Op Nurse arriving at 4PM.
                        </Text>
                        <TouchableOpacity className="bg-indigo-600 py-4 rounded-2xl items-center">
                            <Text className="text-white font-black text-xs uppercase tracking-widest">Accept Task</Text>
                        </TouchableOpacity>
                    </View>

                    {/* House Help Supervision Task */}
                    <View className="bg-amber-50 border-2 border-amber-200 rounded-[40px] p-6 relative">
                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 bg-amber-500 rounded-2xl items-center justify-center shadow-sm">
                                <Ionicons name="sparkles" size={24} color="white" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="font-black text-gray-900">Cleaning Supervision</Text>
                                <Text className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Family Secure Checkout</Text>
                            </View>
                        </View>
                        <Text className="text-gray-500 text-xs font-bold leading-5 mb-4">
                            Supervise deep cleaning for <Text className="text-gray-900">Mrs. Kapoor</Text>. Professional vetted & assigned.
                        </Text>
                        <TouchableOpacity className="bg-amber-600 py-4 rounded-2xl items-center">
                            <Text className="text-white font-black text-xs uppercase tracking-widest">Secure Match</Text>
                        </TouchableOpacity>
                    </View>

                    {/* New Grocery Gigs from Family Approval */}
                    {availableGigs.map((gig) => (
                        <Animated.View key={gig.id} entering={FadeInDown} className="mt-4 bg-orange-50 border-2 border-orange-200 rounded-[40px] p-6 relative">
                            <View className="flex-row items-center mb-4">
                                <View className="w-12 h-12 bg-orange-500 rounded-2xl items-center justify-center shadow-sm">
                                    <Ionicons name="cart" size={24} color="white" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="font-black text-gray-900">{gig.category} Pickup</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Verified • ₹250 Est.</Text>
                                    </View>
                                </View>
                            </View>
                            <Text className="text-gray-500 text-xs font-bold mb-4">
                                {gig.seniorName} needs {gig.items.length} items. Budget: ₹{gig.budget}.
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    assignPal(gig.id, user?.phone || 'pal_1', user?.name || 'Arjun');
                                }}
                                className="bg-orange-500 py-4 rounded-2xl items-center"
                            >
                                <Text className="text-white font-black text-xs uppercase tracking-widest">Claim this Gig</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </Animated.View>

                {/* Assigned Gig Detail */}
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">Current Active Gig</Text>
                {activeGig ? (
                    <Animated.View entering={FadeInDown.delay(200)} className="bg-white border-2 border-emerald-500/20 rounded-[40px] p-8 shadow-sm mb-10">
                        <View className="flex-row items-center mb-6">
                            <View className="relative">
                                <View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center overflow-hidden">
                                    <Ionicons name="person" size={32} color="#D1D5DB" />
                                </View>
                                <View className="absolute -top-2 -right-2 bg-emerald-500 px-2 py-1 rounded-lg">
                                    <Text className="text-[8px] font-bold text-white">LIVE</Text>
                                </View>
                            </View>
                            <View className="ml-5 flex-1">
                                <Text className="font-black text-xl text-gray-900" numberOfLines={1}>{activeGig.seniorName}</Text>
                                <Text className="text-xs font-bold text-emerald-600">Senior Link Verified</Text>
                            </View>
                        </View>

                        <View className="bg-gray-50 rounded-2xl p-4 gap-y-4">
                            <GigStep icon="list" label={`${activeGig.category}: ${activeGig.items.length} items`} />
                            <GigStep icon="shield-checkmark" label="Payment Verified" />
                            <GigStep icon="time" label="Active Now" />
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                router.push('/(pal)/active-gig');
                            }}
                            className="bg-emerald-600 mt-8 py-5 rounded-3xl items-center shadow-lg shadow-emerald-100 flex-row justify-center"
                        >
                            <Ionicons name="clipboard" size={20} color="white" />
                            <Text className="text-white font-bold ml-2 text-lg">View Checklist</Text>
                        </TouchableOpacity>
                    </Animated.View>
                ) : (
                    <View className="bg-gray-50 rounded-[40px] p-8 items-center justify-center border border-gray-100 mb-10">
                        <Ionicons name="cafe-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold mt-4 text-center">No active jobs. Take a break or check the queue!</Text>
                    </View>
                )}

                {/* Senior Health Insight for Pals */}
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">Senior Well-being</Text>
                <Animated.View entering={FadeInDown.delay(250)} className="flex-row flex-wrap gap-4 mb-10">
                    <HealthStatusCard
                        icon="happy"
                        label="Mood"
                        value={healthRecords.mood?.type || 'Not Logged'}
                        color="#A855F7"
                        delay={0}
                    />
                    <HealthStatusCard
                        icon="heart"
                        label="BP"
                        value={healthRecords.bloodPressure ? `${healthRecords.bloodPressure.systolic}/${healthRecords.bloodPressure.diastolic}` : '--/--'}
                        color="#EF4444"
                        delay={100}
                    />
                </Animated.View>

                {/* Status Hub */}
                <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">Pal Status Hub</Text>
                <View className="flex-row gap-x-4">
                    <StatusTile icon="map" label="Coverage" value="10 KM" />
                    <StatusTile icon="star" label="Rating" value="4.9" />
                    <StatusTile icon="flash" label="Radius" value="Active" />
                </View>
            </ScrollView>
        </View>
    );
}

function HealthStatusCard({ icon, label, value, color, delay }: { icon: any; label: string; value: string; color: string; delay: number }) {
    return (
        <Animated.View
            entering={FadeInDown.delay(delay)}
            className="bg-gray-50 p-5 rounded-[32px] border border-gray-100 flex-1 min-w-[140px]"
        >
            <View className="flex-row items-center mb-3">
                <View style={{ backgroundColor: `${color}15` }} className="w-8 h-8 rounded-xl items-center justify-center">
                    <Ionicons name={icon} size={16} color={color} />
                </View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">{label}</Text>
            </View>
            <Text className="text-xl font-black text-gray-900">{value}</Text>
        </Animated.View>
    );
}

function GigStep({ icon, label }: { icon: any; label: string }) {

    return (
        <View className="flex-row items-center">
            <Ionicons name={icon} size={16} color="#059669" />
            <Text className="ml-3 text-xs font-semibold text-gray-600 flex-1" numberOfLines={1}>{label}</Text>
        </View>
    );
}

function StatusTile({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <View className="flex-1 bg-gray-50 p-5 rounded-[32px] border border-gray-100 items-center">
            <Ionicons name={icon} size={20} color="#059669" className="opacity-70" />
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-2">{label}</Text>
            <Text className="text-base font-black text-gray-800 mt-0.5">{value}</Text>
        </View>
    );
}
