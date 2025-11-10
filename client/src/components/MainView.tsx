import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import ChannelList from './ChannelList';
import ChatView from './ChatView';
import UserList from './UserList';
import VoiceControls from './VoiceControls';
import Settings from './Settings';
import './MainView.css';

const MainView: React.FC = () => {
  const { user, currentChannelId, voiceState } = useStore();
  const [showUserList, setShowUserList] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="main-view">
      <div className="sidebar-left">
        <div className="server-header">
          <div className="server-title">
            <span className="server-icon">⚡</span>
            <h2>FUSE</h2>
          </div>
          <div className="user-status" onClick={() => setShowSettings(true)} style={{ cursor: 'pointer' }} title="Настройки">
            <div className="avatar">
              {user?.avatar_url ? (
                <img src={`http://localhost:3000${user.avatar_url}`} alt={user.username} />
              ) : (
                user?.username.charAt(0).toUpperCase()
              )}
            </div>
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
            <div className="welcome-icon">⚡</div>
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

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

export default MainView;
