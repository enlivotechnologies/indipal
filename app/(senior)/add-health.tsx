import { useHealthStore } from '@/store/healthStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND_PURPLE = '#6E5BFF';

export default function AddHealthDataScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { addHealthData } = useHealthStore();

    const [systolic, setSystolic] = useState('');
    const [diastolic, setDiastolic] = useState('');
    const [bloodSugar, setBloodSugar] = useState('');
    const [heartRate, setHeartRate] = useState('');
    const [temperature, setTemperature] = useState('');
    const [tempUnit, setTempUnit] = useState<'C' | 'F'>('F');

    const handleSave = () => {
        const sys = parseInt(systolic);
        const dia = parseInt(diastolic);
        const sugar = parseInt(bloodSugar);
        const hr = parseInt(heartRate);
        const temp = parseFloat(temperature);

        let hasData = false;
        let healthData: any = {};

        if (systolic || diastolic) {
            if (!sys || !dia || sys < 50 || sys > 250 || dia < 30 || dia > 150) {
                Alert.alert("Invalid Input", "Please enter valid Blood Pressure values (e.g., 120/80).");
                return;
            }
            healthData.bp = { systolic: sys, diastolic: dia };
            hasData = true;
        }

        if (bloodSugar) {
            if (!sugar || sugar < 20 || sugar > 600) {
                Alert.alert("Invalid Input", "Please enter a valid Blood Sugar level.");
                return;
            }
            healthData.sugar = sugar;
            hasData = true;
        }

        if (heartRate) {
            if (!hr || hr < 30 || hr > 250) {
                Alert.alert("Invalid Input", "Please enter a valid Heart Rate.");
                return;
            }
            healthData.heartRate = hr;
            hasData = true;
        }

        if (temperature) {
            if (!temp || temp < 30 || temp > 110) {
                Alert.alert("Invalid Input", "Please enter a valid Body Temperature.");
                return;
            }
            healthData.temp = { value: temp, unit: tempUnit };
            hasData = true;
        }

        if (!hasData) {
            Alert.alert("No Data", "Please enter at least one health metric to save.");
            return;
        }

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        addHealthData(healthData);
        router.back();
    };

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <View
                style={{ paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }}
                className="px-6 flex-row items-center border-b border-gray-50 bg-white"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color={BRAND_PURPLE} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-2xl font-black text-gray-900">Add Data</Text>
                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">Health Metrics</Text>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1 px-6 pt-8"
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    <Animated.View entering={FadeInUp.delay(100)} className="mb-8">
                        <Text className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 ml-1">Blood Pressure</Text>
                        <View className="flex-row items-center justify-between gap-4">
                            <View className="flex-1">
                                <TextInput
                                    value={systolic}
                                    onChangeText={setSystolic}
                                    placeholder="Systolic"
                                    keyboardType="numeric"
                                    maxLength={3}
                                    className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900 text-center"
                                />
                                <Text className="text-center text-[10px] font-bold text-gray-400 mt-2">mmHg</Text>
                            </View>
                            <Text className="text-2xl font-black text-gray-300">/</Text>
                            <View className="flex-1">
                                <TextInput
                                    value={diastolic}
                                    onChangeText={setDiastolic}
                                    placeholder="Diastolic"
                                    keyboardType="numeric"
                                    maxLength={3}
                                    className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900 text-center"
                                />
                                <Text className="text-center text-[10px] font-bold text-gray-400 mt-2">mmHg</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(200)} className="mb-8">
                        <Text className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-3 ml-1">Blood Sugar</Text>
                        <View className="flex-row items-center justify-between">
                            <TextInput
                                value={bloodSugar}
                                onChangeText={setBloodSugar}
                                placeholder="e.g. 98"
                                keyboardType="numeric"
                                maxLength={3}
                                className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900 flex-1 mr-4"
                            />
                            <View className="bg-green-50 px-4 py-3 rounded-2xl border border-green-100 items-center justify-center">
                                <Text className="text-green-700 font-black text-xs">mg/dL</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(300)} className="mb-8">
                        <Text className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 ml-1">Heart Rate</Text>
                        <View className="flex-row items-center justify-between">
                            <TextInput
                                value={heartRate}
                                onChangeText={setHeartRate}
                                placeholder="e.g. 72"
                                keyboardType="numeric"
                                maxLength={3}
                                className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900 flex-1 mr-4"
                            />
                            <View className="bg-rose-50 px-4 py-3 rounded-2xl border border-rose-100 items-center justify-center">
                                <Text className="text-rose-600 font-black text-xs">BPM</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(400)} className="mb-12">
                        <Text className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 ml-1">Body Temperature</Text>
                        <View className="flex-row items-center justify-between">
                            <TextInput
                                value={temperature}
                                onChangeText={setTemperature}
                                placeholder="e.g. 98.6"
                                keyboardType="numeric"
                                maxLength={5}
                                className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-gray-900 flex-1 mr-4"
                            />
                            <View className="flex-row bg-gray-50 rounded-2xl border border-gray-100 p-1">
                                {['F', 'C'].map((unit) => (
                                    <TouchableOpacity
                                        key={unit}
                                        onPress={() => {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            setTempUnit(unit as 'C' | 'F');
                                        }}
                                        className={`px-4 py-2 rounded-xl items-center justify-center ${tempUnit === unit ? 'bg-amber-100' : 'bg-transparent'}`}
                                    >
                                        <Text className={`font-black text-xs ${tempUnit === unit ? 'text-amber-700' : 'text-gray-400'}`}>°{unit}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </Animated.View>

                    <TouchableOpacity
                        onPress={handleSave}
                        className="bg-indigo-600 py-6 rounded-[32px] items-center shadow-xl shadow-indigo-200"
                    >
                        <Text className="text-white font-black uppercase tracking-widest text-base">Save Data</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
