import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";
import { useChatStore } from "./chatStore";
import { useNotificationStore } from "./notificationStore";

export type BookingStatus =
  | "sent_to_family" // Senior -> Family
  | "sent_to_pals"   // Family -> Pals
  | "pending"        // Generic pending
  | "accepted"       // Pal accepted
  | "declined"       // Family declined
  | "rejected"       // Pal rejected
  | "on_the_way"
  | "on_site"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "open";

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
  type: "nurse" | "house_help" | "pharmacy" | "grocery" | "errand";
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
  createRequest: (data: Omit<Booking, "id" | "timestamp" | "status" | "services" | "palId" | "palName">) => Promise<{ success: boolean; id: string }>;
  forwardToPal: (id: string) => Promise<boolean>;
  acceptGig: (id: string, palId: string, palName: string) => Promise<{ success: boolean; message: string }>;
  declineGig: (id: string) => Promise<{ success: boolean; message: string }>;
  rejectGig: (id: string) => Promise<{ success: boolean; message: string }>;
  updateGigStatus: (id: string, status: BookingStatus) => Promise<{ success: boolean; message: string }>;
  completeGig: (id: string) => Promise<{ success: boolean; message: string }>;
  updateServiceStatus: (gigId: string, serviceId: string, status: ServiceItem["status"]) => void;
  setHasNewGigs: (val: boolean) => void;
  addGig: (gig: Omit<Booking, "id" | "timestamp" | "status" | "services"> & { services?: ServiceItem[] }) => void;
  cancelBooking: (id: string) => void;
  fetchGigs: () => Promise<void>;
  fetchBookings?: () => Promise<void>;

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

      createRequest: async (data) => {
        const id = `REQ${Math.random().toString(36).substring(7).toUpperCase()}`;
        const newBooking: Booking = {
          ...data,
          id,
          status: "sent_to_family",
          timestamp: Date.now(),
          palId: "",
          palName: "",
          services: [
            { id: 'S1', title: data.title, duration: data.duration || '1h', price: data.price, status: 'pending' }
          ]
        };

        set((state) => ({ bookings: [...state.bookings, newBooking] }));

        // Notify Family
        useNotificationStore.getState().addNotification({
          title: "New Care Request",
          message: `${data.clientName} has requested ${data.title}.`,
          type: "task",
          receiverRole: "family",
          actionRoute: "/(family)/home",
        });

        return { success: true, id };
      },

      forwardToPal: async (id) => {
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === id ? { ...b, status: "sent_to_pals" as BookingStatus } : b
          ),
        }));

        const booking = get().bookings.find(b => b.id === id);
        if (booking) {
          useNotificationStore.getState().addNotification({
            title: "New Gig Available",
            message: `New request for ${booking.title} near you. Payment Secured in Escrow!`,
            type: "task",
            receiverRole: "pal",
            actionRoute: "/(pal)/home",
          });
        }
        return true;
      },

      fetchGigs: async () => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 800));
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

        const updatedBookings = [...bookings];
        updatedBookings[gigIndex] = {
          ...gig,
          status: "accepted",
          palId,
          palName,
          assignedAt: Date.now(),
        };

        set({ bookings: updatedBookings, isLoading: false });

        useChatStore.getState().getOrCreateConversation(palId, {
          id: gig.familyId || `FAM_${gig.clientName.split(" ")[0]}`,
          name: gig.clientName,
          role: "family",
          avatar: undefined
        });

        // Notify Senior
        useNotificationStore.getState().addNotification({
          title: "Pal Assigned!",
          message: `${palName} has accepted your ${gig.title} request.`,
          type: "task",
          receiverRole: "senior",
          actionRoute: "/(senior)/home",
        });

        // Notify Family
        useNotificationStore.getState().addNotification({
          title: "Booking Accepted",
          message: `Pal ${palName} has accepted your booking for ${gig.clientName}.`,
          type: "task",
          receiverRole: "family",
          actionRoute: "/(family)/home",
        });

        return { success: true, message: "Gig accepted successfully" };
      },

      declineGig: async (id) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));

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
          status: "declined",
        };

        set({ bookings: updatedBookings, isLoading: false });

        return { success: true, message: "Gig declined by family" };
      },

      rejectGig: async (id) => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 1000));

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
          status: "sent_to_pals",
        };

        set({ bookings: updatedBookings, isLoading: false });

        // Notify Family
        useNotificationStore.getState().addNotification({
          title: "Pal Declined",
          message: `A pal has declined the ${gig.title} request. Others may still accept.`,
          type: "task",
          receiverRole: "family",
          actionRoute: "/(family)/home",
        });

        return { success: true, message: "Gig rejected by pal" };
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

          useNotificationStore.getState().addNotification({
            title: "Nurse/Help Update",
            message: familyMsg,
            type: "task",
            receiverRole: "senior",
            actionRoute: "/(senior)/home",
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
            message: `₹${amount} added to your balance for ${gig.title} with ${gig.clientName}.`,
            type: "wallet",
            receiverRole: "pal",
            actionRoute: "/(pal)/earnings",
          });
        }

        useNotificationStore.getState().addNotification({
          title: "Service Completed",
          message: `Care session for ${gig.clientName} has been completed successfully.`,
          type: "task",
          receiverRole: "family",
          actionRoute: "/(family)/home",
        });

        useNotificationStore.getState().addNotification({
          title: "Service Completed",
          message: `Your ${gig.title} session has ended. Hope you had a great experience!`,
          type: "task",
          receiverRole: "senior",
          actionRoute: "/(senior)/home",
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
              status: "pending",
              timestamp: Date.now(),
              price: totalPrice,
              paymentAmount: totalPrice,
              services
            },
          ],
        }));

        // Notify Pal
        useNotificationStore.getState().addNotification({
          title: "New Booking Request",
          message: `You have a new booking request for ${gig.clientName}.`,
          type: "task",
          receiverRole: "pal",
          actionRoute: "/(pal)/home",
        });
      },

      cancelBooking: (id) =>
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== id),
        })),

      addBooking: (booking: any) => {
        const price = typeof booking.price === 'string'
          ? Number(booking.price.replace(/[^\d.-]/g, ''))
          : Number(booking.price || 0);

        get().addGig({
          ...booking,
          clientName: booking.clientName || booking.userName || "Senior Member",
          price: price,
          paymentAmount: price,
          title: booking.title || "Care Session",
          location: { address: booking.location || "HSR Layout" },
          familyId: booking.familyId || "FAM_USER",
          palId: booking.palId || "",
          palName: booking.palName || "Assigned Pal",
        });
      },
    }),
    {
      name: "booking-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
