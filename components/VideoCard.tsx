import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp } from 'react-native-reanimated';
import { WellnessVideo } from "../store/wellnessStore";

interface VideoCardProps {
    video: WellnessVideo;
    onPlay: (video: WellnessVideo) => void;
    onToggleSave: (id: string) => void;
    onShare?: (video: WellnessVideo) => void;
    isPal?: boolean;
    conditionMatch?: boolean;
    delay?: number;
}

const BRAND_PURPLE = '#6E5BFF';

export const VideoCard: React.FC<VideoCardProps> = ({
    video,
    onPlay,
    onToggleSave,
    onShare,
    isPal,
    conditionMatch,
    delay = 0
}) => {
    return (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(600)}
            className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm mb-5"
        >
            <View className="h-48 relative">
                <Image
                    source={{ uri: video.thumbnail }}
                    className="w-full h-full"
                    resizeMode="cover"
                />

                {/* Condition Match Badge */}
                {conditionMatch && (
                    <View className="absolute top-4 right-16 bg-emerald-500 px-3 py-1.5 rounded-xl border border-emerald-400">
                        <Text className="text-white text-[8px] font-black uppercase tracking-widest">Recommended</Text>
                    </View>
                )}

                {/* Family Recommended Badge */}
                {video.isFamilyRecommended && (
                    <View className="absolute top-14 left-4 bg-[#F59E0B] px-3 py-1.5 rounded-xl border border-orange-300 shadow-sm">
                        <View className="flex-row items-center">
                            <Ionicons name="heart" size={10} color="white" />
                            <Text className="text-white text-[8px] font-black uppercase tracking-widest ml-1">Family Recommended</Text>
                        </View>
                    </View>
                )}

                <View className="absolute top-4 right-4 bg-black/50 px-3 py-1.5 rounded-xl">
                    <Text className="text-white text-[10px] font-black">{video.duration}</Text>
                </View>

                {/* Play Button Overlay */}
                <TouchableOpacity
                    onPress={() => onPlay(video)}
                    activeOpacity={0.8}
                    className="absolute inset-0 items-center justify-center bg-black/10"
                >
                    <View className="w-16 h-16 bg-white/90 rounded-full items-center justify-center shadow-xl">
                        <Ionicons name="play" size={32} color={BRAND_PURPLE} style={{ marginLeft: 4 }} />
                    </View>
                </TouchableOpacity>

                {/* Saved Toggle */}
                <TouchableOpacity
                    onPress={() => onToggleSave(video.id)}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-md"
                >
                    <Ionicons
                        name={video.saved ? "bookmark" : "bookmark-outline"}
                        size={20}
                        color={BRAND_PURPLE}
                    />
                </TouchableOpacity>
            </View>

            <View className="p-5">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-4">
                        <Text className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-1">
                            {video.category}
                        </Text>
                        <Text className="text-gray-900 font-bold text-lg leading-tight">
                            {video.title}
                        </Text>
                    </View>

                    {/* Share Button (For Family -> Senior SMS logic) */}
                    {onShare && (
                        <TouchableOpacity
                            onPress={() => onShare(video)}
                            className="bg-indigo-50 w-10 h-10 rounded-xl items-center justify-center border border-indigo-100"
                        >
                            <Ionicons name="share-social-outline" size={20} color={BRAND_PURPLE} />
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <Ionicons name="eye-outline" size={14} color="#9CA3AF" />
                        <Text className="text-gray-400 text-[10px] font-bold ml-1.5">{video.views}</Text>
                    </View>

                    {isPal && (
                        <View className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center">
                            <Ionicons name="people" size={14} color="white" />
                            <Text className="text-white text-[10px] font-black ml-2 uppercase">Pal Guided</Text>
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};
