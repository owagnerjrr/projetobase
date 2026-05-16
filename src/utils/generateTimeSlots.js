export function generateTimeSlots() {
  const start = 9;
  const end = 19;

  const lunchStart = 12;
  const lunchEnd = 13.5;

  const slots = [];

  for (let hour = start; hour < end; hour++) {
    const time = hour;

    if (time >= lunchStart && time < lunchEnd) continue;

    const formatted = `${String(Math.floor(time)).padStart(2, "0")}:00`;

    slots.push(formatted);
  }

  return slots;
}