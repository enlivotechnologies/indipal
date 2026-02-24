import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type MoodType = 'Happy' | 'Calm' | 'Sad' | 'Stressed' | 'Tired';

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
}

interface HealthState {
    records: HealthRecord;
    updateMood: (mood: HealthRecord['mood']) => void;
    updateBloodPressure: (bp: HealthRecord['bloodPressure']) => void;
    updateBloodSugar: (sugar: HealthRecord['bloodSugar']) => void;
    updateWeight: (weight: HealthRecord['weight']) => void;
    updateWater: (water: HealthRecord['water']) => void;
}

const DEFAULT_GOAL = 8;

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
        }),
        {
            name: 'enlivo-health-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
