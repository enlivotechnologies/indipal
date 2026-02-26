import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';

export type PharmacyOrderStatus =
    | 'sent_to_family'
    | 'processing'
    | 'accepted'
    | 'completed'
    | 'rejected'
    | 'cancelled';

export interface PharmacyItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
    unit: string;
    requiresPrescription?: boolean;
    description?: string;
    usage?: string;
    sideEffects?: string;
    expiry?: string;
    stock?: string;
    icon?: string;
}

export interface PharmacyOrder {
    id: string;
    creatorId: string;
    creatorName: string;
    creatorRole: 'senior' | 'family';
    seniorId: string;
    seniorName: string;
    familyId: string;
    palId?: string;
    palName?: string;
    items: PharmacyItem[];
    prescriptionImage?: string;
    totalAmount: number;
    status: PharmacyOrderStatus;
    timestamp: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
    unit: string;
    requiresPrescription?: boolean;
    description: string;
    usage: string;
    sideEffects: string;
    expiry: string;
    stock: string;
    icon: string;
}

interface PharmacyState {
    products: Product[];
    cart: PharmacyItem[];
    orders: PharmacyOrder[];

    // Cart Actions
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    // Order Actions
    createOrder: (role: 'senior' | 'family', seniorId: string, familyId: string, prescriptionImage?: string) => Promise<{ success: boolean; orderId?: string }>;
    forwardToPal: (orderId: string, palId?: string) => Promise<boolean>;
    acceptOrder: (orderId: string, palId: string, palName: string) => Promise<boolean>;
    rejectOrder: (orderId: string) => Promise<boolean>;
    completeOrder: (orderId: string) => Promise<boolean>;
}

