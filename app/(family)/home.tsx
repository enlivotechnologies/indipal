import { useAuthStore } from '@/store/authStore';
import { useHealthStore } from '@/store/healthStore';
import { useServiceStore } from '@/store/serviceStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { Dimensions, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInUp, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function FamilyHomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const healthRecords = useHealthStore((state) => state.records);
  const orders = useServiceStore((state) => state.orders);

  const pendingOrder = orders.filter(o => o.status === 'Pending').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

  const activeTab = pathname.includes('home') ? 'Home' :
    pathname.includes('care') ? 'Care' :
      pathname.includes('tracking') ? 'Track' :
        pathname.includes('chat') ? 'Connect' : 'Home';

  // Simulated Handshake Data
  const linkedSenior = user?.parentsDetails?.[0] || {
    name: 'Ramesh Chandra',
    phone: '+91 98765 43210',
    address: 'Sector 4, HSR Layout, Bengaluru',
    hasSmartphone: false
  };

  const nearbyPals = [
    { id: '1', name: 'Arjun Singh', rating: 4.9, experience: '5 yrs', image: 'https://i.pravatar.cc/150?u=arjun', verified: true },
    { id: '2', name: 'Priya Verma', rating: 4.8, experience: '3 yrs', image: 'https://i.pravatar.cc/150?u=priya', verified: true },
    { id: '3', name: 'Rahul K', rating: 4.7, experience: '4 yrs', image: 'https://i.pravatar.cc/150?u=rahul', verified: false },
  ];

  const services = [
    { id: '1', title: 'Home Nurse', subtitle: 'Professional Care', icon: 'person-add', color: '#10B981', image: 'https://images.unsplash.com/photo-1582750433449-64c3efdf1e6d?auto=format&fit=crop&q=80&w=400', route: '/(family)/services/nurse' },
    { id: '2', title: 'House Help', subtitle: 'Daily Chores', icon: 'home', color: '#F59E0B', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', route: '/(family)/services/house-help' },
    { id: '3', title: 'Grocery Delivery', subtitle: 'Fresh Essentials', icon: 'cart', color: '#06B6D4', image: 'https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=400', route: '/(family)/services/grocery' },
    { id: '4', title: 'Pharmacy Order', subtitle: 'Meds at Doorstep', icon: 'bandage', color: '#6366F1', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400', route: '/(family)/services/pharmacy' },
  ];

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tab === 'Home') router.replace('/(family)/home' as any);
    if (tab === 'Care') router.replace('/(family)/care' as any);
    if (tab === 'Track') router.replace('/(family)/tracking' as any);
    if (tab === 'Connect') router.replace('/(family)/chat' as any);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header - PERSISTENT & RESPONSIVE */}
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
        ]}
        className="px-6 flex-row justify-between items-center bg-white"
      >
        <View>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">EnlivoCare</Text>
          <Text className="text-2xl font-black text-gray-900">Control Tower</Text>
        </View>
        <View className="flex-row items-center gap-x-2">
          <TouchableOpacity
            onPress={() => router.push('/(family)/account/notifications' as any)}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
          >
            <Ionicons name="notifications-outline" size={20} color="#1F2937" />
            {(pendingOrder || orders.length > 0) && (
              <View className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-orange-500 rounded-full border border-white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(family)/profiles' as any)}
            className="w-10 h-10 bg-orange-100 rounded-[24px] items-center justify-center overflow-hidden border border-orange-200"
          >
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={20} color="#F59E0B" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100
        }}
      >
        <View className="mt-4">
          <Text className="text-xs font-bold text-gray-400 uppercase">{getGreeting()}, {user?.name || 'Member'}</Text>
        </View>

        {/* 1. Real-time Senior Linkage Card */}
        <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.out(Easing.quad))} className="mb-8 mt-5">
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 w-full rounded-[48px] shadow-xl shadow-orange-200"
          >
            <View className="flex-row justify-between items-start mb-6">
              <View className="flex-row items-center flex-1">
                <View className="w-16 h-16 bg-white/20 rounded-[32px] items-center justify-center border border-white/30 overflow-hidden">
                  <Ionicons name="person" size={32} color="white" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Primary Senior</Text>
                  <Text className="text-white text-xl font-bold" numberOfLines={1}>{linkedSenior.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <View className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                    <Text className="text-white/90 text-xs font-medium">Currently at Home</Text>
                  </View>
                </View>
              </View>
              <View className={`w-10 h-10 rounded-2xl items-center justify-center ${linkedSenior.hasSmartphone ? 'bg-white/20' : 'bg-orange-800/40'}`}>
                <Ionicons name={linkedSenior.hasSmartphone ? "phone-portrait-outline" : "keypad-outline"} size={20} color="white" />
              </View>
            </View>

            <View className="bg-black/10 p-5 rounded-full flex-row items-center">
              <Ionicons name="location" size={20} color="white" />
              <Text className="text-white font-bold text-sm ml-4 flex-1" numberOfLines={1}>{linkedSenior.address}</Text>
            </View>

            {!linkedSenior.hasSmartphone && (
              <View className="mt-4 flex-row items-center">
                <Ionicons name="chatbubble-ellipses-outline" size={14} color="white" className="opacity-80" />
                <Text className="text-white/80 text-[10px] ml-2 italic">Non-App User: Linked via VIP SMS/IVR fallback.</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Priority Alerts - Real-time Senior Actions */}
        <Animated.View entering={FadeInUp.delay(150).duration(600).easing(Easing.out(Easing.quad))} className="mb-8">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Priority Alerts</Text>
            <TouchableOpacity onPress={() => router.push('/(family)/account/notifications')}>
              <Text className="text-orange-600 text-[10px] font-black uppercase">Recent Activity</Text>
            </TouchableOpacity>
          </View>

          {pendingOrder ? (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(family)/account/notifications', params: { filter: 'senior' } } as any)}
              className="bg-white p-6 rounded-[24px] border-2 border-orange-100 shadow-lg flex-row items-center"
            >
              <View style={{ backgroundColor: `${pendingOrder.color}20` }} className="w-12 h-12 rounded-2xl items-center justify-center border border-orange-100">
                <Ionicons name={pendingOrder.serviceIcon as any} size={24} color={pendingOrder.color} />
              </View>
              <View className="flex-1 ml-4 pr-4">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-bold text-sm">New {pendingOrder.serviceTitle} Request</Text>
                  <Text className="text-orange-500 text-[8px] font-black uppercase">Requires Payment</Text>
                </View>
                <Text className="text-gray-500 text-[11px] leading-4" numberOfLines={2}>
                  {pendingOrder.seniorName} has requested {pendingOrder.serviceTitle}. Tap to authorize payment of ₹{pendingOrder.amount}.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
            </TouchableOpacity>
          ) : (
            <View
              className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm flex-row items-center opacity-60"
            >
              <View className="w-12 h-12 bg-gray-50 rounded-2xl border border-gray-100 items-center justify-center">
                <Ionicons name="notifications-off-outline" size={24} color="#9CA3AF" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-gray-400 font-bold text-sm">No new alerts</Text>
                <Text className="text-gray-400 text-[10px]">Everything is running smoothly.</Text>
              </View>
            </View>
          )}
        </Animated.View>

        {/* Errands & Task Tracker (Family <-> Pal) */}
        <Animated.View entering={FadeInUp.delay(200).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
          <TouchableOpacity
            onPress={() => router.push('/(family)/services/errands')}
            activeOpacity={0.9}
            className="bg-gray-900 p-8 rounded-[24px] shadow-2xl shadow-black/20"
          >
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-white font-black text-2xl">Today's Errands</Text>
                <Text className="text-white/50 text-[10px] uppercase font-bold tracking-widest mt-1">Managed by Arjun Singh</Text>
              </View>
              <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                <Text className="text-emerald-400 text-[10px] font-black uppercase">2/3 Done</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-x-3">
              <View className="flex-1 bg-white/5 h-12 rounded-2xl px-4 flex-row items-center">
                <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3" />
                <Text className="text-white/80 text-[10px] font-black uppercase tracking-widest">Active: Grocery Pickup</Text>
              </View>
              <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center">
                <Ionicons name="flash" size={18} color="#3B82F6" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* 2. Active Care Monitoring (Uber-Style) - The "Tracker Bottom Card" */}
        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Live Monitoring</Text>
        <Animated.View entering={FadeInUp.delay(250).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(family)/tracking')}
            className="bg-gray-50 rounded-[28px] overflow-hidden border border-gray-100 shadow-sm"
          >
            {/* Simulated Map View */}
            <View className="h-48 bg-gray-200 items-center justify-center">
              <Ionicons name="navigate-circle-outline" size={120} color="white" className="opacity-30" />
              <View className="absolute inset-0 items-center justify-center">
                <PulseMarker />
              </View>
              {/* ETA Overlay */}
              <View className="absolute top-4 left-4 bg-white/90 px-4 py-2 rounded-2xl shadow-sm flex-row items-center border border-gray-100">
                <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                <Text className="text-xs font-bold text-gray-800">Arjun is 8 mins away</Text>
              </View>
            </View>

            <View className="p-6 flex-row items-center bg-white">
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: 'https://i.pravatar.cc/100?u=arjun' }} className="w-12 h-12 rounded-full" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-900 font-black text-base">Arjun Singh</Text>
                  <View className="flex-row items-center mt-0.5">
                    <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2" />
                    <Text className="text-gray-400 text-[10px] font-bold uppercase">En Route to Care</Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center gap-x-2">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/(family)/chat/[id]', params: { id: '3' } });
                  }}
                  className="bg-white w-10 h-10 rounded-xl items-center justify-center border border-gray-100 shadow-sm"
                >
                  <Ionicons name="chatbubble-outline" size={18} color="#1F2937" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Linking.openURL('tel:+919876543210');
                  }}
                  className="bg-emerald-50 w-10 h-10 rounded-xl items-center justify-center border border-emerald-100"
                >
                  <Ionicons name="call" size={18} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(family)/tracking')}
                  className="bg-orange-50 w-10 h-10 rounded-xl items-center justify-center border border-orange-100"
                >
                  <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Nearby Pals */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Certified Pals Near You</Text>
            <TouchableOpacity><Text className="text-orange-600 text-[10px] font-black uppercase">View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
            {nearbyPals.map((pal, idx) => (
              <Animated.View
                key={pal.id}
                entering={FadeInUp.delay(300 + idx * 100).duration(600).easing(Easing.out(Easing.quad))}
                className="mr-5"
              >
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: '/(family)/profiles/pal',
                    params: { id: pal.id, name: pal.name, image: pal.image }
                  } as any)}
                  className="bg-white border border-gray-200 p-5 rounded-[20px] items-center shadow-sm w-36"
                >
                  <View className="relative mb-3">
                    <Image source={{ uri: pal.image }} className="w-20 h-20 rounded-[28px]" />
                    {pal.verified && (
                      <View className="absolute -right-1 -bottom-1 bg-emerald-500 rounded-full border-2 border-white p-1">
                        <Ionicons name="checkmark" size={10} color="white" />
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-900 font-black text-sm">{pal.name}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={10} color="#F59E0B" />
                    <Text className="text-gray-400 text-[10px] font-black ml-1 uppercase">{pal.rating} • {pal.experience}</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Senior Health Snapshot - Real-time from Senior App */}
        <Animated.View entering={FadeInUp.delay(400).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
          <View className="flex-row items-center justify-between mb-4 px-1">
            <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">Senior Health Status</Text>
            <View className="bg-emerald-100 px-2 py-1 rounded-[24px]">
              <Text className="text-[8px] text-emerald-600 font-bold uppercase">Live Data</Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-4">
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
              unit="mmHg"
              color="#EF4444"
              delay={100}
            />
            <HealthStatusCard
              icon="water"
              label="Sugar"
              value={healthRecords.bloodSugar?.level.toString() || '--'}
              unit="mg/dL"
              color="#3B82F6"
              delay={200}
            />
            <HealthStatusCard
              icon="tint"
              label="Hydration"
              value={`${healthRecords.water?.glasses || 0}/${healthRecords.water?.goal || 8}`}
              unit="Glasses"
              color="#06B6D4"
              delay={300}
            />
          </View>
        </Animated.View>

        {/* Quick Services Grid */}
        <View className="mb-10">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Quick Orchestrations</Text>
          <View className="flex-row flex-wrap justify-between">
            {services.map((service, idx) => (
              <Animated.View
                key={service.id}
                entering={FadeInUp.delay(500 + idx * 50).duration(600).easing(Easing.out(Easing.quad))}
                className={`mb-5 ${idx === 0 || idx === 3 ? 'w-[58%]' : 'w-[38%]'}`}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    if (service.route) router.push(service.route as any);
                  }}
                  className="h-48 rounded-[24px] overflow-hidden shadow-2xl shadow-black/20 relative bg-gray-900"
                >
                  <Image
                    source={{ uri: service.image }}
                    className="absolute inset-0 w-full h-full opacity-60"
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    className="absolute inset-0 p-6 justify-end"
                  >
                    <View
                      style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      className="w-10 h-10 rounded-xl items-center justify-center mb-3 border border-white/20"
                    >
                      <Ionicons name={service.icon as any} size={20} color="white" />
                    </View>
                    <Text className="text-white font-black text-base">{service.title}</Text>
                    <Text className="text-white/50 text-[8px] font-black uppercase tracking-widest">{service.subtitle}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Premium Care Wallet & Billing */}
        <Animated.View entering={FadeInUp.delay(600).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(family)/account/wallet')}
            className="overflow-hidden rounded-[24px]"
          >
            <LinearGradient
              colors={['#1F2937', '#111827']}
              className="p-8"
            >
              {/* Decorative Background Elements */}
              <View className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
              <View className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />

              <View className="flex-row justify-between items-center mb-8">
                <View>
                  <Text className="text-orange-400 text-[10px] font-black uppercase tracking-[3px] mb-1">Care Wallet</Text>
                  <Text className="text-white text-2xl font-black">Escrow Balance</Text>
                </View>
                <View className="w-14 h-14 bg-white/10 rounded-2xl items-center justify-center border border-white/10">
                  <Ionicons name="card-outline" size={28} color="white" />
                </View>
              </View>

              <View className="flex-row items-end justify-between">
                <View>
                  <View className="flex-row items-baseline">
                    <Text className="text-white text-4xl font-black">₹ 5,250</Text>
                    <Text className="text-white/30 text-sm font-bold ml-2">Total</Text>
                  </View>
                  <View className="flex-row items-center mt-2">
                    <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-sm shadow-emerald-500" />
                    <Text className="text-emerald-400/80 text-[10px] font-black uppercase tracking-widest">Auto-Refill Active</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    router.push('/(family)/account/wallet');
                  }}
                  className="bg-white px-6 py-3 rounded-2xl shadow-lg"
                >
                  <Text className="text-gray-900 font-black text-xs uppercase tracking-widest">Add Funds</Text>
                </TouchableOpacity>
              </View>

              {/* Mini Activity Snapshot */}
              <View className="mt-8 flex-row items-center border-t border-white/10 pt-6 mb-4">
                <View className="w-8 h-8 bg-emerald-500/20 rounded-full items-center justify-center mr-3">
                  <Ionicons name="arrow-up" size={14} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-[11px]">Apollo Hospital Escrow</Text>
                  <Text className="text-white/30 text-[9px] uppercase tracking-widest font-black">Just Now • Paid</Text>
                </View>
                <Text className="text-white font-black text-sm">- ₹ 2,100</Text>
              </View>

              {/* Security Badge */}
              <View className="flex-row items-center bg-white/5 p-4 rounded-[20px] border border-white/5">
                <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.4)" />
                <Text className="text-white/40 text-[9px] font-bold ml-3 uppercase tracking-widest">Secured by Enlivo TrustShield</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Custom Floating Bottom Bar */}
      <Animated.View entering={FadeInUp.delay(200).duration(600).easing(Easing.out(Easing.quad))} className="absolute bottom-0 left-0 right-0 px-6 bg-white/10" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <View style={styles.tabBar} className="bg-gray-900/95 flex-row justify-between items-center h-16 rounded-[28px] px-3 shadow-2xl">
          <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
          <TabButton icon="cart" label="Care" active={activeTab === 'Care'} onPress={() => handleTabPress('Care')} />
          <TabButton icon="map" label="Track" active={activeTab === 'Track'} onPress={() => handleTabPress('Track')} />
          <TabButton icon="chatbubbles" label="Connect" active={activeTab === 'Connect'} onPress={() => handleTabPress('Connect')} />
        </View>
      </Animated.View>
    </View>
  );
}

