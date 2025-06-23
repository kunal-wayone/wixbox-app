// ShiftData interface
export interface ShiftData {
  day: string;
  status: boolean;
  shift1: { from: string; to: string };
  shift2?: { from: string; to: string };
  state: string;
}

// Convert 12-hour time to 24-hour
function parseTime12to24(time: string): string {
  if (!time) return '';
  const [timePart, modifier] = time.trim().split(' ');
  let [hours, minutes] = timePart.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Convert 24-hour time to 12-hour
function parseTime24to12(time: string): string {
  if (!time) return '';
  let [hours, minutes] = time.split(':').map(Number);
  const modifier = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12; // 0 => 12 AM
  return `${hours}:${minutes.toString().padStart(2, '0')} ${modifier}`;
}

/**
 * Converts array of ShiftData objects into flat formatted structure.
 */
export function convertShiftData(data: ShiftData[]) {
  return data.map(item => {
    const result: Record<string, any> = {
      day: item.day,
      status: item.status,
      state: item.state,
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

/**
 * Reverts flattened shift data back to ShiftData[] format.
 */
export function revertShiftData(data: any[]): ShiftData[] {
  return data.map(item => {
    const shift: ShiftData = {
      day: item.day,
      status: item.status,
      shift1: { from: '', to: '' },
      state: item.state || '',
    };

    if (item.status) {
      if (item.first_shift_start && item.first_shift_end) {
        shift.shift1 = {
          from: parseTime24to12(item.first_shift_start),
          to: parseTime24to12(item.first_shift_end),
        };
      }

      if (item.second_shift_start && item.second_shift_end) {
        shift.shift2 = {
          from: parseTime24to12(item.second_shift_start),
          to: parseTime24to12(item.second_shift_end),
        };
      }
    }

    return shift;
  });
}
