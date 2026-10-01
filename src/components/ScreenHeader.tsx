import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {GROUP_CODE} from '../constants/group';
import {c} from '../theme';

export function ScreenHeader({title}: {title: string}) {
  return (
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {title}
      </Text>
      <Text
        style={styles.groupCode}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        allowFontScaling
      >
        {GROUP_CODE}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  title: {
    color: c.ink,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  groupCode: {
    color: '#8ED1FF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginTop: 4,
    lineHeight: 18,
  },
});
