import {
    Pressable,
    View,
    Animated,
    SafeAreaView,
    StyleSheet,
} from 'react-native';
import { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';


const defaultStyles = {
    bgGradientColors: ['#ac94f4', '#ac94f4'],
    headGradientColors: ['#000', '#000'],
};

const activeStyles = {
    bgGradientColors: ['#00c40a', '#00c40a'],
    headGradientColors: ['#fff', '#fff'],
};


const SIZE_CONFIGS: any = {
    small: {
        width: 40,
        height: 20,
        padding: 2,
        knobSize: 16,
        translateRange: [2, 22],
    },
    medium: {
        width: 56,
        height: 28,
        padding: 3,
        knobSize: 22,
        translateRange: [4, 28],
    },
    large: {
        width: 72,
        height: 36,
        padding: 4,
        knobSize: 28,
        translateRange: [5, 39],
    },
};


const Switch = (props: any) => {
    const { value, onValueChange, size = 'medium' } = props;
    const [animatedValue] = useState(new Animated.Value(value ? 1 : 0));

    const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.medium;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: value ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [value]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: config.translateRange,
    });

    const toggleSwitch = () => onValueChange(!value);

    const currentStyles = value ? activeStyles : defaultStyles;

    return (
        <Pressable
            onPress={toggleSwitch}
            style={{
                width: config.width,
                height: config.height,
                borderRadius: config.height / 2,
            }}
        >
            <LinearGradient
                colors={currentStyles.bgGradientColors}
                style={{
                    flex: 1,
                    borderRadius: config.height / 2,
                }}
                start={{ x: 0, y: 0.5 }}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: config.padding,
                    }}
                >
                    <Animated.View
                        style={{
                            transform: [{ translateX }],
                        }}
                    >
                        <LinearGradient
                            colors={currentStyles.headGradientColors}
                            style={{
                                width: config.knobSize,
                                height: config.knobSize,
                                borderRadius: config.knobSize / 2,
                            }}
                        />
                    </Animated.View>
                </View>
            </LinearGradient>
        </Pressable>
    );
};



export default Switch;


const styles = StyleSheet.create({
    pressable: {
        width: 56,
        height: 28,
        borderRadius: 16,
    },
    backgroundGradient: {
        borderRadius: 16,
        flex: 1,
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        position: 'relative',
    },
    headGradient: {
        width: 22,
        height: 22,
        borderRadius: 100,
    },
});