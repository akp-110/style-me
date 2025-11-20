import React, { forwardRef } from 'react';

export const ShareCard = forwardRef(({ photoPreview, advisorName, advisorPersona, summary, rating, mode }, ref) => {
    if (!photoPreview) return null;

    // Mode-specific styling with standard hex colors (no OKLCH)
    const getModeStyles = () => {
        switch (mode) {
            case 'professional':
                return {
                    borderColor: '#1e293b', // slate-800
                    textColor: '#0f172a', // slate-900
                    accentBg: '#1e293b'
                };
            case 'balanced':
                return {
                    borderColor: '#7c2d12', // orange-900
                    textColor: '#431407', // orange-950
                    accentBg: '#7c2d12'
                };
            case 'hype':
                return {
                    borderColor: '#14532d', // green-900
                    textColor: '#14532d',
                    accentBg: '#14532d'
                };
            case 'roast':
                return {
                    borderColor: '#312e81', // indigo-900
                    textColor: '#1e1b4b', // indigo-950
                    accentBg: '#312e81'
                };
            default:
                return {
                    borderColor: '#1e293b',
                    textColor: '#0f172a',
                    accentBg: '#1e293b'
                };
        }
    };

    const styles = getModeStyles();

    return (
        <div
            ref={ref}
            style={{
                backgroundColor: '#fefefe',
                padding: '32px',
                paddingBottom: '64px',
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                transform: 'rotate(0deg)', // Straight, no tilt
                width: '500px',
                margin: '0 auto',
                position: 'relative',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                border: '12px solid #f5f3ed', // Cream border for vintage feel
                borderRadius: '2px'
            }}
        >
            {/* Polaroid Photo Area - Square format */}
            <div style={{
                backgroundColor: '#000000',
                aspectRatio: '1/1', // Square format to prevent distortion
                marginBottom: '24px',
                overflow: 'hidden',
                border: '1px solid #e5e5e5',
                boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.1)',
                position: 'relative'
            }}>
                <img
                    src={photoPreview}
                    alt="Outfit"
                    crossOrigin="anonymous"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Cover maintains aspect ratio and fills square
                        objectPosition: 'center',
                        display: 'block'
                    }}
                />
                {/* Subtle film grain overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)',
                    pointerEvents: 'none',
                    opacity: 0.3
                }}></div>
            </div>

            {/* Content Area */}
            <div style={{ textAlign: 'center', color: styles.textColor }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    <span style={{
                        fontSize: '32px',
                        fontWeight: '900',
                        color: styles.textColor,
                        fontFamily: 'Georgia, serif'
                    }}>
                        {rating}
                    </span>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        opacity: '0.5',
                        fontFamily: 'monospace'
                    }}>
                        / 10
                    </span>
                </div>

                <p style={{
                    fontSize: '18px',
                    lineHeight: '1.6',
                    marginBottom: '24px',
                    padding: '0 16px',
                    fontStyle: 'italic',
                    fontFamily: 'Georgia, serif',
                    color: '#2c2c2c'
                }}>
                    "{summary}"
                </p>

                <div style={{
                    borderTop: '1px solid #d4d4d4',
                    paddingTop: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                }}>
                    <div style={{ textAlign: 'left' }}>
                        <p style={{
                            fontWeight: '600',
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            opacity: '0.4',
                            marginBottom: '6px',
                            fontFamily: 'monospace'
                        }}>
                            Rated by
                        </p>
                        <p style={{
                            fontWeight: '700',
                            fontSize: '16px',
                            color: styles.textColor,
                            marginBottom: '4px',
                            fontFamily: 'Georgia, serif'
                        }}>
                            {advisorName}
                        </p>
                        <p style={{
                            fontSize: '12px',
                            opacity: '0.6',
                            fontStyle: 'italic'
                        }}>
                            {advisorPersona}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{
                            fontWeight: '900',
                            fontSize: '18px',
                            letterSpacing: '-0.02em',
                            color: styles.textColor,
                            fontFamily: 'monospace'
                        }}>
                            #StyleMe
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
});

ShareCard.displayName = 'ShareCard';
