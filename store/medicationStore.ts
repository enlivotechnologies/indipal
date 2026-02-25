import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface Medication {
    id: string;
    name: string;
    dosage: string;
    time: string;
    status: 'Pending' | 'Taken';
    color: string;
    nextDoseTime: string;
}

interface MedicationState {
    medications: Medication[];
    markAsTaken: (id: string) => void;
    addMedication: (med: Omit<Medication, 'id' | 'status'>) => void;
    getNextUpcomingDose: () => Medication | undefined;
}

const INITIAL_MEDICATIONS: Medication[] = [
    { id: "1", name: "Amlodipine", dosage: "5mg", time: "08:00 AM", status: "Taken", color: "#6E5BFF", nextDoseTime: "2026-02-26T08:00:00" },
    { id: "2", name: "Metformin", dosage: "500mg", time: "01:00 PM", status: "Taken", color: "#3BB273", nextDoseTime: "2026-02-26T13:00:00" },
    { id: "3", name: "Atorvastatin", dosage: "10mg", time: "08:00 PM", status: "Pending", color: "#FFB800", nextDoseTime: "2026-02-25T20:00:00" },
];

export const useMedicationStore = create<MedicationState>()(
    persist(
        (set, get) => ({
            medications: INITIAL_MEDICATIONS,
            markAsTaken: (id) => set((state) => ({
                medications: state.medications.map(m =>
                    m.id === id ? { ...m, status: 'Taken' as const } : m
                )
            })),
            addMedication: (med) => set((state) => ({
                medications: [
                    ...state.medications,
                    {
                        ...med,
                        id: Math.random().toString(36).substr(2, 9),
                        status: 'Pending' as const
                    }
                ]
            })),
            getNextUpcomingDose: () => {
                const { medications } = get();
                const pending = medications.filter(m => m.status === 'Pending');
                if (pending.length === 0) return undefined;

                // Sort by time (this is a simple implementation, ideally use real timestamps)
                return pending[0];
            }
        }),
        {
            name: 'enlivo-medication-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
