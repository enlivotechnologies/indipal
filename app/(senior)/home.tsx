import { useAuthStore } from '@/store/authStore';
import { useErrandStore } from '@/store/errandStore';
import { useHealthStore } from '@/store/healthStore';
import { useNotificationStore } from '@/store/notificationStore';
import { usePharmacyStore } from '@/store/pharmacyStore';
import { useServiceStore } from '@/store/serviceStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



// Premium Palette for Seniors
const BRAND_PURPLE = '#6E5BFF';

function ServiceCard({ icon, label, subtitle, color, onPress, delay }: any) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(800)} className="w-[48%] mb-5">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        className="h-44 rounded-[32px] overflow-hidden bg-white"
        style={{
          borderWidth: 2,
          borderColor: color + '20',
          shadowColor: color,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 3
        }}
      >
        <View className="p-7 justify-between flex-1">
          <View className="flex-row items-center justify-between">
            <View
              style={{ backgroundColor: `${color}10` }}
              className="w-14 h-14 rounded-[22px] items-center justify-center border border-gray-50"
            >
              <Ionicons name={icon as any} size={28} color={color} />
            </View>
            <Ionicons name="arrow-forward" size={16} color={color} style={{ opacity: 0.3 }} />
          </View>

          <View>
            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-1">{subtitle}</Text>
            <Text className="text-gray-900 font-black text-2xl leading-none">{label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CircleMember({ name, relation, status, image, icon, isService, phone, delay, onPress }: any) {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(600)}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="flex-row items-center bg-white p-4 rounded-[32px] border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}
      >
        <View className="relative">
          <View className="w-12 h-12 rounded-full overflow-hidden bg-indigo-50 items-center justify-center">
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" />
            ) : (
              <Ionicons name={icon as any || 'person'} size={24} color={BRAND_PURPLE} />
            )}
          </View>
          <View className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-emerald-500" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-gray-900 font-bold text-base">{name}</Text>
          <Text className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">{relation}</Text>
        </View>
        <View className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center">
          <Ionicons name={phone ? "call" : "chevron-forward"} size={18} color={BRAND_PURPLE} />
        </View>
      </TouchableOpacity>
    </Animated.View>
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

