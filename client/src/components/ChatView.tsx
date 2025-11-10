import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import { socketClient } from '../api/socket';
import './ChatView.css';

const ChatView: React.FC = () => {
  const { currentChannelId, channels, messages, user } = useStore();
  const [messageInput, setMessageInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentChannel = channels.find(c => c.id === currentChannelId);
  const channelMessages = currentChannelId ? messages[currentChannelId] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !currentChannelId) return;

    socketClient.sendMessage({
      channelId: currentChannelId,
      content: messageInput,
      messageType: 'text'
    });

    setMessageInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChannelId) return;

    setIsUploading(true);

    try {
      const uploadData = await api.uploadFile(file);
      
      let messageType = 'file';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('audio/')) messageType = 'audio';
      else if (file.type.startsWith('video/')) messageType = 'video';

      socketClient.sendMessage({
        channelId: currentChannelId,
        content: uploadData.file.name,
        messageType,
        fileUrl: uploadData.file.url,
        fileName: uploadData.file.name,
        fileSize: uploadData.file.size
      });
    } catch (error) {
      console.error('File upload failed:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="chat-view">
      <div className="chat-header">
        <span className="channel-icon">#</span>
        <h3>{currentChannel?.name || 'Канал'}</h3>
      </div>

      <div className="messages-container">
        {channelMessages.length === 0 ? (
          <div className="no-messages">
            <p>Пока нет сообщений. Начните общение!</p>
          </div>
        ) : (
          channelMessages.map((msg) => (
            <MessageItem key={msg.id} message={msg} isOwn={msg.user_id === user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <form onSubmit={handleSendMessage} className="message-form">
          <button
            type="button"
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Прикрепить файл"
          >
            {isUploading ? '⏳' : '📎'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={`Сообщение в #${currentChannel?.name || 'канал'}`}
            disabled={isUploading}
            className="message-input"
          />
          <button type="submit" className="send-button" disabled={isUploading || !messageInput.trim()}>
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

const MessageItem: React.FC<{ message: any; isOwn: boolean }> = ({ message, isOwn }) => {
  const avatarSrc = message.avatar_url ? `http://localhost:3000${message.avatar_url}` : null;
  
  const renderContent = () => {
    if (message.message_type === 'image' && message.file_url) {
      return (
        <div className="message-image">
          <img src={api.getFileUrl(message.file_url)} alt={message.file_name} />
        </div>
      );
    }

    if (message.message_type === 'audio' && message.file_url) {
      return (
        <div className="message-audio">
          <audio controls src={api.getFileUrl(message.file_url)} />
          <span className="file-name">{message.file_name}</span>
        </div>
      );
    }

    if (message.message_type === 'video' && message.file_url) {
      return (
        <div className="message-video">
          <video controls src={api.getFileUrl(message.file_url)} />
          <span className="file-name">{message.file_name}</span>
        </div>
      );
    }

    if (message.message_type === 'file' && message.file_url) {
      return (
        <div className="message-file">
          <a href={api.getFileUrl(message.file_url)} download={message.file_name} target="_blank" rel="noopener noreferrer">
            📄 {message.file_name}
          </a>
          <span className="file-size">{formatFileSize(message.file_size)}</span>
        </div>
      );
    }

    return <p className="message-text">{message.content}</p>;
  };

  return (
    <div className={`message ${isOwn ? 'own' : ''}`}>
      {!isOwn && (
        <div className="message-avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt={message.username} />
          ) : (
            message.username?.charAt(0).toUpperCase()
          )}
        </div>
      )}
      <div className="message-content">
        {!isOwn && <span className="message-author">{message.username}</span>}
        {renderContent()}
        <span className="message-time">{formatTime(message.created_at)}</span>
      </div>
    </div>
  );
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default ChatView;
