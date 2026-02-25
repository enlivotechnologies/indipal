import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Linking, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FamilyProfileScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  const activeTab = pathname.includes('home') ? 'Home' :
    pathname.includes('care') ? 'Care' :
      pathname.includes('tracking') ? 'Track' :
        pathname.includes('chat') ? 'Connect' : 'Home';

  const [isEditing, setIsEditing] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showManageLinkages, setShowManageLinkages] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // App Preferences State
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [appLanguage, setAppLanguage] = useState('English');

  // Mock Activity Logs Data
  const MOCK_ACTIVITY_LOGS = [
    { id: '1', action: 'Daily Medicine Taken', time: '10:30 AM', date: 'Today', status: 'Success', icon: 'medical', color: '#10B981' },
    { id: '2', action: 'Morning Walk Completed', time: '07:15 AM', date: 'Today', status: 'Success', icon: 'walk', color: '#F59E0B' },
    { id: '3', action: 'Blood Pressure Logged', time: '09:00 PM', date: 'Yesterday', status: 'Info', icon: 'pulse', color: '#6366F1' },
    { id: '4', action: 'Emergency Alert Test', time: '04:20 PM', date: '21 Feb', status: 'System', icon: 'shield-checkmark', color: '#9CA3AF' },
  ];

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || 'Vikram Malhotra');
  const [editPhone, setEditPhone] = useState(user?.phone || '+91 98765 43210');
  const [editEmail, setEditEmail] = useState(user?.email || 'vikram.m@outlook.com');
  const [editRole, setEditRole] = useState('Son • Primary Caregiver');

  const [tempName, setTempName] = useState(editName);
  const [tempPhone, setTempPhone] = useState(editPhone);
  const [tempEmail, setTempEmail] = useState(editEmail);
  const [tempRole, setTempRole] = useState(editRole);

  // Mock Orders Data
  const MOCK_ORDERS = [
    {
      id: 'ORD001',
      type: 'Grocery',
      category: 'Organic essentials',
      status: 'In Transit',
      date: '23 Feb, 2026',
      price: 1250,
      pal: 'Arjun Singh',
      items: ['A2 Milk', 'Alphonso Mangoes', 'Himalayan Salt'],
      color: '#10B981'
    },
    {
      id: 'ORD002',
      type: 'Medical Hub',
      category: 'BP Medications',
      status: 'Delivered',
      date: '21 Feb, 2026',
      price: 850,
      pal: 'Priya Verma',
      items: ['Telmisartan 40mg', 'Aspirin', 'Vitamin D3'],
      color: '#6366F1'
    }
  ];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (showManageLinkages) {
      setShowManageLinkages(false);
      return;
    }
    router.replace('/(family)/home');
  };

  const handleLogout = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
    router.replace('/(auth)/onboarding' as any);
  };

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tab === 'Home') router.replace('/(family)/home' as any);
    if (tab === 'Care') router.replace('/(family)/care' as any);
    if (tab === 'Track') router.replace('/(family)/tracking' as any);
    if (tab === 'Connect') router.replace('/(family)/chat' as any);
  };

  const saveProfile = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setEditName(tempName);
    setEditPhone(tempPhone);
    setEditEmail(tempEmail);
    setEditRole(tempRole);
    setIsEditing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header - Responsive */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
        className="px-6 flex-row items-center border-b border-gray-50 bg-white"
      >
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-4"
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-2xl font-black text-gray-900">{showManageLinkages ? 'Manage Linkages' : 'Settings'}</Text>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">{showManageLinkages ? 'Senior Supervision' : 'Global Profile'}</Text>
        </View>
        {!showManageLinkages && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setTempName(editName);
              setTempPhone(editPhone);
              setTempEmail(editEmail);
              setTempRole(editRole);
              setIsEditing(true);
            }}
            className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center border border-orange-100"
          >
            <Ionicons name="create-outline" size={20} color="#F59E0B" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {!showManageLinkages ? (
          <>
            {/* Profile Card */}
            <Animated.View entering={FadeInUp.delay(100).duration(600).easing(Easing.out(Easing.quad))} className="px-6 py-8 items-center">
              <View className="relative">
                <View className="w-28 h-28 bg-orange-50 rounded-[40px] items-center justify-center border-2 border-orange-100 p-1">
                  {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} className="w-full h-full rounded-[38px]" />
                  ) : (
                    <Ionicons name="person" size={48} color="#F59E0B" />
                  )}
                </View>
                <TouchableOpacity className="absolute bottom-0 right-0 bg-orange-500 w-10 h-10 rounded-2xl border-4 border-white items-center justify-center">
                  <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="text-2xl font-bold text-gray-900 mt-4" numberOfLines={1}>{editName}</Text>
              <Text className="text-xs font-bold text-orange-600 uppercase tracking-widest mt-1">{editRole}</Text>
            </Animated.View>

            {/* Section: My Orders / Active Bookings */}
            <View className="px-6 mb-8">
              <View className="flex-row items-center justify-between mb-4 ml-1">
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest">My Recent Orders</Text>
                <TouchableOpacity>
                  <Text className="text-[10px] font-black text-orange-600 uppercase">View All</Text>
                </TouchableOpacity>
              </View>

              {MOCK_ORDERS.map((order, idx) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setSelectedOrder(order);
                    setShowOrderDetails(true);
                  }}
                  activeOpacity={0.7}
                  className="mb-4"
                >
                  <Animated.View
                    entering={FadeInUp.delay(200 + idx * 100).duration(600).easing(Easing.out(Easing.quad))}
                    className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center flex-1">
                      <View
                        style={{ backgroundColor: order.color + '15' }}
                        className="w-12 h-12 rounded-2xl items-center justify-center border border-gray-100"
                      >
                        <Ionicons name={order.type === 'Grocery' ? 'cart' : 'medical'} size={20} color={order.color} />
                      </View>
                      <View className="ml-4 flex-1">
                        <Text className="font-black text-gray-900 text-sm">{order.type}</Text>
                        <Text className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{order.date}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-black text-gray-900 text-sm">₹{order.price}</Text>
                      <View className="flex-row items-center mt-1">
                        <View style={{ backgroundColor: order.color }} className="w-1.5 h-1.5 rounded-full mr-1.5" />
                        <Text style={{ color: order.color }} className="text-[9px] font-black uppercase">{order.status}</Text>
                      </View>
                    </View>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Section: Linked Seniors */}
            <View className="px-6 mb-8">
              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Verified Linkages</Text>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  setShowManageLinkages(true);
                }}
                activeOpacity={0.7}
                className="bg-white p-5 rounded-[32px] border border-gray-100 flex-row items-center justify-between shadow-sm"
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100">
                    <Ionicons name="heart" size={22} color="#F59E0B" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="font-black text-gray-900 text-base" numberOfLines={1}>{user?.parentsDetails?.[0]?.name || 'Ramesh Chandra'}</Text>
                    <View className="flex-row items-center mt-0.5">
                      <View className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                      <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Connection</Text>
                    </View>
                  </View>
                </View>
                <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Section: Account Settings */}
            <View className="px-6 mb-8">
              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">App Preferences</Text>
              <View className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <ProfileOption
                  icon="notifications"
                  label="Push Notifications"
                  value={notificationsEnabled}
                  isToggle
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNotificationsEnabled(!notificationsEnabled);
                  }}
                />
                <ProfileOption
                  icon="shield-checkmark"
                  label="Two-Factor Auth"
                  value={twoFactorEnabled}
                  isToggle
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setTwoFactorEnabled(!twoFactorEnabled);
                  }}
                />
                <ProfileOption
                  icon="wallet"
                  label="Wallet & Payments"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/(family)/account/wallet" as any);
                  }}
                />
                <ProfileOption
                  icon="language"
                  label="App Language"
                  subLabel={appLanguage}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowLanguageModal(true);
                  }}
                />
              </View>
            </View>

            {/* Section: Support */}
            <View className="px-6">
              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Help & Danger Zone</Text>
              <View className="bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm">
                <ProfileOption
                  icon="help-circle"
                  label="Support Center"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowSupportModal(true);
                  }}
                />
                <TouchableOpacity
                  onPress={handleLogout}
                  className="flex-row items-center justify-between p-5"
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center">
                      <Ionicons name="log-out" size={20} color="#EF4444" />
                    </View>
                    <Text className="ml-4 font-black text-red-500">Log Out</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View className="px-6 pt-8">
            <View className="mb-8">
              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-1">Your Connected Seniors</Text>

              {/* Senior Card 1 */}
              <View className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-sm mb-4">
                <View className="flex-row items-center mb-6">
                  <View className="w-14 h-14 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100">
                    <Ionicons name="person" size={24} color="#F59E0B" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="font-black text-gray-900 text-lg">{user?.parentsDetails?.[0]?.name || 'Ramesh Chandra'}</Text>
                    <View className="flex-row items-center mt-1">
                      <View className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                      <Text className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Online • Active Care</Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-x-3">
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push('/(family)/profiles/senior-health');
                    }}
                    className="flex-row items-center justify-center flex-1 bg-indigo-50 py-4 rounded-2xl border border-indigo-100"
                  >
                    <Ionicons name="pulse-outline" size={16} color="#6366F1" className="mr-2" />
                    <Text className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Health</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowAuditLogs(true);
                    }}
                    className="flex-row items-center justify-center flex-1 bg-gray-50 py-4 rounded-2xl border border-gray-100"
                  >
                    <Ionicons name="document-text-outline" size={16} color="#4B5563" className="mr-2" />
                    <Text className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Logs</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                    className="flex-row items-center justify-center w-12 bg-red-50 py-4 rounded-2xl border border-red-100"
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(auth)/registration/senior' as any);
                }}
                className="bg-orange-50 border-2 border-dashed border-orange-200 p-8 rounded-[32px] items-center justify-center mt-4"
              >
                <View className="w-12 h-12 bg-orange-500 rounded-full items-center justify-center mb-3 shadow-lg shadow-orange-200">
                  <Ionicons name="add" size={24} color="white" />
                </View>
                <Text className="text-orange-600 font-black text-[11px] uppercase tracking-widest">Link New Senior</Text>
                <Text className="text-orange-400 text-[9px] font-bold mt-1">Add another family member</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 items-center">
              <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mb-4 shadow-sm">
                <Ionicons name="shield-checkmark" size={24} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 font-black text-base">Security Notice</Text>
              <Text className="text-gray-400 text-center text-[11px] mt-2 leading-5 font-bold">
                Unlinking a senior will stop all real-time tracking and care services for that account immediately. This action cannot be undone without a new verification.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Order Detail Modal */}
      <Modal
        visible={showOrderDetails}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <Animated.View
            entering={ZoomIn.duration(600).easing(Easing.out(Easing.back(1)))}
            className="bg-white w-full rounded-[48px] overflow-hidden"
          >
            <LinearGradient
              colors={[selectedOrder?.color || '#000', '#000']}
              className="p-8 pb-12"
            >
              <TouchableOpacity
                onPress={() => setShowOrderDetails(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View className="w-20 h-20 bg-white/20 rounded-[28px] items-center justify-center mb-6 border border-white/30">
                <Ionicons name={selectedOrder?.type === 'Grocery' ? 'cart' : 'medical'} size={40} color="white" />
              </View>
              <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Receipt for {selectedOrder?.id}</Text>
              <Text className="text-white text-3xl font-black mb-2">{selectedOrder?.type}</Text>
              <Text className="text-white/80 font-bold">{selectedOrder?.category}</Text>
            </LinearGradient>

            <View className="p-8 -mt-6 bg-white rounded-t-[40px]">
              <View className="flex-row justify-between items-center mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <View>
                  <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Assigned Pal</Text>
                  <Text className="text-gray-900 font-black text-lg">{selectedOrder?.pal}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Linking.openURL('tel:+919876543210');
                  }}
                  className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm"
                >
                  <Ionicons name="call" size={20} color={selectedOrder?.color} />
                </TouchableOpacity>
              </View>

              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Items Summary</Text>
              {selectedOrder?.items.map((item: string, i: number) => (
                <View key={i} className="flex-row items-center mb-4 bg-white p-4 rounded-2xl border border-gray-50">
                  <View className="w-2 h-2 rounded-full bg-gray-200 mr-4" />
                  <Text className="text-gray-800 font-bold flex-1">{item}</Text>
                  <Text className="text-gray-400 text-[10px] font-black">X 1</Text>
                </View>
              ))}

              <View className="mt-6 border-t border-gray-100 pt-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-gray-400 font-bold">Order Total</Text>
                  <Text className="text-gray-900 font-black text-xl">₹{selectedOrder?.price}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-400 font-bold">Method</Text>
                  <Text className="text-gray-900 font-black">Enlivo Wallet</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowOrderDetails(false)}
                className="mt-10 bg-gray-900 py-5 rounded-[24px] items-center"
              >
                <Text className="text-white font-black uppercase tracking-widest">Close Receipt</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditing}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <Animated.View
            entering={ZoomIn.duration(600).easing(Easing.out(Easing.back(1)))}
            className="bg-white w-full rounded-[48px] p-8 shadow-2xl max-h-[90%]"
          >
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-black text-gray-900">Edit Profile</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Update your information</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-grow-0">
              <View className="mb-8 items-center">
                <TouchableOpacity className="w-24 h-24 bg-orange-50 rounded-[32px] items-center justify-center border-2 border-orange-100 relative">
                  {user?.profileImage ? (
                    <Image source={{ uri: user.profileImage }} className="w-full h-full rounded-[30px]" />
                  ) : (
                    <Ionicons name="person" size={40} color="#F59E0B" />
                  )}
                  <View className="absolute -bottom-2 -right-2 bg-orange-500 w-8 h-8 rounded-xl border-4 border-white items-center justify-center">
                    <Ionicons name="camera" size={14} color="white" />
                  </View>
                </TouchableOpacity>
              </View>

              <View className="space-y-6">
                <View>
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</Text>
                  <TextInput
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Enter your name"
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-gray-900"
                  />
                </View>

                <View>
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</Text>
                  <TextInput
                    value={tempPhone}
                    onChangeText={setTempPhone}
                    keyboardType="phone-pad"
                    placeholder="+91 00000 00000"
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-gray-900"
                  />
                </View>

                <View>
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</Text>
                  <TextInput
                    value={tempEmail}
                    onChangeText={setTempEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="example@email.com"
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-gray-900"
                  />
                </View>

                <View className="mb-6">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Role / Relationship</Text>
                  <TextInput
                    value={tempRole}
                    onChangeText={setTempRole}
                    placeholder="e.g. Son, Daughter"
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold text-gray-900"
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={saveProfile}
              className="mt-6 bg-orange-500 py-5 rounded-[24px] items-center shadow-xl shadow-orange-500/40"
            >
              <Text className="text-white font-black uppercase tracking-widest">Save Changes</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Audit Logs Modal */}
      <Modal
        visible={showAuditLogs}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <Animated.View
            entering={ZoomIn.duration(600).easing(Easing.out(Easing.back(1)))}
            className="bg-white w-full rounded-[48px] p-8 shadow-2xl max-h-[80%]"
          >
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-black text-gray-900">Activity Logs</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Audit Trail for Senior</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAuditLogs(false)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {MOCK_ACTIVITY_LOGS.map((log) => (
                <View key={log.id} className="mb-6 flex-row items-center">
                  <View
                    style={{ backgroundColor: log.color + '15' }}
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                  >
                    <Ionicons name={log.icon as any} size={20} color={log.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-black text-gray-900 text-sm">{log.action}</Text>
                    <View className="flex-row items-center mt-0.5">
                      <Text className="text-[10px] text-gray-400 font-bold uppercase">{log.date} • {log.time}</Text>
                    </View>
                  </View>
                  <View className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{log.status}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowAuditLogs(false)}
              className="mt-8 bg-gray-900 py-5 rounded-[24px] items-center"
            >
              <Text className="text-white font-black uppercase tracking-widest">Acknowledge Trail</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <Animated.View
            entering={ZoomIn.duration(600).easing(Easing.out(Easing.back(1)))}
            className="bg-white w-full rounded-[48px] p-8 shadow-2xl"
          >
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-black text-gray-900">Select Language</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Choose your preference</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <View className="space-y-3">
              {['English', 'Hindi', 'Kannada', 'Bengali', 'Punjabi', 'Marathi'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setAppLanguage(lang);
                    setShowLanguageModal(false);
                  }}
                  className={`flex-row items-center justify-between p-5 rounded-2xl border ${appLanguage === lang ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100'
                    }`}
                >
                  <Text className={`font-bold ${appLanguage === lang ? 'text-orange-600' : 'text-gray-900'}`}>{lang}</Text>
                  {appLanguage === lang && (
                    <Ionicons name="checkmark-circle" size={20} color="#F59E0B" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => setShowLanguageModal(false)}
              className="mt-10 bg-gray-900 py-5 rounded-[24px] items-center"
            >
              <Text className="text-white font-black uppercase tracking-widest">Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Support Center Modal */}
      <Modal
        visible={showSupportModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <Animated.View
            entering={ZoomIn.duration(600).easing(Easing.out(Easing.back(1)))}
            className="bg-white w-full rounded-[48px] p-8 shadow-2xl max-h-[85%]"
          >
            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-2xl font-black text-gray-900">Support Center</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">We're here to help you</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSupportModal(false)}
                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Quick Help</Text>

              <View className="space-y-4 mb-8">
                {[
                  { q: 'How do I link a new senior?', a: 'Go to Manage Linkages and click "Link New Senior". Verification takes < 2 mins.' },
                  { q: 'What is a "Care Pal"?', a: 'Pals are our verified on-ground assistants who help with groceries, meds, and check-ins.' },
                  { q: 'Is my data secure?', a: 'Absolutely. We use banking-grade encryption and 2FA for all senior data access.' }
                ].map((faq, i) => (
                  <View key={i} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 mb-4">
                    <Text className="font-black text-gray-900 text-sm mb-2">{faq.q}</Text>
                    <Text className="text-[11px] text-gray-500 font-medium leading-5">{faq.a}</Text>
                  </View>
                ))}
              </View>

              <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Connect with us</Text>
              <View className="flex-row gap-x-4 mb-4">
                <TouchableOpacity className="flex-1 bg-orange-500 p-4 rounded-2xl items-center flex-row justify-center">
                  <Ionicons name="chatbubble-ellipses" size={18} color="white" />
                  <Text className="text-white font-black uppercase text-[10px] ml-2">Live Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-gray-900 p-4 rounded-2xl items-center flex-row justify-center">
                  <Ionicons name="call" size={18} color="white" />
                  <Text className="text-white font-black uppercase text-[10px] ml-2">Call Hub</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowSupportModal(false)}
              className="mt-6 bg-gray-100 py-5 rounded-[24px] items-center"
            >
              <Text className="text-gray-900 font-black uppercase tracking-widest">Close Center</Text>
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

function ProfileOption({ icon, label, subLabel, value, isToggle, onPress }: { icon: any; label: string; subLabel?: string; value?: boolean; isToggle?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between p-5 border-b border-gray-50"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center">
          <Ionicons name={icon} size={20} color="#4B5563" />
        </View>
        <View className="ml-4">
          <Text className="font-bold text-gray-800">{label}</Text>
          {subLabel && <Text className="text-[10px] text-gray-400 font-medium">{subLabel}</Text>}
        </View>
      </View>
      {isToggle ? (
        <Switch
          value={value}
          trackColor={{ true: '#FFEDD5', false: '#F3F4F6' }}
          thumbColor={value ? '#F59E0B' : '#D1D5DB'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#4B5563" />
      )}
    </TouchableOpacity>
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
