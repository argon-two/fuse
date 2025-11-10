import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import ChannelList from './ChannelList';
import ChatView from './ChatView';
import UserList from './UserList';
import VoiceControls from './VoiceControls';
import './MainView.css';

const MainView: React.FC = () => {
  const { user, currentChannelId, voiceState } = useStore();
  const [showUserList, setShowUserList] = useState(true);

  return (
    <div className="main-view">
      <div className="sidebar-left">
        <div className="server-header">
          <h2>FUSE SERVER</h2>
          <div className="user-status">
            <div className="avatar">{user?.username.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <span className="username">{user?.username}</span>
              <span className="status online">● Онлайн</span>
            </div>
          </div>
        </div>
        <ChannelList />
        {voiceState.channelId && <VoiceControls />}
      </div>

      <div className="main-content">
        {currentChannelId ? (
          <ChatView />
        ) : (
          <div className="no-channel-selected">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <circle cx="50" cy="50" r="45" fill="var(--accent-primary)" opacity="0.2" />
              <path d="M 30 35 L 30 65 L 50 50 L 70 65 L 70 35 Z" fill="var(--accent-primary)" />
            </svg>
            <h2>Добро пожаловать в Fuse!</h2>
            <p>Выберите канал слева, чтобы начать общение</p>
          </div>
        )}
      </div>

      {showUserList && (
        <div className="sidebar-right">
          <UserList />
        </div>
      )}

      <button
        className="toggle-userlist"
        onClick={() => setShowUserList(!showUserList)}
        title={showUserList ? 'Скрыть список пользователей' : 'Показать список пользователей'}
      >
        {showUserList ? '→' : '←'}
      </button>
    </div>
  );
};

export default MainView;
