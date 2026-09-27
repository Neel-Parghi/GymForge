/** Converts a meal time like "7:30 AM", "13:00" or "1:00 pm" to minutes after midnight (0 when unparseable). */
export function mealTimeToMinutes(timeStr: string): number {
  if (!timeStr) 
    return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) 
    return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && hours < 12) 
    hours += 12;
  if (ampm === 'AM' && hours === 12) 
    hours = 0;

  return hours * 60 + minutes;
}
