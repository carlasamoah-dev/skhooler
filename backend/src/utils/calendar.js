export function generateIcs(event) {
  const formatDate = (date) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const start = formatDate(event.startDate);
  const end = event.endDate ? formatDate(event.endDate) : formatDate(new Date(new Date(event.startDate).getTime() + 60 * 60 * 1000));
  
  const location = event.locationAddress || event.locationUrl || '';
  const status = event.isCancelled ? 'CANCELLED' : 'CONFIRMED';
  
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Skhooler//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    `STATUS:${status}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  
  return lines.join('\r\n');
}

export function generateGoogleCalendarUrl(event) {
  const formatDate = (date) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const start = formatDate(event.startDate);
  const end = event.endDate ? formatDate(event.endDate) : formatDate(new Date(new Date(event.startDate).getTime() + 60 * 60 * 1000));
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || '',
    location: event.locationAddress || event.locationUrl || ''
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
