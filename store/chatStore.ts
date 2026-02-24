import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useNotificationStore } from './notificationStore';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    text: string;
    timestamp: number;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    participants: {
        id: string;
        name: string;
        role: 'family' | 'senior' | 'pal';
        avatar?: string;
    }[];
    lastMessage?: string;
    lastTimestamp?: number;
    unreadCount: number;
    relatedGigId?: string;
}

interface ChatState {
    conversations: Conversation[];
    messages: Record<string, Message[]>; // conversationId -> messages
    isLoading: boolean;

    // Actions
    fetchConversations: (userId: string) => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (conversationId: string, text: string, senderId: string, senderName: string) => Promise<void>;
    markAsRead: (conversationId: string) => Promise<void>;
    createConversation: (palId: string, otherId: string, otherName: string, role: 'family' | 'senior', gigId?: string) => string;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            isLoading: false,

            fetchConversations: async (userId) => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 800));
                // In a real app, this would be a fetch call.
                // Our data is persisted locally in this mock.
                set({ isLoading: false });
            },

            fetchMessages: async (conversationId) => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 500));
                set({ isLoading: false });
            },

            sendMessage: async (conversationId, text, senderId, senderName) => {
                const conversation = get().conversations.find(c => c.id === conversationId);
                if (!conversation) return;

                const receiver = conversation.participants.find(p => p.id !== senderId);
                if (!receiver) return;

                const newMessage: Message = {
                    id: Math.random().toString(36).substring(7),
                    conversationId,
                    senderId,
                    senderName,
                    receiverId: receiver.id,
                    text,
                    timestamp: Date.now(),
                    isRead: false
                };

                set((state) => ({
                    messages: {
                        ...state.messages,
                        [conversationId]: [...(state.messages[conversationId] || []), newMessage]
                    },
                    conversations: state.conversations.map(c =>
                        c.id === conversationId
                            ? { ...c, lastMessage: text, lastTimestamp: Date.now() }
                            : c
                    )
                }));

                // Simulate reply for "real-time" feel
                setTimeout(async () => {
                    const reply: Message = {
                        id: Math.random().toString(36).substring(7),
                        conversationId,
                        senderId: receiver.id,
                        senderName: receiver.name,
                        receiverId: senderId,
                        text: `Got your message! I'll check on the requirements for the visit.`,
                        timestamp: Date.now(),
                        isRead: false
                    };

                    set((state) => ({
                        messages: {
                            ...state.messages,
                            [conversationId]: [...(state.messages[conversationId] || []), reply]
                        },
                        conversations: state.conversations.map(c =>
                            c.id === conversationId
                                ? { ...c, lastMessage: reply.text, lastTimestamp: Date.now(), unreadCount: c.unreadCount + 1 }
                                : c
                        )
                    }));

                    // Trigger Notification
                    useNotificationStore.getState().addNotification({
                        title: `New Message from ${receiver.name}`,
                        message: reply.text,
                        type: 'system',
                        receiverRole: 'pal',
                        actionRoute: '/(pal)/chat'
                    });
                }, 3000);
            },

            markAsRead: async (conversationId) => {
                set((state) => ({
                    conversations: state.conversations.map(c =>
                        c.id === conversationId ? { ...c, unreadCount: 0 } : c
                    ),
                    messages: {
                        ...state.messages,
                        [conversationId]: (state.messages[conversationId] || []).map(m => ({ ...m, isRead: true }))
                    }
                }));
            },

            createConversation: (palId, otherId, otherName, role, gigId) => {
                const existing = get().conversations.find(c =>
                    c.participants.some(p => p.id === otherId) && c.relatedGigId === gigId
                );

                if (existing) return existing.id;

                const id = `CONV${Math.random().toString(36).substring(7).toUpperCase()}`;
                const newConv: Conversation = {
                    id,
                    participants: [
                        { id: palId, name: 'You', role: 'pal' },
                        { id: otherId, name: otherName, role: role }
                    ],
                    unreadCount: 0,
                    relatedGigId: gigId,
                    lastTimestamp: Date.now()
                };

                set((state) => ({
                    conversations: [newConv, ...state.conversations]
                }));

                return id;
            }
        }),
        {
            name: 'enlivo-chat-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
