import api from './axios'; // your existing JWT-attached axios instance

export interface RetrievedSource {
  id: number;
  source_type: string;
  object_id: string;
  snippet: string;
  relevance_score: number;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  sources?: RetrievedSource[];
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export async function createConversation(): Promise<Conversation> {
  const res = await api.post<Conversation>('/ai/conversations/', {});
  return res.data;
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<{ user_message: ChatMessage; assistant_message: ChatMessage }> {
  const res = await api.post(`/ai/conversations/${conversationId}/messages/`, {
    content,
  });
  return res.data;
}