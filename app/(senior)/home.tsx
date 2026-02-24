import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SeniorHome() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

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
        {/* Header - Purple Theme for Seniors */}
        <View className="flex-row justify-between items-center mb-10">
          <View className="flex-1 mr-4">
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Welcome Back</Text>
            <Text className="text-3xl font-black text-gray-900" numberOfLines={1}>{user?.name?.split(' ')[0] || 'User'} 👋</Text>
          </View>
          <TouchableOpacity className="w-14 h-14 bg-purple-100 rounded-[22px] items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            <Ionicons name="person" size={28} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Wallet / Service Balance */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <LinearGradient
            colors={['#8B5CF6', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-8 rounded-[40px] shadow-xl shadow-purple-200 mb-10"
          >
            <View className="flex-row items-center mb-2">
              <Ionicons name="card" size={16} color="rgba(255,255,255,0.7)" />
              <Text className="text-white/70 text-xs font-bold uppercase tracking-widest ml-2">Family Wallet</Text>
            </View>
            <View className="flex-row justify-between items-end">
              <Text className="text-white text-4xl font-black">₹ 5,250</Text>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-white text-[10px] font-bold">Safe Escrow</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">Active Pal Session</Text>
        <Animated.View entering={FadeInDown.delay(500)} className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-6">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center flex-1">
              <Image source={{ uri: 'https://i.pravatar.cc/150?u=priya' }} className="w-12 h-12 rounded-2xl" />
              <View className="ml-4 flex-1">
                <Text className="font-bold text-gray-800" numberOfLines={1}>Priya Verma</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Your Enlivo Pal</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Linking.openURL('tel:+919876543210');
              }}
              className="bg-white w-10 h-10 rounded-full items-center justify-center shadow-sm border border-gray-50"
            >
              <Ionicons name="call" size={18} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <View className="bg-white p-4 rounded-2xl border border-gray-50 flex-row items-center">
            <View className="w-2 h-2 bg-emerald-500 rounded-full mr-3" />
            <Text className="text-xs font-medium text-gray-600">Arriving in <Text className="font-bold text-gray-900">12 Minutes</Text></Text>
          </View>
        </Animated.View>

        {/* Health & Vitals Section */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">Health & Vitals</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-6 px-6" contentContainerStyle={{ paddingRight: 40 }}>
          <HealthTile
            icon="happy"
            title="Mood"
            color="#A855F7"
            onPress={() => router.push('/(senior)/mood')}
          />
          <HealthTile
            icon="heart"
            title="BP"
            color="#EF4444"
            onPress={() => router.push('/(senior)/vitals/bp')}
          />
          <HealthTile
            icon="water"
            title="Sugar"
            color="#3B82F6"
            onPress={() => router.push('/(senior)/vitals/sugar')}
          />
          <HealthTile
            icon="barbell"
            title="Weight"
            color="#10B981"
            onPress={() => router.push('/(senior)/vitals/weight')}
          />
          <HealthTile
            icon="tint"
            title="Water"
            color="#06B6D4"
            onPress={() => router.push('/(senior)/vitals/water')}
          />
        </ScrollView>

        {/* Simplify Service Ordering for Seniors */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">Daily Essentials</Text>
        <View className="flex-row gap-x-4 mb-4">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(family)/grocery' as any);
            }}
            className="flex-1 bg-white p-6 rounded-[32px] border border-gray-100 items-center shadow-sm"
          >
            <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mb-3">
              <Ionicons name="cart" size={24} color="#10B981" />
            </View>
            <Text className="text-gray-900 font-black text-sm">Order</Text>
            <Text className="text-gray-900 font-black text-sm">Grocery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(family)/pharmacy' as any);
            }}
            className="flex-1 bg-white p-6 rounded-[32px] border border-gray-100 items-center shadow-sm"
          >
            <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-3">
              <Ionicons name="bandage" size={24} color="#3B82F6" />
            </View>
            <Text className="text-gray-900 font-black text-sm">Order</Text>
            <Text className="text-gray-900 font-black text-sm">Medicine</Text>
          </TouchableOpacity>
        </View>

        {/* Live Support & Family Activity */}
        <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 ml-1">Live Support & Activity</Text>
        <Animated.View entering={FadeInDown.delay(550)} className="mb-10">
          {/* Grocery Booking Alert */}
          <View className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex-row items-center mb-4">
            <View className="w-10 h-10 bg-emerald-500 rounded-2xl items-center justify-center shadow-sm">
              <Ionicons name="cart" size={20} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-emerald-900 font-bold text-sm">Essential Groceries Booked</Text>
              <Text className="text-emerald-700/60 text-[10px] font-bold uppercase py-0.5">Fresh Pack • Arjun (Pal) On-Route</Text>
            </View>
            <TouchableOpacity className="bg-white px-3 py-1.5 rounded-xl border border-emerald-100">
              <Text className="text-emerald-600 text-[9px] font-black uppercase">Track</Text>
            </TouchableOpacity>
          </View>

          {/* Medicine Booking Alert */}
          <View className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex-row items-center mb-4">
            <View className="w-10 h-10 bg-indigo-500 rounded-2xl items-center justify-center shadow-sm">
              <Ionicons name="notifications" size={20} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-indigo-900 font-bold text-sm">Medicine Order Dispatched</Text>
              <Text className="text-indigo-700/60 text-[10px] font-bold uppercase py-0.5">Care Kit • Priya (Pal) On-Route</Text>
            </View>
            <TouchableOpacity className="bg-white px-3 py-1.5 rounded-xl border border-indigo-100">
              <Text className="text-indigo-600 text-[9px] font-black uppercase">Track</Text>
            </TouchableOpacity>
          </View>

          {/* Nurse Alert */}
          <View className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 flex-row items-center mb-4">
            <View className="w-10 h-10 bg-blue-500 rounded-2xl items-center justify-center shadow-sm">
              <Ionicons name="medical" size={20} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-blue-900 font-bold text-sm">Post-Op Nurse Booked</Text>
              <Text className="text-blue-700/60 text-[10px] font-bold uppercase py-0.5">Clinical Care • Vitals Check Today</Text>
            </View>
            <TouchableOpacity className="bg-white px-3 py-1.5 rounded-xl border border-blue-100">
              <Text className="text-blue-600 text-[9px] font-black uppercase">Details</Text>
            </TouchableOpacity>
          </View>

          {/* House Help Alert */}
          <View className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 flex-row items-center mb-4">
            <View className="w-10 h-10 bg-amber-500 rounded-2xl items-center justify-center shadow-sm">
              <Ionicons name="sparkles" size={20} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-amber-900 font-bold text-sm">Maintenance Help Scheduled</Text>
              <Text className="text-amber-700/60 text-[10px] font-bold uppercase py-0.5">Deep Cleaning • 2:00 PM Arrival</Text>
            </View>
            <TouchableOpacity className="bg-white px-3 py-1.5 rounded-xl border border-amber-100">
              <Text className="text-amber-600 text-[9px] font-black uppercase">View</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-purple-50 p-6 rounded-[32px] border border-purple-100 flex-row items-center">
            <Ionicons name="information-circle" size={20} color="#8B5CF6" />
            <Text className="text-[10px] text-purple-700 font-bold ml-3 flex-1">Your family has secured your nursing care and home maintenance. Certified professionals are coordinated.</Text>
          </View>
        </Animated.View>

        {/* SOS Button - Extremely Responsive */}
        <TouchableOpacity
          className="bg-red-500 py-6 rounded-[32px] items-center flex-row justify-center shadow-xl shadow-red-200 mt-4"
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)}
        >
          <Ionicons name="alert-circle" size={24} color="white" />
          <Text className="text-white text-xl font-black ml-3 uppercase tracking-widest">Instant SOS</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function HealthTile({ icon, title, color, onPress }: { icon: any; title: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="bg-white p-6 rounded-[32px] border border-gray-100 items-center shadow-sm mr-4 w-28"
    >
      <View
        style={{ backgroundColor: `${color}15` }}
        className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-gray-900 font-black text-xs uppercase tracking-widest">{title}</Text>
    </TouchableOpacity>
  );
}
