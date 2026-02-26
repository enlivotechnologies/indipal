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

export interface GigLocation {
  address: string;
  lat?: number;
  lng?: number;
}

export interface Booking {
  id: string;
  palId: string;
  palName: string;
  userName: string; // clientName
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
  setHasNewGigs: (val: boolean) => void;
  addGig: (gig: Omit<Booking, "id" | "timestamp" | "status">) => void;
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
              userName: "Malati Devi",
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
            },
            {
              id: `GIG${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
              palId: "",
              palName: "",
              userName: "Colonel Krishnan",
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
            },
          ];

          const filteredNewGigs = newGigs.filter(
            (ng) => !currentBookings.some((cb) => cb.userName === ng.userName && cb.status === "open")
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

        useChatStore.getState().createConversation(
          palId,
          gig.familyId || `FAM_${gig.userName.split(" ")[0]}`,
          gig.userName,
          "family",
          gig.id
        );

        useNotificationStore.getState().addNotification({
          title: "Gig Accepted",
          message: `You have accepted the gig for ${gig.userName}.`,
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
                title: `Care Session: ${gig.userName}`,
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
          message: `Care session for ${gig.userName} has ended.`,
          type: "task",
          receiverRole: "family",
          actionRoute: "/(family)/home",
        });

        return { success: true, message: "Gig completed and balance updated." };
      },

      addGig: (gig) =>
        set((state) => ({
          bookings: [
            ...state.bookings,
            {
              ...gig,
              id: `GIG${Math.random().toString(36).substring(7).toUpperCase()}`,
              status: "open",
              timestamp: Date.now(),
            },
          ],
        })),

      cancelBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
        })),

      addBooking: (booking: any) => {
        get().addGig({
          ...booking,
          price: Number(booking.price?.replace(",", "") || 0),
          paymentAmount: Number(booking.price?.replace(",", "") || 0),
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
