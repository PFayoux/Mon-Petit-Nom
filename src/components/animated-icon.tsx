import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold_Italic,
  useFonts,
} from '@expo-google-fonts/cormorant-garamond';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 600;

const TEXT_LAYERS = [
  { offset: { x: 4, y: 7 }, color: Colors.light.primaryShadow },
  { offset: { x: 2, y: 3 }, color: Colors.light.primaryShadow },
  { offset: { x: 0, y: 0 }, color: Colors.light.primaryPressed },
];

function LogoMark() {
  return (
    <View style={styles.markContainer}>
      <View style={styles.circle} />
      <View style={styles.textStack}>
        {TEXT_LAYERS.map((layer, index) => (
          <View
            key={index}
            style={[
              styles.textLayer,
              { transform: [{ translateX: layer.offset.x }, { translateY: layer.offset.y }] },
            ]}>
            <Text style={[styles.kicker, { color: layer.color }]}>Mon petit</Text>
            <Text style={[styles.title, { color: layer.color }]}>nom</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fontsLoaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold_Italic,
  });

  if (!visible || !fontsLoaded) return null;

  const splashKeyframe = new Keyframe({
    0: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1 }],
      easing: Easing.elastic(0.7),
    },
  });

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.light.background, Colors.light.surface]} style={styles.splashOverlay}>
        <LogoMark />
      </LinearGradient>
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[Colors.light.background, Colors.light.surface]} style={styles.splashOverlay}>
        <LogoMark />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  markContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 8,
    borderColor: Colors.light.primary,
    opacity: 0.4,
  },
  textStack: {
    alignItems: 'center',
  },
  textLayer: {
    position: 'absolute',
    alignItems: 'center',
  },
  kicker: {
    fontFamily: 'CormorantGaramond_500Medium',
    fontSize: 24,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold_Italic',
    fontSize: 72,
    lineHeight: 72,
    marginTop: -2,
  },
});
