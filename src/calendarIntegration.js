// Calendar Integration Module
// Handles parsing and displaying calendar events from various sources

export const parseICSFile = (icsContent) => {
  const events = [];
  const lines = icsContent.split('\n');
  let currentEvent = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      // Parse dates and add to events
      if (currentEvent.SUMMARY) {
        events.push({
          title: currentEvent.SUMMARY,
          description: currentEvent.DESCRIPTION || '',
          startTime: parseICSDate(currentEvent.DTSTART),
          endTime: parseICSDate(currentEvent.DTEND),
          location: currentEvent.LOCATION || '',
          rawData: currentEvent
        });
      }
      currentEvent = null;
    } else if (currentEvent && line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const cleanKey = key.split(';')[0];
      const value = valueParts.join(':');
      currentEvent[cleanKey] = value;
    }
  }

  return events;
};

export const parseICSDate = (dateStr) => {
  if (!dateStr) return null;

  // Format: YYYYMMDDTHHMMSSZ or YYYYMMDD
  const dateOnly = dateStr.substring(0, 8);
  const year = dateOnly.substring(0, 4);
  const month = dateOnly.substring(4, 6);
  const day = dateOnly.substring(6, 8);

  let dateObj = new Date(year, parseInt(month) - 1, parseInt(day));

  if (dateStr.includes('T')) {
    const timeStr = dateStr.substring(9, 15);
    if (timeStr) {
      const hours = timeStr.substring(0, 2);
      const minutes = timeStr.substring(2, 4);
      const seconds = timeStr.substring(4, 6);
      dateObj.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    }
  }

  return dateObj;
};

export const getUpcomingEvents = (events, days = 7) => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return events
    .filter(event => {
      const startTime = new Date(event.startTime);
      return startTime >= now && startTime <= futureDate;
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
};

export const formatEventForPrompt = (event) => {
  const startDate = new Date(event.startTime);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  let eventStr = `${formattedDate} - ${event.title}`;
  if (event.location) {
    eventStr += ` (${event.location})`;
  }
  return eventStr;
};
