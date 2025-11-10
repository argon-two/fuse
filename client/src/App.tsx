import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { api } from './api/client';
import { socketClient } from './api/socket';
import LoginScreen from './components/LoginScreen';
import MainView from './components/MainView';
import './styles/App.css';

const App: React.FC = () => {
  const { user, token, setAuth, setChannels, setOnlineUsers, addMessage } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Try to restore session
    const savedToken = api.getToken();
    const savedHost = localStorage.getItem('fuse_host');
    const savedPort = localStorage.getItem('fuse_port');

    if (savedToken && savedHost && savedPort) {
      api.setServer({ host: savedHost, port: parseInt(savedPort) });
      api.setToken(savedToken);
      
      api.getMe().then((data) => {
        setAuth(data.user, savedToken);
        initializeSocket(savedToken);
      }).catch(() => {
        api.clearToken();
        setIsInitialized(true);
      });
    } else {
      setIsInitialized(true);
    }
  }, []);

  const initializeSocket = (token: string) => {
    const socket = socketClient.connect(token);

    socket.on('connect', async () => {
      try {
        const channelsData = await api.getChannels();
        setChannels(channelsData.channels);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load channels:', error);
      }
    });

    socketClient.onNewMessage((message) => {
      addMessage(message.channel_id, message);
    });

    socketClient.onUserList((users) => {
      setOnlineUsers(users);
    });
  };

  useEffect(() => {
    if (user && token && !socketClient.getSocket()) {
      initializeSocket(token);
    }
  }, [user, token]);

  if (!isInitialized) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка Fuse...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {user ? <MainView /> : <LoginScreen />}
    </div>
  );
};

export default App;
