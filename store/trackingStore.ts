import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type TrackingStatus = 'idle' | 'searching' | 'matched' | 'en_route' | 'arrived' | 'active' | 'completed';

export interface Location {
    latitude: number;
    longitude: number;
    timestamp: number;
}

export interface OrderTracking {
    orderId: string;
    palId?: string;
    palLocation?: Location;
    status: TrackingStatus;
    estimatedArrival?: string;
    lastUpdate: string;
}

interface TrackingState {
    activeTrackings: Record<string, OrderTracking>;
    startTracking: (orderId: string) => void;
    updatePalLocation: (orderId: string, location: Location) => void;
    updateStatus: (orderId: string, status: TrackingStatus) => void;
    stopTracking: (orderId: string) => void;
    getTracking: (orderId: string) => OrderTracking | undefined;
}

export const useTrackingStore = create<TrackingState>()(
    persist(
        (set, get) => ({
            activeTrackings: {},
            startTracking: (orderId) => set((state) => ({
                activeTrackings: {
                    ...state.activeTrackings,
                    [orderId]: {
                        orderId,
                        status: 'idle',
                        lastUpdate: new Date().toISOString(),
                    }
                }
            })),
            updatePalLocation: (orderId, location) => set((state) => {
                const tracking = state.activeTrackings[orderId];
                if (!tracking) return state;
                return {
                    activeTrackings: {
                        ...state.activeTrackings,
                        [orderId]: {
                            ...tracking,
                            palLocation: location,
                            lastUpdate: new Date().toISOString(),
                        }
                    }
                };
            }),
            updateStatus: (orderId, status) => set((state) => {
                const tracking = state.activeTrackings[orderId];
                if (!tracking) return state;
                return {
                    activeTrackings: {
                        ...state.activeTrackings,
                        [orderId]: {
                            ...tracking,
                            status,
                            lastUpdate: new Date().toISOString(),
                        }
                    }
                };
            }),
            stopTracking: (orderId) => set((state) => {
                const { [orderId]: _, ...remaining } = state.activeTrackings;
                return { activeTrackings: remaining };
            }),
            getTracking: (orderId) => get().activeTrackings[orderId],
        }),
        {
            name: 'enlivo-tracking-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
