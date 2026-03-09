import React from 'react';
import './FavoritesModal.css';

const FavoritesModal = ({ isOpen, onClose, favorites, onRemove, onSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="close-btn" onClick={onClose}>×</button>
            <div className="modal-content glass-card favorites-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-flex">
                    <div className="dummy-spacer" style={{ width: '40px' }}></div>
                    <h2>Favorites</h2>
                </div>

                <div className="modal-scroll-area">
                    {favorites.length === 0 ? (
                        <div className="empty-state">
                            <p>No favorites saved yet.</p>
                        </div>
                    ) : (
                        <div className="favorites-grid">
                            {favorites.map((item) => (
                                <div key={item.id} className="favorite-item" onClick={() => onSelect(item)}>
                                    <div className="favorite-thumbnail">
                                        {item.type === 'video' ? (
                                            <>
                                                {item.poster ? (
                                                    <img src={item.poster} alt="Favorite video" />
                                                ) : (
                                                    <video src={item.runtimeUrl || item.url} muted loop playsInline />
                                                )}
                                                <div className="media-badge" aria-label="Video favorite" title="Video">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2.5" y="5" width="14" height="14" rx="2.5" ry="2.5" />
                                                        <polygon points="10 10 10 14 13.5 12 10 10" />
                                                        <path d="M16.5 10 21.5 7v10l-5-3" />
                                                    </svg>
                                                </div>
                                            </>
                                        ) : (
                                            <img src={item.url || item.image} alt="Favorite outfit" />
                                        )}
                                        <button
                                            className="delete-overlay"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemove(item.id);
                                            }}
                                            title="Remove from Favorites"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoritesModal;
