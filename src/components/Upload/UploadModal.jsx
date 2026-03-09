import React, { useState } from 'react';
import './UploadModal.css';

const SHARED_CATEGORIES = ['Jackets', 'Pants', 'Shirts', 'Shoes', 'Hats', 'Scarves', 'Accessories'];
const MALE_CATEGORIES = ['Suits'];
const FEMALE_CATEGORIES = ['Skirts', 'Dresses'];
const SUBCATEGORIES = ['Formal', 'Casual', 'Sport', 'Streetwear', 'Vintage'];

const UploadModal = ({ isOpen, onClose, onAdd, gender }) => {
    const getAvailableCategories = () => {
        if (gender === 'Male') return [...MALE_CATEGORIES, ...SHARED_CATEGORIES];
        if (gender === 'Female') return [...FEMALE_CATEGORIES, ...SHARED_CATEGORIES];
        return [...MALE_CATEGORIES, ...FEMALE_CATEGORIES, ...SHARED_CATEGORIES]; // 'None' or fallback
    };

    const categories = getAvailableCategories();

    const [formData, setFormData] = useState({
        category: categories[0],
        subCategory: 'Formal',
        color: '',
        image: null,
    });
    const [preview, setPreview] = useState(null);

    // Update category if the list changes (e.g. gender change or opening modal)
    React.useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, category: categories[0] }));
        }
    }, [isOpen, gender]);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.image) {
            alert('Please upload an image');
            return;
        }
        onAdd(formData);
        onClose();
        setPreview(null);
        setFormData({
            category: 'Suits',
            subCategory: 'Formal',
            color: '',
            image: null,
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="close-btn" onClick={onClose}>×</button>
            <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                <h2>Add to Collection</h2>

                <form onSubmit={handleSubmit}>
                    <div className="upload-section">
                        <label className="image-dropzone">
                            {preview ? (
                                <img src={preview} alt="Preview" className="image-preview" />
                            ) : (
                                <div className="dropzone-placeholder">
                                    <span>+</span>
                                    <p>Click to upload image</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                        </label>
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Sub-Category</label>
                        <select
                            value={formData.subCategory}
                            onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                        >
                            {SUBCATEGORIES.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Color</label>
                        <input
                            type="text"
                            placeholder="e.g. Midnight Blue"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="action-icon submit-icon-btn" title="Add to Collection">+</button>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;
