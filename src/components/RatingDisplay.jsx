import React from 'react';
import { Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const RatingDisplay = ({ rating, currentMode, useWeather, weather }) => {
    if (!rating) return null;

    return (
        <div className="glass-strong rounded-[2.5rem] shadow-2xl p-10 sm:p-14 mb-10 border-2 border-white/40 backdrop-blur-xl animate-scale-in text-left">
            <div className="flex items-center gap-8 mb-12 pb-10 border-b-4 border-gradient-to-r from-slate-300 to-orange-300">
                <div className="text-7xl sm:text-8xl animate-bounce-slow relative">
                    <div className="absolute inset-0 bg-white/30 blur-2xl rounded-full"></div>
                    <span className="relative">
                        <currentMode.icon className="w-24 h-24 sm:w-32 sm:h-32 text-slate-700" />
                    </span>
                </div>
                <div className="flex-1">
                    <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-3 flex items-center gap-3">
                        <Wand2 className="w-8 h-8 text-orange-700" />
                        <span>{currentMode.label}'s Advice</span>
                    </h2>
                    <div className="flex items-center gap-3">
                    </div>
                </div>
            </div>
            <div className="prose prose-lg sm:prose-xl max-w-none prose-headings:text-gray-800 prose-headings:font-black prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700">
                <ReactMarkdown
                    components={{
                        h2: (props) => (
                            <h2 className="text-4xl font-black text-gray-800 mt-10 mb-6 pb-3 border-b-4 border-gradient-to-r from-gray-200 to-slate-200" {...props} />
                        ),
                        h3: (props) => (
                            <h3 className="text-3xl font-bold text-gray-800 mt-8 mb-4" {...props} />
                        ),
                        p: (props) => (
                            <p className="mb-6 text-gray-700 leading-9 text-xl" {...props} />
                        ),
                        ul: (props) => (
                            <ul className="list-disc list-outside mb-8 space-y-4 ml-6 text-xl" {...props} />
                        ),
                        li: (props) => (
                            <li className="text-gray-700 leading-9 marker:text-slate-500 marker:font-bold" {...props} />
                        ),
                        strong: (props) => (
                            <strong className="font-black text-gray-900 bg-gradient-to-r from-slate-100 to-gray-100 px-3 py-1.5 rounded-lg shadow-sm" {...props} />
                        ),
                    }}
                >
                    {rating}
                </ReactMarkdown>
            </div>
            <div className="mt-12 p-8 bg-gradient-to-r from-slate-100/90 to-gray-100/90 rounded-3xl border-2 border-slate-200/60 backdrop-blur-sm shadow-xl">
                <p className="text-center text-gray-700 font-black text-lg flex items-center justify-center gap-3">
                    <span className="text-3xl">💡</span>
                    <span>
                        {useWeather && weather
                            ? 'Weather-aware rating provided! Try different modes for more perspectives!'
                            : 'Try different modes for completely different perspectives!'}
                    </span>
                </p>
            </div>
        </div>
    );
};
