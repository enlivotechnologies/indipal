import { useAuthStore } from '@/store/authStore';
import { useErrandStore } from '@/store/errandStore';
import { useGigStore } from '@/store/gigStore';
import { Medication, useHealthStore } from '@/store/healthStore';
import { useServiceStore } from '@/store/serviceStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInUp, useAnimatedStyle, withRepeat, withSequence, withTiming, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function FamilyHomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const { records: healthRecords, medications, addMedication, updateMedicationStatus } = useHealthStore();
  const orders = useServiceStore((state) => state.orders);
  const { notifications, sosAlerts, resolveSOS } = useErrandStore();
  const { gigs, approveGig, addGig } = useGigStore();

  const activeSOS = sosAlerts.find(a => a.status === 'active');
  const pendingGrocery = gigs.find(g => g.status === 'pending_approval' && g.category === 'Grocery');

  const pendingOrder = orders.filter(o => o.status === 'Pending').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const [approvalModal, setApprovalModal] = useState(false);
  const [budget, setBudget] = useState('500');

  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [addMedModal, setAddMedModal] = useState(false);
  const [refillModal, setRefillModal] = useState(false);

  // Form State
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFreq, setMedFreq] = useState('Daily');

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
      addedBy: 'family',
      color: '#6366F1',
    });

    setMedName('');
    setMedDosage('');
    setAddMedModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', 'Medicine added to Senior Profile');
  };

  // Simulated Handshake Data
  const linkedSenior = user?.parentsDetails?.[0] || {
    id: 'senior_1',
    name: 'Ramesh Chandra',
    phone: '+91 98765 43210',
    address: 'Sector 4, HSR Layout, Bengaluru',
    hasSmartphone: false
  };

  const handleRefillImmediately = (med: Medication) => {
    addGig({
      seniorId: linkedSenior.id || 'senior_1',
      seniorName: linkedSenior.name,
      familyId: user?.id || 'family_1',
      status: 'pending_approval',
      category: 'Medicine',
      items: [{ id: Math.random().toString(), name: `Refill: ${med.name}`, quantity: '1 Pack', checked: false }],
      type: 'Refill',
      medicationDetails: {
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency
      }
    });

    setRefillModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Errand Created', 'A refill request has been sent to nearby Pals.');
  };

  const pendingMedReview = medications.find(m => m.status === 'pending_review');

  const activeTab = pathname.includes('home') ? 'Home' :
    pathname.includes('care') ? 'Care' :
      pathname.includes('tracking') ? 'Track' :
        pathname.includes('chat') ? 'Connect' : 'Home';

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
      {/* SOS Lively Alert Overlay */}
      {activeSOS && (
        <Animated.View entering={FadeInUp} className="bg-red-600 mt-2 mx-4 rounded-3xl overflow-hidden shadow-2xl shadow-red-200">
          <LinearGradient colors={['#DC2626', '#B91C1C']} className="p-5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center border border-white/30">
                  <Ionicons name="alert-circle" size={28} color="white" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-white font-black text-lg">EMERGENCY SOS</Text>
                  <Text className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{activeSOS.seniorName} Needs help!</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  resolveSOS(activeSOS.id);
                }}
                className="bg-white/20 px-4 py-2 rounded-xl border border-white/30"
              >
                <Text className="text-white font-black text-[10px] uppercase">Got it</Text>
              </TouchableOpacity>
            </View>

            <View className="mt-4 pt-4 border-t border-white/10 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="location" size={14} color="white" />
                <Text className="text-white/90 text-[11px] font-bold ml-1.5">{activeSOS.location}</Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${linkedSenior.phone}`)}
                className="bg-white px-5 py-2.5 rounded-full flex-row items-center"
              >
                <Ionicons name="call" size={14} color="#DC2626" />
                <Text className="text-red-700 font-black text-[10px] uppercase tracking-widest ml-1.5">Emergency Call</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      )}

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
            onPress={() => router.push('/(family)/account/wallet' as any)}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
          >
            <Ionicons name="wallet-outline" size={20} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(family)/account/notifications' as any)}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
          >
            <Ionicons name="notifications-outline" size={20} color="#1F2937" />
            {(pendingOrder || unreadNotifications > 0) && (
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
            style={{ borderRadius: 15, overflow: 'hidden' }}
            className="p-10 w-full shadow-2xl shadow-orange-200"
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

            <View className="bg-black/15 p-6 rounded-[24px] flex-row items-center">
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

          {activeSOS ? null : pendingMedReview ? (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  'Review Medicine',
                  `${linkedSenior.name} added ${pendingMedReview.name} (${pendingMedReview.dosage}). Confirm addition?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Confirm', onPress: () => updateMedicationStatus(pendingMedReview.id, 'active') }
                  ]
                );
              }}
              className="bg-amber-50 p-6 rounded-[24px] border-2 border-amber-400 shadow-xl shadow-amber-100 flex-row items-center mb-4"
            >
              <View className="w-12 h-12 rounded-2xl items-center justify-center bg-amber-100 border border-amber-200">
                <Ionicons name="medical" size={24} color="#D97706" />
              </View>
              <View className="flex-1 ml-4 pr-4">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-amber-900 font-bold text-sm">Medicine Review</Text>
                  <View className="bg-amber-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-[8px] font-black uppercase tracking-widest font-nunito">Verify Now</Text>
                  </View>
                </View>
                <Text className="text-amber-800 text-[11px] leading-4" numberOfLines={2}>
                  Review the prescription for {pendingMedReview.name} before it&apos;s added to schedule.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D97706" />
            </TouchableOpacity>
          ) : null}

          {pendingGrocery ? (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setApprovalModal(true);
              }}
              className="bg-white p-6 rounded-[24px] border-2 border-orange-400 shadow-xl shadow-orange-100 flex-row items-center"
            >
              <View className="w-12 h-12 rounded-2xl items-center justify-center bg-orange-100 border border-orange-200">
                <Ionicons name="cart" size={24} color="#F59E0B" />
              </View>
              <View className="flex-1 ml-4 pr-4">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-gray-900 font-bold text-sm">Grocery Request</Text>
                  <View className="bg-orange-500 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-[8px] font-black uppercase">Review Now</Text>
                  </View>
                </View>
                <Text className="text-gray-500 text-[11px] leading-4" numberOfLines={2}>
                  {pendingGrocery.seniorName} has requested {pendingGrocery.items.length} items. Tap to approve and assign a Pal.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#F59E0B" />
            </TouchableOpacity>
          ) : pendingOrder ? (
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
            className="h-44 rounded-[24px] overflow-hidden shadow-2xl shadow-black/20 relative bg-gray-900"
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=400' }}
              className="absolute inset-0 w-full h-full opacity-40"
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              className="absolute inset-0 p-8 justify-end"
            >
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="text-white font-black text-2xl">Today&apos;s Errands</Text>
                  <Text className="text-white/50 text-[10px] uppercase font-bold tracking-widest mt-1">Managed by Arjun Singh</Text>
                </View>
                <View className="bg-emerald-500/20 px-3 py-1.5 rounded-full border border-emerald-500/30">
                  <Text className="text-emerald-400 text-[10px] font-black uppercase">2/3 Done</Text>
                </View>
              </View>

              <View className="flex-row items-center gap-x-3">
                <View className="flex-1 bg-white/10 h-10 rounded-xl px-4 flex-row items-center">
                  <View className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3" />
                  <Text className="text-white/80 text-[10px] font-black uppercase tracking-widest">Active: Grocery Pickup</Text>
                </View>
                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                  <Ionicons name="flash" size={16} color="#3B82F6" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* 2. Active Care Monitoring (Uber-Style) - The "Tracker Bottom Card" */}
        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Live Monitoring</Text>
        <Animated.View entering={FadeInUp.delay(250).duration(600).easing(Easing.out(Easing.quad))} className="mb-10">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/(family)/tracking')}
            className="bg-gray-50 rounded-[15px] overflow-hidden border border-gray-100 shadow-sm"
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
                  className="bg-white border border-gray-200 p-5 rounded-[15px] items-center shadow-sm w-36"
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
            <TouchableOpacity onPress={() => router.push('/(family)/profiles/senior-health' as any)} className="bg-emerald-100 px-3 py-1.5 rounded-[24px] border border-emerald-200">
              <Text className="text-[9px] text-emerald-700 font-black uppercase tracking-widest">Full Report</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            <HealthStatusCard
              icon="heart"
              label="BP"
              value={healthRecords.bloodPressure ? `${healthRecords.bloodPressure.systolic}/${healthRecords.bloodPressure.diastolic}` : '--/--'}
              unit="mmHg"
              color="#EF4444"
              delay={0}
            />
            <HealthStatusCard
              icon="water"
              label="Sugar"
              value={healthRecords.bloodSugar?.level.toString() || '--'}
              unit="mg/dL"
              color="#3B82F6"
              delay={100}
            />
            <HealthStatusCard
              icon="pulse"
              label="Heart"
              value={healthRecords.heartRate?.bpm.toString() || '--'}
              unit="BPM"
              color="#6366F1"
              delay={200}
            />
            <HealthStatusCard
              icon="thermometer"
              label="Temp"
              value={healthRecords.temperature?.value.toString() || '--'}
              unit={`°${healthRecords.temperature?.unit || 'F'}`}
              color="#EC4899"
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
                  className="h-48 rounded-[15px] overflow-hidden shadow-2xl shadow-black/20 relative bg-gray-900"
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
            className="overflow-hidden rounded-[15px]"
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
            className="absolute bottom-40 right-8 gap-y-4"
          >
            <TouchableOpacity
              onPress={() => {
                setPlusMenuOpen(false);
                setRefillModal(true);
              }}
              style={{ backgroundColor: '#F59E0B' }}
              className="px-6 py-4 rounded-[20px] shadow-lg flex-row items-center border border-white/20"
            >
              <Ionicons name="repeat" size={20} color="white" />
              <Text className="text-white font-nunito-bold ml-3 uppercase tracking-widest text-xs">Request Refill</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setPlusMenuOpen(false);
                setAddMedModal(true);
              }}
              style={{ backgroundColor: '#FEF3C7' }}
              className="px-6 py-4 rounded-[20px] shadow-lg flex-row items-center border border-white/20"
            >
              <Ionicons name="add-circle" size={20} color="#D97706" />
              <Text className="text-[#D97706] font-nunito-bold ml-3 uppercase tracking-widest text-xs">Add New Medicine</Text>
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
        style={{ backgroundColor: '#F59E0B' }} // Enlivo Orange
        className="absolute bottom-32 right-8 w-16 h-16 rounded-[24px] items-center justify-center shadow-xl shadow-orange-300 z-[101]"
      >
        <Ionicons name={plusMenuOpen ? "close" : "add"} size={plusMenuOpen ? 28 : 32} color="white" />
      </TouchableOpacity>

      {/* Refill Modal */}
      <Modal visible={refillModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] p-8 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Stock Refill</Text>
                <Text className="text-gray-900 font-nunito-bold text-2xl">Select Medicine</Text>
              </View>
              <TouchableOpacity onPress={() => setRefillModal(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {medications.filter(m => m.status === 'active').map((med) => (
                <TouchableOpacity
                  key={med.id}
                  onPress={() => handleRefillImmediately(med)}
                  className="bg-gray-50 p-6 rounded-[28px] border border-gray-100 flex-row items-center mb-4"
                >
                  <View style={{ backgroundColor: med.color }} className="w-1.5 h-10 rounded-full" />
                  <View className="ml-5 flex-1">
                    <Text className="text-gray-900 font-nunito-bold text-lg">{med.name}</Text>
                    <Text className="text-gray-500 text-sm">{med.dosage}</Text>
                  </View>
                  <View className="bg-orange-100 px-4 py-2 rounded-xl border border-orange-200">
                    <Text className="text-orange-700 text-[10px] font-black uppercase">Refill</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Medicine Modal */}
      <Modal visible={addMedModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Health Control</Text>
                <Text className="text-gray-900 font-nunito-bold text-2xl">Add Medicine</Text>
              </View>
              <TouchableOpacity onPress={() => setAddMedModal(false)} className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-y-6 mb-10">
                <View>
                  <Text className="text-gray-900 font-black text-xs uppercase mb-3 ml-1 tracking-widest">Medicine Name</Text>
                  <TextInput
                    value={medName}
                    onChangeText={setMedName}
                    placeholder="e.g. Telmisartan"
                    className="bg-gray-50 p-5 rounded-2xl border border-gray-100 font-nunito-bold text-lg"
                  />
                </View>
                <View className="flex-row gap-x-4">
                  <View className="flex-1">
                    <Text className="text-gray-900 font-black text-xs uppercase mb-3 ml-1 tracking-widest">Dosage</Text>
                    <TextInput
                      value={medDosage}
                      onChangeText={setMedDosage}
                      placeholder="e.g. 40mg"
                      className="bg-gray-50 p-5 rounded-2xl border border-gray-100 font-nunito-bold text-lg"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-black text-xs uppercase mb-3 ml-1 tracking-widest">Freq</Text>
                    <TouchableOpacity className="bg-gray-50 p-5 rounded-2xl border border-gray-100 items-center justify-center">
                      <Text className="font-nunito-bold text-lg text-gray-900">{medFreq}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddMedicine}
                className="bg-gray-900 h-20 rounded-[28px] items-center justify-center shadow-xl shadow-gray-200"
              >
                <Text className="text-white font-black text-lg uppercase tracking-widest">Add to Health Profile</Text>
              </TouchableOpacity>
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Floating Bottom Bar */}
      <Animated.View entering={FadeInUp.delay(200).duration(600).easing(Easing.out(Easing.quad))} className="absolute bottom-0 left-0 right-0 px-6 bg-white/10" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <View style={styles.tabBar} className="bg-gray-900/95 flex-row items-center h-16 rounded-[28px] px-2 shadow-2xl">
          <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
          <TabButton icon="cart" label="Care" active={activeTab === 'Care'} onPress={() => handleTabPress('Care')} />
          <TabButton icon="map" label="Track" active={activeTab === 'Track'} onPress={() => handleTabPress('Track')} />
          <TabButton icon="chatbubbles" label="Connect" active={activeTab === 'Connect'} onPress={() => handleTabPress('Connect')} />
        </View>
      </Animated.View>

      {/* Grocery Approval Modal */}
      <Modal
        visible={approvalModal}
        transparent
        animationType="slide"
        onRequestClose={() => setApprovalModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] p-8">
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Review Request</Text>
                <Text className="text-gray-900 font-black text-2xl">Grocery Order</Text>
              </View>
              <TouchableOpacity
                onPress={() => setApprovalModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            {pendingGrocery && (
              <ScrollView showsVerticalScrollIndicator={false} className="max-h-[60vh]">
                <View className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 mb-8">
                  <Text className="text-orange-900 font-black text-xs uppercase mb-4 tracking-widest">Requested Items</Text>
                  {pendingGrocery.items.map((item, idx) => (
                    <View key={idx} className="flex-row items-center justify-between mb-3 last:mb-0">
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 bg-orange-400 rounded-full mr-3" />
                        <Text className="text-gray-800 font-bold">{item.name}</Text>
                      </View>
                      <Text className="text-gray-400 font-bold text-xs">{item.quantity}</Text>
                    </View>
                  ))}
                </View>

                <View className="mb-8">
                  <Text className="text-gray-400 font-bold text-xs uppercase mb-4 tracking-widest ml-1">Set Max Budget (₹)</Text>
                  <View className="flex-row items-center bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                    <Text className="text-gray-900 font-black text-xl mr-2">₹</Text>
                    <TextInput
                      value={budget}
                      onChangeText={setBudget}
                      keyboardType="numeric"
                      className="flex-1 text-gray-900 font-black text-xl"
                      placeholder="Enter amount"
                    />
                  </View>
                </View>

                <View className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex-row items-center mb-8">
                  <View className="w-10 h-10 bg-indigo-500 rounded-xl items-center justify-center">
                    <Ionicons name="wallet" size={20} color="white" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-indigo-900 font-black text-sm">Enlivo Secure Pay</Text>
                    <Text className="text-indigo-500 font-bold text-[10px] uppercase">Garanteed from Wallet</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    approveGig(pendingGrocery.id, { budget: parseInt(budget) });
                    setApprovalModal(false);
                  }}
                  className="bg-orange-500 h-20 rounded-[28px] items-center justify-center shadow-xl shadow-orange-200"
                >
                  <Text className="text-white font-black text-lg uppercase tracking-widest font-nunito">Confirm Order</Text>
                </TouchableOpacity>
                <View className="h-10" />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function HealthStatusCard({ icon, label, value, unit, color, delay }: { icon: any; label: string; value: string; unit?: string; color: string; delay: number }) {
  return (
    <Animated.View
      entering={FadeInUp.delay(100 + delay).easing(Easing.inOut(Easing.ease))}
      className="bg-white p-5 rounded-[32px] border border-gray-100 w-[47%] shadow-sm"
    >
      <View className="flex-row items-center mb-4">
        <View style={{ backgroundColor: `${color}10` }} className="w-8 h-8 rounded-xl items-center justify-center">
          <Ionicons name={icon} size={16} color={color} />
        </View>
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">{label}</Text>
      </View>
      <View className="flex-row items-baseline">
        <Text className="text-2xl font-black text-gray-900">{value}</Text>
        {unit && <Text className="text-[9px] font-black text-gray-400 ml-1.5 uppercase">{unit}</Text>}
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
    <View className="flex-1 h-full items-center justify-center">
      <TouchableOpacity
        onPress={onPress}
        className={`flex-row items-center justify-center px-4 h-10 rounded-2xl ${active ? 'bg-orange-500' : ''}`}
      >
        <Ionicons name={active ? (icon as any) : (`${icon}-outline` as any)} size={20} color={active ? "white" : "#9CA3AF"} />
        {active && <Text numberOfLines={1} className="text-white text-[10px] font-bold ml-2 uppercase tracking-widest">{label}</Text>}
      </TouchableOpacity>
    </View>
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
