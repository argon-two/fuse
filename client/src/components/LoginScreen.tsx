import React, { useState } from 'react';
import { api } from '../api/client';
import { useStore } from '../store/useStore';
import './LoginScreen.css';

const LoginScreen: React.FC = () => {
  const [mode, setMode] = useState<'connect' | 'login' | 'register'>('connect');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('3000');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setAuth, setConnection } = useStore();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      api.setServer({ host, port: parseInt(port) });
      const response = await fetch(`http://${host}:${port}/health`);
      
      if (response.ok) {
        setConnection(host, parseInt(port));
        localStorage.setItem('fuse_host', host);
        localStorage.setItem('fuse_port', port);
        setMode('login');
      } else {
        setError('Не удалось подключиться к серверу');
      }
    } catch (err) {
      setError('Не удалось подключиться к серверу. Проверьте адрес и порт.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await api.login(username, password);
      api.setToken(data.token);
      setAuth(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await api.register(username, email, password);
      api.setToken(data.token);
      setAuth(data.user, data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="logo">
            <svg viewBox="0 0 100 100" width="60" height="60">
              <circle cx="50" cy="50" r="45" fill="var(--accent-primary)" />
              <path d="M 30 35 L 30 65 L 50 50 L 70 65 L 70 35 Z" fill="var(--bg-primary)" />
            </svg>
          </div>
          <h1>FUSE</h1>
          <p>Командные звонки и чат</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {mode === 'connect' && (
          <form onSubmit={handleConnect} className="login-form">
            <h2>Подключение к серверу</h2>
            <div className="form-group">
              <label>Адрес сервера</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="localhost или IP адрес"
                required
              />
            </div>
            <div className="form-group">
              <label>Порт</label>
              <input
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="3000"
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              Подключиться
            </button>
          </form>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="login-form">
            <h2>Вход</h2>
            <div className="form-group">
              <label>Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите имя пользователя"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setMode('register')}
              disabled={isLoading}
            >
              Создать аккаунт
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => setMode('connect')}
              disabled={isLoading}
            >
              ← Сменить сервер
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="login-form">
            <h2>Регистрация</h2>
            <div className="form-group">
              <label>Имя пользователя</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите имя пользователя"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setMode('login')}
              disabled={isLoading}
            >
              Уже есть аккаунт?
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
