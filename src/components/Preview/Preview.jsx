import React from 'react';
import './Preview.css';

const Preview = ({
    photo,
    isGenerating,
    hasGeneratedOutfit,
    onUndo,
    onRemix,
    onVideo,
    onDownload,
    onShare,
    onFavorite,
    isFavorite,
    isVideoFavorite
}) => {
    return (
        <div className="preview-container" style={{ position: 'relative' }}>
            <div className={`user-silhouette ${isGenerating ? 'generating' : ''}`}>
                <img src={photo} alt="User silhouette or outfitted result" />
            </div>

            {isGenerating && (
                <div className="processing-overlay">
                    <div className="spinner"></div>
                </div>
            )}

            <div className="preview-action-bar">
                {hasGeneratedOutfit && !isGenerating && (
                    <>
                        <button type="button" className="action-icon action-btn" onClick={onUndo} title="Undo Outfit">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 7v6h6" />
                                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
                            </svg>
                        </button>
                        <button type="button" className="action-icon action-btn" onClick={onRemix} title="Remix Background">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                            </svg>
                        </button>
                    </>
                )}
                {onFavorite && !isGenerating && (
                    <button
                        type="button"
                        className={`action-icon action-btn favorite-btn ${isFavorite ? 'is-fav' : ''}`}
                        onClick={() => onFavorite(photo)}
                        title={isFavorite ? "In Favorites" : "Add to Favorites"}
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
                )}
                {hasGeneratedOutfit && !isGenerating && (
                    <>
                        <button
                            className={`action-icon action-btn ${isVideoFavorite ? 'is-fav' : ''}`}
                            onClick={onVideo}
                            title={isVideoFavorite ? "Video in Favorites" : "Generate Video"}
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke={isVideoFavorite ? "#ff4444" : "currentColor"}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <rect x="2.5" y="5" width="14" height="14" rx="2.5" ry="2.5" />
                                <polygon points="10 10 10 14 13.5 12 10 10" />
                                <path d="M16.5 10 21.5 7v10l-5-3" />
                            </svg>
                        </button>
                        <button className="action-icon action-btn" onClick={onDownload} title="Download">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </button>
                        <button className="action-icon action-btn" onClick={onShare} title="Share">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Preview;
