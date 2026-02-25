import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type GigStatus =
    | 'pending'
    | 'pending_approval'
    | 'approved_and_assigned'
    | 'matched'
    | 'active'
    | 'completed';

export interface GroceryItem {
    id: string;
    name: string;
    quantity: string;
    checked: boolean;
}

export interface Gig {
    id: string;
    seniorId: string;
    seniorName: string;
    familyId?: string;
    palId?: string;
    palName?: string;
    status: GigStatus;
    category: 'Grocery' | 'Medicine' | 'Assistance';
    items: GroceryItem[];
    budget?: number;
    timestamp: string;
    approvedByFamily: boolean;
    paymentGuaranteed: boolean;
    type?: string;
    prescriptionImage?: string;
    receiptImage?: string;
    medicationDetails?: {
        name: string;
        dosage: string;
        frequency: string;
    };
}

interface GigState {
    gigs: Gig[];
    addGig: (gig: Omit<Gig, 'id' | 'timestamp' | 'approvedByFamily' | 'paymentGuaranteed'>) => void;
    updateGigStatus: (gigId: string, status: GigStatus) => void;
    approveGig: (gigId: string, updates: Partial<Pick<Gig, 'items' | 'budget'>>) => void;
    assignPal: (gigId: string, palId: string, palName: string) => void;
    toggleItem: (gigId: string, itemId: string) => void;
}

export const useGigStore = create<GigState>()(
    persist(
        (set) => ({
            gigs: [
                {
                    id: 'mock-1',
                    seniorId: 'senior_1',
                    seniorName: 'Ramesh Chandra',
                    familyId: 'family_1',
                    status: 'pending_approval',
                    category: 'Grocery',
                    items: [
                        { id: 'i1', name: 'A2 Milk', quantity: '2L', checked: false },
                        { id: 'i2', name: 'Fresh Spinach', quantity: '1 Bunch', checked: false },
                    ],
                    timestamp: new Date().toISOString(),
                    approvedByFamily: false,
                    paymentGuaranteed: false,
                }
            ],
            addGig: (gigData) => set((state) => ({
                gigs: [
                    {
                        ...gigData,
                        id: Math.random().toString(36).substr(2, 9),
                        timestamp: new Date().toISOString(),
                        approvedByFamily: false,
                        paymentGuaranteed: false,
                    },
                    ...state.gigs
                ]
            })),
            updateGigStatus: (gigId, status) => set((state) => ({
                gigs: state.gigs.map((g) => g.id === gigId ? { ...g, status } : g)
            })),
            approveGig: (gigId, updates) => set((state) => ({
                gigs: state.gigs.map((g) =>
                    g.id === gigId
                        ? {
                            ...g,
                            ...updates,
                            status: 'approved_and_assigned',
                            approvedByFamily: true,
                            paymentGuaranteed: true
                        }
                        : g
                )
            })),
            assignPal: (gigId, palId, palName) => set((state) => ({
                gigs: state.gigs.map((g) => g.id === gigId ? { ...g, palId, palName, status: 'matched' } : g)
            })),
            toggleItem: (gigId, itemId) => set((state) => ({
                gigs: state.gigs.map((g) =>
                    g.id === gigId
                        ? {
                            ...g,
                            items: g.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i)
                        }
                        : g
                )
            })),
        }),
        {
            name: 'enlivo-gig-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
