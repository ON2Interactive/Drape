import React, { useEffect, useRef, useState } from 'react';
import './StylistModal.css';
import { createRealtimeStylistSession } from '../../services/realtimeStylistService';

const SILENCE_TIMEOUT_MS = 60000;

const StylistModal = ({ isOpen, onClose, collection, profile, onCreateOutfitFromIntent }) => {
    const [state, setState] = useState('idle'); // idle | connecting | listening | speaking | error
    const [errorMessage, setErrorMessage] = useState('');
    const [isCreatingOutfit, setIsCreatingOutfit] = useState(false);
    const sessionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const lastHandledIntentRef = useRef('');
    const pendingOutfitIntentRef = useRef('');

    const normalizeCommand = (text) => (
        String(text || '')
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    );

    const isGenerateConfirmIntent = (text) => {
        const value = normalizeCommand(text);
        return value === 'create outfit now';
    };

    const isOutfitRequestIntent = (text) => {
        const value = normalizeCommand(text);
        const hasOccasion = /(dinner|date|night|tonight|evening|work|office|meeting|event|party|weekend)/.test(value);
        const hasGarment = /(shirt|tee|tshirt|jacket|blazer|dress|pants|trousers|skirt|suit|look|outfit|shoe|shoes|accessory|hat|scarf)/.test(value);
        const hasColor = /(black|white|blue|navy|red|green|gray|grey|brown|beige|cream)/.test(value);
        return (
            value.includes('create outfit')
            || value.includes('create a look')
            || value.includes('generate outfit')
            || value.includes('generate a look')
            || value.includes('make an outfit')
            || value.includes('make a look')
            || value.includes('build an outfit')
            || value.includes('build a look')
            || value.includes('put together')
            || value.includes('style me')
            || value.includes('dress me')
            || value.includes('put me in')
            || value.includes('outfit for')
            || value.includes('look for')
            || (hasGarment && hasColor)
            || (hasOccasion && hasGarment)
        );
    };

    const isDoneIntent = (text) => {
        const value = normalizeCommand(text);
        return (
            value === 'done'
            || value === 'im done'
            || value === 'i am done'
            || value === 'i m done'
            || value === 'all done'
            || value === 'thats it'
            || value === 'that s it'
            || value === 'end session'
        );
    };

    const clearSilenceTimer = () => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    };

    const armSilenceTimer = () => {
        if (isCreatingOutfit) return;
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(() => {
            sessionRef.current?.stop?.();
            sessionRef.current = null;
            setState('idle');
            setErrorMessage('');
            onClose?.();
        }, SILENCE_TIMEOUT_MS);
    };

    const endSession = () => {
        clearSilenceTimer();
        sessionRef.current?.stop?.();
        sessionRef.current = null;
        setState('idle');
        setErrorMessage('');
    };

    const startSession = async () => {
        setErrorMessage('');
        setState('connecting');
        const session = await createRealtimeStylistSession({
            collection,
            profile,
            onStateChange: (nextState) => {
                setState(nextState);
                if (nextState !== 'error') {
                    setErrorMessage('');
                }
                if (nextState === 'error' || nextState === 'idle') {
                    clearSilenceTimer();
                } else {
                    armSilenceTimer();
                }
            },
            onError: (message) => {
                setErrorMessage(message || 'Stylist connection failed.');
            },
            onActivity: () => {
                armSilenceTimer();
            },
            onUserTranscript: async (transcript) => {
                if (!transcript) return;
                const normalized = transcript.trim().toLowerCase();
                if (isCreatingOutfit) return;
                if (isOutfitRequestIntent(normalized)) {
                    pendingOutfitIntentRef.current = transcript;
                }
                if (isDoneIntent(normalized)) {
                    clearSilenceTimer();
                    const pendingIntent = pendingOutfitIntentRef.current;
                    if (pendingIntent) {
                        sessionRef.current?.cancel?.();
                        endSession();
                        onClose?.();
                        try {
                            await onCreateOutfitFromIntent?.(pendingIntent);
                        } catch (error) {
                            console.error('Stylist intent handling failed:', error);
                        }
                        pendingOutfitIntentRef.current = '';
                    } else {
                        sessionRef.current?.cancel?.();
                        endSession();
                        onClose?.();
                    }
                    return;
                }
                if (normalized.length < 8) return;
                if (!isGenerateConfirmIntent(normalized)) return;
                if (lastHandledIntentRef.current === normalized) return;
                lastHandledIntentRef.current = normalized;
                try {
                    setIsCreatingOutfit(true);
                    clearSilenceTimer();
                    const intentForGeneration = pendingOutfitIntentRef.current || transcript;
                    const ok = await onCreateOutfitFromIntent?.(intentForGeneration);
                    if (ok) {
                        sessionRef.current?.speak?.('Done. I put together an outfit for you.');
                        pendingOutfitIntentRef.current = '';
                    }
                } catch (error) {
                    console.error('Stylist intent handling failed:', error);
                } finally {
                    setIsCreatingOutfit(false);
                    armSilenceTimer();
                }
            }
        });
        sessionRef.current = session;
    };

    const handleMicToggle = async () => {
        const hasLiveSession = !!sessionRef.current && state !== 'error';
        if (hasLiveSession) {
            endSession();
            return;
        }
        try {
            await startSession();
        } catch (error) {
            console.error('Realtime specialist failed:', error);
            setErrorMessage(error?.message || 'Stylist connection failed.');
            setState('error');
            clearSilenceTimer();
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        return () => {
            sessionRef.current?.stop?.();
            sessionRef.current = null;
            setState('idle');
            setErrorMessage('');
            clearSilenceTimer();
            lastHandledIntentRef.current = '';
            pendingOutfitIntentRef.current = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;
    const isActive = state === 'connecting' || state === 'listening' || state === 'speaking';
    const isSessionOn = !!sessionRef.current && state !== 'error';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="close-btn" onClick={onClose}>×</button>
            <div className="stylist-modal" onClick={(e) => e.stopPropagation()}>
                <div className="stylist-visual">
                    <div className={`voice-bars ${isActive ? 'active' : ''}`}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <button className={`stylist-mic-btn ${isSessionOn ? 'active' : ''}`} onClick={handleMicToggle} title={isSessionOn ? 'End Session' : 'Start Session'}>
                        {isSessionOn ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
                                <path d="M19 12a7 7 0 0 1-14 0" />
                                <line x1="12" y1="19" x2="12" y2="22" />
                                <line x1="8" y1="22" x2="16" y2="22" />
                                <line x1="4" y1="4" x2="20" y2="20" />
                            </svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
                                <path d="M19 12a7 7 0 0 1-14 0" />
                                <line x1="12" y1="19" x2="12" y2="22" />
                                <line x1="8" y1="22" x2="16" y2="22" />
                            </svg>
                        )}
                    </button>
                    <div className="stylist-helper-text">Tap to Start/Stop</div>
                    <div className="stylist-command-text">Say "Done" or "Create Outfit Now" when you are done</div>
                    {state === 'error' && (
                        <div className="stylist-fallback">{errorMessage || 'Connection error'}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StylistModal;
