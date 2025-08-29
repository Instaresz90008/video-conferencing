
import { realTimeService } from '@/services/realTimeService';
import { meetingApi } from '@/services/meetingApi';

export interface RTCConnectionState {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  peerConnections: Map<string, RTCPeerConnection>;
  isScreenSharing: boolean;
}

class WebRTCService {
  private state: RTCConnectionState = {
    localStream: null,
    remoteStreams: new Map(),
    peerConnections: new Map(),
    isScreenSharing: false
  };

  private configuration: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun.l.google.com:5349" },
      { urls: "stun:stun1.l.google.com:3478" },
      { urls: "stun:stun1.l.google.com:5349" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:5349" },
      { urls: "stun:stun3.l.google.com:3478" },
      { urls: "stun:stun3.l.google.com:5349" },
      { urls: "stun:stun4.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:5349" }
      // Add TURN servers from your PostgreSQL backend config
    ]
  };

  async initializeMedia(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.state.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw error;
    }
  }

  async joinMeeting(meetingId: string, participantId: string): Promise<void> {
    // Subscribe to WebRTC signals from PostgreSQL backend
    meetingApi.subscribeToSignals(meetingId, (signal) => {
      this.handleSignal(signal, meetingId);
    });

    // Announce joining to other participants
    await meetingApi.sendSignal(meetingId, {
      type: 'participant_joined',
      participantId,
      timestamp: Date.now()
    });
  }

  async createPeerConnection(participantId: string, meetingId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.configuration);

    // Add local stream to peer connection
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.state.localStream!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      this.state.remoteStreams.set(participantId, remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        meetingApi.sendSignal(meetingId, {
          type: 'ice_candidate',
          candidate: event.candidate,
          participantId,
          timestamp: Date.now()
        });
      }
    };

    this.state.peerConnections.set(participantId, peerConnection);
    return peerConnection;
  }

  private async handleSignal(signal: any, meetingId: string): Promise<void> {
    const { type, participantId, data } = signal;

    switch (type) {
      case 'offer':
        await this.handleOffer(signal, meetingId);
        break;
      case 'answer':
        await this.handleAnswer(signal);
        break;
      case 'ice_candidate':
        await this.handleIceCandidate(signal);
        break;
      case 'participant_joined':
        await this.handleParticipantJoined(signal, meetingId);
        break;
      case 'participant_left':
        this.handleParticipantLeft(signal);
        break;
    }
  }

  private async handleOffer(signal: any, meetingId: string): Promise<void> {
    const { participantId, offer } = signal;
    const peerConnection = await this.createPeerConnection(participantId, meetingId);

    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    await meetingApi.sendSignal(meetingId, {
      type: 'answer',
      answer,
      participantId,
      timestamp: Date.now()
    });
  }

  private async handleAnswer(signal: any): Promise<void> {
    const { participantId, answer } = signal;
    const peerConnection = this.state.peerConnections.get(participantId);

    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
    }
  }

  private async handleIceCandidate(signal: any): Promise<void> {
    const { participantId, candidate } = signal;
    const peerConnection = this.state.peerConnections.get(participantId);

    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
    }
  }

  private async handleParticipantJoined(signal: any, meetingId: string): Promise<void> {
    const { participantId } = signal;
    const peerConnection = await this.createPeerConnection(participantId, meetingId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    await meetingApi.sendSignal(meetingId, {
      type: 'offer',
      offer,
      participantId,
      timestamp: Date.now()
    });
  }

  private handleParticipantLeft(signal: any): void {
    const { participantId } = signal;
    const peerConnection = this.state.peerConnections.get(participantId);

    if (peerConnection) {
      peerConnection.close();
      this.state.peerConnections.delete(participantId);
      this.state.remoteStreams.delete(participantId);
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      this.state.isScreenSharing = true;

      // Replace video track in all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      this.state.peerConnections.forEach(peerConnection => {
        const sender = peerConnection.getSenders().find(s =>
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      return screenStream;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.state.localStream) {
      const videoTrack = this.state.localStream.getVideoTracks()[0];

      this.state.peerConnections.forEach(peerConnection => {
        const sender = peerConnection.getSenders().find(s =>
          s.track && s.track.kind === 'video'
        );
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      });
    }

    this.state.isScreenSharing = false;
  }

  disconnect(): void {
    // Close all peer connections
    this.state.peerConnections.forEach(peerConnection => {
      peerConnection.close();
    });

    // Stop local stream
    if (this.state.localStream) {
      this.state.localStream.getTracks().forEach(track => track.stop());
    }

    // Clear state
    this.state.peerConnections.clear();
    this.state.remoteStreams.clear();
    this.state.localStream = null;
  }

  getState(): RTCConnectionState {
    return { ...this.state };
  }
}

export const webRTCService = new WebRTCService();
