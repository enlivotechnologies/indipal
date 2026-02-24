import { useHealthStore } from '@/store/healthStore';
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import React from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const BRAND_PURPLE = '#6E5BFF';

export default function HealthDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();
    const { history, records } = useHealthStore();
    const [filter, setFilter] = React.useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');

    const activeTab = pathname.includes('home') ? 'Home' :
        pathname.includes('services') ? 'Services' :
            pathname.includes('health') ? 'Health' :
                pathname.includes('video') ? 'Video' : 'Home';

    const handleTabPress = (tab: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (tab === 'Home') router.replace('/(senior)/home' as any);
        if (tab === 'Services') router.replace('/(senior)/services' as any);
        if (tab === 'Health') router.replace('/(senior)/health' as any);
        if (tab === 'Video') router.replace('/(senior)/video' as any);
    };

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
            const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            if (filter === 'Daily') return diffHours <= 24;
            if (filter === 'Weekly') return diffHours <= 24 * 7;
            if (filter === 'Monthly') return diffHours <= 24 * 30;
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

        const ensureVariance = (arr: number[]) => {
            if (arr.length <= 1) return arr;
            let min = Math.min(...arr);
            let max = Math.max(...arr);
            if (Math.abs(max - min) < 0.1) {
                let newArr = [...arr];
                newArr[0] += 1;
                newArr[newArr.length - 1] -= 1;
                return newArr;
            }
            return arr;
        };

        if (dataArrays.length > 0) {
            if (typeof dataArrays[0] === 'number') {
                dataArrays = ensureVariance(dataArrays.map(Number)) as any;
            } else if (Array.isArray(dataArrays[0])) {
                let sys = dataArrays.map((a: any) => Number(a[0]));
                let dia = dataArrays.map((a: any) => Number(a[1]));
                let vSys = ensureVariance(sys);
                let vDia = ensureVariance(dia);
                dataArrays = dataArrays.map((_, i) => [vSys[i], vDia[i]]);
            }
        }

        return { labels, dataArrays };
    };

    const bpChart = getChartData(history.bloodPressure, (b) => [b.systolic, b.diastolic]);
    const sugarChart = getChartData(history.bloodSugar, (b) => b.level);
    const hrChart = getChartData(history.heartRate, (b) => b.bpm);

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
                <View>
                    <Text className="text-xs font-bold text-indigo-400 uppercase tracking-widest">EnlivoCare</Text>
                    <Text className="text-2xl font-black text-gray-900">Health Stats</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-indigo-50 rounded-xl items-center justify-center border border-indigo-100"
                >
                    <Ionicons name="chevron-back" size={20} color={BRAND_PURPLE} />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: insets.bottom + 120
                }}
            >
                {/* Vitals Grid - Premium Elevated Cards */}
                <View className="flex-row flex-wrap justify-between mt-8">
                    <VitalCard
                        label="Blood Pressure"
                        value={records.bloodPressure ? `${records.bloodPressure.systolic}/${records.bloodPressure.diastolic}` : "--/--"}
                        unit="mmHg"
                        status={getBPStatus(records.bloodPressure?.systolic || 0)}
                        color={(records.bloodPressure?.systolic || 0) > 140 ? "#EF4444" : "#3BB273"}
                        icon="pulse"
                        delay={100}
                    />
                    <VitalCard
                        label="Blood Sugar"
                        value={records.bloodSugar ? records.bloodSugar.level.toString() : "--"}
                        unit="mg/dL"
                        status="Normal"
                        color="#3BB273"
                        icon="water"
                        delay={200}
                    />
                    <VitalCard
                        label="Heart Rate"
                        value={records.heartRate ? records.heartRate.bpm.toString() : "--"}
                        unit="BPM"
                        status="Stable"
                        color={BRAND_PURPLE}
                        icon="heart"
                        delay={300}
                    />
                    <VitalCard
                        label="Body Temp"
                        value={records.temperature ? records.temperature.value.toString() : "--"}
                        unit={`°${records.temperature?.unit || 'F'}`}
                        status="Normal"
                        color="#3BB273"
                        icon="thermometer"
                        delay={400}
                    />
                </View>

                {/* Filter Buttons */}
                <Animated.View entering={FadeInUp.delay(450)} className="flex-row justify-between mt-8 mb-4 bg-gray-50 p-1 rounded-2xl">
                    {['Daily', 'Weekly', 'Monthly'].map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setFilter(f as any);
                            }}
                            className={`flex-1 items-center py-2 rounded-xl ${filter === f ? 'bg-white shadow-sm' : 'bg-transparent'}`}
                        >
                            <Text className={`text-[11px] font-black uppercase tracking-widest ${filter === f ? 'text-indigo-600' : 'text-gray-400'}`}>{f}</Text>
                        </TouchableOpacity>
                    ))}
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
                ) : (
                    <EmptyGraph label="Blood Pressure" />
                )}

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
                ) : (
                    <EmptyGraph label="Blood Sugar" />
                )}

                {hrChart ? (
                    <Animated.View entering={FadeInUp.delay(600).duration(600)} className="bg-white rounded-[32px] p-4 border border-gray-100 shadow-sm mb-6">
                        <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-4">Heart Rate</Text>
                        <LineChart
                            data={{
                                labels: hrChart.labels,
                                datasets: [{ data: hrChart.dataArrays as number[], color: () => BRAND_PURPLE }]
                            }}
                            width={width - 80}
                            height={160}
                            chartConfig={chartConfig}
                            bezier
                            style={{ borderRadius: 16 }}
                        />
                    </Animated.View>
                ) : null}

                {/* Medical Reports */}
                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mt-12 mb-6 ml-1">Medical Reports</Text>
                <Animated.View entering={FadeInUp.delay(600).duration(600)} className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 flex-row items-center">
                    <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
                        <Ionicons name="document-text" size={24} color={BRAND_PURPLE} />
                    </View>
                    <View className="ml-5 flex-1">
                        <Text className="text-indigo-900 font-bold text-base">Lipid Profile Test</Text>
                        <Text className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mt-1">Added 22 Feb 2024</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-white rounded-xl items-center justify-center border border-indigo-100">
                        <Ionicons name="download-outline" size={20} color={BRAND_PURPLE} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Performance CTA */}
                <TouchableOpacity
                    onPress={() => router.push('/(senior)/add-health' as any)}
                    style={styles.seniorButtonPrimary}
                    className="mt-6 bg-indigo-600 h-16 rounded-[24px] flex-row items-center justify-center gap-x-3 shadow-xl shadow-indigo-200"
                >
                    <Ionicons name="add-circle" size={22} color="white" />
                    <Text className="text-white font-black text-sm uppercase tracking-widest">Add Health Data</Text>
                </TouchableOpacity>

            </ScrollView>

            {/* Custom Floating Bottom Bar */}
            <Animated.View
                entering={FadeInUp.delay(200).duration(600)}
                className="absolute bottom-0 left-0 right-0 px-6 bg-white/10"
                style={{ paddingBottom: Math.max(insets.bottom, 20) }}
            >
                <View style={styles.tabBar} className="bg-gray-900/95 flex-row justify-between items-center h-16 rounded-[28px] px-3 shadow-2xl">
                    <TabButton icon="home" label="Home" active={activeTab === 'Home'} onPress={() => handleTabPress('Home')} />
                    <TabButton icon="grid" label="Services" active={activeTab === 'Services'} onPress={() => handleTabPress('Services')} />
                    <TabButton icon="heart" label="Health" active={activeTab === 'Health'} onPress={() => handleTabPress('Health')} />
                    <TabButton icon="videocam" label="Video" active={activeTab === 'Video'} onPress={() => handleTabPress('Video')} />
                </View>
            </Animated.View>
        </View>
    );
}

