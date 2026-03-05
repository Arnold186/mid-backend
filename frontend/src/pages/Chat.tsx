import React, { useEffect, useMemo, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
  message: string;
  timestamp: string;
}

interface ChatMessagePayload {
  id: string;
  room: string;
  senderId: string;
  senderName: string;
  senderRole: 'ADMIN' | 'TEACHER' | 'STUDENT';
  message: string;
  timestamp: string;
}

let socket: Socket | null = null;

const getOrganizationRoom = (email: string) => {
  const [, domain] = email.split('@');
  return domain ? `org:${domain.toLowerCase()}` : `org:default`;
};

const Chat: React.FC = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const room = useMemo(
    () => (user ? getOrganizationRoom(user.email) : 'org:default'),
    [user]
  );

  // Fetch Chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!token) return;
        const response = await fetch(`http://localhost:1099/api/chat/${room}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const messages = await response.json();
        const normalized = (Array.isArray(messages) ? messages : []).map((m: any) => ({
          ...m,
          senderRole: m.senderRole ?? 'STUDENT'
        }));
        setMessages(normalized);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (user && room) {
      fetchMessages();
    }
  }, [room, token, user]);


  // Socket setup
  useEffect(() => {
    if (!user) return;

    if (!socket) {
      socket = io('http://localhost:1099', {
        transports: ['websocket']
      });
    }

    const currentSocket = socket;

    currentSocket.on('connect', () => {
      setIsConnected(true);
      currentSocket.emit('joinRoom', room);
    });

    currentSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    currentSocket.on('chat:message', (payload: ChatMessagePayload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [
          ...prev,
          {
            id: payload.id,
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderRole: payload.senderRole,
            message: payload.message,
            timestamp: payload.timestamp
          }
        ];
      });
    });

    return () => {
      currentSocket.off('connect');
      currentSocket.off('disconnect');
      currentSocket.off('chat:message');
    };
  }, [room, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !user || !input.trim()) return;

    socket.emit('chat:message', {
      room,
      message: input.trim(),
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role
    });

    setInput('');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h2 className="chat-title">Organization Chat</h2>
          <p className="chat-subtitle">
            You are chatting with people from{' '}
            <strong>{user.email.split('@')[1] || 'your organization'}</strong>
          </p>
        </div>
        <span className={`chat-status ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Say hello 👋</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-message ${
                msg.senderId === user.id ? 'chat-message-own' : ''
              }`}
            >
              <div className="chat-message-meta">
                <span className="chat-message-sender">
                  {msg.senderId === user.id ? 'You' : msg.senderName}
                  <span className={`chat-role chat-role-${msg.senderRole.toLowerCase()}`}>
                    {msg.senderRole}
                  </span>
                </span>
                <span className="chat-message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <div className="chat-message-body">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <textarea
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={2}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!isConnected || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;

