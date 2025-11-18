import { useState, useEffect } from 'react';
import { parseICSFile } from '../calendarIntegration';

/**
 * Custom hook for managing calendar events with localStorage persistence
 */
export const useCalendar = () => {
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [useCalendarContext, setUseCalendarContext] = useState(true);

    // Load calendar events from localStorage
    useEffect(() => {
        const savedEvents = localStorage.getItem('calendarEvents');
        if (savedEvents) {
            try {
                setCalendarEvents(JSON.parse(savedEvents));
            } catch (error) {
                console.error('Error loading calendar events:', error);
            }
        }
    }, []);

    // Save calendar events to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
    }, [calendarEvents]);

    const handleICSFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                try {
                    const events = parseICSFile(reader.result);
                    setCalendarEvents(events);
                    alert(`Successfully loaded ${events.length} events from your calendar!`);
                    setShowCalendarModal(false);
                } catch (error) {
                    console.error('Error parsing ICS file:', error);
                    alert('Error parsing calendar file. Please ensure it\'s a valid .ics file.');
                }
            };
            reader.readAsText(file);
        }
    };

    const removeCalendarEvent = (index) => {
        setCalendarEvents(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllCalendarEvents = () => {
        if (window.confirm('Are you sure you want to clear all calendar events?')) {
            setCalendarEvents([]);
        }
    };

    return {
        calendarEvents,
        showCalendarModal,
        setShowCalendarModal,
        useCalendarContext,
        setUseCalendarContext,
        handleICSFileUpload,
        removeCalendarEvent,
        clearAllCalendarEvents
    };
};
