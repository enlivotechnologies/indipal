import { VideoCard } from "@/components/VideoCard";
import { useAuthStore } from "@/store/authStore";
import { useWellnessStore, WellnessVideo } from "@/store/wellnessStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useMemo, useState } from "react";
import {
    Alert,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, { FadeInRight, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";


const BRAND_PURPLE = '#6E5BFF';

export default function SeniorVideoScreen() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    // Stores
    const { user } = useAuthStore();
    const {
        videos,
        toggleSaveVideo,
        addToHistory
    } = useWellnessStore();

    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [playingVideo, setPlayingVideo] = useState<WellnessVideo | null>(null);
    const [sortBy] = useState<'Health' | 'Popular' | 'Newest'>('Health');

    const safePathname = pathname || '';
    const CATEGORIES = ['ALL', 'SAVED', 'YOGA', 'DIET', 'EXERCISE'];

    // Advanced Sorting & Filtering Function
    const processedVideos = useMemo(() => {
        let filtered = videos;

        // 1. Category Filtering Logic
        if (selectedCategory === 'SAVED') {
            filtered = videos.filter(v => v.saved);
        } else if (selectedCategory !== 'ALL') {
            filtered = videos.filter(v => v.category.toUpperCase() === selectedCategory);
        }

        // 2. Relational & Sorting Logic
        const userConditions = (user?.medicalConditions || []).map(c => c.toLowerCase());
        const hasDiabetes = userConditions.includes('diabetes');

        return [...filtered].sort((a, b) => {
            // Relational Prio: Diabetes -> DIET videos first
            if (hasDiabetes) {
                const aIsDiet = a.category.toUpperCase() === 'DIET';
                const bIsDiet = b.category.toUpperCase() === 'DIET';
                if (aIsDiet && !bIsDiet) return -1;
                if (!aIsDiet && bIsDiet) return 1;
            }

            if (sortBy === 'Health') {
                const aMatch = a.tags?.some(tag => userConditions.includes(tag.toLowerCase()));
                const bMatch = b.tags?.some(tag => userConditions.includes(tag.toLowerCase()));
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
            }

            if (sortBy === 'Popular') {
                const parseViews = (v: string) => parseFloat(v.replace('k', '')) * (v.includes('k') ? 1000 : 1);
                return parseViews(b.views) - parseViews(a.views);
            }

            // Tie-break with Family Recommendation
            if (a.isFamilyRecommended && !b.isFamilyRecommended) return -1;
            if (!a.isFamilyRecommended && b.isFamilyRecommended) return 1;

            return 0;
        });
    }, [videos, selectedCategory, user?.medicalConditions, sortBy]);

    const activeTab = safePathname.includes('home') ? 'Home' :
        safePathname.includes('services') ? 'Services' :
            safePathname.includes('health') ? 'Health' :
                safePathname.includes('video') ? 'Video' : 'Video';

    const handleTabPress = (tab: string) => {
        if (tab === activeTab) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home');
        if (tab === 'Services') router.replace('/(senior)/services');
        if (tab === 'Health') router.replace('/(senior)/health');
        if (tab === 'Video') router.replace('/(senior)/video');
    };

    const handlePlay = (video: WellnessVideo) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addToHistory(video.id);
        setPlayingVideo(video);
    };

    const handleShare = (video: WellnessVideo) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const url = `https://enlivo.care/v/${video.id}`;
        const message = `Hi! Watch this helpful health video: ${video.title} - ${url}`;

        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
        } else {
            Alert.alert("Share", message);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F9F8FF' }}>
            {/* Header */}
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
                    borderBottomColor: '#F3F4F6',
                    zIndex: 10
                }}
            >
                <View>
                    <Text className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Enlivo Wellness</Text>
                    <Text className="text-2xl font-black text-gray-900">Health Hub</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(senior)/home')}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                >
                    <Ionicons name="chevron-back" size={20} color={BRAND_PURPLE} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 120
                }}
            >
                {/* Condition-Based Pulse Alert */}
                {user?.medicalConditions?.length ? (
                    <Animated.View
                        entering={FadeInUp.delay(200)}
                        className="mx-6 mt-6 p-4 bg-indigo-600 rounded-[32px] flex-row items-center border border-indigo-400 shadow-lg shadow-indigo-100"
                    >
                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30">
                            <Ionicons name="sparkles" size={18} color="white" />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-white font-black text-[10px] uppercase tracking-widest">Health Alignment</Text>
                            <Text className="text-white/90 text-[12px] font-bold">Priority content for {user.medicalConditions.join(', ')}</Text>
                        </View>
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={FadeInUp.delay(200)}
                        className="mx-6 mt-6 p-4 bg-white rounded-[32px] flex-row items-center border border-indigo-50 shadow-sm"
                    >
                        <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center">
                            <Ionicons name="videocam" size={18} color={BRAND_PURPLE} />
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-indigo-400 font-black text-[10px] uppercase tracking-widest">Wellness Library</Text>
                            <Text className="text-gray-500 text-[12px] font-bold">Explore curated routines</Text>
                        </View>
                    </Animated.View>
                )}

                {/* Categories - Horizontal Scroll Pill Buttons */}
                <View className="mt-8 mb-4">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24 }}
                    >
                        {CATEGORIES.map((cat, idx) => {
                            const isActive = selectedCategory === cat;
                            return (
                                <Animated.View
                                    key={cat}
                                    entering={FadeInRight.delay(200 + idx * 50).duration(600)}
                                >
                                    <TouchableOpacity
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setSelectedCategory(cat);
                                        }}
                                        style={{
                                            backgroundColor: isActive ? BRAND_PURPLE : '#F3F0FF',
                                            borderRadius: 999,
                                            paddingHorizontal: 24,
                                            paddingVertical: 12,
                                            marginRight: 12,
                                            borderWidth: 1,
                                            borderColor: isActive ? BRAND_PURPLE : '#E0D7FF',
                                            shadowColor: isActive ? BRAND_PURPLE : '#000',
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: isActive ? 0.3 : 0.05,
                                            shadowRadius: 8,
                                            elevation: isActive ? 4 : 2
                                        }}
                                    >
                                        <Text
                                            style={{ color: isActive ? '#FFFFFF' : '#6366F1' }}
                                            className="font-black text-xs uppercase tracking-widest"
                                        >
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </ScrollView>
                </View>


                {/* Video Feed - Vertical Scroll */}
                <View className="px-6 mt-4">
                    {processedVideos.map((video, idx) => {
                        const userConditions = (user?.medicalConditions || []).map(c => c.toLowerCase());
                        const isMatch = video.tags?.some(tag => userConditions.includes(tag.toLowerCase()));

                        return (
                            <VideoCard
                                key={`${video.id}-${selectedCategory}-${sortBy}`} // Force re-animation on any filter change
                                video={video}
                                delay={idx * 100}
                                onPlay={handlePlay}
                                onToggleSave={toggleSaveVideo}
                                onShare={handleShare}
                                isPal={safePathname.includes('pal')}
                                conditionMatch={isMatch}
                            />
                        );
                    })}

                    {processedVideos.length === 0 && (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="videocam-outline" size={64} color="#E5E7EB" />
                            <Text className="text-gray-400 font-bold mt-4">No videos found in this category</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Video Player Modal */}
            {playingVideo && (
                <VideoPlayerOverlay
                    video={playingVideo}
                    onClose={() => setPlayingVideo(null)}
                />
            )}

            {/* Custom Tab Bar - Persistent & Static */}
            <View
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row justify-between items-center h-16 rounded-[28px] px-3 shadow-2xl">
                    <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
                    <TabButton icon="grid" label="Services" active={activeTab === 'Services'} onPress={() => handleTabPress('Services')} />
                    <TabButton icon="heart" label="Health" active={activeTab === 'Health'} onPress={() => handleTabPress('Health')} />
                    <TabButton icon="videocam" label="Video" active={activeTab === 'Video'} onPress={() => handleTabPress('Video')} />
                </View>
            </View>
        </View>
    );
}

function VideoPlayerOverlay({ video, onClose }: { video: WellnessVideo, onClose: () => void }) {
    const player = useVideoPlayer(video.videoUrl, (player) => {
        player.loop = true;
        player.play();
    });

    return (
        <Modal animationType="fade" transparent visible={true}>
            <View className="flex-1 bg-black">
                <View className="absolute top-12 left-6 z-20">
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30"
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-1 justify-center">
                    <VideoView
                        player={player}
                        style={{ width: '100%', aspectRatio: 16 / 9 }}
                        allowsFullscreen
                        allowsPictureInPicture
                    />
                </View>

                <View className="absolute bottom-12 left-6 right-6 p-8 bg-black/40 rounded-[32px] border border-white/10">
                    <Text className="text-white/60 text-[10px] font-black uppercase tracking-[3px] mb-2">{video.category}</Text>
                    <Text className="text-white text-2xl font-black mb-4">{video.title}</Text>
                    <View className="flex-row items-center">
                        <View className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center border border-indigo-400">
                            <Ionicons name="fitness" size={16} color="white" />
                            <Text className="text-white font-black text-[10px] ml-2 uppercase">Wellness Routine</Text>
                        </View>
                        <View className="ml-4 bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                            <Text className="text-white/80 font-bold text-[10px] uppercase">{video.duration}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
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

const styles = StyleSheet.create({
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    },
});
