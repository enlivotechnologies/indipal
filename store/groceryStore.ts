import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';

export type GroceryOrderStatus =
    | 'sent_to_family'
    | 'pending_family_approval'
    | 'forwarded_to_pal'
    | 'accepted_by_pal'
    | 'completed'
    | 'cancelled';

export interface GroceryItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
    unit: string;
}

export interface GroceryOrder {
    id: string;
    creatorId: string;
    creatorName: string;
    creatorRole: 'senior' | 'family';
    seniorId: string;
    seniorName: string;
    familyId: string;
    palId?: string;
    palName?: string;
    items: GroceryItem[];
    totalAmount: number;
    status: GroceryOrderStatus;
    timestamp: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    unit: string;
}

interface GroceryState {
    products: Product[];
    cart: GroceryItem[];
    orders: GroceryOrder[];

    // Cart Actions
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    // Order Actions
    createOrder: (role: 'senior' | 'family', seniorId: string, familyId: string) => Promise<{ success: boolean; orderId?: string }>;
    forwardToPal: (orderId: string, palId?: string) => Promise<boolean>;
    acceptOrder: (orderId: string, palId: string, palName: string) => Promise<boolean>;
    completeOrder: (orderId: string) => Promise<boolean>;
}

export const useGroceryStore = create<GroceryState>()(
    persist(
        (set, get) => ({
            products: [
                { id: '1', name: 'Fresh Milk', price: 60, category: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9107da5a1bb?q=80&w=200&auto=format&fit=crop', unit: '1L' },
                { id: '2', name: 'Organic Eggs', price: 90, category: 'Dairy', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=200&auto=format&fit=crop', unit: '6pcs' },
                { id: '3', name: 'Whole Wheat Bread', price: 45, category: 'Bakery', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop', unit: 'Pack' },
                { id: '4', name: 'Red Apples', price: 180, category: 'Fruits', image: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?q=80&w=200&auto=format&fit=crop', unit: '1kg' },
                { id: '5', name: 'Bananas', price: 50, category: 'Fruits', image: 'https://images.unsplash.com/photo-1571771894821-ad9902d73647?q=80&w=200&auto=format&fit=crop', unit: '1 Dozen' },
                { id: '6', name: 'Fresh Spinach', price: 30, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=200&auto=format&fit=crop', unit: 'Pack' },
                { id: '7', name: 'Tomatoes', price: 40, category: 'Vegetables', image: 'https://images.unsplash.com/photo-1518977676601-b53f02bad174?q=80&w=200&auto=format&fit=crop', unit: '1kg' },
                { id: '8', name: 'Aspirin', price: 120, category: 'Pharmacy', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=200&auto=format&fit=crop', unit: '10 Tablets' },
            ],
            cart: [],
            orders: [],

            addToCart: (product) => {
                const currentCart = get().cart;
                const existing = currentCart.find(i => i.id === product.id);
                if (existing) {
                    set({ cart: currentCart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
                } else {
                    set({ cart: [...currentCart, { ...product, quantity: 1, unit: product.unit }] });
                }
            },

            removeFromCart: (productId) => {
                set({ cart: get().cart.filter(i => i.id !== productId) });
            },

            updateCartQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeFromCart(productId);
                    return;
                }
                set({ cart: get().cart.map(i => i.id === productId ? { ...i, quantity } : i) });
            },

            clearCart: () => set({ cart: [] }),

            createOrder: async (role, seniorId, familyId) => {
                const { cart } = get();
                if (cart.length === 0) return { success: false };

                const user = useAuthStore.getState().user;
                const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                const newOrder: GroceryOrder = {
                    id: `GRC${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    creatorId: user?.id || 'USER_1',
                    creatorName: user?.name || 'User',
                    creatorRole: role,
                    seniorId,
                    seniorName: role === 'senior' ? user?.name || 'Senior' : 'Senior Member',
                    familyId,
                    items: [...cart],
                    totalAmount,
                    status: role === 'senior' ? 'sent_to_family' : 'forwarded_to_pal',
                    timestamp: Date.now(),
                };

                set(state => ({
                    orders: [newOrder, ...state.orders],
                    cart: []
                }));

                // Notifications
                if (role === 'senior') {
                    // Notify Family
                    useNotificationStore.getState().addNotification({
                        title: 'Grocery Request from Senior',
                        message: `${newOrder.seniorName} has shared a grocery list for your approval.`,
                        type: 'task',
                        receiverRole: 'family',
                        actionRoute: '/(family)/home' // Redirect to home or specific grocery tab
                    });
                } else {
                    // Forwarded directly by Family to Pal
                    useNotificationStore.getState().addNotification({
                        title: 'New Grocery Order',
                        message: `A new grocery order for ${newOrder.seniorName} is available.`,
                        type: 'task',
                        receiverRole: 'pal',
                        actionRoute: '/(pal)/home'
                    });

                    // Deduct from Family Wallet
                    const balance = user?.walletBalance || 0;
                    if (balance >= totalAmount) {
                        useAuthStore.getState().updateUser({ walletBalance: balance - totalAmount });
                    }
                }

                return { success: true, orderId: newOrder.id };
            },

            forwardToPal: async (orderId, palId) => {
                const orders = get().orders;
                const orderIndex = orders.findIndex(o => o.id === orderId);
                if (orderIndex === -1) return false;

                const order = orders[orderIndex];
                const updatedOrders = [...orders];
                updatedOrders[orderIndex] = { ...order, status: 'forwarded_to_pal', palId };

                set({ orders: updatedOrders });

                // Deduct from Family Wallet if not already done
                const user = useAuthStore.getState().user;
                const balance = user?.walletBalance || 0;
                if (balance >= order.totalAmount) {
                    useAuthStore.getState().updateUser({ walletBalance: balance - order.totalAmount });
                }

                // Notify Pal
                useNotificationStore.getState().addNotification({
                    title: 'Grocery Order Assigned',
                    message: `You have a new grocery delivery task for ${order.seniorName}.`,
                    type: 'task',
                    receiverRole: 'pal',
                    actionRoute: '/(pal)/home'
                });

                return true;
            },

            acceptOrder: async (orderId, palId, palName) => {
                const orders = get().orders;
                const orderIndex = orders.findIndex(o => o.id === orderId);
                if (orderIndex === -1) return false;

                const order = orders[orderIndex];
                const updatedOrders = [...orders];
                updatedOrders[orderIndex] = { ...order, status: 'accepted_by_pal', palId, palName };

                set({ orders: updatedOrders });

                // Notify Senior and Family
                useNotificationStore.getState().addNotification({
                    title: 'Grocery Order Accepted',
                    message: `Pal ${palName} has accepted the grocery order and is heading to the store.`,
                    type: 'task',
                    receiverRole: 'family',
                    actionRoute: '/(family)/home'
                });

                return true;
            },

            completeOrder: async (orderId) => {
                const orders = get().orders;
                const orderIndex = orders.findIndex(o => o.id === orderId);
                if (orderIndex === -1) return false;

                const order = orders[orderIndex];
                const updatedOrders = [...orders];
                updatedOrders[orderIndex] = { ...order, status: 'completed' };

                set({ orders: updatedOrders });

                // Add to Pal Wallet
                if (order.palId === 'PAL001' || order.palId === useAuthStore.getState().user?.id) {
                    const currentUser = useAuthStore.getState().user;
                    const bonus = 150; // Delivery fee
                    const totalEarning = order.totalAmount + bonus;
                    useAuthStore.getState().updateUser({
                        walletBalance: (currentUser?.walletBalance || 0) + totalEarning,
                        totalEarnings: (currentUser?.totalEarnings || 0) + totalEarning
                    });
                }

                // Notify all
                useNotificationStore.getState().addNotification({
                    title: 'Grocery Delivered',
                    message: `Your grocery order has been successfully delivered by ${order.palName}.`,
                    type: 'task',
                    receiverRole: 'family',
                });

                return true;
            },
        }),
        {
            name: 'indipal-grocery-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