export default function SeniorHomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const user = useAuthStore((state) => state.user);
  const { medications, toggleMedicationTaken } = useHealthStore();
  const { fetchNotifications, unreadCount, notifications: storeNotifications } = useNotificationStore();
  const { errands } = useErrandStore();
  const orders = useServiceStore((state) => state.orders);
  const { orders: pharmacyOrders } = usePharmacyStore();

  useEffect(() => {
    fetchNotifications('senior');
  }, [fetchNotifications]);

  const activeErrand = errands.find(e => e.status === 'in-progress');
  const activePharmacyOrder = pharmacyOrders.find(o => ['sent_to_family', 'processing', 'accepted'].includes(o.status));
  const unreadNotifications = unreadCount || storeNotifications.filter(n => !n.isRead).length;

  const activeMeds = medications.filter(m => m.status === 'active');
  const takenCount = activeMeds.filter(m => m.takenToday).length;
  const totalDoses = activeMeds.length;
  const upcomingMed = activeMeds.find(m => !m.takenToday);

  const activeTab = (pathname || '').includes('home') ? 'Home' :
    (pathname || '').includes('services') ? 'Services' :
      (pathname || '').includes('health') ? 'Health' :
        (pathname || '').includes('video') ? 'Video' : 'Home';

  const handleTabPress = (tab: string) => {
    if (tab === activeTab) return; // Prevention
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tab === 'Home') router.replace('/(senior)/home');
    if (tab === 'Services') router.replace('/(senior)/services');
    if (tab === 'Health') router.replace('/(senior)/health');
    if (tab === 'Video') router.replace('/(senior)/video');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header - Aligned with Family Excellence */}
      <View
        style={{
          paddingTop: Math.max(insets.top, 16),
          paddingBottom: 16,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 24,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6'
        }}
      >
        <View>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">EnlivoCare</Text>
          <Text className="text-2xl font-black text-gray-900">Health Hub</Text>
        </View>
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity
            onPress={() => router.push('/(senior)/notifications' as any)}
            className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
          >
            <Ionicons name="notifications-outline" size={20} color={BRAND_PURPLE} />
            {unreadNotifications > 0 && (
              <View className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-yellow-400 rounded-full border border-white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(senior)/profile' as any)}
            className="w-10 h-10 bg-indigo-100 rounded-[24px] items-center justify-center overflow-hidden border border-indigo-200"
          >
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={20} color={BRAND_PURPLE} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 120
        }}
      >
        <View className="mt-4">
          <Text className="text-gray-500 font-bold uppercase text-xs tracking-widest">{getGreeting()}, {user?.name || 'Vivek'}</Text>
        </View>

        {/* 1. Medication Hero Card - Simple & Premium */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)} className="mb-10 mt-5">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(senior)/medications' as any)}
            className="rounded-[40px] overflow-hidden bg-[#F1F5F9]"
            style={{
              borderWidth: 2,
              borderColor: '#E2E8F0',
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 5
            }}
          >
            <LinearGradient
              colors={['#4F46E5', '#3730A3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-8 pb-10"
            >
              <View className="flex-row justify-between items-start mb-8">
                <View className="flex-row items-center flex-1">
                  <View className="w-20 h-20 bg-white/20 rounded-[28px] items-center justify-center border border-white/30">
                    <Text className="text-white text-3xl font-black">{takenCount}/{totalDoses}</Text>
                  </View>
                  <View className="ml-6 flex-1">
                    <Text className="text-white/60 text-[10px] font-black uppercase tracking-[3px] mb-1">
                      {upcomingMed ? 'Upcoming Dose' : 'Day Complete'}
                    </Text>
                    <Text className="text-white text-3xl font-black">
                      {upcomingMed ? upcomingMed.name : 'Well Done!'}
                    </Text>
                    {upcomingMed && (
                      <View className="flex-row items-center mt-3 bg-black/10 py-2.5 px-4 rounded-xl self-start">
                        <Ionicons name="time" size={16} color="white" />
                        <Text className="text-white font-bold text-sm ml-2">Due at {upcomingMed.time}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View className="flex-row gap-x-4">
                <TouchableOpacity
                  onPress={() => router.push('/(senior)/medications' as any)}
                  className="flex-1 py-5 rounded-2xl items-center bg-white/10 border border-white/20"
                >
                  <Text className="text-white font-black text-xs uppercase tracking-widest">Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (upcomingMed) {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      toggleMedicationTaken(upcomingMed.id);
                    }
                  }}
                  className={`flex-1 py-5 rounded-2xl items-center shadow-lg ${upcomingMed ? 'bg-white' : 'bg-white/10'}`}
                >
                  <Text className={`font-black text-xs uppercase tracking-widest ${upcomingMed ? 'text-indigo-600' : 'text-white/40'}`}>
                    Mark Taken
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Smart Pulse - Simple & Cool */}
        <Animated.View entering={FadeInUp.delay(150).duration(600)} className="mb-10">
          <TouchableOpacity
            onPress={() => router.push('/(senior)/notifications' as any)}
            activeOpacity={0.9}
            className="bg-white p-6 rounded-[32px] flex-row items-center"
            style={{
              borderWidth: 2,
              borderColor: '#EEF2FF',
              shadowColor: '#6366F1',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 3
            }}
          >
            <View
              className="w-16 h-16 bg-indigo-50 rounded-[24px] items-center justify-center border"
              style={{ borderColor: '#E0E7FF' }}
            >
              <View
                className="w-12 h-12 bg-indigo-500 rounded-2xl items-center justify-center"
                style={{
                  shadowColor: '#6366F1',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <Ionicons name="sparkles" size={24} color="white" />
              </View>
            </View>

            <View className="ml-5 flex-1 pr-4">
              <Text className="text-indigo-400 text-[10px] font-black uppercase tracking-[3px] mb-1">Smart Pulse</Text>
              <Text className="text-gray-900 font-bold text-base leading-tight" numberOfLines={2}>
                {activePharmacyOrder
                  ? `Pharmacy: Order ${activePharmacyOrder.status.replace(/_/g, ' ')}...`
                  : storeNotifications.length > 0
                    ? storeNotifications[0].message
                    : "All systems normal. You are well cared for today."}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions - Simple & Elegant Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <ServiceCard
            icon="heart"
            label="Health"
            subtitle="Vital Trends"
            color="#A855F7"
            onPress={() => router.push('/(senior)/health')}
            delay={200}
          />
          <ServiceCard
            icon="medical"
            label="Meds"
            subtitle="Daily Dose"
            color="#A855F7"
            onPress={() => router.push('/(senior)/medications' as any)}
            delay={300}
          />
          <ServiceCard
            icon="cart"
            label="Grocery"
            subtitle="Request Items"
            color="#A855F7"
            onPress={() => router.push('/(senior)/services/grocery')}
            delay={400}
          />
          <ServiceCard
            icon="bandage"
            label="Pharmacy"
            subtitle="Order Meds"
            color="#A855F7"
            onPress={() => router.push('/(senior)/services/pharmacy' as any)}
            delay={500}
          />
          <ServiceCard
            icon="person-add"
            label="Nurse"
            subtitle="Home Care"
            color="#A855F7"
            onPress={() => router.push('/(senior)/services/nurse' as any)}
            delay={600}
          />
          <ServiceCard
            icon="home"
            label="Help"
            subtitle="House Aid"
            color="#A855F7"
            onPress={() => router.push('/(senior)/services/house-help' as any)}
            delay={700}
          />
        </View>

        {/* Today's Assistance Tracker */}
        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Today&apos;s Assistance</Text>
        <Animated.View entering={FadeInUp.delay(550).duration(600)} className="mb-10">
          <TouchableOpacity
            onPress={() => router.push('/(senior)/tasks')}
            activeOpacity={0.9}
            className="bg-gray-50 rounded-[32px] p-8 flex-row items-center"
            style={{
              borderWidth: 2,
              borderColor: '#EEF2FF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2
            }}
          >
            <View
              className="w-16 h-16 bg-white rounded-2xl items-center justify-center border"
              style={{ borderColor: '#F1F5F9' }}
            >
              <Ionicons name="flash" size={32} color="#6366F1" />
            </View>
            <View className="ml-6 flex-1">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-gray-900 font-black text-xl">Task Tracker</Text>
                <Text className="text-indigo-600 text-[10px] font-black uppercase">
                  {errands.filter(e => e.status === 'completed').length}/{errands.length} Done
                </Text>
              </View>
              <Text className="text-gray-500 text-sm">
                {activeErrand ? `${activeErrand.title}` : 'No active tasks at the moment'}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Emergency SOS - Serious & High-End */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)} className="mb-12">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              router.push('/(senior)/sos' as any);
            }}
            className="rounded-[32px] overflow-hidden shadow-2xl shadow-red-100"
          >
            <LinearGradient
              colors={['#DC2626', '#991B1B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="px-8 py-10 flex-row items-center"
            >
              <View className="w-20 h-20 bg-white/20 rounded-[28px] items-center justify-center border border-white/30">
                <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center shadow-xl">
                  <Ionicons name="alert-circle" size={40} color="#DC2626" />
                </View>
              </View>
              <View className="ml-8 flex-1">
                <Text className="text-white font-black text-4xl tracking-tighter italic">SOS</Text>
                <Text className="text-white/70 text-xs font-black uppercase tracking-[5px]">Help Now</Text>
              </View>
              <View className="w-14 h-14 bg-black/10 rounded-2xl items-center justify-center border border-white/10">
                <Ionicons name="chevron-forward" size={28} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Care Circle & Booked Services - Real-time Sync with Family/Pals */}
        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">My Care Circle</Text>
        <Animated.View entering={FadeInUp.delay(700).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
          <View
            className="bg-white p-6 rounded-[32px] border-2 border-indigo-50 shadow-sm"
            style={{
              shadowColor: '#4F46E5',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
            }}
          >
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-indigo-900 font-black text-lg">Support Ready</Text>
              <View className="bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <Text className="text-emerald-600 text-[10px] font-black uppercase">Live Connect</Text>
              </View>
            </View>

            <View className="gap-y-4">
              {/* Primary Family */}
              <CircleMember
                name="Vivek (Family)"
                relation="Son"
                status="active"
                image="https://i.pravatar.cc/100?u=vivek"
                phone="+91 98765 43210"
                delay={800}
                onPress={() => router.push({
                  pathname: '/(senior)/member-detail',
                  params: {
                    name: 'Vivek (Family)',
                    relation: 'Son',
                    image: 'https://i.pravatar.cc/100?u=vivek',
                    phone: '+91 98765 43210',
                    bio: 'Vivek is your son and primary family contact. He manages your care schedule and services through Enlivo.',
                    specialization: 'Family Coordination,Emergency Contact'
                  }
                } as any)}
              />

              {/* Booked Care Services (Nurses, House Helps, etc.) */}
              {orders && orders.filter(o => o.status !== 'Completed').length > 0 ? (
                orders.filter(o => o.status !== 'Completed').map((order, idx) => (
                  <CircleMember
                    key={order.id}
                    name={order.serviceTitle}
                    relation={order.details?.type || 'Professional'}
                    status="active"
                    icon={order.serviceIcon}
                    isService
                    delay={900 + (idx * 100)}
                    onPress={() => router.push({
                      pathname: '/(senior)/member-detail',
                      params: {
                        name: order.serviceTitle,
                        relation: order.details?.type || 'Care Professional',
                        icon: order.serviceIcon,
                        phone: '+91 98765 43210',
                        bio: `Assigned professional for your ${order.serviceTitle} requirements. Certified and verified by EnlivoCare.`,
                        specialization: `${order.serviceTitle},Senior Support`
                      }
                    } as any)}
                  />
                ))
              ) : (
                /* Always show default Pal when no ACTIVE professional services */
                <CircleMember
                  name="Arjun Singh"
                  relation="Care Pal"
                  status="active"
                  image="https://i.pravatar.cc/100?u=arjun"
                  phone="+91 99999 88888"
                  delay={900}
                  onPress={() => router.push({
                    pathname: '/(senior)/member-detail',
                    params: {
                      name: 'Arjun Singh',
                      relation: 'Care Pal',
                      image: 'https://i.pravatar.cc/100?u=arjun',
                      phone: '+91 99999 88888',
                      bio: 'Arjun is your dedicated Care Pal. He is experts in manual assistance, grocery management, and companionship.',
                      specialization: 'Companionship,Daily Errands,Assistance'
                    }
                  } as any)}
                />
              )}
            </View>
          </View>
        </Animated.View>

        <View className="h-20" />
      </ScrollView>

      {/* Custom Floating Bottom Bar - Aligned with Family but Purple Accent */}
      <Animated.View
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
    </View >
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBar: {
    // Standard styles only
  },
  premiumProgressContainer: {
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 32,
  },
});
