import React from 'react';
import './Collection.css';

const Collection = ({ collection, onRemove, showDelete = false, gender, selectedItems = [], onToggleSelect }) => {
    if (collection.length === 0) {
        return (
            <div className="collection-empty">
                <p>No items</p>
            </div>
        );
    }

    const normalizeCategory = (cat) => {
        const mapping = {
            'Suit': 'Suits',
            'Jacket': 'Jackets',
            'Shirt': 'Shirts',
            'Skirt': 'Skirts',
            'Dress': 'Dresses',
            'Accessory': 'Accessories',
            'Shoe': 'Shoes'
        };
        return mapping[cat] || cat;
    };

    const getDisplayCategory = (cat) => {
        return cat;
    };

    const groupedCollection = collection.reduce((acc, item) => {
        const cat = normalizeCategory(item.category || 'Other');
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <div className="collection-container">
            {Object.entries(groupedCollection).map(([category, items]) => (
                <div key={category} className="category-group">
                    <div className="category-label">{getDisplayCategory(category)}</div>
                    <div className="collection-grid">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`clothing-thumbnail ${selectedItems.includes(item.id) ? 'selected' : ''}`}
                                onClick={() => onToggleSelect && onToggleSelect(item.id)}
                            >
                                <img src={item.image} alt={item.category} />
                                {showDelete && (
                                    <button
                                        className="remove-thumb-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove(item.id);
                                        }}
                                        title="Remove item"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Collection;
