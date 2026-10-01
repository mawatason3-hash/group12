import React, {useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {c} from '../theme';

type ToastProps = {
  visible: boolean;
  message: string;
  kind?: 'info' | 'success' | 'error';
  onDismiss?: () => void;
};

export function Toast({visible, message, kind = 'info', onDismiss}: ToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, {duration: 220, easing: Easing.out(Easing.cubic)});
      translateY.value = withTiming(0, {duration: 220, easing: Easing.out(Easing.cubic)});
      const timer = setTimeout(() => {
        opacity.value = withTiming(0, {duration: 220, easing: Easing.in(Easing.cubic)});
        translateY.value = withTiming(16, {duration: 220, easing: Easing.in(Easing.cubic)});
        onDismiss?.();
      }, 2200);
      return () => clearTimeout(timer);
    }
    opacity.value = 0;
    translateY.value = 16;
  }, [visible, onDismiss, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{translateY: translateY.value}],
  }));

  if (!visible || !message) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.container, animatedStyle, kind === 'error' && styles.error, kind === 'success' && styles.success]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 92,
    left: 16,
    right: 16,
    backgroundColor: c.ink,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  success: {backgroundColor: c.green},
  error: {backgroundColor: c.red},
  text: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
