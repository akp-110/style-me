import React, { useRef } from 'react';
import { X, Calendar, Upload as UploadIcon, Trash2, MapPin, Info } from 'lucide-react';

export const CalendarModal = ({
    showCalendarModal,
    setShowCalendarModal,
    calendarEvents,
    useCalendarContext,
    setUseCalendarContext,
    handleICSFileUpload,
    removeCalendarEvent,
    clearAllCalendarEvents
}) => {
    const calendarInputRef = useRef(null);

    if (!showCalendarModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-950 px-6 sm:px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-white" />
                        <h2 className="text-2xl sm:text-3xl font-black text-white">My Calendar</h2>
                    </div>
                    <button
                        onClick={() => setShowCalendarModal(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                    >
                        <X className="w-6 h-6 text-amber-50" />
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                    {/* Upload ICS File */}
                    <div>
                        <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                            <UploadIcon className="w-6 h-6" />
                            Import Calendar
                        </h3>
                        <p className="text-sm text-slate-600 mb-4">Upload a .ics calendar file (export from Google Calendar, Outlook, Apple Calendar, etc.)</p>
                        <input
                            ref={calendarInputRef}
                            type="file"
                            accept=".ics,.ical,.ifb,.icalendar"
                            onChange={handleICSFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={() => calendarInputRef.current?.click()}
                            className="w-full px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            <UploadIcon className="w-5 h-5" />
                            <span>Choose .ics File</span>
                        </button>

                        {/* Privacy Notice */}
                        <div className="flex items-start gap-3 mt-4 px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl">
                            <Info className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-700 leading-relaxed text-left">
                                <span className="font-semibold text-slate-900">Privacy:</span> Your calendar file is processed locally in your browser and stored in localStorage. When enabled, calendar event details (titles, dates, locations) are sent to Anthropic&apos;s Claude API for context-aware outfit recommendations. Learn more about{' '}
                                <a
                                    href="https://www.anthropic.com/legal/commercial-terms"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-900 font-semibold underline hover:text-slate-600 transition-colors"
                                >
                                    Anthropic&apos;s privacy practices
                                </a>.
                            </p>
                        </div>
                    </div>

                    {/* Calendar Toggle */}
                    <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useCalendarContext}
                                onChange={(e) => setUseCalendarContext(e.target.checked)}
                                className="w-5 h-5 text-slate-700 rounded"
                            />
                            <span className="font-semibold text-slate-800">Include calendar context in outfit ratings</span>
                        </label>
                    </div>

                    {/* Events List */}
                    {calendarEvents.length > 0 ? (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-slate-800">
                                    Events ({calendarEvents.length})
                                </h3>
                                <button
                                    onClick={clearAllCalendarEvents}
                                    className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center gap-1"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Clear All
                                </button>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {calendarEvents.map((event, idx) => {
                                    const eventDate = new Date(event.startTime);
                                    const isUpcoming = eventDate > new Date();
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border-2 flex items-start justify-between gap-3 ${isUpcoming
                                                ? 'bg-slate-100 border-slate-300'
                                                : 'bg-slate-50 border-slate-200 opacity-60'
                                                }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 truncate">{event.title}</p>
                                                <p className="text-sm text-slate-600">
                                                    {eventDate.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                {event.location && (
                                                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {event.location}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeCalendarEvent(idx)}
                                                className="p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-600 font-semibold">No calendar events yet</p>
                            <p className="text-sm text-slate-500">Upload your calendar to get event-aware fashion recommendations!</p>
                        </div>
                    )}

                    {/* Info */}
                    <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-4">
                        <p className="text-sm text-slate-900 font-semibold flex items-start gap-2">
                            <Calendar className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <span><span className="font-black">How to export:</span> Google Calendar → Settings → Export Calendar (Downloads .ics file) | Outlook → File → Options → Advanced → Export | Apple Calendar → Select calendar → File → Export</span>
                        </p>
                    </div>

                    <button
                        onClick={() => setShowCalendarModal(false)}
                        className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-950 text-white rounded-2xl font-semibold text-lg hover:shadow-lg transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
