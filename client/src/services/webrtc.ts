import { socketClient } from '../api/socket';

export class WebRTCService {
  private peerConnections: Map<number, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<number, MediaStream> = new Map();
  
  private config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  async initializeLocalStream(audio: boolean = true, video: boolean = false): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      });
      
      return this.localStream;
    } catch (error) {
      console.error('Failed to get media devices:', error);
      throw error;
    }
  }

  async createPeerConnection(userId: number, channelId: number): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(this.config);
    
    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketClient.sendIceCandidate(userId, event.candidate);
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      this.remoteStreams.set(userId, remoteStream);
      
      // Trigger event for UI to handle
      window.dispatchEvent(new CustomEvent('remote-stream', {
        detail: { userId, stream: remoteStream }
      }));
    };

    // Handle connection state
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with user ${userId}:`, pc.connectionState);
      
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        this.closePeerConnection(userId);
      }
    };

    this.peerConnections.set(userId, pc);
    return pc;
  }

  async callUser(userId: number, channelId: number) {
    try {
      const pc = await this.createPeerConnection(userId, channelId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      socketClient.callUser(userId, offer, channelId);
    } catch (error) {
      console.error('Failed to call user:', error);
    }
  }

  async handleIncomingCall(userId: number, offer: RTCSessionDescriptionInit, channelId: number) {
    try {
      const pc = await this.createPeerConnection(userId, channelId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      socketClient.makeAnswer(userId, answer);
    } catch (error) {
      console.error('Failed to handle incoming call:', error);
    }
  }

  async handleAnswer(userId: number, answer: RTCSessionDescriptionInit) {
    try {
      const pc = this.peerConnections.get(userId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Failed to handle answer:', error);
    }
  }

  async handleIceCandidate(userId: number, candidate: RTCIceCandidateInit) {
    try {
      const pc = this.peerConnections.get(userId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Failed to handle ICE candidate:', error);
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  toggleVideo(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  closePeerConnection(userId: number) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
    
    this.remoteStreams.delete(userId);
    
    window.dispatchEvent(new CustomEvent('peer-disconnected', {
      detail: { userId }
    }));
  }

  closeAllConnections() {
    this.peerConnections.forEach((pc, userId) => {
      pc.close();
    });
    
    this.peerConnections.clear();
    this.remoteStreams.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(userId: number): MediaStream | undefined {
    return this.remoteStreams.get(userId);
  }

  getAllRemoteStreams(): Map<number, MediaStream> {
    return this.remoteStreams;
  }
}

export const webrtcService = new WebRTCService();
