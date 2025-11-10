import React from 'react';
import { useStore } from '../store/useStore';
import './VoiceControls.css';

const VoiceControls: React.FC = () => {
  const { voiceState, toggleMute, toggleDeafen, toggleVideo } = useStore();

  return (
    <div className="voice-controls">
      <div className="voice-status">
        <div className="voice-indicator-wrapper">
          <div className="voice-indicator active"></div>
        </div>
        <div className="voice-info">
          <span className="voice-label">В голосовом канале</span>
          <span className="participants-count">
            {voiceState.participants.length} участников
          </span>
        </div>
      </div>

      <div className="control-buttons">
        <button
          className={`control-btn ${voiceState.isMuted ? 'active' : ''}`}
          onClick={toggleMute}
          title={voiceState.isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
        >
          {voiceState.isMuted ? '🔇' : '🎤'}
        </button>

        <button
          className={`control-btn ${voiceState.isDeafened ? 'active' : ''}`}
          onClick={toggleDeafen}
          title={voiceState.isDeafened ? 'Включить звук' : 'Выключить звук'}
        >
          {voiceState.isDeafened ? '🔇' : '🔊'}
        </button>

        <button
          className={`control-btn ${voiceState.isVideoEnabled ? 'active' : ''}`}
          onClick={toggleVideo}
          title={voiceState.isVideoEnabled ? 'Выключить камеру' : 'Включить камеру'}
        >
          {voiceState.isVideoEnabled ? '📹' : '📷'}
        </button>
      </div>
    </div>
  );
};

export default VoiceControls;