export const usePharmacyStore = create<PharmacyState>()(
    persist(
        (set, get) => ({
            products: [
                {
                    id: '1',
                    name: 'Paracetamol 650mg',
                    price: 30,
                    category: 'OTC',
                    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400',
                    unit: 'Strip',
                    description: 'Advanced pain and fever relief tablets. Effective for headaches, body aches, and post-viral fever recovery.',
                    usage: '1 tablet every 6 hours after meals. Maximum 4 tablets in 24 hours.',
                    sideEffects: 'Mild drowsiness, skin rash in rare cases.',
                    expiry: 'Dec 2026',
                    stock: 'In Stock',
                    icon: 'medkit'
                },
                {
                    id: '2',
                    name: 'Vitamin C 500mg',
                    price: 150,
                    category: 'Supplements',
                    image: 'https://images.unsplash.com/photo-1616671285415-888469d4993a?auto=format&fit=crop&q=80&w=400',
                    unit: 'Bottle',
                    description: 'Pure Vitamin C with Rose Hips for boosted immunity and skin health.',
                    usage: '1 tablet daily after breakfast. Chew thoroughly before swallowing.',
                    sideEffects: 'None reported if taken as directed.',
                    expiry: 'Mar 2027',
                    stock: 'Limited',
                    icon: 'leaf'
                },
                {
                    id: '3',
                    name: 'Advanced Sanitizer',
                    price: 90,
                    category: 'Hygiene',
                    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400',
                    unit: 'Bottle',
                    description: 'Kills 99.9% germs instantly. Infused with Aloe Vera and Vitamin E.',
                    usage: 'Apply palmful to hands and rub until dry.',
                    sideEffects: 'Slight dryness with frequent use.',
                    expiry: 'Oct 2025',
                    stock: 'In Stock',
                    icon: 'water'
                },
                {
                    id: '4',
                    name: 'Digital Thermometer',
                    price: 250,
                    category: 'Devices',
                    image: 'https://images.unsplash.com/photo-1590812517618-9719460067ce?auto=format&fit=crop&q=80&w=400',
                    unit: 'Unit',
                    description: 'Instant and highly accurate reading with memory function and fever alarm.',
                    usage: 'Place under tongue or in armpit until beep sounds.',
                    sideEffects: 'N/A',
                    expiry: 'Life Expectancy 5y',
                    stock: 'High Demand',
                    icon: 'thermometer'
                },
                {
                    id: '5',
                    name: 'Multivitamin Gold',
                    price: 550,
                    category: 'Supplements',
                    image: 'https://images.unsplash.com/photo-1584017945516-107040a45455?auto=format&fit=crop&q=80&w=400',
                    unit: 'Jar',
                    description: 'Comprehensive daily essential vitality mix specifically formulated for seniors.',
                    usage: '1 capsule daily with lukewarm milk or water after dinner.',
                    sideEffects: 'Mild stomach upset if taken on empty stomach.',
                    expiry: 'Jan 2027',
                    stock: 'In Stock',
                    icon: 'star'
                },
                {
                    id: '6',
                    name: 'N95 Protection Mask',
                    price: 120,
                    category: 'Hygiene',
                    image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=400',
                    unit: 'Pack',
                    description: 'BFE/PFE 95%+ filtration. Ergonomic design for long-term comfort.',
                    usage: 'Secure over nose and chin. Replace after 30 hours of use.',
                    sideEffects: 'N/A',
                    expiry: 'Single Use',
                    stock: 'In Stock',
                    icon: 'shield-checkmark'
                },
                {
                    id: '7',
                    name: 'Amoxicillin 500mg',
                    price: 450,
                    category: 'Antibiotics',
                    image: 'https://images.unsplash.com/photo-1471864190281-ad599f73bc0d?auto=format&fit=crop&q=80&w=400',
                    unit: 'Strip',
                    requiresPrescription: true,
                    description: 'Broad-spectrum antibiotic used to treat various bacterial infections.',
                    usage: '1 tablet twice daily for 5 days. Complete the full course.',
                    sideEffects: 'Nausea, dizziness, or allergic reaction.',
                    expiry: 'Aug 2026',
                    stock: 'Restricted',
                    icon: 'medical'
                },
            ],
            cart: [],
            orders: [],

            addToCart: (product) => {
                const currentCart = get().cart;
                const existing = currentCart.find(i => i.id === product.id);
                if (existing) {
                    set({ cart: currentCart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
                } else {
                    set({ cart: [...currentCart, { ...product, quantity: 1, unit: product.unit, requiresPrescription: product.requiresPrescription }] });
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

            createOrder: async (role, seniorId, familyId, prescriptionImage) => {
                const { cart } = get();
                if (cart.length === 0 && !prescriptionImage) return { success: false };

                // Mandatory prescription check
                const needsRx = cart.some(item => item.requiresPrescription);
                if (needsRx && !prescriptionImage) {
                    return { success: false };
                }

                const user = useAuthStore.getState().user;
                const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                const newOrder: PharmacyOrder = {
                    id: `PHM${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    creatorId: user?.id || 'USER_1',
                    creatorName: user?.name || 'User',
                    creatorRole: role,
                    seniorId,
                    seniorName: role === 'senior' ? user?.name || 'Senior' : 'Senior Member',
                    familyId,
                    items: [...cart],
                    prescriptionImage,
                    totalAmount,
                    status: role === 'senior' ? 'sent_to_family' : 'processing',
                    timestamp: Date.now(),
                };

                set(state => ({
                    orders: [newOrder, ...state.orders],
                    cart: []
                }));

                // Notifications
                if (role === 'senior') {
                    useNotificationStore.getState().addNotification({
                        title: 'Pharmacy Request from Senior',
                        message: `${newOrder.seniorName} has shared a pharmacy list for your approval.`,
                        type: 'task',
                        receiverRole: 'family',
                        actionRoute: '/(family)/services/pharmacy'
                    });
                } else {
                    useNotificationStore.getState().addNotification({
                        title: 'New Pharmacy Order',
                        message: `A new pharmacy order for ${newOrder.seniorName} is available.`,
                        type: 'task',
                        receiverRole: 'pal',
                        actionRoute: '/(pal)/home'
                    });

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
                updatedOrders[orderIndex] = { ...order, status: 'processing', palId };

                set({ orders: updatedOrders });

                const user = useAuthStore.getState().user;
                const balance = user?.walletBalance || 0;
                if (balance >= order.totalAmount) {
                    useAuthStore.getState().updateUser({ walletBalance: balance - order.totalAmount });
                }

                useNotificationStore.getState().addNotification({
                    title: 'Pharmacy Order Assigned',
                    message: `You have a new pharmacy delivery task for ${order.seniorName}.`,
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
                updatedOrders[orderIndex] = { ...order, status: 'accepted', palId, palName };

                set({ orders: updatedOrders });

                useNotificationStore.getState().addNotification({
                    title: 'Pharmacy Order Accepted',
                    message: `Pal ${palName} has accepted the pharmacy order and is heading to the store.`,
                    type: 'task',
                    receiverRole: 'family',
                    actionRoute: '/(family)/services/pharmacy'
                });

                return true;
            },

            rejectOrder: async (orderId) => {
                const orders = get().orders;
                const orderIndex = orders.findIndex(o => o.id === orderId);
                if (orderIndex === -1) return false;

                const order = orders[orderIndex];
                const updatedOrders = [...orders];
                updatedOrders[orderIndex] = { ...order, status: 'rejected' };

                set({ orders: updatedOrders });

                // Refund Family (Simplified)
                const user = useAuthStore.getState().user;
                if (user?.role === 'family') {
                    useAuthStore.getState().updateUser({ walletBalance: (user.walletBalance || 0) + order.totalAmount });
                }

                useNotificationStore.getState().addNotification({
                    title: 'Order Rejected',
                    message: `The pharmacy order for ${order.seniorName} was rejected by the Pal.`,
                    type: 'task',
                    receiverRole: 'family',
                    actionRoute: '/(family)/services/pharmacy'
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

                const currentUser = useAuthStore.getState().user;
                const bonus = 150;
                const totalEarning = order.totalAmount + bonus;

                useAuthStore.getState().updateUser({
                    walletBalance: (currentUser?.walletBalance || 0) + totalEarning,
                    totalEarnings: (currentUser?.totalEarnings || 0) + totalEarning
                });

                useNotificationStore.getState().addNotification({
                    title: 'Medicines Delivered',
                    message: `Your pharmacy order has been successfully delivered by ${order.palName}.`,
                    type: 'task',
                    receiverRole: 'family',
                });

                return true;
            },
        }),
        {
            name: 'indipal-pharmacy-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
