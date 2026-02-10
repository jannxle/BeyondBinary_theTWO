import React from 'react';
import { Video, VideoOff } from 'lucide-react';

export default function GestureInput({ videoRef, canvasRef, isVideoActive, toggleVideo }) {
  return (
    <>
      <div className="video-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`video-feed ${isVideoActive ? 'active' : 'hidden'}`}
        />
        <canvas
          ref={canvasRef}
          className={`video-canvas ${isVideoActive ? 'active' : 'hidden'}`}
        />
        {!isVideoActive && (
          <div className="inactive-state">
            <VideoOff size={64} className="inactive-icon" />
            <p className="inactive-text">Camera Inactive</p>
          </div>
        )}
      </div>
      <button
        onClick={toggleVideo}
        className={`control-button ${isVideoActive ? 'stop' : 'start'}`}
      >
        {isVideoActive ? <VideoOff size={22} /> : <Video size={22} />}
        {isVideoActive ? 'Stop Camera' : 'Start Camera'}
      </button>
    </>
  );
}