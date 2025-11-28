import React, { forwardRef } from 'react';

export const ShareCard = forwardRef(({ photoPreview, advisorName, advisorPersona, summary, rating, mode }, ref) => {
    if (!photoPreview) return null;

    // Mode-specific styling with standard hex colors (no OKLCH)
    const getModeStyles = () => {
        switch (mode) {
            case 'professional':
                return {
                    borderColor: '#1e293b', // slate-800
                    textColor: '#3a3226', // warm dark brown
                    accentBg: '#1e293b',
                    accentColor: '#64748b'
                };
            case 'balanced':
                return {
                    borderColor: '#7c2d12', // orange-900
                    textColor: '#4a2c16', // warm dark brown
                    accentBg: '#7c2d12',
                    accentColor: '#c2410c'
                };
            case 'hype':
                return {
                    borderColor: '#14532d', // green-900
                    textColor: '#2d3a2e',
                    accentBg: '#14532d',
                    accentColor: '#166534'
                };
            case 'roast':
                return {
                    borderColor: '#312e81', // indigo-900
                    textColor: '#2e2a47', // deep purple-brown
                    accentBg: '#312e81',
                    accentColor: '#4338ca'
                };
            default:
                return {
                    borderColor: '#1e293b',
                    textColor: '#3a3226',
                    accentBg: '#1e293b',
                    accentColor: '#64748b'
                };
        }
    };

    const styles = getModeStyles();

    return (
        <div
            ref={ref}
            style={{
                backgroundColor: '#f9f6f0', // Aged cream paper
                padding: '32px',
                paddingBottom: '64px',
                boxShadow: `
                    0 25px 50px -12px rgba(0, 0, 0, 0.4),
                    0 10px 20px -5px rgba(0, 0, 0, 0.2),
                    inset 0 0 0 1px rgba(0, 0, 0, 0.05),
                    0 0 0 1px rgba(139, 115, 85, 0.15)
                `,
                transform: 'rotate(0deg)',
                width: '500px',
                margin: '0 auto',
                position: 'relative',
                fontFamily: 'Georgia, "Times New Roman", serif',
                border: '14px solid #e8dcc8', // Vintage cream border
                borderRadius: '3px',
                backgroundImage: `
                    linear-gradient(45deg, rgba(139, 115, 85, 0.02) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(139, 115, 85, 0.02) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(139, 115, 85, 0.02) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(139, 115, 85, 0.02) 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
        >
            {/* Paper texture overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `
                    radial-gradient(circle at 20% 50%, rgba(255,250,240,0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(139,115,85,0.08) 0%, transparent 50%),
                    radial-gradient(circle at 40% 20%, rgba(210,180,140,0.06) 0%, transparent 40%)
                `,
                pointerEvents: 'none',
                borderRadius: '3px'
            }}></div>

            {/* Subtle edge darkening/aging */}
            <div style={{
                position: 'absolute',
                top: '-14px',
                left: '-14px',
                right: '-14px',
                bottom: '-14px',
                boxShadow: 'inset 0 0 60px rgba(101, 67, 33, 0.15)',
                pointerEvents: 'none',
                borderRadius: '3px'
            }}></div>

            {/* Polaroid Photo Area - Flexible with vintage aesthetic */}
            <div style={{
                backgroundColor: '#1a1816',
                minHeight: '300px',
                maxHeight: '500px',
                marginBottom: '24px',
                overflow: 'hidden',
                border: '2px solid #3a3226',
                boxShadow: `
                    inset 0 0 30px rgba(0, 0, 0, 0.3),
                    0 4px 8px rgba(0, 0, 0, 0.2)
                `,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: 'radial-gradient(circle at center, #1a1816 0%, #0a0a08 100%)'
            }}>
                <img
                    src={photoPreview}
                    alt="Outfit"
                    crossOrigin="anonymous"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '500px',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        objectPosition: 'center',
                        display: 'block',
                        filter: 'contrast(1.05) saturate(0.95) brightness(0.98)' // Subtle vintage color shift
                    }}
                />
                {/* Enhanced film grain overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.05) 2px, rgba(0,0,0,.05) 4px),
                        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.03) 2px, rgba(0,0,0,.03) 4px)
                    `,
                    pointerEvents: 'none',
                    opacity: 0.4
                }}></div>
                {/* Vignette effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)',
                    pointerEvents: 'none'
                }}></div>
            </div>

            {/* Content Area */}
            <div style={{
                textAlign: 'center',
                color: styles.textColor,
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    <span style={{
                        fontSize: '36px',
                        fontWeight: '900',
                        color: styles.textColor,
                        fontFamily: 'Georgia, serif',
                        textShadow: '2px 2px 4px rgba(139, 115, 85, 0.15)',
                        letterSpacing: '-0.02em'
                    }}>
                        {rating}
                    </span>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        opacity: '0.4',
                        fontFamily: '"Courier New", monospace',
                        color: styles.textColor
                    }}>
                        / 10
                    </span>
                </div>

                <p style={{
                    fontSize: '17px',
                    lineHeight: '1.7',
                    marginBottom: '28px',
                    padding: '0 20px',
                    fontStyle: 'italic',
                    fontFamily: 'Georgia, "Palatino Linotype", serif',
                    color: '#3a3226',
                    textShadow: '1px 1px 2px rgba(255, 255, 255, 0.5)',
                    fontWeight: '400'
                }}>
                    "{summary}"
                </p>

                <div style={{
                    borderTop: '2px solid rgba(101, 67, 33, 0.2)',
                    paddingTop: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    position: 'relative'
                }}>
                    {/* Decorative corner accent - left */}
                    <div style={{
                        position: 'absolute',
                        top: '-2px',
                        left: '0',
                        width: '60px',
                        height: '2px',
                        background: `linear-gradient(to right, ${styles.accentColor}, transparent)`
                    }}></div>

                    {/* Decorative corner accent - right */}
                    <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '0',
                        width: '60px',
                        height: '2px',
                        background: `linear-gradient(to left, ${styles.accentColor}, transparent)`
                    }}></div>

                    <div style={{ textAlign: 'left' }}>
                        <p style={{
                            fontWeight: '700',
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.12em',
                            opacity: '0.35',
                            marginBottom: '8px',
                            fontFamily: '"Courier New", monospace',
                            color: styles.textColor
                        }}>
                            Rated by
                        </p>
                        <p style={{
                            fontWeight: '700',
                            fontSize: '17px',
                            color: styles.textColor,
                            marginBottom: '5px',
                            fontFamily: 'Georgia, serif',
                            textShadow: '1px 1px 2px rgba(139, 115, 85, 0.1)'
                        }}>
                            {advisorName}
                        </p>
                        <p style={{
                            fontSize: '12px',
                            opacity: '0.55',
                            fontStyle: 'italic',
                            fontFamily: 'Georgia, serif',
                            color: styles.textColor
                        }}>
                            {advisorPersona}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{
                            fontWeight: '900',
                            fontSize: '20px',
                            letterSpacing: '-0.03em',
                            color: styles.textColor,
                            fontFamily: '"Courier New", monospace',
                            textShadow: '2px 2px 3px rgba(139, 115, 85, 0.15)',
                            opacity: '0.85'
                        }}>
                            #StyleMe
                        </p>
                    </div>
                </div>
            </div>

            {/* Vintage paper noise overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                opacity: 0.08,
                pointerEvents: 'none',
                mixBlendMode: 'multiply',
                borderRadius: '3px'
            }}></div>
        </div>
    );
});

ShareCard.displayName = 'ShareCard';
