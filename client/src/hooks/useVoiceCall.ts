import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { connectSocket } from "../lib/socket";
import { endCall, joinCall as joinCallApi, leaveCall, startCall } from "../api/calls";
import type { ApiUser } from "../types/api";
import { useSessionStore } from "../store/session";

type RemotePeer = {
  id: string;
  user?: ApiUser;
  stream?: MediaStream;
};

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun.cloudflare.com:3478" },
];

interface UseVoiceCallOptions {
  channelId?: string;
  enabled?: boolean;
}

export function useVoiceCall({ channelId, enabled = false }: UseVoiceCallOptions) {
  const user = useSessionStore((state) => state.user);
  const [isJoining, setIsJoining] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const cleanupConnections = useCallback(() => {
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();
    setRemotePeers([]);
  }, []);

  const stopLocalStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }, []);

  const resetState = useCallback(() => {
    setIsJoining(false);
    setIsInCall(false);
    setError(null);
    setSessionId(null);
    stopLocalStream();
    cleanupConnections();
  }, [cleanupConnections, stopLocalStream]);

  useEffect(() => {
    return () => {
      resetState();
    };
  }, [resetState]);

  const createPeerConnection = useCallback(
    (socketId: string, userInfo: ApiUser | undefined, isInitiator: boolean, socket: ReturnType<typeof connectSocket>) => {
      if (!channelId || !localStreamRef.current || !socket) {
        return null;
      }

      let pc = peerConnections.current.get(socketId);
      if (pc) {
        return pc;
      }

      pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      peerConnections.current.set(socketId, pc);

      localStreamRef.current.getTracks().forEach((track) => {
        pc?.addTrack(track, localStreamRef.current!);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("call:signal", {
            channelId,
            targetUserId: socketId,
            signal: {
              type: "candidate",
              candidate: event.candidate,
            },
          });
        }
      };

      pc.ontrack = (event) => {
        setRemotePeers((prev) => {
          const existing = prev.find((peer) => peer.id === socketId);
          const updatedStream = event.streams[0];
          if (existing) {
            return prev.map((peer) =>
              peer.id === socketId
                ? {
                    ...peer,
                    user: userInfo ?? peer.user,
                    stream: updatedStream,
                  }
                : peer,
            );
          }
          return [
            ...prev,
            {
              id: socketId,
              user: userInfo,
              stream: updatedStream,
            },
          ];
        });
      };

      const sendOffer = async () => {
        try {
          const offer = await pc?.createOffer();
          if (!offer) return;
          await pc?.setLocalDescription(offer);
          socket.emit("call:signal", {
            channelId,
            targetUserId: socketId,
            signal: {
              type: "offer",
              sdp: offer,
            },
          });
        } catch (err) {
          console.error("Failed to negotiate offer", err);
        }
      };

      if (isInitiator) {
        void sendOffer();
      }

      return pc;
    },
    [channelId],
  );

  const joinCall = useCallback(async () => {
    if (!channelId || !user || isJoining) {
      return;
    }
    setIsJoining(true);
    setError(null);
    try {
      const socket = connectSocket();
      if (!socket) {
        throw new Error("socket-error");
      }

      const session = await startCall({ channelId });
      setSessionId(session.id);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = true;
      });

      await joinCallApi({ sessionId: session.id });
      socket.emit("call:join", { channelId });
      setIsInCall(true);
    } catch (err) {
      console.error("Failed to join call", err);
      setError("Не удалось подключиться к звонку");
      resetState();
    } finally {
      setIsJoining(false);
    }
  }, [channelId, isJoining, resetState, user]);

  const leaveCurrentCall = useCallback(async () => {
    if (!channelId || !sessionId) {
      resetState();
      return;
    }
    try {
      const socket = connectSocket();
      socket?.emit("call:leave", { channelId });
      await leaveCall({ sessionId });
    } catch (err) {
      console.error("Failed to leave call", err);
    } finally {
      resetState();
    }
  }, [channelId, sessionId, resetState]);

  const endCurrentCall = useCallback(async () => {
    if (!sessionId) return;
    try {
      await endCall({ sessionId });
    } catch (err) {
      console.error("Failed to end call", err);
    } finally {
      leaveCurrentCall();
    }
  }, [leaveCurrentCall, sessionId]);

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }, []);

  useEffect(() => {
    if (!enabled || !channelId || !isInCall) {
      return;
    }
    const socket = connectSocket();
    if (!socket) {
      return;
    }

      const handleExistingPeers = (peers: Array<{ socketId: string; user?: ApiUser }>) => {
        peers.forEach((peer) => {
          const pc = createPeerConnection(peer.socketId, peer.user, true, socket);
          if (!pc) return;
        });
      };

      const handlePeerJoined = ({ socketId, user: peerUser }: { socketId: string; user?: ApiUser }) => {
        const pc = createPeerConnection(socketId, peerUser, true, socket);
        if (!pc) return;
      };

    const handlePeerLeft = ({ socketId }: { socketId: string }) => {
      const pc = peerConnections.current.get(socketId);
      pc?.close();
      peerConnections.current.delete(socketId);
      setRemotePeers((prev) => prev.filter((peer) => peer.id !== socketId));
    };

    const handleSignal = async ({
      from,
      signal,
    }: {
      from: string;
      signal: { type: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit };
    }) => {
      const pc =
        peerConnections.current.get(from) ??
        createPeerConnection(from, undefined, false, socket);
      if (!pc) return;

      if (signal.type === "offer" && signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("call:signal", {
          channelId,
          targetUserId: from,
          signal: {
            type: "answer",
            sdp: answer,
          },
        });
      } else if (signal.type === "answer" && signal.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      } else if (signal.type === "candidate" && signal.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } catch (err) {
          console.error("Failed to add ICE candidate", err);
        }
      }
    };

    socket.on("call:existing-peers", handleExistingPeers);
    socket.on("call:peer-joined", handlePeerJoined);
    socket.on("call:peer-left", handlePeerLeft);
    socket.on("call:signal", handleSignal);

    return () => {
      socket.off("call:existing-peers", handleExistingPeers);
      socket.off("call:peer-joined", handlePeerJoined);
      socket.off("call:peer-left", handlePeerLeft);
      socket.off("call:signal", handleSignal);
    };
  }, [channelId, createPeerConnection, enabled, isInCall]);

  useEffect(() => {
    if (!enabled && isInCall) {
      leaveCurrentCall();
    }
  }, [enabled, isInCall, leaveCurrentCall]);

  const participants = useMemo(() => {
    const localParticipant: RemotePeer | undefined =
      localStreamRef.current && user
        ? {
            id: "local",
            user,
            stream: localStreamRef.current,
          }
        : undefined;

    return [
      ...(localParticipant ? [localParticipant] : []),
      ...remotePeers,
    ];
  }, [remotePeers, user]);

  return {
    isJoining,
    isInCall,
    isMuted,
    error,
    participants,
    joinCall,
    leaveCall: leaveCurrentCall,
    endCall: endCurrentCall,
    toggleMute,
  };
}
