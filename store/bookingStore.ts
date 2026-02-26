import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { useChatStore } from "./chatStore";
import { useNotificationStore } from "./notificationStore";

export type BookingStatus =
  | "open"
  | "accepted"
  | "on_the_way"
  | "on_site"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ServiceItem {
  id: string;
  title: string;
  duration: string;
  price: number;
  status: "pending" | "in_progress" | "completed";
}

export interface GigLocation {
  address: string;
  lat?: number;
  lng?: number;
}

export interface Booking {
  id: string;
  palId: string;
  palName: string;
  clientName: string;
  date: string;
  day: string;
  time: string;
  dateTime?: string;
  status: BookingStatus;
  timestamp: number; // CreatedAt
  price: number;
  paymentAmount: number;
  title: string;
  location: GigLocation;
  requirements?: string[];
  description?: string;
  duration?: string;
  familyId: string;
  services: ServiceItem[];
  assignedAt?: number;
  startedTravelAt?: number;
  arrivedAt?: number;
  startedAt?: number;
  completedAt?: number;
}

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  hasNewGigs: boolean;

  // Actions
  fetchGigs: () => Promise<void>;
  acceptGig: (id: string, palId: string, palName: string) => Promise<{ success: boolean; message: string }>;
  updateGigStatus: (id: string, status: BookingStatus) => Promise<{ success: boolean; message: string }>;
  completeGig: (id: string) => Promise<{ success: boolean; message: string }>;
  updateServiceStatus: (gigId: string, serviceId: string, status: ServiceItem["status"]) => void;
  setHasNewGigs: (val: boolean) => void;
  addGig: (gig: Omit<Booking, "id" | "timestamp" | "status" | "services"> & { services?: ServiceItem[] }) => void;
  cancelBooking: (id: string) => void;

  // Compatibility
  addBooking: (booking: any) => void;
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
        await new Promise((resolve) => setTimeout(resolve, 800));

        const currentBookings = get().bookings;

        // Only mock if no open gigs
        if (currentBookings.filter((b) => b.status === "open").length < 1) {
          const newGigs: Booking[] = [
            {
              id: `GIG${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
              palId: "",
              palName: "",
              clientName: "Malati Devi",
              title: "Morning Care Support",
              date: "26 Feb 2026",
              day: "Thursday",
              time: "10:00 AM - 01:00 PM",
              dateTime: "26 Feb 2026 10:00 AM",
              status: "open",
              timestamp: Date.now(),
              price: 1200,
              paymentAmount: 1200,
              location: {
                address: "Indiranagar, Sector 2",
                lat: 12.9783,
                lng: 77.6408,
              },
              requirements: [
                "Medicine administration",
                "Light walking support",
                "BP monitoring",
              ],
              description: "Senior requires assistance with morning routine and vitals check.",
              duration: "3 Hours",
              familyId: "FAM_MALATI",
              services: [
                { id: 'S1', title: 'Medicine administration', duration: '30m', price: 400, status: 'pending' },
                { id: 'S2', title: 'Light walking support', duration: '1h', price: 400, status: 'pending' },
                { id: 'S3', title: 'BP monitoring', duration: '15m', price: 400, status: 'pending' }
              ]
            },
            {
              id: `GIG${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
              palId: "",
              palName: "",
              clientName: "Colonel Krishnan",
              title: "Evening Companion",
              date: "26 Feb 2026",
              day: "Thursday",
              time: "02:00 PM - 05:00 PM",
              dateTime: "26 Feb 2026 02:00 PM",
              status: "open",
              timestamp: Date.now(),
              price: 1500,
              paymentAmount: 1500,
              location: {
                address: "Koramangala 4th Block",
                lat: 12.9317,
                lng: 77.6226,
              },
              requirements: [
                "Dressing assistance",
                "Meal prep",
                "Reading/Conversation",
              ],
              description: "Retired officer needs companionship and assistance with meal preparation.",
              duration: "3 Hours",
              familyId: "FAM_KRISHNAN",
              services: [
                { id: 'S1', title: 'Dressing assistance', duration: '45m', price: 500, status: 'pending' },
                { id: 'S2', title: 'Meal prep', duration: '1h', price: 500, status: 'pending' },
                { id: 'S3', title: 'Reading/Conversation', duration: '1.5h', price: 500, status: 'pending' }
              ]
            },
          ];

          const filteredNewGigs = newGigs.filter(
            (ng) => !currentBookings.some((cb) => cb.clientName === ng.clientName && cb.status === "open")
          );

          if (filteredNewGigs.length > 0) {
            set({
              bookings: [...currentBookings, ...filteredNewGigs],
              hasNewGigs: true,
            });
          }
        }

        set({ isLoading: false });
      },

      acceptGig: async (id, palId, palName) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const bookings = get().bookings;
        const gigIndex = bookings.findIndex((b) => b.id === id);

        if (gigIndex === -1) {
          set({ isLoading: false });
          return { success: false, message: "Gig not found" };
        }

        const gig = bookings[gigIndex];

        if (gig.status !== "open") {
          set({ isLoading: false });
          return { success: false, message: "Gig already assigned" };
        }

        const updatedBookings = [...bookings];
        updatedBookings[gigIndex] = {
          ...gig,
          status: "accepted",
          palId,
          palName,
          assignedAt: Date.now(),
        };

        set({ bookings: updatedBookings, isLoading: false });

        useChatStore.getState().getOrCreateConversation({
          id: gig.familyId || `FAM_${gig.clientName.split(" ")[0]}`,
          name: gig.clientName,
          role: "family",
          avatar: undefined // could be added if available
        });

        useNotificationStore.getState().addNotification({
          title: "Gig Accepted",
          message: `You have accepted the gig for ${gig.clientName}.`,
          type: "task",
          receiverRole: "pal",
          actionRoute: "/(pal)/active-gig",
        });

        return { success: true, message: "Gig accepted successfully" };
      },

      updateGigStatus: async (id, status) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const bookings = get().bookings;
        const gigIndex = bookings.findIndex((b) => b.id === id);

        if (gigIndex === -1) {
          set({ isLoading: false });
          return { success: false, message: "Gig not found" };
        }

        const gig = bookings[gigIndex];
        const updatedGig = { ...gig, status };

        if (status === "on_the_way") updatedGig.startedTravelAt = Date.now();
        if (status === "on_site") updatedGig.arrivedAt = Date.now();
        if (status === "in_progress") updatedGig.startedAt = Date.now();

        const updatedBookings = [...bookings];
        updatedBookings[gigIndex] = updatedGig;

        set({ bookings: updatedBookings, isLoading: false });

        let familyMsg = "";
        if (status === "on_the_way") familyMsg = `Pal ${gig.palName} is on the way.`;
        if (status === "on_site") familyMsg = `Pal ${gig.palName} has arrived.`;
        if (status === "in_progress") familyMsg = `The care session has started.`;

        if (familyMsg) {
          useNotificationStore.getState().addNotification({
            title: "Gig Update",
            message: familyMsg,
            type: "task",
            receiverRole: "family",
            actionRoute: "/(family)/home",
          });
        }

        return { success: true, message: `Status updated to ${status}` };
      },

      completeGig: async (id) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const bookings = get().bookings;
        const gigIndex = bookings.findIndex((b) => b.id === id);

        if (gigIndex === -1) {
          set({ isLoading: false });
          return { success: false, message: "Gig not found" };
        }

        const gig = bookings[gigIndex];
        const updatedBookings = [...bookings];
        updatedBookings[gigIndex] = {
          ...gig,
          status: "completed",
          completedAt: Date.now(),
        };

        set({ bookings: updatedBookings, isLoading: false });

        // Update Wallet Balance & Transactions
        const authUser = useAuthStore.getState().user;
        if (authUser && authUser.role === "pal") {
          const amount = Number(gig.price);
          const newBalance = (authUser.walletBalance || 0) + amount;

          useAuthStore.getState().updateUser({
            walletBalance: newBalance,
            transactions: [
              {
                id: `ER${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
                type: "earning",
                amount: amount,
                title: `Care Session: ${gig.clientName}`,
                date: "Just now",
                status: "Success",
              },
              ...(authUser.transactions || []),
            ],
          });

          useNotificationStore.getState().addNotification({
            title: "Earnings Added",
            message: `₹${amount} added to your balance.`,
            type: "wallet",
            receiverRole: "pal",
            actionRoute: "/(pal)/earnings",
          });
        }

        useNotificationStore.getState().addNotification({
          title: "Gig Completed",
          message: `Care session for ${gig.clientName} has ended.`,
          type: "task",
          receiverRole: "family",
          actionRoute: "/(family)/home",
        });

        return { success: true, message: "Gig completed and balance updated." };
      },

      updateServiceStatus: (gigId, serviceId, status) => {
        set((state) => {
          const updatedBookings = state.bookings.map((b) => {
            if (b.id !== gigId) return b;

            const updatedServices = b.services.map((s) =>
              s.id === serviceId ? { ...s, status } : s
            );

            let overallStatus = b.status;
            if (updatedServices.some((s) => s.status === "in_progress")) {
              if (overallStatus !== "in_progress") {
                overallStatus = "in_progress";
                b.startedAt = Date.now();
              }
            } else if (updatedServices.every((s) => s.status === "completed")) {
              overallStatus = "completed";
              b.completedAt = Date.now();
            }

            return { ...b, services: updatedServices, status: overallStatus };
          });

          return { bookings: updatedBookings };
        });

        // If overall status became completed, trigger balance update
        const updatedGig = get().bookings.find(b => b.id === gigId);
        if (updatedGig?.status === 'completed') {
          get().completeGig(gigId);
        }
      },

      addGig: (gig) => {
        const services = gig.services || [
          { id: 'S1', title: gig.title, duration: gig.duration || '1h', price: gig.price, status: 'pending' }
        ];
        const totalPrice = services.reduce((sum, s) => sum + s.price, 0);

        set((state) => ({
          bookings: [
            ...state.bookings,
            {
              ...gig,
              id: `GIG${Math.random().toString(36).substring(7).toUpperCase()}`,
              status: "open",
              timestamp: Date.now(),
              price: totalPrice,
              paymentAmount: totalPrice,
              services
            },
          ],
        }));
      },

      cancelBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
        })),

      addBooking: (booking: any) => {
        get().addGig({
          ...booking,
          clientName: booking.clientName || booking.userName || "Senior Member",
          price: Number(booking.price?.toString().replace(",", "") || 0),
          paymentAmount: Number(booking.price?.toString().replace(",", "") || 0),
          title: booking.title || "Care Session",
          location: { address: booking.location || "HSR Layout" },
          familyId: "FAM_USER",
        });
      },
    }),
    {
      name: "booking-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
