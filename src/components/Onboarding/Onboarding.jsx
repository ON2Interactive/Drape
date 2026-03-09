import React, { useState } from 'react';
import './Onboarding.css';
import drapeLogo from '../../../Icons/Drape-Logo-White-No-BG.svg';
import { processProfileImage } from '../../services/geminiService';

const Onboarding = ({ onComplete, onSkip }) => {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState({
        gender: '',
        photo: null
    });
    const [preview, setPreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleGenderSelect = (gender) => {
        setProfile({ ...profile, gender });
        setStep(2);
    };

    const handlePhotoUpload = async (e) => {
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
                    setProfile({ ...profile, photo: processedImage || base64Image });
                } catch (error) {
                    console.error("Cleanup failed:", error);
                    setProfile({ ...profile, photo: base64Image });
                } finally {
                    setIsProcessing(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFinish = () => {
        if (profile.gender && profile.photo) {
            onComplete(profile);
        }
    };

    return (
        <div className="onboarding-viewport">
            <div className="onboarding-container">
                <header className="onboarding-header">
                    <img
                        src={drapeLogo}
                        alt="Drape"
                        className="onboarding-logo"
                        onClick={onSkip}
                        title="Skip to workspace"
                    />
                    <p className="step-indicator">Step {step} of 2</p>
                </header>

                {step === 1 && (
                    <div className="onboarding-step fade-in">
                        <div className="gender-options">
                            <button className="gender-btn" onClick={() => handleGenderSelect('Male')}>Male</button>
                            <button className="gender-btn" onClick={() => handleGenderSelect('Female')}>Female</button>
                            <button className="gender-btn" onClick={() => handleGenderSelect('Other')}>Other</button>
                        </div>
                    </div>
                )}


                {step === 2 && (
                    <div className="onboarding-step fade-in">
                        <h2>Upload Full-Size Photo</h2>
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
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden disabled={isProcessing} />
                        </label>

                        <div className="onboarding-actions">
                            <button className="secondary" onClick={() => setStep(1)}>Back</button>
                            <button
                                onClick={handleFinish}
                                disabled={!profile.photo}
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
