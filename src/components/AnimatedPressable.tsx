import React, {type PropsWithChildren} from 'react';
import type {PressableProps, StyleProp, ViewStyle} from 'react-native';
import {Pressable} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type AnimatedPressableProps = PropsWithChildren<
  PressableProps & {
    style?: StyleProp<ViewStyle>;
    pressedScale?: number;
  }
>;

export function AnimatedPressable({
  children,
  style,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  ...props
}: AnimatedPressableProps) {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: reducedMotion ? 1 : scale.value}],
  }));

  return (
    <Pressable
      {...props}
      onPressIn={event => {
        scale.value = withTiming(pressedScale, {duration: 120});
        onPressIn?.(event);
      }}
      onPressOut={event => {
        scale.value = withTiming(1, {duration: 120});
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
