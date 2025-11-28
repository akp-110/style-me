import React from 'react';

export const FlipContainer = ({ isFlipped, frontContent, backContent }) => {
    return (
        <div className="relative w-full max-w-4xl mx-auto perspective-1000">
            <div
                className={`relative w-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''
                    }`}
            >
                {/* Front Side (Upload) */}
                <div className={`w-full backface-hidden ${isFlipped ? 'hidden' : 'block'}`}>
                    {frontContent}
                </div>

                {/* Back Side (Rating) */}
                <div className={`w-full backface-hidden rotate-y-180 ${isFlipped ? 'block' : 'hidden'}`}>
                    {backContent}
                </div>
            </div>
        </div>
    );
};
