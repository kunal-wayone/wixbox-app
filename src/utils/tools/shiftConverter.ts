export interface ShiftData {
  day: string;
  status: boolean;
  shift1: { from: string; to: string };
  shift2?: { from: string; to: string };
  state: string;
}



function parseTime12to24(time: string): string {
  if (!time) return '';
  const [timePart, modifier] = time.trim().split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Converts array of ShiftData objects into flat formatted structure.
 */
export function convertShiftData(data: ShiftData[]) {
  return data.map(item => {
    const result: Record<string, any> = {
      day: item.day,
      status: item.status,
    };

    if (item.status && item.shift1) {
      result.first_shift_start = parseTime12to24(item.shift1.from);
      result.first_shift_end = parseTime12to24(item.shift1.to);
    }

    if (item.status && item.shift2) {
      result.second_shift_start = parseTime12to24(item.shift2.from);
      result.second_shift_end = parseTime12to24(item.shift2.to);
    }

    return result;
  });
}
