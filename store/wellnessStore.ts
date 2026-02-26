import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type VideoCategory = 'All' | 'Saved' | 'Yoga' | 'Diet' | 'Exercise' | 'Mental Health';

export interface WellnessVideo {
    id: string;
    title: string;
    category: VideoCategory;
    duration: string;
    thumbnail: string;
    videoUrl: string;
    views: string;
    isPremium: boolean;
    tags?: string[];
    saved?: boolean;
    isFamilyRecommended?: boolean;
}

interface WellnessState {
    videos: WellnessVideo[];
    categories: VideoCategory[];
    playHistory: string[]; // IDs of played videos
    toggleSaveVideo: (id: string) => void;
    addToHistory: (id: string) => void;
    setVideos: (videos: WellnessVideo[]) => void;
}

const INITIAL_VIDEOS: WellnessVideo[] = [
    {
        id: '1',
        title: 'Morning Yoga Flows',
        category: 'Yoga',
        duration: '15:00',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        views: '1.2k',
        isPremium: true,
        tags: ['mobility', 'morning', 'beginner']
    },
    {
        id: '11',
        title: 'Diabetes Friendly Diet',
        category: 'Diet',
        duration: '06:15',
        thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        views: '3.4k',
        isPremium: false,
        tags: ['diabetes', 'nutrition', 'sugar-free']
    },
    {
        id: '21',
        title: 'Hypertension Management',
        category: 'Diet',
        duration: '07:45',
        thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        views: '2.1k',
        isPremium: false,
        tags: ['hypertension', 'salt-free', 'heart']
    },
    {
        id: '12',
        title: 'Better Sleep Rituals',
        category: 'Mental Health',
        duration: '10:00',
        thumbnail: 'https://images.unsplash.com/photo-1511295742364-911917188c83?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        views: '1.1k',
        isPremium: true,
        tags: ['sleep', 'relaxation', 'insomnia']
    },
    {
        id: '31',
        title: 'Anxiety Relief Breathing',
        category: 'Mental Health',
        duration: '05:30',
        thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        views: '6.7k',
        isPremium: false,
        tags: ['anxiety', 'breathing', 'peace']
    },
    {
        id: '15',
        title: 'Balance Training',
        category: 'Exercise',
        duration: '12:30',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        views: '4.5k',
        isPremium: true,
        tags: ['balance', 'safety', 'falls-prevention']
    },
    {
        id: '41',
        title: 'Lower Back Strength',
        category: 'Exercise',
        duration: '09:20',
        thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        views: '1.8k',
        isPremium: false,
        tags: ['back-pain', 'strength', 'mobility']
    },
    {
        id: '16',
        title: 'Low Carb Recipes',
        category: 'Diet',
        duration: '09:10',
        thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        views: '2.8k',
        isPremium: false,
        tags: ['diet', 'keto', 'weight-loss']
    },
    {
        id: '17',
        title: 'Daily Meditation',
        category: 'Mental Health',
        duration: '15:00',
        thumbnail: 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        views: '5.2k',
        isPremium: true,
        tags: ['meditation', 'focus', 'mindfulness']
    },
    {
        id: '3',
        title: 'Chair Yoga Flow',
        category: 'Yoga',
        duration: '12:00',
        thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        views: '800',
        isPremium: true,
        tags: ['yoga', 'senior', 'seated']
    },
    {
        id: '51',
        title: 'Flexibility for Seniors',
        category: 'Yoga',
        duration: '20:15',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        views: '3.3k',
        isPremium: false,
        tags: ['stretching', 'flexibility', 'full-body']
    },
    {
        id: '101',
        title: 'Nutritional Meal Prep',
        category: 'Diet',
        duration: '15:20',
        thumbnail: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        views: '1.5k',
        isPremium: false,
        tags: ['nutrition', 'cooking', 'healthy'],
        isFamilyRecommended: true
    }
];

export const useWellnessStore = create<WellnessState>()(
    persist(
        (set) => ({
            videos: INITIAL_VIDEOS,
            categories: ['All', 'Saved', 'Yoga', 'Diet', 'Exercise', 'Mental Health'],
            playHistory: [],
            toggleSaveVideo: (id) => set((state) => ({
                videos: state.videos.map(v => v.id === id ? { ...v, saved: !v.saved } : v)
            })),
            addToHistory: (id) => set((state) => ({
                playHistory: Array.from(new Set([id, ...state.playHistory]))
            })),
            setVideos: (videos) => set({ videos })
        }),
        {
            name: 'enlivo-wellness-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
