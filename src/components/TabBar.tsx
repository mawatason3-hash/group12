import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {AnimatedPressable} from './AnimatedPressable';
import {c, appShadow} from '../theme';

const ICONS: Record<string, string> = {
  Home: 'home',
  NewInspection: 'clipboard',
  Records: 'folder-open',
};

export function TabBar({state, descriptors, navigation}: BottomTabBarProps) {
  const [width, setWidth] = useState(0);
  const tabWidth = width > 0 ? width / state.routes.length : 0;

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: state.index * (tabWidth || 0)}],
    width: tabWidth || 0,
  }));

  return (
    <View style={styles.wrapper} onLayout={({nativeEvent}) => setWidth(nativeEvent.layout.width)}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const {options} = descriptors[route.key];
        const labelValue = options.tabBarLabel ?? options.title ?? route.name;
        const label = typeof labelValue === 'string' ? labelValue : route.name;
        const iconName = ICONS[route.name] ?? 'radio-button-off';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AnimatedPressable
            key={route.key}
            accessibilityRole="button"
            accessibilityLabel={String(label)}
            accessibilityState={isFocused ? {selected: true} : {selected: false}}
            onPress={onPress}
            style={styles.tab}
          >
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={21}
              color={isFocused ? '#0B2137' : c.muted}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>{label}</Text>
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    minHeight: 86,
    backgroundColor: '#F7F0E8',
    borderTopWidth: 0,
    borderRadius: 28,
    marginHorizontal: 14,
    marginBottom: 14,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0D2BE',
    ...appShadow,
  },
  indicator: {
    position: 'absolute',
    top: 8,
    left: 0,
    bottom: 8,
    backgroundColor: c.yellow,
    borderRadius: 20,
    marginHorizontal: 6,
    shadowColor: '#F7CB42',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
    zIndex: 1,
    paddingVertical: 6,
    marginHorizontal: 2,
  },
  label: {
    marginTop: 5,
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.15,
    color: c.muted,
  },
  labelActive: {
    color: '#0B2137',
  },
});
