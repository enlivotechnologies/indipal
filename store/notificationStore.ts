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
    allNotifications: Notification[];
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    currentRole: UserRole | null;

    // Actions
    fetchNotifications: (role: UserRole) => Promise<void>;
    markAsRead: (id: string, role: UserRole) => Promise<void>;
    markAllAsRead: (role: UserRole) => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set, get) => ({
            allNotifications: [],
            notifications: [],
            unreadCount: 0,
            isLoading: false,
            currentRole: null,

            fetchNotifications: async (role) => {
                set({ isLoading: true, currentRole: role });
                console.log(`[NotificationStore] Fetching notifications for role: ${role}`);

                // Load initial mock data if none exist or only real ones exist
                const currentAll = get().allNotifications;
                const hasMock = currentAll.some(n => n.id.startsWith('MOCK') || n.id.startsWith('NTF00'));

                if (!hasMock) {
                    const mockNotifications: Notification[] = [
                        {
                            id: 'MOCK_NTF001',
                            title: 'Verification Approved',
                            message: 'Your Government ID has been successfully verified.',
                            type: 'verification',
                            receiverRole: 'pal',
                            isRead: false,
                            createdAt: new Date(Date.now() - 3600000).toISOString(),
                            actionRoute: '/(pal)/profile'
                        },
                        {
                            id: 'MOCK_NTF006',
                            title: 'Senior Alert',
                            message: 'Ramesh Chandra has triggered a check-in.',
                            type: 'alert',
                            receiverRole: 'family',
                            isRead: false,
                            createdAt: new Date(Date.now() - 5400000).toISOString(),
                            actionRoute: '/(family)/tracking'
                        }
                    ];

                    // Merge without duplicates
                    const merged = [...currentAll, ...mockNotifications.filter(m => !currentAll.some(c => c.id === m.id))];
                    set({ allNotifications: merged });
                }

                const filtered = get().allNotifications.filter(n => n.receiverRole === role);
                console.log(`[NotificationStore] UI Updated: ${filtered.length} notifications for ${role}`);

                set({
                    notifications: filtered,
                    unreadCount: filtered.filter(n => !n.isRead).length,
                    isLoading: false
                });
            },

            markAsRead: async (id, role) => {
                const updatedAll = get().allNotifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                );
                const filtered = updatedAll.filter(n => n.receiverRole === role);

                set({
                    allNotifications: updatedAll,
                    notifications: filtered,
                    unreadCount: filtered.filter(n => !n.isRead).length,
                });
            },

            markAllAsRead: async (role) => {
                const updatedAll = get().allNotifications.map((n) =>
                    n.receiverRole === role ? { ...n, isRead: true } : n
                );
                const filtered = updatedAll.filter(n => n.receiverRole === role);

                set({
                    allNotifications: updatedAll,
                    notifications: filtered,
                    unreadCount: 0,
                });
            },

            addNotification: async (notifData) => {
                const newNotif: Notification = {
                    ...notifData,
                    id: `NTF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                };

                console.log('[NotificationStore] Adding notification:', newNotif);

                const updatedAll = [newNotif, ...get().allNotifications];
                set({ allNotifications: updatedAll });

                // Update current view if the role matches
                const activeRole = get().currentRole;
                console.log('[NotificationStore] Current active role:', activeRole);

                if (activeRole) {
                    const filtered = updatedAll.filter(n => n.receiverRole === activeRole);
                    console.log('[NotificationStore] Filtered notification count:', filtered.length);
                    set({
                        notifications: filtered,
                        unreadCount: filtered.filter(n => !n.isRead).length,
                    });
                }
            },
        }),
        {
            name: 'enlivo-notification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
