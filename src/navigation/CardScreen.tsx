import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {AnimatedPressable} from '../components/AnimatedPressable';
import {c, appShadow} from '../theme';

export function CardScreen() {
  const [flipped, setFlipped] = useState(false);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{perspective: 1200}, {rotateY: withTiming(flipped ? '180deg' : '0deg', {duration: 350, easing: Easing.inOut(Easing.cubic)})}],
    opacity: withTiming(flipped ? 0 : 1, {duration: 180}),
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{perspective: 1200}, {rotateY: withTiming(flipped ? '0deg' : '-180deg', {duration: 350, easing: Easing.inOut(Easing.cubic)})}],
    opacity: withTiming(flipped ? 1 : 0, {duration: 180}),
  }));

  return (
    <View style={styles.page}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title} accessibilityRole="header">Transport card</Text>
          <Text style={styles.caption}>Sample data only. No balance is displayed.</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryPillText}>Valid</Text>
        </View>
      </View>

      <AnimatedPressable
        onPress={() => setFlipped(value => !value)}
        accessibilityRole="button"
        accessibilityLabel="Flip transport card"
        style={styles.flipArea}
      >
        <Animated.View style={[styles.cardFace, styles.frontFace, frontStyle]}>
          <Text style={styles.cardBrand}>Inspection pass</Text>
          <Text style={styles.cardNumber}>•••• •••• 1234</Text>
          <Text style={styles.cardText}>Route: Musanze</Text>
          <Text style={styles.cardText}>Status: valid</Text>
        </Animated.View>

        <Animated.View style={[styles.cardFace, styles.backFace, backStyle]}>
          <Text style={styles.cardBrand}>Sample data</Text>
          <Text style={styles.backName}>Musanze Route</Text>
          <Text style={styles.cardText}>Issued: 12 Aug 2026</Text>
          <Text style={styles.cardText}>No balance shown</Text>
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: c.paper,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: c.ink,
    letterSpacing: -0.8,
  },
  caption: {
    marginTop: 2,
    fontSize: 13,
    color: c.muted,
  },
  summaryPill: {
    backgroundColor: '#EAF5F1',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#B9DCC5',
  },
  summaryPillText: {
    color: '#1D6F48',
    fontSize: 12,
    fontWeight: '800',
  },
  flipArea: {
    minHeight: 220,
    borderRadius: 22,
    ...appShadow,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 22,
    padding: 22,
    justifyContent: 'space-between',
  },
  frontFace: {
    backgroundColor: c.blue,
  },
  backFace: {
    backgroundColor: c.ink,
    borderWidth: 1,
    borderColor: c.line,
  },
  cardBrand: {
    color: c.yellow,
    fontSize: 18,
    fontWeight: '700',
  },
  cardNumber: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});
