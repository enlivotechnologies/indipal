import { useAuthStore } from '@/store/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <LinearGradient
        colors={['#F3E8FF', '#FFFFFF']}
        style={{ flex: 1, paddingHorizontal: 32, justifyContent: 'center' }}
      >
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          className="items-center mb-12"
        >
          <View className="w-24 h-24 bg-purple-600 rounded-3xl items-center justify-center shadow-xl mb-8 transform rotate-6">
            <Text className="text-white text-4xl font-bold">EC</Text>
          </View>

          <Text className="text-5xl font-extrabold text-gray-900 tracking-tight text-center">
            EnlivoCare
          </Text>
          <Text className="text-xl text-gray-500 mt-4 text-center px-4 font-medium leading-7">
            Your trusted companion for premium elder care and family support.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(600).duration(800)}
          className="gap-y-6"
        >
          <TouchableOpacity
            onPress={() => router.push('/(auth)/onboarding/role-selection')}
            activeOpacity={0.8}
            className="bg-purple-600 py-6 rounded-3xl items-center shadow-lg shadow-purple-200"
          >
            <Text className="text-white text-xl font-extrabold tracking-wide">Get Started</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-gray-400 font-semibold">Already a member? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/verification/phone-entry')}>
              <Text className="text-purple-600 font-bold underline">Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Development Reset Button */}
          <TouchableOpacity
            onPress={() => {
              useAuthStore.getState().logout();
              router.replace('/(auth)/onboarding' as any);
            }}
            className="mt-4 items-center"
          >
            <Text className="text-gray-300 text-xs font-bold uppercase tracking-widest">Reset Flow (Dev Only)</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1000).duration(1000)}
          style={{ position: 'absolute', bottom: Math.max(insets.bottom, 20), left: 0, right: 0, alignItems: 'center' }}
        >
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            Premium Care • Human Connection
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}
