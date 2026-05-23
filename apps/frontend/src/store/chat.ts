import { create } from 'zustand';
type Msg = { role: 'user' | 'assistant'; content: string };
export const useChatStore = create<{ messages: Msg[]; conversationId?: string; add: (m: Msg) => void; setConversationId: (id: string) => void }>((set) => ({
  messages: [{ role: 'assistant', content: 'Hey, I\'m NutriFlow AI 👋 Ready to build your tastiest macro-friendly plan?' }],
  conversationId: undefined,
  add: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setConversationId: (id) => set(() => ({ conversationId: id }))
}));
