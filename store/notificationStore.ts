import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type NotificationType = 'alert' | 'task' | 'wallet' | 'verification' | 'support' | 'system';
export type UserRole = 'family' | 'senior' | 'pal';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    relatedEntityId?: string;
    receiverRole: UserRole;
    isRead: boolean;
    createdAt: string;
    actionRoute?: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;

    // Actions
    fetchNotifications: (role: UserRole) => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: (role: UserRole) => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            isLoading: false,

            fetchNotifications: async (role) => {
                set({ isLoading: true });
                // Mock API delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Initial mock data if empty
                const currentNotifications = get().notifications;
                if (currentNotifications.length === 0) {
                    const initialDocs: Notification[] = [
                        {
                            id: 'NTF001',
                            title: 'Verification Approved',
                            message: 'Your Government ID has been successfully verified. You now have full access to premium jobs.',
                            type: 'verification',
                            receiverRole: 'pal',
                            isRead: false,
                            createdAt: new Date(Date.now() - 3600000).toISOString(),
                            actionRoute: '/(pal)/profile'
                        },
                        {
                            id: 'NTF002',
                            title: 'New Task Assigned',
                            message: 'You have a new Morning Care assignment for Ramesh C. at 09:00 AM.',
                            type: 'task',
                            receiverRole: 'pal',
                            isRead: false,
                            createdAt: new Date(Date.now() - 86400000).toISOString(),
                            actionRoute: '/(pal)/tasks'
                        },
                        {
                            id: 'NTF004',
                            title: 'Medication Reminder',
                            message: 'It is time for your afternoon blood pressure medication. Please take 1 tablet of Amlodipine.',
                            type: 'alert',
                            receiverRole: 'senior',
                            isRead: false,
                            createdAt: new Date(Date.now() - 1800000).toISOString(),
                            actionRoute: '/(senior)/health'
                        },
                        {
                            id: 'NTF005',
                            title: 'Family Update',
                            message: 'Your son (Vivek) has scheduled a new grocery delivery for tomorrow morning.',
                            type: 'system',
                            receiverRole: 'senior',
                            isRead: false,
                            createdAt: new Date(Date.now() - 7200000).toISOString(),
                            actionRoute: '/(senior)/home'
                        },
                        {
                            id: 'NTF006',
                            title: 'Senior Alert',
                            message: 'Ramesh Chandra has triggered a check-in. Everything seems normal.',
                            type: 'alert',
                            receiverRole: 'family',
                            isRead: false,
                            createdAt: new Date(Date.now() - 5400000).toISOString(),
                            actionRoute: '/(family)/tracking'
                        },
                        {
                            id: 'NTF007',
                            title: 'Payment Required',
                            message: 'The pharmacy order for Ramesh Chandra is pending payment confirmation.',
                            type: 'wallet',
                            receiverRole: 'family',
                            isRead: false,
                            createdAt: new Date(Date.now() - 14400000).toISOString(),
                            actionRoute: '/(family)/account/notifications'
                        }
                    ];
                    const filtered = initialDocs.filter(n => n.receiverRole === role);
                    set({
                        notifications: filtered,
                        unreadCount: filtered.filter(n => !n.isRead).length,
                        isLoading: false
                    });
                } else {
                    set({ isLoading: false });
                }
            },

            markAsRead: async (id) => {
                set((state) => {
                    const updatedNotifications = state.notifications.map((n) =>
                        n.id === id ? { ...n, isRead: true } : n
                    );
                    return {
                        notifications: updatedNotifications,
                        unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
                    };
                });
                // Sync with backend mock
                await new Promise(resolve => setTimeout(resolve, 500));
            },

            markAllAsRead: async (role) => {
                set((state) => {
                    const updatedNotifications = state.notifications.map((n) =>
                        n.receiverRole === role ? { ...n, isRead: true } : n
                    );
                    return {
                        notifications: updatedNotifications,
                        unreadCount: 0,
                    };
                });
                // Sync with backend mock
                await new Promise(resolve => setTimeout(resolve, 800));
            },

            addNotification: async (notifData) => {
                const newNotif: Notification = {
                    ...notifData,
                    id: `NTF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                };

                set((state) => ({
                    notifications: [newNotif, ...state.notifications],
                    unreadCount: state.unreadCount + 1,
                }));

                // Mock backend persistence
                await new Promise(resolve => setTimeout(resolve, 500));
            },
        }),
        {
            name: 'enlivo-notification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
