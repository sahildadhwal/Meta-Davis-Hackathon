import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

interface WaveAnimationProps {
  active: boolean;
}

const BAR_COUNT = 5;
const MIN_HEIGHT = 8;
const MAX_HEIGHT = 32;

export default function WaveAnimation({ active }: WaveAnimationProps) {
  const anims = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_HEIGHT)),
  ).current;

  useEffect(() => {
    if (!active) {
      anims.forEach((a) => {
        Animated.timing(a, { toValue: MIN_HEIGHT, duration: 200, useNativeDriver: false }).start();
      });
      return;
    }

    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 100),
          Animated.timing(anim, {
            toValue: MIN_HEIGHT + Math.random() * (MAX_HEIGHT - MIN_HEIGHT),
            duration: 300 + i * 60,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: MIN_HEIGHT,
            duration: 300 + i * 60,
            useNativeDriver: false,
          }),
        ]),
      ),
    );

    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active, anims]);

  return (
    <View style={styles.container}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: anim,
              backgroundColor: active ? COLORS.green : COLORS.textDim,
              opacity: active ? 0.85 : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: MAX_HEIGHT + 4,
  },
  bar: {
    width: 4,
    borderRadius: RADIUS.full,
  },
});
