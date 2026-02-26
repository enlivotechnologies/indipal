import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Pal {
    id: string;
    name: string;
    profileImage?: string;
    rating: number;
    experienceYears: number;
    specialization: string[];
    availability: { date: string; slots: string[] }[];
}

interface PalState {
    pals: Pal[];
    isLoading: boolean;
    fetchPals: () => Promise<void>;
    updatePalAvailability: (palId: string, date: string, slot: string) => void;
    restorePalAvailability: (palId: string, date: string, slot: string) => void;
}

export const usePalStore = create<PalState>()(
    persist(
        (set) => ({
            pals: [
                {
                    id: "PAL001",
                    name: "Arjun Singh",
                    rating: 4.9,
                    experienceYears: 5,
                    specialization: ["Morning Care", "Medical Support"],
                    availability: [
                        { date: "2026-02-26", slots: ["09:00 AM - 12:00 PM", "03:00 PM - 06:00 PM"] },
                        { date: "2026-02-27", slots: ["10:00 AM - 01:00 PM", "02:00 PM - 05:00 PM"] },
                        { date: "2026-02-28", slots: ["09:00 AM - 12:00 PM", "12:00 PM - 03:00 PM", "03:00 PM - 06:00 PM"] },
                        { date: "2026-03-01", slots: ["10:00 AM - 02:00 PM"] },
                        { date: "2026-03-02", slots: ["09:00 AM - 12:00 PM", "01:00 PM - 04:00 PM"] },
                    ],
                },
                {
                    id: "PAL002",
                    name: "Meera Reddy",
                    rating: 4.8,
                    experienceYears: 3,
                    specialization: ["Companion", "Meal Prep"],
                    availability: [
                        { date: "2026-02-26", slots: ["11:00 AM - 02:00 PM", "05:00 PM - 08:00 PM"] },
                        { date: "2026-02-27", slots: ["09:00 AM - 12:00 PM", "04:00 PM - 07:00 PM"] },
                        { date: "2026-02-28", slots: ["10:00 AM - 01:00 PM", "01:00 PM - 04:00 PM"] },
                        { date: "2026-03-01", slots: ["02:00 PM - 06:00 PM"] },
                    ],
                },
                {
                    id: "PAL003",
                    name: "Priya Verma",
                    rating: 5.0,
                    experienceYears: 7,
                    specialization: ["Elderly Care", "Dementia Care"],
                    availability: [
                        { date: "2026-02-26", slots: ["08:00 AM - 11:00 AM", "06:00 PM - 09:00 PM"] },
                        { date: "2026-02-27", slots: ["09:00 AM - 12:00 PM", "01:00 PM - 04:00 PM"] },
                        { date: "2026-02-28", slots: ["08:00 AM - 12:00 PM"] },
                        { date: "2026-03-02", slots: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"] },
                    ],
                },
            ],
            isLoading: false,
            fetchPals: async () => {
                set({ isLoading: true });
                await new Promise((resolve) => setTimeout(resolve, 500));
                set({ isLoading: false });
            },
            updatePalAvailability: (palId, date, slot) => {
                set((state) => ({
                    pals: state.pals.map((pal) => {
                        if (pal.id === palId) {
                            return {
                                ...pal,
                                availability: pal.availability.map((av) => {
                                    if (av.date === date) {
                                        return { ...av, slots: av.slots.filter((s) => s !== slot) };
                                    }
                                    return av;
                                }).filter(av => av.slots.length > 0),
                            };
                        }
                        return pal;
                    }),
                }));
            },
            restorePalAvailability: (palId, date, slot) => {
                set((state) => ({
                    pals: state.pals.map((pal) => {
                        if (pal.id === palId) {
                            const existingAvailability = pal.availability.find(av => av.date === date);
                            if (existingAvailability) {
                                return {
                                    ...pal,
                                    availability: pal.availability.map((av) => {
                                        if (av.date === date && !av.slots.includes(slot)) {
                                            return { ...av, slots: [...av.slots, slot].sort() };
                                        }
                                        return av;
                                    }),
                                };
                            } else {
                                return {
                                    ...pal,
                                    availability: [...pal.availability, { date, slots: [slot] }].sort((a, b) => a.date.localeCompare(b.date)),
                                };
                            }
                        }
                        return pal;
                    }),
                }));
            },
        }),
        {
            name: "pal-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
