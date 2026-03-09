import React, { useState } from 'react';
import './ProfileModal.css';
import { processProfileImage } from '../../services/geminiService';

const ProfileModal = ({ isOpen, onClose, profile, onSave }) => {
    const [preview, setPreview] = useState(profile?.photo || null);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Image = reader.result;
                setPreview(base64Image);

                setIsProcessing(true);
                try {
                    const processedImage = await processProfileImage(base64Image);
                    setPreview(processedImage || base64Image);
                } catch (error) {
                    console.error("Cleanup failed:", error);
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave({ ...profile, photo: preview });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="close-btn" onClick={onClose}>×</button>
            <div className="modal-content glass-card profile-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Update Profile</h2>

                <label className={`photo-upload-zone ${isProcessing ? 'processing' : ''}`}>
                    {isProcessing ? (
                        <div className="processing-overlay">
                            <div className="spinner"></div>
                        </div>
                    ) : preview ? (
                        <img src={preview} alt="Profile preview" className="photo-preview" />
                    ) : (
                        <div className="upload-placeholder">
                            <span className="plus">+</span>
                            <span>Click to select photo</span>
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden disabled={isProcessing} />
                </label>

                <div className="profile-actions">
                    <button
                        className="save-profile-btn"
                        onClick={handleSave}
                        disabled={!preview || isProcessing}
                    >
                        Save
                    </button>
                    <button className="secondary" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
