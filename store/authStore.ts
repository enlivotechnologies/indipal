import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useNotificationStore } from './notificationStore';

export type UserRole = 'senior' | 'family' | 'pal';

export interface User {
  id?: string;
  familyId?: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  language?: string;
  dob?: string;
  gender?: string;
  profileImage?: string;
  hasSmartphone?: boolean; // Global smartphone status (Offline mode trigger)

  // Senior specific
  medicalConditions?: string[];
  mobilityStatus?: string;
  regularMedication?: boolean;
  medicationDetails?: string;
  allergies?: string;
  riskLevel?: string;
  residentialType?: string;
  address?: string;
  liveLocationEnabled?: boolean;
  preferredCommunication?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  // Caretaker (Pal/Agent) specific
  qualification?: string;
  experienceYears?: string;
  specialization?: string[];
  availableDays?: string[];
  timeSlots?: { from: string; to: string };
  workingRadius?: number;
  liveInOption?: boolean;
  governmentId?: string;
  policeVerification?: string;
  upiId?: string;
  languages?: string[];
  trustShieldVerified?: boolean;

  // Family Member specific
  age?: string;
  relationshipToSenior?: string;
  email?: string;
  parentsDetails?: {
    id?: string;
    familyId?: string;
    name: string;
    age: string;
    gender: string;
    phone: string; // Connection Key
    address: string; // Connection Key
    hasSmartphone: boolean; // Trigger for Parent's SMS mode
  }[];
  walletBalance?: number;
  upiVerified?: boolean;

  // Pal Profile Advanced Features
  totalEarnings?: number;
  totalWithdrawn?: number;
  transactions?: {
    id: string;
    type: 'earning' | 'withdrawal' | 'topup';
    amount: number;
    title: string;
    date: string;
    status: 'Success' | 'Pending' | 'Failed' | 'In Escrow';
  }[];
  verificationDocuments?: {
    id: string;
    documentType: 'id_proof' | 'address_proof' | 'bank_details' | 'police_verification';
    verificationStatus: 'Verified' | 'Pending' | 'Rejected';
    uploadDate: string;
    fileUrl: string;
    adminRemarks?: string;
  }[];
  supportTickets?: {
    id: string;
    category: 'Payment' | 'Verification' | 'Technical Issue' | 'Other';
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    date: string;
    attachments?: string[];
  }[];
}

interface AuthState {
  user: User | null;
  isLoaded: boolean;
  isAuthenticated: boolean;
  hasCompletedProfile: boolean;
  updateRole: (role: UserRole) => void;
  setPhone: (phone: string) => void;
  updateUser: (data: Partial<User>) => void;
  completeProfile: (data: Partial<User>) => void;
  logout: () => void;
  setLoaded: (loaded: boolean) => void;

