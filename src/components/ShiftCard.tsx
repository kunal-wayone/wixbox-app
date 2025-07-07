import React from 'react';
import { View, Text } from 'react-native';

interface ShiftProps {
  day: string;
  shift: number; // 0 = no shift, 1 = single shift, 2 = double shift
  firstShift?: string;
  secondShift?: string;
  first_shift_start: string,
  first_shift_end: string,
  second_shift_start: string,
  second_shift_end: string,
  status: boolean
}

const ShiftCard: React.FC<ShiftProps> = ({
  day,
  shift,
  firstShift,
  secondShift,
  first_shift_start,
  first_shift_end,
  second_shift_start,
  second_shift_end,
  status = true
}) => {
  if (!status)
    return (
      <View className="flex-row items-center gap-4 mb-8 hidden">
        <Text className="px-3 py-2 w-16 text-center bg-primary-50 rounded-lg text-black">
          {day}
        </Text>
        <Text className="text-black  text-center font-poppins">
          {'....................'}
        </Text>
        <Text className="text-black font-poppins">{'   '}</Text>
        <Text className="text-black text-center font-poppins">
          {'....................'}
        </Text>
      </View>
    );

  return (
    <View className="flex-row items-center gap-4 mb-4">
      <Text className="px-3 py-2 w-16 text-center bg-primary-50 rounded-lg text-black">
        {day}
      </Text>

      {first_shift_start && first_shift_end && !second_shift_start && !second_shift_end && (
        <View className='flex-row items-center justify-start w-2/3'>
          <Text className="text-black text-sm font-poppins text-left">
            {first_shift_start + " - " + first_shift_end}
          </Text>
        </View>
      )}

      {second_shift_start && second_shift_end && (
        <View className="flex-row items-center gap-1">
          <Text className="text-black text-sm font-poppins">{first_shift_start + " - " + first_shift_end}</Text>
          <Text className="text-black text-sm font-poppins mx-2">&</Text>
          <Text className="text-black text-sm font-poppins">{second_shift_start + " - " + second_shift_end}</Text>
        </View>
      )}
    </View>
  );
};

export default ShiftCard;