function VitalCard({ label, value, unit, status, color, icon, delay }: any) {
    return (
        <Animated.View
            entering={FadeInUp.delay(delay).duration(600)}
            className="bg-white w-[47%] rounded-[32px] p-6 mb-5 border border-gray-50 shadow-sm items-center"
        >
            <View style={{ backgroundColor: `${color}10` }} className="w-12 h-12 rounded-[18px] items-center justify-center mb-4">
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text className="text-gray-900 font-black text-2xl">{value}</Text>
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">{unit}</Text>
            <Text className="text-gray-600 font-bold text-xs mt-4">{label}</Text>
            <View style={{ backgroundColor: `${color}15` }} className="mt-4 px-3 py-1 rounded-full">
                <Text style={{ color }} className="text-[9px] font-black uppercase tracking-wider">{status}</Text>
            </View>
        </Animated.View>
    );
}

function EmptyGraph({ label }: { label: string }) {
    return (
        <Animated.View entering={FadeInUp.delay(500).duration(600)} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm mb-6 items-center justify-center min-h-[160px]">
            <Ionicons name="bar-chart-outline" size={32} color="#D1D5DB" />
            <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mt-4">No {label} Data</Text>
        </Animated.View>
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

const chartConfig = {
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    color: (opacity = 1) => `rgba(110, 91, 255, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
        fontSize: 10,
        fontWeight: 'bold',
        fill: '#9CA3AF'
    },
    propsForBackgroundLines: {
        strokeWidth: 1,
        stroke: '#F3F4F6'
    }
};

const styles = StyleSheet.create({
    header: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    tabBar: {
        ...(Platform.OS === 'ios' && { backdropFilter: 'blur(20px)' }),
    },
    seniorButtonPrimary: {
        shadowColor: BRAND_PURPLE,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    }
});
