import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole = 'senior' | 'family' | 'pal';

export interface User {
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
    name: string;
    age: string;
    gender: string;
    phone: string; // Connection Key
    address: string; // Connection Key
    hasSmartphone: boolean; // Trigger for Parent's SMS mode
  }[];
  walletBalance?: number;
  upiVerified?: boolean;
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : data,
          hasCompletedProfile: true
        })),
      logout: () => set({
        user: null,
        isAuthenticated: false,
        hasCompletedProfile: false
      }),
      setLoaded: (loaded) => set({ isLoaded: loaded }),
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
