import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function ChatList() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { conversations, fetchConversations } = useChatStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.phone) fetchConversations(user.phone);
  }, [user]);

  const filteredConversations = conversations.filter(conv => {
    return (conv.contactName || '').toLowerCase().includes(search.toLowerCase());
  });

  const activeTab = pathname.includes('home') ? 'Home' :
    pathname.includes('care') ? 'Care' :
      pathname.includes('tracking') ? 'Track' :
        pathname.includes('chat') ? 'Connect' : 'Connect';

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(family)/home' as any);
  };

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tab === 'Home') router.replace('/(family)/home' as any);
    if (tab === 'Care') router.replace('/(family)/care' as any);
    if (tab === 'Track') router.replace('/(family)/tracking' as any);
    if (tab === 'Connect') router.replace('/(family)/chat' as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Premium Header - Responsive */}
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
          <Text className="text-2xl font-black text-gray-900">Conversations</Text>
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enlivo Connect</Text>
        </View>
        <View className="w-10 h-10" />
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4">
        <View className="bg-gray-50 flex-row items-center px-4 py-3 rounded-2xl border border-gray-100">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search contacts..."
            className="ml-3 flex-1 text-gray-800 font-medium"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          return (
            <Animated.View entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(family)/chat/[id]", params: { id: item.id } })}
                className="flex-row items-center py-4 border-b border-gray-50"
              >
                <View className="relative">
                  <View className="w-14 h-14 bg-orange-50 rounded-[22px] items-center justify-center border border-orange-100 overflow-hidden">
                    {item.contactAvatar ? (
                      <Image source={{ uri: item.contactAvatar }} className="w-full h-full" />
                    ) : (
                      <Ionicons name="person" size={24} color="#F59E0B" />
                    )}
                  </View>
                  <View className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                </View>

                <View className="flex-1 ml-4">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>{item.contactName}</Text>
                    <Text className="text-[10px] font-bold text-gray-400">
                      {item.lastTimestamp ? new Date(item.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                  </View>
                  <Text className="text-xs font-medium text-orange-600 mb-1 uppercase tracking-widest">{item.contactRole}</Text>
                  <Text className="text-xs text-gray-500 font-medium" numberOfLines={1}>{item.lastMessage || 'No messages yet'}</Text>
                </View>

                {item.unreadCount > 0 && (
                  <View className="ml-2 bg-orange-500 w-5 h-5 rounded-full items-center justify-center shadow-sm shadow-orange-200">
                    <Text className="text-[10px] font-black text-white">{item.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />

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
