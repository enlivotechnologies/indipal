import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useChatStore } from './chatStore';
import { useNotificationStore } from './notificationStore';

export type BookingStatus = 'Pending' | 'Accepted' | 'Declined' | 'Completed';

export interface Booking {
    id: string;
    palId: string;
    palName: string;
    userName: string;
    date: string;
    day: string;
    time: string;
    status: BookingStatus;
    timestamp: number;
    price: string;
    location?: string;
    requirements?: string[];
}

interface BookingState {
    bookings: Booking[];
    isLoading: boolean;
    hasNewGigs: boolean;

    // Actions
    fetchGigs: () => Promise<void>;
    acceptGig: (id: string, palId: string, palName: string) => Promise<{ success: boolean; message: string }>;
    completeGig: (id: string) => Promise<{ success: boolean }>;
    setHasNewGigs: (val: boolean) => void;
    addBooking: (booking: Omit<Booking, 'id' | 'timestamp' | 'status'>) => void;
    updateBookingStatus: (id: string, status: BookingStatus) => void;
    cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set, get) => ({
            bookings: [],
            isLoading: false,
            hasNewGigs: false,

            setHasNewGigs: (val) => set({ hasNewGigs: val }),

            fetchGigs: async () => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 800));

                const currentBookings = get().bookings;

                if (currentBookings.filter(b => b.status === 'Pending').length < 2) {
                    const newGigs: Booking[] = [
                        {
                            id: `GIG${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                            palId: '',
                            palName: '',
                            userName: 'Malati Devi',
                            date: '25 Feb 2026',
                            day: 'Wednesday',
                            time: '10:00 AM - 01:00 PM',
                            status: 'Pending',
                            timestamp: Date.now(),
                            price: '1,200',
                            location: 'Indiranagar, Sector 2',
                            requirements: ['Medicine administration', 'Light walking support', 'BP monitoring']
                        },
                        {
                            id: `GIG${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                            palId: '',
                            palName: '',
                            userName: 'Colonel Krishnan',
                            date: '25 Feb 2026',
                            day: 'Wednesday',
                            time: '02:00 PM - 05:00 PM',
                            status: 'Pending',
                            timestamp: Date.now(),
                            price: '1,500',
                            location: 'Koramangala 4th Block',
                            requirements: ['Dressing assistance', 'Meal prep', 'Reading/Conversation']
                        }
                    ];

                    const filteredNewGigs = newGigs.filter(ng => !currentBookings.some(cb => cb.userName === ng.userName && cb.status === 'Pending'));

                    if (filteredNewGigs.length > 0) {
                        set({
                            bookings: [...currentBookings, ...filteredNewGigs],
                            hasNewGigs: true
                        });
                    }
                }

                set({ isLoading: false });
            },

            acceptGig: async (id, palId, palName) => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 1500));

                const bookings = get().bookings;
                const gig = bookings.find(b => b.id === id);

                if (!gig) return { success: false, message: 'Gig not found' };
                if (gig.status !== 'Pending') return { success: false, message: 'Gig already accepted by someone else' };

                set((state) => ({
                    bookings: state.bookings.map((b) =>
                        b.id === id ? { ...b, status: 'Accepted', palId, palName } : b
                    ),
                    isLoading: false
                }));

                // Auto-create Chat for this Gig (Requirement #6)
                useChatStore.getState().createConversation(
                    palId,
                    `FAM_${gig.userName.split(' ')[0]}`,
                    gig.userName,
                    'family',
                    gig.id
                );

                // Trigger Notification
                useNotificationStore.getState().addNotification({
                    title: 'Gig Accepted',
                    message: `You have successfully accepted the gig for ${gig.userName}. Check Active Gigs for details.`,
                    type: 'task',
                    receiverRole: 'pal',
                    actionRoute: '/(pal)/active-gig'
                });

                return { success: true, message: 'Gig accepted successfully' };
            },

            completeGig: async (id) => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 1000));

                const gig = get().bookings.find(b => b.id === id);

                set((state) => ({
                    bookings: state.bookings.map((b) =>
                        b.id === id ? { ...b, status: 'Completed' } : b
                    ),
                    isLoading: false
                }));

                if (gig) {
                    useNotificationStore.getState().addNotification({
                        title: 'Payment Received',
                        message: `₹${gig.price} has been credited to your wallet for serving ${gig.userName}.`,
                        type: 'wallet',
                        receiverRole: 'pal',
                        actionRoute: '/(pal)/earnings'
                    });
                }

                return { success: true };
            },

            addBooking: (booking) => set((state) => ({
                bookings: [
                    ...state.bookings,
                    {
                        ...booking,
                        id: Math.random().toString(36).substring(7),
                        status: 'Pending',
                        timestamp: Date.now(),
                    },
                ],
            })),
            updateBookingStatus: (id, status) => set((state) => ({
                bookings: state.bookings.map((b) =>
                    b.id === id ? { ...b, status } : b
                ),
            })),
            cancelBooking: (id) => set((state) => ({
                bookings: state.bookings.filter((b) => b.id !== id),
            })),
        }),
        {
            name: 'booking-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
