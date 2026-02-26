import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FD_MODE = { fast: 1 };
const FD_LANDMARKS = { none: 0 };
const FD_CLASSIFICATIONS = { none: 0 };
const BRAND_ORANGE = '#F97316';

export default function FamilyCallScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { type, partnerName, partnerAvatar } = useLocalSearchParams();

    const [status, setStatus] = useState<'idle' | 'calling' | 'ringing' | 'connecting' | 'active' | 'ended' | 'rejected' | 'no-answer'>('calling');
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [, requestPermission] = useCameraPermissions();
    const [faceDetected, setFaceDetected] = useState(true);
    const [hasDetectedOnce, setHasDetectedOnce] = useState(false);
    const lastFaceDetectionTime = useRef(Date.now());

    const pulseValue = useSharedValue(1);

    useEffect(() => {
        if (type === 'video' && status === 'active' && !isCameraOff) {
            const interval = setInterval(() => {
                const now = Date.now();
                if (hasDetectedOnce && now - lastFaceDetectionTime.current > 3000) {
                    setFaceDetected(false);
                } else {
                    setFaceDetected(true);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [type, status, isCameraOff, hasDetectedOnce]);

    useEffect(() => {
        StatusBar.setBarStyle('light-content');
        if (type === 'video') {
            requestPermission();
        }

        const rxTimeout = setTimeout(() => {
            setStatus(current => {
                if (current === 'calling') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    return 'ringing';
                }
                return current;
            });
        }, 1500);

        const cnTimeout = setTimeout(() => {
            setStatus(current => {
                if (current === 'ringing') return 'connecting';
                return current;
            });
        }, 4500);

        const acTimeout = setTimeout(() => {
            setStatus(current => {
                if (current === 'connecting') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    return 'active';
                }
                return current;
            });
        }, 6000);

        const naTimeout = setTimeout(() => {
            setStatus(current => {
                if (current !== 'active' && current !== 'ended' && current !== 'rejected') return 'no-answer';
                return current;
            });
        }, 30000);

        pulseValue.value = withRepeat(withTiming(1.2, { duration: 1000 }), -1, true);

        return () => {
            StatusBar.setBarStyle('dark-content');
            clearTimeout(rxTimeout);
            clearTimeout(cnTimeout);
            clearTimeout(acTimeout);
            clearTimeout(naTimeout);
        };
    }, [type, pulseValue, requestPermission]);

    useEffect(() => {
        let timer: any;
        if (status === 'active') {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [status]);

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleEndCall = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setStatus('ended');
        setTimeout(() => {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(family)/home');
            }
        }, 1500);
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseValue.value }],
        opacity: interpolate(pulseValue.value, [1, 1.2], [1, 0.5])
    }));

    if (type === 'video' && status === 'active' && !isCameraOff) {
        return (
            <View style={{ flex: 1, backgroundColor: '#000' }}>
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="front"
                    // @ts-ignore
                    onFacesDetected={({ faces }: any) => {
                        if (faces && faces.length > 0) {
                            lastFaceDetectionTime.current = Date.now();
                            if (!hasDetectedOnce) setHasDetectedOnce(true);
                        }
                    }}
                    // @ts-ignore
                    faceDetectorSettings={{
                        mode: FD_MODE.fast,
                        detectLandmarks: FD_LANDMARKS.none,
                        runClassifications: FD_CLASSIFICATIONS.none,
                        minDetectionInterval: 100,
                        tracking: true,
                    }}
                />

                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />

                {!faceDetected && (
                    <Animated.View entering={FadeInDown} className="absolute top-1/2 left-0 right-0 items-center z-50">
                        <View className="bg-red-500/90 px-6 py-3 rounded-2xl border border-red-400">
                            <Text className="text-white font-black uppercase text-xs tracking-widest">Face Not Detected</Text>
                        </View>
                    </Animated.View>
                )}

                <View style={{ paddingTop: insets.top + 20 }} className="px-6 items-center">
                    <View className="bg-black/40 px-4 py-2 rounded-full border border-white/20">
                        <Text className="text-white font-black text-xs uppercase tracking-widest">{partnerName}</Text>
                    </View>
                    <Text className="text-white/60 font-bold text-[10px] mt-2 uppercase tracking-[4px]">{formatDuration(duration)}</Text>
                </View>

                <View style={{ paddingBottom: insets.bottom + 40 }} className="absolute bottom-0 left-0 right-0 px-10">
                    <View className="flex-row justify-between items-center">
                        <CallControl
                            icon={isMuted ? "mic-off" : "mic"}
                            label={isMuted ? "Unmute" : "Mute"}
                            active={isMuted}
                            onPress={() => setIsMuted(!isMuted)}
                        />
                        <TouchableOpacity
                            onPress={handleEndCall}
                            className="w-20 h-20 bg-red-500 rounded-full items-center justify-center shadow-2xl shadow-red-900"
                        >
                            <Ionicons name="call-outline" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
                        </TouchableOpacity>
                        <CallControl
                            icon={isCameraOff ? "videocam-off" : "videocam"}
                            label={isCameraOff ? "Video On" : "Video Off"}
                            active={isCameraOff}
                            onPress={() => setIsCameraOff(!isCameraOff)}
                        />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
            <View className="absolute inset-0 items-center justify-center opacity-20">
                <Animated.View style={[pulseStyle]} className="w-[500px] h-[500px] rounded-full bg-orange-500/20" />
            </View>

            <View style={{ paddingTop: insets.top + 100 }} className="items-center px-10">
                <Animated.View entering={FadeIn.delay(200)}>
                    <View className="relative">
                        <Animated.View style={[pulseStyle]} className="absolute inset-0 bg-orange-500/30 rounded-[64px]" />
                        <View className="w-40 h-40 bg-slate-800 rounded-[64px] items-center justify-center border-2 border-orange-500 overflow-hidden">
                            {partnerAvatar ? (
                                <Image source={{ uri: partnerAvatar as string }} className="w-full h-full" />
                            ) : (
                                <Ionicons name="person" size={64} color={BRAND_ORANGE} />
                            )}
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400)} className="items-center mt-12">
                    <Text className="text-3xl font-black text-white">{partnerName}</Text>

                    <View className="flex-row items-center bg-white/5 px-6 py-3 rounded-full mt-6 border border-white/10">
                        {status === 'calling' && <ActivityIndicator size="small" color={BRAND_ORANGE} style={{ marginRight: 12 }} />}
                        {status === 'ringing' && <Ionicons name="notifications" size={16} color={BRAND_ORANGE} style={{ marginRight: 12 }} />}
                        {status === 'connecting' && <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 12 }} />}
                        <Text className={`font-black uppercase tracking-[4px] text-xs ${status === 'active' ? 'text-white' : 'text-orange-500'}`}>
                            {status === 'calling' ? 'Calling...' :
                                status === 'ringing' ? 'Ringing...' :
                                    status === 'connecting' ? 'Connecting...' :
                                        status === 'ended' ? 'Call ended' :
                                            status === 'no-answer' ? 'No Answer' :
                                                status === 'rejected' ? 'Call Declined' :
                                                    `Active • ${formatDuration(duration)}`}
                        </Text>
                    </View>

                    <View className="mt-12 flex-row items-center">
                        <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.3)" />
                        <Text className="text-[10px] font-bold text-white/30 uppercase tracking-[2px] ml-2">End-to-End Encrypted</Text>
                    </View>
                </Animated.View>
            </View>

            <View style={{ paddingBottom: insets.bottom + 60 }} className="absolute bottom-0 left-0 right-0 px-10">
                <View className="flex-row justify-between items-center">
                    <CallControl
                        icon={isMuted ? "mic-off" : "mic"}
                        label={isMuted ? "Unmute" : "Mute"}
                        active={isMuted}
                        onPress={() => setIsMuted(!isMuted)}
                    />
                    <TouchableOpacity
                        onPress={handleEndCall}
                        className="w-20 h-20 bg-red-500 rounded-full items-center justify-center shadow-2xl shadow-red-900"
                    >
                        <Ionicons name="call-outline" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
                    </TouchableOpacity>
                    <CallControl
                        icon="volume-high"
                        label="Speaker"
                        active={false}
                        onPress={() => { }}
                    />
                </View>
            </View>
        </View>
    );
}

function CallControl({ icon, label, active, onPress }: any) {
    return (
        <View className="items-center">
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }}
                className={`w-14 h-14 rounded-[22px] items-center justify-center border ${active ? 'bg-white border-white' : 'bg-white/10 border-white/20'}`}
            >
                <Ionicons name={icon} size={24} color={active ? "#0F172A" : "white"} />
            </TouchableOpacity>
            <Text className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-3">{label}</Text>
        </View>
    );
}
