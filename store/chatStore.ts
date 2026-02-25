import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useNotificationStore } from './notificationStore';

export type MessageType = 'text' | 'image' | 'file' | 'location' | 'audio';

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    text: string;
    type: MessageType;
    timestamp: number;
    isRead: boolean;
    fileUrl?: string;
    mediaUrl?: string;
    latitude?: number;
    longitude?: number;
    fileName?: string;
    fileSize?: number;
    duration?: number;
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
    isCallActive?: boolean;
    callType?: 'voice' | 'video';
}

interface ChatState {
    conversations: Conversation[];
    messages: Record<string, Message[]>; // conversationId -> messages
    isLoading: boolean;
    blockedUserIds: string[];

    // Actions
    fetchConversations: (userId: string) => Promise<void>;
    fetchMessages: (conversationId: string) => Promise<void>;
    sendMessage: (
        conversationId: string,
        text: string,
        senderId: string,
        senderName: string,
        type?: MessageType,
        metadata?: Partial<Message>
    ) => Promise<void>;
    markAsRead: (conversationId: string) => Promise<void>;
    createConversation: (palId: string, otherId: string, otherName: string, role: 'family' | 'senior', gigId?: string) => string;
    toggleCall: (conversationId: string, active: boolean, type?: 'voice' | 'video') => void;
    toggleBlockUser: (userId: string) => void;
    isUserBlocked: (userId: string) => boolean;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            isLoading: false,
            blockedUserIds: [],

            fetchConversations: async (userId) => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 800));
                set({ isLoading: false });
            },

            fetchMessages: async (conversationId) => {
                set({ isLoading: true });
                await new Promise(resolve => setTimeout(resolve, 500));
                set({ isLoading: false });
            },

            sendMessage: async (conversationId, text, senderId, senderName, type = 'text', metadata = {}) => {
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
                    type,
                    timestamp: Date.now(),
                    isRead: false,
                    ...metadata
                };

                const lastMsgDisplay = type === 'text' ? text : `[${type.toUpperCase()}]`;

                set((state) => ({
                    messages: {
                        ...state.messages,
                        [conversationId]: [...(state.messages[conversationId] || []), newMessage]
                    },
                    conversations: state.conversations.map(c =>
                        c.id === conversationId
                            ? { ...c, lastMessage: lastMsgDisplay, lastTimestamp: Date.now() }
                            : c
                    )
                }));

                // Simulate reply
                setTimeout(async () => {
                    const reply: Message = {
                        id: Math.random().toString(36).substring(7),
                        conversationId,
                        senderId: receiver.id,
                        senderName: receiver.name,
                        receiverId: senderId,
                        text: `Acknowledged! I see you sent a ${type}.`,
                        type: 'text',
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

                    useNotificationStore.getState().addNotification({
                        title: `Message from ${receiver.name}`,
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
            },

            toggleCall: (conversationId, active, type = 'voice') => {
                set((state) => ({
                    conversations: state.conversations.map(c =>
                        c.id === conversationId ? { ...c, isCallActive: active, callType: type } : c
                    )
                }));
            },

            toggleBlockUser: (userId: string) => {
                set((state) => {
                    const isBlocked = state.blockedUserIds.includes(userId);
                    return {
                        blockedUserIds: isBlocked
                            ? state.blockedUserIds.filter(id => id !== userId)
                            : [...state.blockedUserIds, userId]
                    };
                });
            },

            isUserBlocked: (userId: string) => {
                return get().blockedUserIds.includes(userId);
            }
        }),
        {
            name: 'enlivo-chat-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
