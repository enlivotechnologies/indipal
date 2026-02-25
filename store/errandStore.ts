import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ErrandStatus = 'pending' | 'in-progress' | 'completed';
export type ErrandCategory = 'Grocery' | 'Pharmacy' | 'Household' | 'Medical';

export interface Errand {
    id: string;
    title: string;
    category: ErrandCategory;
    time: string;
    status: ErrandStatus;
    palName?: string;
    palId?: string;
    palImage?: string;
    items?: string[];
    priority?: 'high' | 'normal';
    timestamp: string;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'errand' | 'service' | 'alert';
    timestamp: string;
    read: boolean;
}

export interface SOSAlert {
    id: string;
    seniorName: string;
    location: string;
    timestamp: string;
    status: 'active' | 'resolved';
}

interface ErrandState {
    errands: Errand[];
    notifications: AppNotification[];
    sosAlerts: SOSAlert[];
    addErrand: (errand: Omit<Errand, 'id' | 'status' | 'timestamp'>) => void;
    updateErrandStatus: (errandId: string, status: ErrandStatus) => void;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
    markNotificationRead: (id: string) => void;
    triggerSOS: (seniorName: string, location: string) => void;
    resolveSOS: (id: string) => void;
    clearAll: () => void;
}

export const useErrandStore = create<ErrandState>()(
    persist(
        (set) => ({
            errands: [
                {
                    id: '1',
                    title: 'Medicine Refill',
                    time: 'Today, 10:30 AM',
                    status: 'in-progress',
                    category: 'Pharmacy',
                    palName: 'Arjun Singh',
                    palId: 'pal_1',
                    palImage: 'https://i.pravatar.cc/100?u=arjun',
                    timestamp: new Date().toISOString(),
                },
                {
                    id: '2',
                    title: 'Weekly Fruit & Veggies',
                    category: 'Grocery',
                    time: 'Today, 11:30 AM',
                    status: 'in-progress',
                    palName: 'Arjun Singh',
                    palId: 'pal_1',
                    palImage: 'https://i.pravatar.cc/100?u=arjun',
                    items: ['Apples', 'Bananas', 'Spinach'],
                    priority: 'high',
                    timestamp: new Date().toISOString(),
                },
            ],
            notifications: [],
            sosAlerts: [],
            addErrand: (errandData) => set((state) => {
                const newErrand: Errand = {
                    ...errandData,
                    id: Math.random().toString(36).substr(2, 9),
                    status: 'pending',
                    timestamp: new Date().toISOString(),
                };

                // Simulate notifications for all stakeholders
                const familyNotif: AppNotification = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: 'Errand Sent',
                    message: `You've assigned "${newErrand.title}" to Arjun Singh.`,
                    type: 'errand',
                    timestamp: new Date().toISOString(),
                    read: false,
                };

                const palNotif: AppNotification = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: 'New Task Assigned',
                    message: `You have a new task: "${newErrand.title}".`,
                    type: 'errand',
                    timestamp: new Date().toISOString(),
                    read: false,
                };

                const seniorNotif: AppNotification = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: 'Family Assigned a Task',
                    message: `Your family has asked Arjun Singh to help with "${newErrand.title}".`,
                    type: 'errand',
                    timestamp: new Date().toISOString(),
                    read: false,
                };

                return {
                    errands: [newErrand, ...state.errands],
                    notifications: [familyNotif, palNotif, seniorNotif, ...state.notifications]
                };
            }),
            updateErrandStatus: (errandId, status) => set((state) => {
                const updatedErrands = state.errands.map((e) =>
                    e.id === errandId ? { ...e, status } : e
                );

                const errand = state.errands.find(e => e.id === errandId);
                let newNotifs: AppNotification[] = [];

                if (errand && status === 'completed') {
                    newNotifs.push({
                        id: Math.random().toString(36).substr(2, 9),
                        title: 'Errand Completed',
                        message: `The task "${errand.title}" has been completed by ${errand.palName || 'Pal'}.`,
                        type: 'errand',
                        timestamp: new Date().toISOString(),
                        read: false,
                    });
                }

                return {
                    errands: updatedErrands,
                    notifications: [...newNotifs, ...state.notifications]
                };
            }),
            addNotification: (notifData) => set((state) => ({
                notifications: [
                    {
                        ...notifData,
                        id: Math.random().toString(36).substr(2, 9),
                        timestamp: new Date().toISOString(),
                        read: false,
                    },
                    ...state.notifications
                ]
            })),
            markNotificationRead: (id) => set((state) => ({
                notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
            })),
            triggerSOS: (seniorName, location) => set((state) => {
                const newAlert: SOSAlert = {
                    id: Math.random().toString(36).substr(2, 9),
                    seniorName,
                    location,
                    timestamp: new Date().toISOString(),
                    status: 'active'
                };

                const sosNotif: AppNotification = {
                    id: Math.random().toString(36).substr(2, 9),
                    title: 'EMERGENCY: SOS Triggered',
                    message: `${seniorName} has triggered an SOS alert! Location: ${location}. help is needed immediately.`,
                    type: 'alert',
                    timestamp: new Date().toISOString(),
                    read: false
                };

                // Alert the family and officials lively
                console.log(`[SOS] Alerting Family: ${seniorName} needs help!`);
                console.log(`[SOS] Alerting nearest Officials at ${location}...`);

                return {
                    sosAlerts: [newAlert, ...state.sosAlerts],
                    notifications: [sosNotif, ...state.notifications]
                };
            }),
            resolveSOS: (id) => set((state) => ({
                sosAlerts: state.sosAlerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a)
            })),
            clearAll: () => set({ errands: [], notifications: [], sosAlerts: [] }),
        }),
        {
            name: 'enlivo-errand-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
