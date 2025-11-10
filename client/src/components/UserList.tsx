import React from 'react';
import { useStore } from '../store/useStore';
import './UserList.css';

const UserList: React.FC = () => {
  const { onlineUsers } = useStore();

  const onlineCount = onlineUsers.filter(u => u.status === 'online').length;
  const offlineUsers = onlineUsers.filter(u => u.status === 'offline');
  const onlineOnly = onlineUsers.filter(u => u.status === 'online');

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h3>Пользователи</h3>
        <span className="online-count">{onlineCount} онлайн</span>
      </div>

      {onlineOnly.length > 0 && (
        <div className="user-section">
          <div className="section-title">Онлайн — {onlineOnly.length}</div>
          {onlineOnly.map(user => (
            <UserItem key={user.id} user={user} />
          ))}
        </div>
      )}

      {offlineUsers.length > 0 && (
        <div className="user-section">
          <div className="section-title">Оффлайн — {offlineUsers.length}</div>
          {offlineUsers.map(user => (
            <UserItem key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};

const UserItem: React.FC<{ user: any }> = ({ user }) => {
  const isOnline = user.status === 'online';

  return (
    <div className="user-item">
      <div className="user-avatar">
        {user.avatar_url ? (
          <img src={`http://localhost:3000${user.avatar_url}`} alt={user.username} />
        ) : (
          user.username.charAt(0).toUpperCase()
        )}
        <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`} />
      </div>
      <div className="user-details">
        <span className="user-name">{user.username}</span>
        <span className={`user-status ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Онлайн' : 'Оффлайн'}
        </span>
      </div>
    </div>
  );
};

export default UserList;
