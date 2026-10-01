import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {AnimatedPressable} from './AnimatedPressable';
import {c} from '../theme';

type SegmentedOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedProps<T extends string> = {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string>({options, value, onChange}: SegmentedProps<T>) {
  const [layout, setLayout] = useState<Record<number, {x: number; width: number}>>({});

  const activeIndex = options.findIndex(option => option.value === value);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: withTiming(layout[activeIndex]?.x ?? 0, {duration: 220})}],
    width: withTiming(layout[activeIndex]?.width ?? 0, {duration: 220}),
  }), [activeIndex, layout]);

  const buttonStyle = useMemo(
    () => ({
      width: `${100 / options.length}%`,
    }),
    [options.length],
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <AnimatedPressable
            key={option.value}
            style={[styles.option, buttonStyle, selected && styles.optionSelected]}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{selected}}
            onPress={() => onChange(option.value)}
            onLayout={({nativeEvent}) => {
              if (layout[index]?.x === nativeEvent.layout.x && layout[index]?.width === nativeEvent.layout.width) {
                return;
              }
              setLayout(previous => ({
                ...previous,
                [index]: {
                  x: nativeEvent.layout.x,
                  width: nativeEvent.layout.width,
                },
              }));
            }}
          >
            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.surface,
    borderRadius: 12,
    padding: 4,
    minHeight: 48,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: c.yellow,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  option: {
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  optionSelected: {
    // text styling is handled in the label
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: c.muted,
    paddingHorizontal: 12,
  },
  optionTextSelected: {
    color: c.ink,
  },
});
