import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../api/client';
import './Settings.css';

const Settings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('❌ Файл слишком большой! Максимум 5 МБ');
      return;
    }

    // Проверка типа
    if (!file.type.startsWith('image/')) {
      setMessage('❌ Можно загружать только изображения и GIF');
      return;
    }

    setIsUploading(true);
    setMessage('⏳ Загрузка...');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = api.getToken();
      const response = await fetch(`${api.getBaseUrl()}/api/auth/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        setMessage('✅ Аватар обновлен! Обновите страницу');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage('❌ Ошибка загрузки');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setMessage('❌ Ошибка загрузки');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Настройки</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Профиль</h3>
            
            <div className="profile-info">
              <div className="current-avatar">
                {user?.avatar_url ? (
                  <img src={`http://localhost:3000${user.avatar_url}`} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">{user?.username.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="profile-details">
                <p><strong>Имя:</strong> {user?.username}</p>
                <p><strong>Email:</strong> {user?.email}</p>
              </div>
            </div>

            <div className="avatar-upload">
              <h4>Изменить аватар (включая GIF)</h4>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*,.gif"
                style={{ display: 'none' }}
              />
              <button
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? '⏳ Загрузка...' : '📤 Выбрать файл'}
              </button>
              {message && <p className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</p>}
              <p className="hint">Поддерживаются JPG, PNG, GIF (до 5 МБ)</p>
            </div>
          </div>

          <div className="settings-section">
            <h3>Кастомизация через DevTools</h3>
            <p className="description">
              Нажмите <kbd>F12</kbd> чтобы открыть DevTools браузера и изменить любые стили!
            </p>
            <div className="devtools-examples">
              <p><strong>Примеры команд в Console:</strong></p>
              <code>
                // Изменить основной цвет<br/>
                document.documentElement.style.setProperty('--accent-primary', '#ff0000');<br/><br/>
                // Изменить фон<br/>
                document.documentElement.style.setProperty('--bg-primary', '#1a1a2e');<br/><br/>
                // Увеличить размер текста<br/>
                document.documentElement.style.fontSize = '18px';
              </code>
            </div>
          </div>

          <div className="settings-section">
            <h3>О программе</h3>
            <div className="about">
              <div className="logo-big">⚡</div>
              <h1>FUSE</h1>
              <p>Версия 1.0.0</p>
              <p>Командные звонки и чат</p>
              <p className="hint">Сделано с ❤️ для геймеров и команд</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
