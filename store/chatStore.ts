import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useNotificationStore } from './notificationStore';

export type MessageType = 'text' | 'image' | 'file' | 'location' | 'audio' | 'typing';

export interface Message {
    id: string;
    text: string;
    sender: 'me' | 'them';
    timestamp: number;
    type: MessageType;
    isRead: boolean;
    fileUrl?: string; // for images/files
    latitude?: number;
    longitude?: number;
    fileName?: string;
    fileSize?: number;
    duration?: number;
}

export interface Conversation {
    id: string; // Internal unique ID
    contactId: string; // The ID of the person we are chatting with
    contactName: string;
    contactAvatar?: string;
    contactRole: string;
    messages: Message[];
    lastMessage?: string;
    lastTimestamp?: number;
    unreadCount: number;
    isTyping?: boolean;
}

interface ChatState {
    conversations: Conversation[];
    isLoading: boolean;
    blockedUserIds: string[];

    messages: Message[];
    // Actions
    fetchConversations: (userId: string) => Promise<void>;
    setTypingStatus: (conversationId: string, isTyping: boolean) => void;
    sendMessage: (
        conversationId: string,
        text: string,
        type?: MessageType,
        metadata?: Partial<Message>
    ) => Promise<void>;
    markAsRead: (conversationId: string) => Promise<void>;
    getOrCreateConversation: (contact: { id: string, name: string, role: string, avatar?: string }) => string;
    toggleBlockUser: (userId: string) => void;
    isUserBlocked: (userId: string) => boolean;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            isLoading: false,
            blockedUserIds: [],
            messages: [],

            setTypingStatus: (conversationId, isTyping) => {
                set((state) => ({
                    conversations: (state.conversations || []).map(c =>
                        c.id === conversationId ? { ...c, isTyping } : c
                    )
                }));
            },

            fetchConversations: async (userId) => {
                set({ isLoading: true });
                // In a real app, this would fetch from an API
                await new Promise(resolve => setTimeout(resolve, 800));
                set({ isLoading: false });
            },

            sendMessage: async (conversationId, text, type = 'text', metadata = {}) => {
                const conversation = (get().conversations || []).find(c => c.id === conversationId);
                if (!conversation) return;

                const newMessage: Message = {
                    id: Math.random().toString(36).substring(7),
                    text,
                    sender: 'me',
                    timestamp: Date.now(),
                    type,
                    isRead: true,
                    ...metadata
                };

                const lastMsgDisplay = type === 'text' ? text : `[${type.toUpperCase()}]`;

                set((state) => ({
                    conversations: (state.conversations || []).map(c =>
                        c.id === conversationId
                            ? {
                                ...c,
                                messages: [...(c.messages || []), newMessage],
                                lastMessage: lastMsgDisplay,
                                lastTimestamp: Date.now()
                            }
                            : c
                    )
                }));

                // Simulate reply
                setTimeout(() => {
                    get().setTypingStatus(conversationId, true);

                    setTimeout(() => {
                        const reply: Message = {
                            id: Math.random().toString(36).substring(7),
                            text: `Acknowledged! I received your ${type}.`,
                            sender: 'them',
                            timestamp: Date.now(),
                            type: 'text',
                            isRead: false
                        };

                        set((state) => ({
                            conversations: (state.conversations || []).map(c =>
                                c.id === conversationId
                                    ? {
                                        ...c,
                                        messages: [...(c.messages || []), reply],
                                        lastMessage: reply.text,
                                        lastTimestamp: Date.now(),
                                        unreadCount: (c.unreadCount || 0) + 1,
                                        isTyping: false
                                    }
                                    : c
                            )
                        }));

                        useNotificationStore.getState().addNotification({
                            title: `Message from ${conversation.contactName || 'User'}`,
                            message: reply.text,
                            type: 'system',
                            receiverRole: 'pal',
                            actionRoute: '/(pal)/chat'
                        });
                    }, 2000);
                }, 1000);
            },

            markAsRead: async (conversationId) => {
                set((state) => ({
                    conversations: (state.conversations || []).map(c =>
                        c.id === conversationId
                            ? {
                                ...c,
                                unreadCount: 0,
                                messages: (c.messages || []).map(m => ({ ...m, isRead: true }))
                            }
                            : c
                    )
                }));
            },

            getOrCreateConversation: (contact) => {
                const state = get();
                const existing = (state.conversations || []).find(c => c.contactId === contact.id);

                if (existing) return existing.id;

                const newId = `CONV_${Math.random().toString(36).substring(7).toUpperCase()}`;
                const newConv: Conversation = {
                    id: newId,
                    contactId: contact.id,
                    contactName: contact.name,
                    contactAvatar: contact.avatar,
                    contactRole: contact.role,
                    messages: [],
                    unreadCount: 0,
                    lastTimestamp: Date.now()
                };

                set((state) => ({
                    conversations: [newConv, ...(state.conversations || [])]
                }));

                return newId;
            },

            toggleBlockUser: (userId: string) => {
                set((state) => {
                    const isBlocked = (state.blockedUserIds || []).includes(userId);
                    return {
                        blockedUserIds: isBlocked
                            ? (state.blockedUserIds || []).filter(id => id !== userId)
                            : [...(state.blockedUserIds || []), userId]
                    };
                });
            },

            isUserBlocked: (userId: string) => {
                return (get().blockedUserIds || []).includes(userId);
            }
        }),
        {
            name: 'enlivo-chat-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
