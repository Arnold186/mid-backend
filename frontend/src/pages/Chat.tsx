import React, { useEffect, useMemo, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

let socket: Socket | null = null;

const getOrganizationRoom = (email: string) => {
  const [, domain] = email.split('@');
  return domain ? `org:${domain.toLowerCase()}` : `org:default`;
};

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const room = useMemo(
    () => (user ? getOrganizationRoom(user.email) : 'org:default'),
    [user]
  );

  useEffect(() => {
    if (!user) return;

    if (!socket) {
      socket = io('http://localhost:1085', {
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

    currentSocket.on('chat:message', (payload: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `${payload.timestamp}-${payload.senderId}-${Math.random().toString(36).slice(2)}`,
          senderId: payload.senderId,
          senderName: payload.senderName,
          message: payload.message,
          timestamp: payload.timestamp
        }
      ]);
    });

    return () => {
      currentSocket.off('connect');
      currentSocket.off('disconnect');
      currentSocket.off('chat:message');
    };
  }, [room, user]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !user || !input.trim()) return;

    socket.emit('chat:message', {
      room,
      message: input.trim(),
      senderName: user.name,
      senderId: user.id
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
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
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

