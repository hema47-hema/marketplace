import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User as UserIcon, MessageSquare, Clock } from 'lucide-react';
import { Message, User } from '../types';
import { api } from '../api';

interface ChatDrawerProps {
  currentUser: User | null;
  targetUserId?: number;
  projectId?: number;
  projectTitle?: string;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  currentUser,
  targetUserId,
  projectId,
  projectTitle,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(targetUserId);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load available users if not provided
  useEffect(() => {
    if (!selectedUserId) {
      api.getFreelancers().then(users => {
        setAvailableUsers(users);
        if (users.length > 0 && !selectedUserId) {
          setSelectedUserId(users[0].id);
        }
      }).catch(() => {});
    }
  }, [selectedUserId]);

  const loadMessages = async () => {
    if (!currentUser) return;
    try {
      const data = await api.getMessages({
        other_user_id: selectedUserId,
        project_id: projectId
      });
      setMessages(data);
    } catch {}
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Poll messages
    return () => clearInterval(interval);
  }, [currentUser, selectedUserId, projectId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser || !selectedUserId) return;

    const content = inputText.trim();
    setInputText('');

    try {
      await api.sendMessage({
        receiver_id: selectedUserId,
        content,
        project_id: projectId
      });
      loadMessages();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 440,
        maxWidth: '100vw',
        background: '#0c1322',
        borderLeft: '1px solid var(--border-subtle)',
        boxShadow: '-12px 0 36px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1100,
        animation: 'slideInRight 0.25s ease-out'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(19, 27, 46, 0.7)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <MessageSquare size={18} color="#818cf8" />
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
              Project Messenger
            </h3>
            {projectTitle && (
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', maxWidth: 260, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                Ref: {projectTitle}
              </div>
            )}
          </div>
        </div>

        <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
          <X size={20} />
        </button>
      </div>

      {/* Select participant if multiple */}
      {availableUsers.length > 0 && !targetUserId && (
        <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {availableUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => setSelectedUserId(u.id)}
              style={{
                fontSize: '0.78rem',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                background: selectedUserId === u.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedUserId === u.id ? '1px solid #6366f1' : '1px solid var(--border-subtle)',
                color: selectedUserId === u.id ? '#818cf8' : 'var(--text-secondary)',
                whiteSpace: 'nowrap'
              }}
            >
              {u.full_name}
            </button>
          ))}
        </div>
      )}

      {/* Message Timeline */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            <MessageSquare size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
            <div>No messages yet. Send a greeting to start the conversation!</div>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === currentUser?.id;
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  {isMe ? 'You' : m.sender?.full_name || 'Collaborator'}
                </div>

                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isMe ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    lineHeight: 1.4,
                    boxShadow: isMe ? '0 4px 14px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  {m.content}
                </div>

                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSend}
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.6rem',
          background: 'rgba(19, 27, 46, 0.7)'
        }}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="form-input"
          style={{ flex: 1, padding: '0.7rem 0.9rem', fontSize: '0.88rem' }}
        />
        <button
          type="submit"
          className="btn-primary"
          style={{ padding: '0.7rem 1rem' }}
          disabled={!inputText.trim()}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
