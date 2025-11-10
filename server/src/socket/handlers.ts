import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { MessageModel } from '../models/Message';

interface SocketWithUser extends Socket {
  userId?: number;
  username?: string;
}

export class SocketHandlers {
  private io: Server;
  private users: Map<number, string> = new Map(); // userId -> socketId
  private socketToUser: Map<string, number> = new Map(); // socketId -> userId

  constructor(io: Server) {
    this.io = io;
    this.setupMiddleware();
  }

  private setupMiddleware() {
    this.io.use(async (socket: SocketWithUser, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.username = user.username;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  public setupHandlers() {
    this.io.on('connection', (socket: SocketWithUser) => {
      console.log(`User connected: ${socket.username} (${socket.id})`);

      // Register user
      if (socket.userId) {
        this.users.set(socket.userId, socket.id);
        this.socketToUser.set(socket.id, socket.userId);
        UserModel.updateStatus(socket.userId, 'online');
      }

      // Broadcast user list
      this.broadcastUserList();

      // Join channel
      socket.on('join-channel', (channelId: number) => {
        socket.join(`channel-${channelId}`);
        console.log(`${socket.username} joined channel ${channelId}`);
      });

      // Leave channel
      socket.on('leave-channel', (channelId: number) => {
        socket.leave(`channel-${channelId}`);
        console.log(`${socket.username} left channel ${channelId}`);
      });

      // Send message
      socket.on('send-message', async (data: {
        channelId: number;
        content: string;
        messageType?: string;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
      }) => {
        try {
          const message = await MessageModel.create(
            data.channelId,
            socket.userId!,
            data.content,
            data.messageType,
            data.fileUrl,
            data.fileName,
            data.fileSize
          );

          const user = await UserModel.findById(socket.userId!);

          const messageData = {
            ...message,
            username: user?.username,
            avatar_url: user?.avatar_url
          };

          this.io.to(`channel-${data.channelId}`).emit('new-message', messageData);
        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // WebRTC signaling
      socket.on('call-user', (data: { to: number; offer: any; channelId: number }) => {
        const targetSocketId = this.users.get(data.to);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('call-made', {
            offer: data.offer,
            from: socket.userId,
            username: socket.username,
            channelId: data.channelId
          });
        }
      });

      socket.on('make-answer', (data: { to: number; answer: any }) => {
        const targetSocketId = this.users.get(data.to);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('answer-made', {
            answer: data.answer,
            from: socket.userId,
            username: socket.username
          });
        }
      });

      socket.on('ice-candidate', (data: { to: number; candidate: any }) => {
        const targetSocketId = this.users.get(data.to);
        if (targetSocketId) {
          this.io.to(targetSocketId).emit('ice-candidate', {
            candidate: data.candidate,
            from: socket.userId
          });
        }
      });

      socket.on('join-voice-channel', (data: { channelId: number }) => {
        socket.join(`voice-${data.channelId}`);
        socket.to(`voice-${data.channelId}`).emit('user-joined-voice', {
          userId: socket.userId,
          username: socket.username
        });
      });

      socket.on('leave-voice-channel', (data: { channelId: number }) => {
        socket.leave(`voice-${data.channelId}`);
        socket.to(`voice-${data.channelId}`).emit('user-left-voice', {
          userId: socket.userId,
          username: socket.username
        });
      });

      // Typing indicator
      socket.on('typing-start', (data: { channelId: number }) => {
        socket.to(`channel-${data.channelId}`).emit('user-typing', {
          userId: socket.userId,
          username: socket.username
        });
      });

      socket.on('typing-stop', (data: { channelId: number }) => {
        socket.to(`channel-${data.channelId}`).emit('user-stopped-typing', {
          userId: socket.userId
        });
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.username} (${socket.id})`);
        
        if (socket.userId) {
          this.users.delete(socket.userId);
          this.socketToUser.delete(socket.id);
          UserModel.updateStatus(socket.userId, 'offline');
        }

        this.broadcastUserList();
      });
    });
  }

  private async broadcastUserList() {
    try {
      const allUsers = await UserModel.getAllUsers();
      this.io.emit('user-list', allUsers);
    } catch (error) {
      console.error('Error broadcasting user list:', error);
    }
  }
}
