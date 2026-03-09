import React from 'react';
import './PlanModal.css';

const PlanModal = ({
    isOpen,
    onClose,
    weekPlan = [],
    onGenerate,
    onRegenerateDay,
    onToggleLockDay,
    onAddAllToFavorites,
    onExportCalendar,
    planPreset = 'Work',
    presets = [],
    onPresetChange,
    isGenerating,
    onSelect,
    planError = '',
    days = []
}) => {
    if (!isOpen) return null;

    const planByDay = days.map((day) => ({
        day,
        item: weekPlan.find((entry) => entry.day === day.key) || null
    }));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="close-btn" onClick={onClose}>×</button>
            <div className="modal-content glass-card plan-modal" onClick={(e) => e.stopPropagation()}>
                <div className="plan-header">
                    <h2>Plan</h2>
                    <div className="plan-header-actions">
                        <button className="plan-generate-btn" onClick={onExportCalendar} disabled={isGenerating || weekPlan.length === 0}>
                            Export Calendar
                        </button>
                        <button className="plan-generate-btn" onClick={onAddAllToFavorites} disabled={isGenerating || weekPlan.length === 0}>
                            Add All to Favorites
                        </button>
                        <button className="plan-generate-btn" onClick={onGenerate} disabled={isGenerating}>
                            {isGenerating ? 'Generating...' : 'Generate Week'}
                        </button>
                    </div>
                </div>
                {planError ? <div className="plan-error">{planError}</div> : null}
                <div className="plan-presets">
                    {presets.map((preset) => (
                        <button
                            key={preset}
                            className={`plan-preset-btn ${planPreset === preset ? 'active' : ''}`}
                            onClick={() => onPresetChange?.(preset)}
                            disabled={isGenerating}
                        >
                            {preset}
                        </button>
                    ))}
                </div>

                <div className="plan-grid">
                    {planByDay.map(({ day, item }) => (
                        <div key={day.key} className={`plan-card ${item ? 'is-ready' : ''}`} onClick={() => item && onSelect?.(item)}>
                            <div className="plan-day-row">
                                <div className="plan-day">{day.label}</div>
                                {item ? (
                                    <button
                                        className={`plan-icon-btn ${item.locked ? 'is-locked' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onToggleLockDay?.(day.key);
                                        }}
                                        title={item.locked ? 'Unlock day' : 'Lock day'}
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            {item.locked ? (
                                                <>
                                                    <rect x="5" y="11" width="14" height="10" rx="2" />
                                                    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                                                </>
                                            ) : (
                                                <>
                                                    <rect x="5" y="11" width="14" height="10" rx="2" />
                                                    <path d="M15 11V8a4 4 0 0 0-7.5-2" />
                                                </>
                                            )}
                                        </svg>
                                    </button>
                                ) : null}
                            </div>
                            <div className="plan-thumb">
                                {item?.image ? (
                                    <img src={item.image} alt={`${day.label} outfit`} />
                                ) : (
                                    <div className="plan-empty">No look yet</div>
                                )}
                            </div>
                            <div className="plan-card-actions">
                                <button
                                    className="plan-icon-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRegenerateDay?.(day.key);
                                    }}
                                    disabled={isGenerating}
                                    title={`Regenerate ${day.label}`}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <polyline points="23 4 23 10 17 10" />
                                        <polyline points="1 20 1 14 7 14" />
                                        <path d="M3.5 9a9 9 0 0 1 14.2-3.36L23 10M1 14l5.3 4.36A9 9 0 0 0 20.5 15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PlanModal;
