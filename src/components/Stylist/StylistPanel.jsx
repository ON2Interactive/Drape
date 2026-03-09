import React, { useState } from 'react';
import './StylistPanel.css';
import { getStylistResponse } from '../../services/aiStylist';

const StylistPanel = ({ collection, onUploadClick }) => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your Drape stylist. Ready to find the perfect outfit?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await getStylistResponse(input, collection);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having a bit of trouble connecting to my fashion database. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="stylist-container glass-card">
            <div className="stylist-header">
                <div className="header-top">
                    <h2>AI Stylist</h2>
                    <button className="icon-upload-btn" onClick={onUploadClick} title="Upload Clothing">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                    </button>
                </div>
                <p>{collection.length} items in wardrobe</p>
            </div>

            <div className="chat-history">
                {messages.map((msg, i) => (
                    <div key={i} className={`message ${msg.role}`}>
                        <div className="message-bubble">
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="message assistant">
                        <div className="message-bubble typing">...</div>
                    </div>
                )}
            </div>

            <form className="chat-input" onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder={isTyping ? "Stylist is thinking..." : "What should I wear tonight?"}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isTyping}
                />
                <button type="submit" disabled={isTyping}>Ask</button>
            </form>
        </div>
    );
};

export default StylistPanel;
