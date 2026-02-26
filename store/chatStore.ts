import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
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
    ownerId: string; // The ID of the person who OWNS this conversation (current user)
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
    getOrCreateConversation: (
        ownerId: string,
        contact: { id: string, name: string, role: string, avatar?: string }
    ) => string;
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
                await new Promise(resolve => setTimeout(resolve, 500));

                const state = get();
                const user = useAuthStore.getState().user;
                const userRole = user?.role;

                // Deduplicate and migration sync
                set((state) => {
                    const seen = new Set();
                    const uniqueConvs = (state.conversations || []).filter(c => {
                        const key = `${c.ownerId || userId}_${c.contactId}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    }).map(c => {
                        const conv = !c.ownerId ? { ...c, ownerId: userId } : c;

                        // Deduplicate messages within the conversation
                        const msgSeen = new Set();
                        const uniqueMessages = (conv.messages || []).filter(m => {
                            if (!m.id) return true; // Keep items without IDs (like typing placeholder)
                            if (msgSeen.has(m.id)) return false;
                            msgSeen.add(m.id);
                            return true;
                        });

                        return { ...conv, messages: uniqueMessages };
                    });

                    return { conversations: uniqueConvs };
                });

                const finalState = get();
                const existingForUser = (finalState.conversations || []).filter(c => c.ownerId === userId);

                if (existingForUser.length === 0 && userId !== 'SYSTEM') {
                    // Seed ONE default contact based on role
                    const defaultContact = userRole === 'family'
                        ? { id: 'RAVI_PAL', name: 'Ravi Kumar', role: 'pal', avatar: 'https://i.pravatar.cc/500?u=Ravi' }
                        : { id: 'VIVEK_FAM', name: 'Vivek (Family)', role: 'family', avatar: 'https://i.pravatar.cc/500?u=Vivek' };

                    get().getOrCreateConversation(userId, defaultContact);
                }

                set({ isLoading: false });
            },

            sendMessage: async (conversationId, text, type = 'text', metadata = {}) => {
                const state = get();
                const senderConv = (state.conversations || []).find(c => c.id === conversationId);
                if (!senderConv) return;

                const senderId = senderConv.ownerId;
                const recipientId = senderConv.contactId;

                const timestamp = Date.now();
                const msgId = Math.random().toString(36).substring(7);

                const senderMessage: Message = {
                    id: msgId,
                    text: text,
                    sender: 'me',
                    timestamp,
                    type,
                    isRead: true,
                    ...metadata
                };

                const recipientMessage: Message = {
                    id: msgId,
                    text: text,
                    sender: 'them',
                    timestamp,
                    type,
                    isRead: false,
                    ...metadata
                };

                const lastMsgDisplay = type === 'text' ? text : `[${type.toUpperCase()}]`;

                set((state) => {
                    const currentConvs = [...(state.conversations || [])];

                    // 1. Find or Create Recipient's Conversation
                    let recipientConvIndex = currentConvs.findIndex(
                        c => c.ownerId === recipientId && c.contactId === senderId
                    );

                    if (recipientConvIndex === -1) {
                        const newId = `CONV_${Math.random().toString(36).substring(7).toUpperCase()}`;
                        const newRecipientConv: Conversation = {
                            id: newId,
                            ownerId: recipientId,
                            contactId: senderId,
                            contactName: "User", // This will be updated later if needed
                            contactRole: senderConv.contactRole === 'pal' ? 'family' : 'pal',
                            messages: [],
                            unreadCount: 0,
                            lastTimestamp: timestamp
                        };
                        currentConvs.push(newRecipientConv);
                        recipientConvIndex = currentConvs.length - 1;
                    }

                    // 2. Update both sides
                    const updatedConversations = currentConvs.map((c, idx) => {
                        if (c.id === conversationId) {
                            return {
                                ...c,
                                messages: [...(c.messages || []), senderMessage],
                                lastMessage: lastMsgDisplay,
                                lastTimestamp: timestamp
                            };
                        }
                        if (idx === recipientConvIndex) {
                            return {
                                ...c,
                                messages: [...(c.messages || []), recipientMessage],
                                lastMessage: lastMsgDisplay,
                                lastTimestamp: timestamp,
                                unreadCount: (c.unreadCount || 0) + 1
                            };
                        }
                        return c;
                    });

                    return { conversations: updatedConversations };
                });

                // 3. Trigger Real-time Notification for Recipient
                useNotificationStore.getState().addNotification({
                    title: `New message from ${senderConv.contactRole === 'pal' ? 'Family' : 'Pal'}`,
                    message: text,
                    type: 'system',
                    receiverRole: senderConv.contactRole === 'pal' ? 'family' : 'pal',
                    actionRoute: senderConv.contactRole === 'pal' ? '/(family)/chat' : '/(pal)/chat'
                });
            },

            markAsRead: async (conversationId) => {
                const state = get();
                const conv = (state.conversations || []).find(c => c.id === conversationId);
                if (!conv) return;

                const ownerId = conv.ownerId;
                const contactId = conv.contactId;

                set((state) => ({
                    conversations: (state.conversations || []).map(c => {
                        // 1. Mark this conversation and its messages as read
                        if (c.id === conversationId) {
                            return {
                                ...c,
                                unreadCount: 0,
                                messages: (c.messages || []).map(m => ({ ...m, isRead: true }))
                            };
                        }
                        // 2. ALSO mark the SAME messages (by ID) as read in the reciprocated conversation
                        // This ensures the "sender" sees the "double checkmark" turn active
                        if (c.ownerId === contactId && c.contactId === ownerId) {
                            return {
                                ...c,
                                messages: (c.messages || []).map(m => {
                                    // If this message was sent by 'them' (the person marking as read now)
                                    // and we have it as 'me' (sent by us), mark it as read.
                                    // Actually, any message with the same ID should be synced.
                                    return { ...m, isRead: true };
                                })
                            };
                        }
                        return c;
                    })
                }));
            },

            getOrCreateConversation: (ownerId, contact) => {
                const state = get();
                const existing = (state.conversations || []).find(
                    c => c.ownerId === ownerId && c.contactId === contact.id
                );

                if (existing) return existing.id;

                const newId = `CONV_${Math.random().toString(36).substring(7).toUpperCase()}`;
                const newConv: Conversation = {
                    id: newId,
                    ownerId,
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
