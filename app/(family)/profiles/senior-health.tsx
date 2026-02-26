import { HealthHistory, useHealthStore } from '@/store/healthStore';
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const FAMILY_ORANGE = '#F59E0B';
const HEALTH_INDIGO = '#6366F1';

export default function SeniorHealthReport() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { history, records } = useHealthStore();
    const [filter, setFilter] = React.useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

    // Seed history if empty for demonstration
    const seededHistory = React.useMemo(() => {
        const seed = (key: keyof HealthHistory) => {
            const data = history[key] as any;
            if (data && data.length > 0) return data;
            // Generate 7 days of data
            return Array.from({ length: 7 }).map((_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (7 - i));
                if (key === 'bloodPressure') return { systolic: 120 + i, diastolic: 80 + (i % 3), timestamp: d.toISOString() };
                if (key === 'bloodSugar') return { level: 90 + (i * 2), timestamp: d.toISOString() };
                if (key === 'heartRate') return { bpm: 72 + (i % 5), timestamp: d.toISOString() };
                return { value: 98.6, unit: 'F', timestamp: d.toISOString() };
            });
        };
        return {
            bloodPressure: seed('bloodPressure') as any,
            bloodSugar: seed('bloodSugar') as any,
            heartRate: seed('heartRate') as any,
            temperature: seed('temperature') as any,
        };
    }, [history]);

    const getBPStatus = (sys: number) => {
        if (!sys) return "No Data";
        if (sys > 140) return "High";
        if (sys < 90) return "Low";
        return "Normal";
    };

    const getChartData = (arr: any[], valueMapper: (item: any) => any) => {
        const now = new Date();
        const filtered = (arr || []).filter(item => {
            if (!item?.timestamp) return false;
            const date = new Date(item.timestamp);
            const diffMs = now.getTime() - date.getTime();
            const diffHours = diffMs / (1000 * 60 * 60);
            const diffDays = diffHours / 24;

            if (filter === 'Daily') return diffHours <= 24;
            if (filter === 'Weekly') return diffDays <= 7;
            if (filter === 'Monthly') return diffDays <= 30;
            return true;
        });

        if (filtered.length === 0) return null;

        let sliced = filtered.slice(-6);
        let labels = sliced.map(item => {
            const date = new Date(item.timestamp);
            if (filter === 'Daily') {
                const h = date.getHours();
                return `${h > 12 ? h - 12 : h === 0 ? 12 : h}${h >= 12 ? 'p' : 'a'}`;
            }
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });

        let dataArrays = sliced.map(valueMapper);

        if (sliced.length === 1) {
            labels = [labels[0], "Now"];
            dataArrays = [dataArrays[0], dataArrays[0]];
        }

        return { labels, dataArrays };
    };

    const bpChart = getChartData(seededHistory.bloodPressure, (b) => [b.systolic, b.diastolic]);
    const sugarChart = getChartData(seededHistory.bloodSugar, (b) => b.level);
    const hrChart = getChartData(seededHistory.heartRate, (b) => b.bpm);

    return (
        <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
            {/* Header */}
            <View
                style={[
                    styles.header,
                    { paddingTop: Math.max(insets.top, 16), paddingBottom: 16 }
                ]}
                className="px-6 flex-row justify-between items-center bg-white"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={20} color="#1F2937" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="text-xl font-black text-gray-900">Health Report</Text>
                    <Text className="text-[10px] font-bold text-orange-500 uppercase tracking-[3px]">Senior Vitality Index</Text>
                </View>
                <TouchableOpacity
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center border border-orange-100"
                >
                    <Ionicons name="share-outline" size={20} color={FAMILY_ORANGE} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 40
                }}
            >
                {/* Vitals Grid */}
                <View className="flex-row flex-wrap justify-between mt-8">
                    <VitalCard
                        label="Blood Pressure"
                        value={records.bloodPressure ? `${records.bloodPressure.systolic}/${records.bloodPressure.diastolic}` : "120/80"}
                        unit="mmHg"
                        status={getBPStatus(records.bloodPressure?.systolic || 120)}
                        color="#10B981"
                        icon="pulse"
                        delay={100}
                    />
                    <VitalCard
                        label="Blood Sugar"
                        value={records.bloodSugar ? records.bloodSugar.level.toString() : "94"}
                        unit="mg/dL"
                        status="Normal"
                        color="#F59E0B"
                        icon="water"
                        delay={200}
                    />
                    <VitalCard
                        label="Heart Rate"
                        value={records.heartRate ? records.heartRate.bpm.toString() : "72"}
                        unit="BPM"
                        status="Stable"
                        color="#6366F1"
                        icon="heart"
                        delay={300}
                    />
                    <VitalCard
                        label="Body Temp"
                        value={records.temperature ? records.temperature.value.toString() : "98.6"}
                        unit={`°${records.temperature?.unit || 'F'}`}
                        status="Normal"
                        color="#EC4899"
                        icon="thermometer"
                        delay={400}
                    />
                </View>

                {/* Filter Bar */}
                <Animated.View entering={FadeInUp.delay(450)} className="flex-row justify-between mt-8 mb-6 bg-orange-50/50 p-1.5 rounded-[20px] border border-orange-100/50">
                    {['Daily', 'Weekly', 'Monthly'].map((f) => {
                        const isActive = filter === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setFilter(f as any);
                                }}
                                style={{
                                    backgroundColor: isActive ? 'white' : 'transparent',
                                    borderColor: isActive ? '#FFEDD5' : 'transparent',
                                    borderWidth: isActive ? 1 : 0,
                                    shadowOpacity: isActive ? 0.05 : 0,
                                }}
                                className="flex-1 items-center py-3 rounded-[15px]"
                            >
                                <Text
                                    style={{ color: isActive ? FAMILY_ORANGE : '#9CA3AF' }}
                                    className="text-[10px] font-black uppercase tracking-[2px]"
                                >
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </Animated.View>

                {/* Charts */}
                {bpChart ? (
                    <Animated.View entering={FadeInUp.delay(500).duration(600)} className="bg-white rounded-[32px] p-4 border border-gray-100 shadow-sm mb-6">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">Blood Pressure Trends</Text>
                        <LineChart
                            data={{
                                labels: bpChart.labels,
                                datasets: [
                                    { data: bpChart.dataArrays.map((a: any) => a[0]), color: () => '#EF4444' },
                                    { data: bpChart.dataArrays.map((a: any) => a[1]), color: () => '#3BB273' }
                                ]
                            }}
                            width={width - 80}
                            height={180}
                            chartConfig={chartConfig}
                            bezier
                            withDots={true}
                            style={{ borderRadius: 16 }}
                        />
                    </Animated.View>
                ) : null}

                {sugarChart ? (
                    <Animated.View entering={FadeInUp.delay(550).duration(600)} className="bg-white rounded-[32px] p-4 border border-gray-100 shadow-sm mb-6">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">Blood Sugar</Text>
                        <LineChart
                            data={{
                                labels: sugarChart.labels,
                                datasets: [{ data: sugarChart.dataArrays as number[], color: () => '#3BB273' }]
                            }}
                            width={width - 80}
                            height={160}
                            chartConfig={chartConfig}
                            bezier
                            style={{ borderRadius: 16 }}
                        />
                    </Animated.View>
                ) : null}

                {hrChart ? (
                    <Animated.View entering={FadeInUp.delay(600).duration(600)} className="bg-white rounded-[32px] p-4 border border-gray-100 shadow-sm mb-6">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">Heart Rate</Text>
                        <LineChart
                            data={{
                                labels: hrChart.labels,
                                datasets: [{ data: hrChart.dataArrays as number[], color: () => HEALTH_INDIGO }]
                            }}
                            width={width - 80}
                            height={160}
                            chartConfig={chartConfig}
                            bezier
                            style={{ borderRadius: 16 }}
                        />
                    </Animated.View>
                ) : null}

                {/* Medical Reports Snapshot */}
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mt-12 mb-6 ml-1">Latest Medical Reports</Text>
                <Animated.View entering={FadeInUp.delay(600).duration(600)} className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex-row items-center mb-10">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                        <Ionicons name="document-text" size={24} color={FAMILY_ORANGE} />
                    </View>
                    <View className="ml-5 flex-1">
                        <Text className="text-gray-900 font-bold text-base">Lipid Profile Test</Text>
                        <Text className="text-orange-500 text-[10px] font-black uppercase tracking-widest mt-1">22 Feb 2024</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-orange-100">
                        <Ionicons name="eye-outline" size={20} color={FAMILY_ORANGE} />
                    </TouchableOpacity>
                </Animated.View>

            </ScrollView>
        </View>
    );
}

function VitalCard({ label, value, unit, status, color, icon, delay }: any) {
    return (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(600)}
            className="bg-white w-[48%] rounded-[32px] p-6 mb-5 border-2 border-gray-50 shadow-sm"
            style={{
                shadowColor: color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 2
            }}
        >
            <View style={{ backgroundColor: `${color}10` }} className="w-12 h-12 rounded-[18px] items-center justify-center mb-6">
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text className="text-gray-900 font-black text-2xl tracking-tighter">{value}</Text>
                <Text className="text-gray-400 text-[9px] font-black uppercase tracking-[2px] mt-1">{unit}</Text>
            </View>
            <Text className="text-gray-900 font-bold text-xs mt-6">{label}</Text>
            <View style={{ backgroundColor: `${color}15`, alignSelf: 'flex-start' }} className="mt-3 px-3 py-1 rounded-full">
                <Text style={{ color }} className="text-[8px] font-black uppercase tracking-widest">{status}</Text>
            </View>
        </Animated.View>
    );
}

const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
        fontSize: 10,
        fontWeight: '900',
        fill: '#F59E0B'
    },
    propsForBackgroundLines: {
        strokeWidth: 1,
        stroke: '#FFF7ED'
    }
};

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    }
});
