import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OTPVerify() {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const setPhone = useAuthStore((state) => state.setPhone);

  // Resend OTP countdown
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp !== '123456') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid OTP', 'Please enter 123456 for testing.');
      return;
    }

    setIsVerifying(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setPhone(phone || '9876543210');

    setTimeout(() => {
      setIsVerifying(false);

      const currentState = useAuthStore.getState();
      const role = currentState.user?.role;

      if (role === 'senior') {
        router.replace('/(auth)/registration/senior' as any);
      } else if (role === 'family') {
        router.replace('/(auth)/registration/family' as any);
      } else if (role === 'pal') {
        router.replace('/(auth)/registration/pal' as any);
      } else {
        router.replace('/(auth)/onboarding/role-selection' as any);
      }
    }, 800);
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
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/verification/phone-entry' as any)}
              className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm mb-8"
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>

            <Text className="text-3xl font-extrabold text-gray-900 mb-2">Verify Code</Text>
            <Text className="text-lg text-gray-500 mb-10 font-medium">
              We&apos;ve sent a 6-digit code to <Text className="text-purple-600 font-bold">+91 {phone || 'XXXXX XXXXX'}</Text>
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 items-center"
          >
            <TextInput
              autoFocus
              keyboardType="number-pad"
              className="text-5xl font-bold tracking-[15px] text-center border-b-2 border-purple-100 pb-4 mb-10 text-gray-900 w-full"
              placeholder="000000"
              placeholderTextColor="#E5E7EB"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
              editable={!isVerifying}
            />

            <TouchableOpacity
              onPress={handleVerify}
              disabled={otp.length < 6 || isVerifying}
              activeOpacity={0.8}
              className={`w-full py-5 rounded-3xl items-center shadow-lg ${otp.length === 6 && !isVerifying ? 'bg-purple-600 shadow-purple-200' : 'bg-gray-100'
                }`}
            >
              {isVerifying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className={`text-lg font-extrabold ${otp.length === 6 ? 'text-white' : 'text-gray-400'
                  }`}>Verify & Continue</Text>
              )}
            </TouchableOpacity>

            <View className="mt-8 flex-row items-center gap-x-2">
              {timer > 0 ? (
                <Text className="text-gray-400 font-semibold italic">Resend code in {timer}s</Text>
              ) : (
                <TouchableOpacity onPress={() => setTimer(30)}>
                  <Text className="text-purple-600 font-bold text-base underline">Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          <View className="mt-8 items-center" style={{ paddingBottom: insets.bottom + 20 }}>
            <Text className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest bg-purple-50 px-4 py-2 rounded-full overflow-hidden">
              Test OTP: 123456
            </Text>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </View>
  );
}
