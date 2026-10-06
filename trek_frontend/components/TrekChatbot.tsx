'use client';

import { useState, useRef, useEffect } from 'react';
import { createConversation, sendMessage, ChatMessage } from '@/lib/ai';

const COLORS = {
  navy: '#0c2340',
  teal: '#0f766e',
  white: '#ffffff',
};

export default function TrekChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!conversationId) {
      try {
        const convo = await createConversation();
        setConversationId(convo.id);
        setMessages([
          {
            id: 0,
            role: 'assistant',
            content:
              "Namaste! I'm your Trek Nepal assistant. Ask me about gear, difficulty, permits, seasons, or anything trek-related.",
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        setError('Please log in to chat with the assistant.');
      }
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !conversationId || loading) return;

    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const { assistant_message } = await sendMessage(conversationId, content);
      setMessages((prev) => [...prev, assistant_message]);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Open trek assistant chat"
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            backgroundColor: COLORS.teal,
            color: COLORS.white,
            border: 'none',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div
          style={{
            width: 340,
            height: 460,
            backgroundColor: COLORS.white,
            borderRadius: 16,
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: COLORS.navy,
              color: COLORS.white,
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontWeight: 600 }}>Trek Nepal Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{ background: 'none', border: 'none', color: COLORS.white, cursor: 'pointer', fontSize: 18 }}
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              backgroundColor: '#f7f9f9',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? COLORS.teal : COLORS.white,
                  color: msg.role === 'user' ? COLORS.white : '#111',
                  padding: '8px 12px',
                  borderRadius: 12,
                  maxWidth: '80%',
                  fontSize: 14,
                  boxShadow: msg.role === 'assistant' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: '#888', fontSize: 13 }}>Typing…</div>
            )}
            {error && (
              <div style={{ alignSelf: 'center', color: '#b91c1c', fontSize: 13 }}>{error}</div>
            )}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', borderTop: '1px solid #eee', padding: 8, gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about treks, gear, permits…"
              disabled={!conversationId || loading}
              style={{
                flex: 1,
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: '8px 10px',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!conversationId || loading || !input.trim()}
              style={{
                backgroundColor: COLORS.teal,
                color: COLORS.white,
                border: 'none',
                borderRadius: 8,
                padding: '0 14px',
                cursor: 'pointer',
                opacity: !conversationId || loading || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}