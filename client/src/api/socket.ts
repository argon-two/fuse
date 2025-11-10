import { io, Socket } from 'socket.io-client';
import { api } from './client';

class SocketClient {
  private socket: Socket | null = null;

  connect(token: string) {
    const baseUrl = api.getBaseUrl();
    
    this.socket = io(baseUrl, {
      auth: { token },
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinChannel(channelId: number) {
    this.socket?.emit('join-channel', channelId);
  }

  leaveChannel(channelId: number) {
    this.socket?.emit('leave-channel', channelId);
  }

  sendMessage(data: {
    channelId: number;
    content: string;
    messageType?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) {
    this.socket?.emit('send-message', data);
  }

  onNewMessage(callback: (message: any) => void) {
    this.socket?.on('new-message', callback);
  }

  onUserList(callback: (users: any[]) => void) {
    this.socket?.on('user-list', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user-typing', callback);
  }

  onUserStoppedTyping(callback: (data: any) => void) {
    this.socket?.on('user-stopped-typing', callback);
  }

  startTyping(channelId: number) {
    this.socket?.emit('typing-start', { channelId });
  }

  stopTyping(channelId: number) {
    this.socket?.emit('typing-stop', { channelId });
  }

  // WebRTC signaling
  callUser(to: number, offer: RTCSessionDescriptionInit, channelId: number) {
    this.socket?.emit('call-user', { to, offer, channelId });
  }

  onCallMade(callback: (data: any) => void) {
    this.socket?.on('call-made', callback);
  }

  makeAnswer(to: number, answer: RTCSessionDescriptionInit) {
    this.socket?.emit('make-answer', { to, answer });
  }

  onAnswerMade(callback: (data: any) => void) {
    this.socket?.on('answer-made', callback);
  }

  sendIceCandidate(to: number, candidate: RTCIceCandidate) {
    this.socket?.emit('ice-candidate', { to, candidate });
  }

  onIceCandidate(callback: (data: any) => void) {
    this.socket?.on('ice-candidate', callback);
  }

  joinVoiceChannel(channelId: number) {
    this.socket?.emit('join-voice-channel', { channelId });
  }

  leaveVoiceChannel(channelId: number) {
    this.socket?.emit('leave-voice-channel', { channelId });
  }

  onUserJoinedVoice(callback: (data: any) => void) {
    this.socket?.on('user-joined-voice', callback);
  }

  onUserLeftVoice(callback: (data: any) => void) {
    this.socket?.on('user-left-voice', callback);
  }
}

export const socketClient = new SocketClient();