function HealthStatusCard({ icon, label, value, unit, color, delay }: { icon: any; label: string; value: string; unit?: string; color: string; delay: number }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(100 + delay).easing(Easing.inOut(Easing.ease))}
      className="bg-gray-50 p-5 rounded-[32px] border border-gray-100 flex-1 min-w-[140px]"
    >
      <View className="flex-row items-center mb-3">
        <View style={{ backgroundColor: `${color}15` }} className="w-8 h-8 rounded-xl items-center justify-center">
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">{label}</Text>
      </View>
      <View className="flex-row items-baseline">
        <Text className="text-xl font-black text-gray-900">{value}</Text>
        {unit && <Text className="text-[8px] font-bold text-gray-400 ml-1 uppercase">{unit}</Text>}
      </View>
    </Animated.View>
  );
}

function ErrandItem({ title, status }: { title: string; status: 'completed' | 'pending' }) {
  return (
    <View className="flex-row items-center">
      <View className={`w-5 h-5 rounded-full border items-center justify-center ${status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}>
        {status === 'completed' && <Ionicons name="checkmark" size={12} color="white" />}
      </View>
      <Text className={`ml-3 text-xs ${status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>{title}</Text>
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

function PulseMarker() {
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withRepeat(withSequence(withTiming(1.2, { duration: 1000 }), withTiming(0.8, { duration: 1000 })), -1) }],
    opacity: withRepeat(withTiming(0.4, { duration: 1000 }), -1),
  }));

  return (
    <View className="items-center justify-center">
      <Animated.View style={pulseStyle} className="w-12 h-12 bg-blue-400 rounded-full absolute" />
      <View className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white" />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabBar: {
    ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
  }
});
