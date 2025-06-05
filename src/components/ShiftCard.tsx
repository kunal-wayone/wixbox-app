import React from 'react';
import {View, Text} from 'react-native';

interface ShiftProps {
  day: string;
  shift: number; // 0 = no shift, 1 = single shift, 2 = double shift
  firstShift?: string;
  secondShift?: string;
}

const ShiftCard: React.FC<ShiftProps> = ({
  day,
  shift,
  firstShift,
  secondShift,
}) => {
  if (shift === 0)
    return (
      <View className="flex-row items-center gap-4 mb-8">
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
    <View className="flex-row items-center gap-4 mb-8">
      <Text className="px-3 py-2 w-16 text-center bg-primary-50 rounded-lg text-black">
        {day}
      </Text>

      {shift === 1 && firstShift && (
        <Text className="text-black font-poppins text-center">{firstShift}</Text>
      )}

      {shift === 2 && firstShift && secondShift && (
        <View className="flex-row items-center gap-1">
          <Text className="text-black font-poppins">{firstShift}</Text>
          <Text className="text-black font-poppins">&</Text>
          <Text className="text-black font-poppins">{secondShift}</Text>
        </View>
      )}
    </View>
  );
};

export default ShiftCard;
