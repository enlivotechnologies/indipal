import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
}

interface BookingState {
    bookings: Booking[];
    addBooking: (booking: Omit<Booking, 'id' | 'timestamp' | 'status'>) => void;
    updateBookingStatus: (id: string, status: BookingStatus) => void;
    cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>()(
    persist(
        (set) => ({
            bookings: [],
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