  // Pal Specific Actions
  withdrawFunds: (amount: number) => Promise<{ success: boolean; message: string }>;
  createSupportTicket: (ticket: any) => Promise<{ success: boolean; id: string }>;
  uploadVerificationDoc: (doc: any) => Promise<{ success: boolean }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoaded: false,
      isAuthenticated: false,
      hasCompletedProfile: false,
      updateRole: (role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : { role }
        })),
      setPhone: (phone) =>
        set((state) => ({
          user: state.user ? { ...state.user, phone } : { phone },
          isAuthenticated: true
        })),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : data
        })),
      completeProfile: (data) =>
        set((state) => {
          const updatedUser: User = state.user ? { ...state.user, ...data } : data;

          // Initial Pal Mock Data if role is pal
          if (updatedUser.role === 'pal') {
            updatedUser.walletBalance = updatedUser.walletBalance ?? 8400;
            updatedUser.totalEarnings = updatedUser.totalEarnings ?? 12500;
            updatedUser.totalWithdrawn = updatedUser.totalWithdrawn ?? 4100;
            updatedUser.transactions = updatedUser.transactions ?? [
              { id: 'TXN001', type: 'earning', amount: 850, title: 'Morning Care - Ramesh C.', date: 'Today, 09:00 AM', status: 'Success' },
              { id: 'TXN002', type: 'withdrawal', amount: 2000, title: 'Withdrawal to Bank', date: 'Yesterday, 04:30 PM', status: 'Success' },
              { id: 'TXN003', type: 'earning', amount: 1200, title: 'Pharmacy Run - Priya V.', date: '22 Feb, 02:15 PM', status: 'Success' },
            ];
            updatedUser.verificationDocuments = updatedUser.verificationDocuments?.length ? updatedUser.verificationDocuments : [
              { id: 'DOC001', documentType: 'id_proof', verificationStatus: 'Verified', uploadDate: '15 Feb, 2026', fileUrl: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?auto=format&fit=crop&q=80&w=400' },
              { id: 'DOC002', documentType: 'address_proof', verificationStatus: 'Verified', uploadDate: '16 Feb, 2026', fileUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=400' },
              { id: 'DOC003', documentType: 'bank_details', verificationStatus: 'Verified', uploadDate: '15 Feb, 2026', fileUrl: 'https://images.unsplash.com/photo-1601597111158-2fcee27014df?auto=format&fit=crop&q=80&w=400' },
              { id: 'DOC004', documentType: 'police_verification', verificationStatus: 'Rejected', uploadDate: '17 Feb, 2026', fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400', adminRemarks: 'Image is blurry. Please upload a high-resolution scan.' },
            ];
            updatedUser.supportTickets = updatedUser.supportTickets ?? [];
          }

          return {
            user: updatedUser,
            hasCompletedProfile: true
          };
        }),
      logout: () => set({
        user: null,
        isAuthenticated: false,
        hasCompletedProfile: false
      }),
      setLoaded: (loaded) => set({ isLoaded: loaded }),

      withdrawFunds: async (amount) => {
        const { user } = get();
        if (!user) return { success: false, message: 'User not found' };

        // Verification Restriction Check
        const requiredDocs = ['id_proof', 'address_proof', 'bank_details'];
        const allVerified = requiredDocs.every(type =>
          user.verificationDocuments?.find(d => d.documentType === type)?.verificationStatus === 'Verified'
        );

        if (!allVerified) {
          return { success: false, message: 'Complete verification to enable withdrawals' };
        }

        if ((user.walletBalance || 0) < amount) {
          return { success: false, message: 'Insufficient balance' };
        }

        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newTransaction = {
          id: `WTH${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          type: 'withdrawal' as const,
          amount: amount,
          title: 'Withdrawal to Bank',
          date: 'Just now',
          status: 'Success' as const
        };

        set((state) => ({
          user: state.user ? {
            ...state.user,
            walletBalance: (state.user.walletBalance || 0) - amount,
            totalWithdrawn: (state.user.totalWithdrawn || 0) + amount,
            transactions: [newTransaction, ...(state.user.transactions || [])]
          } : null
        }));

        // Trigger Notification
        useNotificationStore.getState().addNotification({
          title: 'Withdrawal Processed',
          message: `Your request for ₹${amount.toLocaleString()} has been successfully processed.`,
          type: 'wallet',
          receiverRole: user.role || 'pal',
          actionRoute: '/(pal)/profile'
        });

        return { success: true, message: 'Withdrawal successful' };
      },

      createSupportTicket: async (ticketData) => {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newTicket = {
          ...ticketData,
          id: `TCK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'Open' as const,
          date: 'Just now'
        };

        set((state) => ({
          user: state.user ? {
            ...state.user,
            supportTickets: [newTicket, ...(state.user.supportTickets || [])]
          } : null
        }));

        // Trigger Notification
        useNotificationStore.getState().addNotification({
          title: 'Ticket Raised',
          message: `Your support ticket #${newTicket.id} has been successfully created.`,
          type: 'support',
          receiverRole: (get().user?.role) || 'pal',
          actionRoute: '/(pal)/profile'
        });

        return { success: true, id: newTicket.id };
      },

      uploadVerificationDoc: async (docData) => {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newDoc = {
          ...docData,
          id: `DOC${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          verificationStatus: 'Pending' as const,
          uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        };

        set((state) => {
          if (!state.user) return state;

          const existingDocs = state.user.verificationDocuments || [];
          const filteredDocs = existingDocs.filter(d => d.documentType !== docData.documentType);

          return {
            user: {
              ...state.user,
              verificationDocuments: [newDoc, ...filteredDocs]
            }
          };
        });

        // Trigger Notification
        useNotificationStore.getState().addNotification({
          title: 'Document Uploaded',
          message: `${docData.documentType.split('_').join(' ').toUpperCase()} uploaded successfully and pending verification.`,
          type: 'verification',
          receiverRole: (get().user?.role) || 'pal',
          actionRoute: '/(pal)/profile'
        });

        return { success: true };
      }
    }),
    {
      name: 'enlivo-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setLoaded(true);
      },
    }
  )
);
