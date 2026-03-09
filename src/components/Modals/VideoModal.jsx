import React from 'react';
import './VideoModal.css';

const VideoModal = ({ isOpen, onClose, videoUrl, onDownload, onShare, onFavorite, isFavorite }) => {
    if (!isOpen || !videoUrl) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="close-btn" onClick={onClose}>×</button>
            <div className="video-modal" onClick={(e) => e.stopPropagation()}>
                <div className="video-frame">
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                </div>
                <div className="video-action-row">
                    <button
                        type="button"
                        className="action-icon action-btn video-action-btn"
                        onClick={onDownload}
                        title="Download video"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        className="action-icon action-btn video-action-btn"
                        onClick={onShare}
                        title="Share video"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        className={`action-icon action-btn video-action-btn ${isFavorite ? 'is-fav' : ''}`}
                        onClick={onFavorite}
                        title={isFavorite ? "In Favorites" : "Add video to Favorites"}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill={isFavorite ? "#ff4444" : "none"}
                            stroke={isFavorite ? "#ff4444" : "currentColor"}
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
