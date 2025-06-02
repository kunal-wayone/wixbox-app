import React from 'react';
import { Text, TouchableOpacity, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface GradientButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  style?: ViewStyle;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  disabled = false,
  isSubmitting = false,
  style,
}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.touchable, style]}>
      <LinearGradient
        colors={['#EE6447', '#7248B3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}>
        <Text style={styles.text}>
          {isSubmitting ? 'Creating...' : title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    marginTop: 16,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GradientButton;
