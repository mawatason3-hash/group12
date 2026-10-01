import React, {type PropsWithChildren} from 'react';
import {StyleSheet, View} from 'react-native';
import {c} from '../theme';

type ScreenProps = PropsWithChildren<{
  style?: object;
}>;

export function Screen({children, style}: ScreenProps) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.paper,
  },
});
