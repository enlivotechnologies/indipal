import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type MoodType = 'Happy' | 'Calm' | 'Sad' | 'Stressed' | 'Tired';
export type MedicationStatus = 'active' | 'pending_review' | 'refill_requested' | 'archived';

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    time?: string;
    prescriptionImage?: string;
    status: MedicationStatus;
    startDate: string;
    addedBy: 'senior' | 'family';
    color: string;
    takenToday?: boolean;
}

export interface HealthRecord {
    mood?: {
        type: MoodType;
        note?: string;
        timestamp: string;
    };
    bloodPressure?: {
        systolic: number;
        diastolic: number;
        note?: string;
        timestamp: string;
    };
    bloodSugar?: {
        level: number;
        type: 'Fasting' | 'Post-meal';
        timestamp: string;
    };
    weight?: {
        value: number;
        timestamp: string;
    };
    water?: {
        glasses: number;
        goal: number;
        timestamp: string;
    };
    heartRate?: {
        bpm: number;
        timestamp: string;
    };
    temperature?: {
        value: number;
        unit: 'C' | 'F';
        timestamp: string;
    };
}

export interface HealthHistory {
    bloodPressure: Array<{ systolic: number; diastolic: number; timestamp: string }>;
    bloodSugar: Array<{ level: number; timestamp: string }>;
    heartRate: Array<{ bpm: number; timestamp: string }>;
    temperature: Array<{ value: number; unit: 'C' | 'F'; timestamp: string }>;
}

interface HealthState {
    records: HealthRecord;
    updateMood: (mood: HealthRecord['mood']) => void;
    updateBloodPressure: (bp: HealthRecord['bloodPressure']) => void;
    updateBloodSugar: (sugar: HealthRecord['bloodSugar']) => void;
    updateWeight: (weight: HealthRecord['weight']) => void;
    updateWater: (water: HealthRecord['water']) => void;
    history: HealthHistory;
    medications: Medication[];
    addHealthData: (data: { bp?: { systolic: number; diastolic: number }, sugar?: number, heartRate?: number, temp?: { value: number, unit: 'C' | 'F' } }) => void;
    addMedication: (med: Omit<Medication, 'id' | 'startDate' | 'status'>) => void;
    updateMedicationStatus: (id: string, status: MedicationStatus) => void;
    requestRefill: (id: string) => void;
    toggleMedicationTaken: (id: string) => void;
}

const DEFAULT_GOAL = 8;
const INITIAL_HISTORY: HealthHistory = {
    bloodPressure: [],
    bloodSugar: [],
    heartRate: [],
    temperature: []
};

export const useHealthStore = create<HealthState>()(
    persist(
        (set) => ({
            records: {
                water: {
                    glasses: 0,
                    goal: DEFAULT_GOAL,
                    timestamp: new Date().toISOString()
                }
            },
            updateMood: (mood) => set((state) => ({
                records: { ...state.records, mood }
            })),
            updateBloodPressure: (bloodPressure) => set((state) => ({
                records: { ...state.records, bloodPressure }
            })),
            updateBloodSugar: (bloodSugar) => set((state) => ({
                records: { ...state.records, bloodSugar }
            })),
            updateWeight: (weight) => set((state) => ({
                records: { ...state.records, weight }
            })),
            updateWater: (water) => set((state) => ({
                records: { ...state.records, water }
            })),
            history: INITIAL_HISTORY,
            addHealthData: (data) => set((state) => {
                const now = new Date().toISOString();
                const newHistory = state.history ? { ...state.history } : { ...INITIAL_HISTORY };
                let newRecords = { ...state.records };

                if (data.bp) {
                    newHistory.bloodPressure = [...(newHistory.bloodPressure || []), { ...data.bp, timestamp: now }];
                    newRecords.bloodPressure = { systolic: data.bp.systolic, diastolic: data.bp.diastolic, timestamp: now };
                }
                if (data.sugar) {
                    newHistory.bloodSugar = [...(newHistory.bloodSugar || []), { level: data.sugar, timestamp: now }];
                    newRecords.bloodSugar = { level: data.sugar, type: 'Fasting', timestamp: now };
                }
                if (data.heartRate) {
                    newHistory.heartRate = [...(newHistory.heartRate || []), { bpm: data.heartRate, timestamp: now }];
                    newRecords.heartRate = { bpm: data.heartRate, timestamp: now };
                }
                if (data.temp) {
                    newHistory.temperature = [...(newHistory.temperature || []), { value: data.temp.value, unit: data.temp.unit, timestamp: now }];
                    newRecords.temperature = { value: data.temp.value, unit: data.temp.unit, timestamp: now };
                }

                return { history: newHistory, records: newRecords };
            }),
            medications: [
                { id: "1", name: "Amlodipine", dosage: "5mg", time: "08:00 AM", frequency: "Daily", status: "active", startDate: new Date().toISOString(), addedBy: "family", color: "#6E5BFF" },
                { id: "2", name: "Metformin", dosage: "500mg", time: "01:00 PM", frequency: "Daily", status: "active", startDate: new Date().toISOString(), addedBy: "family", color: "#3BB273" },
                { id: "3", name: "Atorvastatin", dosage: "10mg", time: "08:00 PM", frequency: "Daily", status: "active", startDate: new Date().toISOString(), addedBy: "family", color: "#FFB800" },
            ],
            addMedication: (med) => set((state) => ({
                medications: [
                    ...state.medications,
                    {
                        ...med,
                        id: Math.random().toString(36).substr(2, 9),
                        status: med.addedBy === 'family' ? 'active' : 'pending_review',
                        startDate: new Date().toISOString(),
                    }
                ]
            })),
            updateMedicationStatus: (id, status) => set((state) => ({
                medications: state.medications.map(m => m.id === id ? { ...m, status } : m)
            })),
            requestRefill: (id) => set((state) => ({
                medications: state.medications.map(m => m.id === id ? { ...m, status: 'refill_requested' } : m)
            })),
            toggleMedicationTaken: (id) => set((state) => ({
                medications: state.medications.map(m => m.id === id ? { ...m, takenToday: !m.takenToday } : m)
            })),
        }),
        {
            name: 'enlivo-health-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
