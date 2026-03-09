import React from 'react';
import './CollectionModal.css';
import Collection from '../Collection/Collection';

const CollectionModal = ({ isOpen, onClose, collection, onRemove, onAddClick, gender }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="close-btn" onClick={onClose}>×</button>
            <div className="modal-content glass-card collection-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-flex">
                    <button className="action-icon add-item-plus" onClick={onAddClick} title="Add Item">+</button>
                    <h2>Collection Items</h2>
                </div>

                <div className="modal-scroll-area">
                    <Collection collection={collection} onRemove={onRemove} showDelete={true} gender={gender} />
                </div>
            </div>
        </div>
    );
};

export default CollectionModal;
