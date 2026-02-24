import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PhoneEntry() {
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSendOTP = () => {
    if (phone.length === 10) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/(auth)/verification/otp-verify',
        params: { phone }
      } as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['#F3E8FF', '#FFFFFF']}
          style={{ flex: 1, paddingHorizontal: 32, paddingTop: Math.max(insets.top, 20) }}
        >
          <Animated.View entering={FadeInDown.duration(600)}>
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/onboarding/role-selection' as any)}
              className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm mb-8"
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <Text className="text-3xl font-extrabold text-gray-900 mb-2">Welcome Back!</Text>
            <Text className="text-lg text-gray-500 mb-10 font-medium">Enter your mobile number to receive a secure login code.</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100"
          >
            <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">
              Phone Number
            </Text>
            <View className="flex-row items-center border-b-2 border-purple-100 pb-4 mb-8">
              <Text className="text-2xl font-bold text-gray-800 mr-4">+91</Text>
              <TextInput
                autoFocus
                keyboardType="phone-pad"
                className="text-2xl font-bold flex-1 text-gray-900"
                placeholder="00000 00000"
                placeholderTextColor="#D1D5DB"
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              onPress={handleSendOTP}
              disabled={phone.length < 10}
              activeOpacity={0.8}
              className={`py-5 rounded-3xl items-center shadow-lg ${phone.length === 10 ? 'bg-purple-600 shadow-purple-200' : 'bg-gray-100'
                }`}
            >
              <Text className={`text-lg font-extrabold ${phone.length === 10 ? 'text-white' : 'text-gray-400'
                }`}>Send Verification Code</Text>
            </TouchableOpacity>
          </Animated.View>

          <View className="mt-8 items-center gap-y-4">
            <View className="bg-purple-50 px-4 py-2 rounded-full border border-purple-100 items-center">
              <Text className="text-purple-600 text-xs font-bold uppercase tracking-wider">
                Simulation Mode: any 10 digits
              </Text>
            </View>
            <Text className="text-gray-400 text-sm font-medium text-center px-6" style={{ paddingBottom: insets.bottom + 20 }}>
              By continuing, you agree to our <Text className="text-purple-600 font-bold">Terms</Text> and <Text className="text-purple-600 font-bold">Privacy</Text>
            </Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </View>
  );
}
