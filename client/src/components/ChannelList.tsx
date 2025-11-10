import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import { socketClient } from '../api/socket';
import './ChannelList.css';

const ChannelList: React.FC = () => {
  const { channels, currentChannelId, setCurrentChannel, setChannels, setMessages } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'text' | 'voice'>('text');

  const handleChannelClick = async (channelId: number) => {
    if (currentChannelId) {
      socketClient.leaveChannel(currentChannelId);
    }
    
    setCurrentChannel(channelId);
    socketClient.joinChannel(channelId);
    
    // Load messages
    try {
      const data = await api.getMessages(channelId);
      setMessages(channelId, data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = await api.createChannel(newChannelName, newChannelType);
      setChannels([...channels, data.channel]);
      setNewChannelName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
    }
  };

  const textChannels = channels.filter(c => c.type === 'text');
  const voiceChannels = channels.filter(c => c.type === 'voice' || c.type === 'video');

  return (
    <div className="channel-list">
      <div className="channel-section">
        <div className="section-header">
          <span>ТЕКСТОВЫЕ КАНАЛЫ</span>
          <button onClick={() => { setNewChannelType('text'); setShowCreateModal(true); }}>+</button>
        </div>
        {textChannels.map(channel => (
          <div
            key={channel.id}
            className={`channel-item ${currentChannelId === channel.id ? 'active' : ''}`}
            onClick={() => handleChannelClick(channel.id)}
          >
            <span className="channel-icon">#</span>
            <span className="channel-name">{channel.name}</span>
          </div>
        ))}
      </div>

      <div className="channel-section">
        <div className="section-header">
          <span>ГОЛОСОВЫЕ КАНАЛЫ</span>
          <button onClick={() => { setNewChannelType('voice'); setShowCreateModal(true); }}>+</button>
        </div>
        {voiceChannels.map(channel => (
          <VoiceChannel key={channel.id} channel={channel} />
        ))}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Создать канал</h3>
            <form onSubmit={handleCreateChannel}>
              <div className="form-group">
                <label>Название канала</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="новый-канал"
                  required
                />
              </div>
              <div className="form-group">
                <label>Тип канала</label>
                <select
                  value={newChannelType}
                  onChange={(e) => setNewChannelType(e.target.value as 'text' | 'voice')}
                >
                  <option value="text">Текстовый</option>
                  <option value="voice">Голосовой</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Создать</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const VoiceChannel: React.FC<{ channel: any }> = ({ channel }) => {
  const { voiceState, setVoiceChannel } = useStore();
  const isInChannel = voiceState.channelId === channel.id;

  const handleJoinVoice = () => {
    if (isInChannel) {
      socketClient.leaveVoiceChannel(channel.id);
      setVoiceChannel(null);
    } else {
      if (voiceState.channelId) {
        socketClient.leaveVoiceChannel(voiceState.channelId);
      }
      socketClient.joinVoiceChannel(channel.id);
      setVoiceChannel(channel.id);
    }
  };

  return (
    <div className={`channel-item voice ${isInChannel ? 'active' : ''}`} onClick={handleJoinVoice}>
      <span className="channel-icon">🔊</span>
      <span className="channel-name">{channel.name}</span>
      {isInChannel && <span className="voice-indicator">●</span>}
    </div>
  );
};

export default ChannelList;
