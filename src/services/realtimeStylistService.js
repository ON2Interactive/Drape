const buildCollectionSummary = (collection = []) => {
    if (!collection.length) return 'No collection items uploaded yet.';
    return collection
        .slice(0, 50)
        .map((item, index) =>
            `${index + 1}. category=${item.category || 'Unknown'}, subCategory=${item.subCategory || 'Unknown'}, color=${item.color || 'Unknown'}`
        )
        .join(' | ');
};

const buildProfileSummary = (profile) => {
    if (!profile) return 'Unknown profile.';
    return `gender=${profile.gender || 'unknown'}`;
};

const getEphemeralKey = async ({ collection, profile }) => {
    const response = await fetch('/api/realtime/client-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            collectionSummary: buildCollectionSummary(collection),
            profileSummary: buildProfileSummary(profile)
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message || data?.error || 'Failed to get realtime client secret.');
    }

    const key = data?.client_secret?.value || data?.value;
    if (!key) {
        throw new Error('Realtime client secret is missing from token response.');
    }
    return key;
};

const extractTranscriptFromEvent = (msg) => {
    return (
        msg?.transcript
        || msg?.text
        || msg?.delta
        || msg?.item?.content?.[0]?.transcript
        || msg?.item?.content?.[0]?.text
        || null
    );
};

const isLikelyUserTranscriptEvent = (msg) => {
    const type = String(msg?.type || '');
    const role = String(msg?.item?.role || '').toLowerCase();
    if (role === 'user') return true;
    return (
        type === 'conversation.item.input_audio_transcription.completed'
        || type === 'input_audio_transcription.completed'
    );
};

export const createRealtimeStylistSession = async ({ collection, profile, onStateChange, onError, onActivity, onUserTranscript }) => {
    const ephemeralKey = await getEphemeralKey({ collection, profile });
    const pc = new RTCPeerConnection();
    const remoteAudio = document.createElement('audio');
    remoteAudio.autoplay = true;
    remoteAudio.playsInline = true;
    remoteAudio.style.display = 'none';
    document.body.appendChild(remoteAudio);

    let localStream = null;
    let dataChannel = null;
    let micEnabled = false;
    let greetingSent = false;
    let greetingTimer = null;

    const setState = (state) => onStateChange?.(state);
    const markActivity = () => onActivity?.();
    setState('connecting');

    const sendEvent = (event) => {
        if (!dataChannel || dataChannel.readyState !== 'open') return false;
        dataChannel.send(JSON.stringify(event));
        return true;
    };

    const requestGreeting = () => {
        if (greetingSent) return true;
        const sentResponse = sendEvent({
            type: 'response.create',
            response: {
                modalities: ['audio'],
                instructions: 'Greet the user briefly, then ask what outfit help they want using their collection in one short sentence.'
            }
        });
        greetingSent = !!sentResponse;
        return greetingSent;
    };

    pc.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
        remoteAudio.play().catch(() => {
            // Browser may still gate autoplay until a direct user gesture.
        });
    };

    const audioTransceiver = pc.addTransceiver('audio', { direction: 'recvonly' });
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const [audioTrack] = localStream.getAudioTracks();
        if (audioTrack) {
            await audioTransceiver.sender.replaceTrack(audioTrack);
            audioTransceiver.direction = 'sendrecv';
            micEnabled = true;
        }
    } catch (error) {
        micEnabled = false;
        onError?.(`Microphone unavailable: ${error?.message || 'permission denied or no input device'}`);
    }

    dataChannel = pc.createDataChannel('oai-events');
    dataChannel.onopen = () => {
        markActivity();
        // Ensure the session behavior is explicitly configured for voice turn-taking.
        dataChannel.send(JSON.stringify({
            type: 'session.update',
            session: {
                instructions: 'You are Drape Stylist, a concise voice stylist. Focus strictly on the user collection items. Never suggest, describe, or reference any item that is not explicitly present in the provided collection context. If the user asks for a specific item, color, or piece that is not in the collection, clearly say it is not available in their current collection. Do not volunteer alternatives unless the user explicitly asks for alternatives or asks for advice. Only give styling advice when the user asks for advice, recommendations, or opinions. Do not discuss video or motion unless explicitly asked. Keep answers short and collection-grounded. Greet briefly, then help with the collection only.',
                audio: {
                    output: { voice: 'marin' },
                    input: {
                        transcription: {
                            model: 'gpt-4o-mini-transcribe'
                        },
                        turn_detection: {
                            type: 'server_vad',
                            create_response: true,
                            interrupt_response: true,
                            silence_duration_ms: 600
                        }
                    }
                }
            }
        }));
        greetingTimer = setTimeout(() => {
            requestGreeting();
        }, 350);
        setState('listening');
    };

    dataChannel.onmessage = (event) => {
        markActivity();
        try {
            const msg = JSON.parse(event.data);
            const transcript = extractTranscriptFromEvent(msg);
            if (transcript && isLikelyUserTranscriptEvent(msg)) {
                onUserTranscript?.(String(transcript).trim());
            }
            if (msg.type === 'response.audio.delta' || msg.type === 'response.audio_transcript.delta') {
                greetingSent = true;
                if (greetingTimer) {
                    clearTimeout(greetingTimer);
                    greetingTimer = null;
                }
                setState('speaking');
            }
            if (msg.type === 'response.done') {
                setState('listening');
            }
            if (msg.type === 'error') {
                onError?.(msg?.error?.message || 'Stylist reported an error.');
            }
        } catch {
            // ignore non-json payloads
        }
    };

    dataChannel.onerror = () => setState('error');
    pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
            markActivity();
        }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp'
        },
        body: offer.sdp
    });

    if (!sdpResponse.ok) {
        const text = await sdpResponse.text();
        onError?.(`Realtime negotiation failed: ${text}`);
        throw new Error(`Realtime negotiation failed: ${text}`);
    }

    const answerSdp = await sdpResponse.text();
    await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    setState(micEnabled ? 'listening' : 'speaking');

    const stop = () => {
        if (greetingTimer) {
            clearTimeout(greetingTimer);
            greetingTimer = null;
        }
        try { dataChannel?.close(); } catch { /* noop */ }
        try { pc.getSenders().forEach((sender) => sender.track?.stop()); } catch { /* noop */ }
        try { localStream?.getTracks().forEach((track) => track.stop()); } catch { /* noop */ }
        try { pc.close(); } catch { /* noop */ }
        try {
            if (remoteAudio.srcObject) {
                const tracks = remoteAudio.srcObject.getTracks?.() || [];
                tracks.forEach((track) => track.stop());
                remoteAudio.srcObject = null;
            }
            remoteAudio.remove();
        } catch {
            // noop
        }
    };

    const cancel = () => {
        try {
            sendEvent({ type: 'response.cancel' });
        } catch {
            // noop
        }
        try {
            remoteAudio.pause();
            remoteAudio.currentTime = 0;
        } catch {
            // noop
        }
    };

    const speak = (text) => {
        if (!text) return false;
        const spokeIntro = sendEvent({
            type: 'conversation.item.create',
            item: {
                type: 'message',
                role: 'user',
                content: [{ type: 'input_text', text }]
            }
        });
        const spokeResponse = sendEvent({
            type: 'response.create',
            response: {
                modalities: ['audio'],
                instructions: `Say this exactly and briefly: "${text}"`
            }
        });
        return spokeIntro && spokeResponse;
    };

    return { stop, speak, cancel };
};
