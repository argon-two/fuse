import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { socketClient } from '../api/socket';
import { webrtcService } from '../services/webrtc';

export const useVoiceChat = () => {
  const { voiceState, user, onlineUsers } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<Map<number, MediaStream>>(new Map());

  useEffect(() => {
    if (voiceState.channelId && !isInitialized) {
      initializeVoice();
      setIsInitialized(true);
    }

    if (!voiceState.channelId && isInitialized) {
      cleanup();
      setIsInitialized(false);
    }

    return () => {
      if (isInitialized) {
        cleanup();
      }
    };
  }, [voiceState.channelId]);

  useEffect(() => {
    // Toggle audio based on mute state
    webrtcService.toggleAudio(!voiceState.isMuted);
  }, [voiceState.isMuted]);

  useEffect(() => {
    // Toggle video based on video state
    webrtcService.toggleVideo(voiceState.isVideoEnabled);
  }, [voiceState.isVideoEnabled]);

  const initializeVoice = async () => {
    try {
      await webrtcService.initializeLocalStream(true, voiceState.isVideoEnabled);

      // Setup socket listeners
      socketClient.onCallMade(async (data) => {
        await webrtcService.handleIncomingCall(data.from, data.offer, data.channelId);
      });

      socketClient.onAnswerMade(async (data) => {
        await webrtcService.handleAnswer(data.from, data.answer);
      });

      socketClient.onIceCandidate(async (data) => {
        await webrtcService.handleIceCandidate(data.from, data.candidate);
      });

      socketClient.onUserJoinedVoice((data) => {
        if (data.userId !== user?.id) {
          // Call the new user
          webrtcService.callUser(data.userId, voiceState.channelId!);
        }
      });

      socketClient.onUserLeftVoice((data) => {
        webrtcService.closePeerConnection(data.userId);
        setRemoteUsers(prev => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
      });

      // Handle remote streams
      const handleRemoteStream = (event: any) => {
        const { userId, stream } = event.detail;
        setRemoteUsers(prev => {
          const next = new Map(prev);
          next.set(userId, stream);
          return next;
        });
      };

      const handlePeerDisconnected = (event: any) => {
        const { userId } = event.detail;
        setRemoteUsers(prev => {
          const next = new Map(prev);
          next.delete(userId);
          return next;
        });
      };

      window.addEventListener('remote-stream', handleRemoteStream);
      window.addEventListener('peer-disconnected', handlePeerDisconnected);

      // Call existing users in the channel
      const usersInChannel = onlineUsers.filter(u => u.id !== user?.id);
      for (const otherUser of usersInChannel) {
        webrtcService.callUser(otherUser.id, voiceState.channelId!);
      }

    } catch (error) {
      console.error('Failed to initialize voice:', error);
    }
  };

  const cleanup = () => {
    webrtcService.closeAllConnections();
    setRemoteUsers(new Map());
  };

  return {
    localStream: webrtcService.getLocalStream(),
    remoteUsers
  };
};
