import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type OrderStatus = 'Pending' | 'Paid' | 'Confirmed' | 'Shipped' | 'Completed';

export interface Order {
    id: string;
    serviceTitle: string;
    serviceIcon: string;
    color: string;
    seniorName: string;
    status: OrderStatus;
    timestamp: string;
    amount: string;
    details?: {
        type?: string;
        duration?: string;
        date?: string;
        time?: string;
        address?: string;
    };
}

interface ServiceState {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => void;
    updateOrderStatus: (orderId: string, status: OrderStatus) => void;
    clearOrders: () => void;
}

export const useServiceStore = create<ServiceState>()(
    persist(
        (set) => ({
            orders: [],
            addOrder: (orderData) => set((state) => ({
                orders: [
                    ...state.orders,
                    {
                        ...orderData,
                        id: Math.random().toString(36).substr(2, 9),
                        status: 'Pending',
                        timestamp: new Date().toISOString(),
                    }
                ]
            })),
            updateOrderStatus: (orderId, status) => set((state) => ({
                orders: state.orders.map((o) =>
                    o.id === orderId ? { ...o, status } : o
                )
            })),
            clearOrders: () => set({ orders: [] }),
        }),
        {
            name: 'enlivo-service-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

export default useServiceStore;
