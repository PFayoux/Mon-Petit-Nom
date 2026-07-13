import {
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold_Italic,
  useFonts,
} from '@expo-google-fonts/cormorant-garamond';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const DURATION = 600;

// The mark is drawn at this reference size and then scaled to the screen width,
// so it stays crisp (vector circle + text) at any size instead of a raster.
const BASE_CIRCLE = 240;
const BASE_KICKER = 24;
const BASE_TITLE = 72;
const BASE_LETTER_SPACING = 3;
const BASE_BORDER = 8;

const TEXT_LAYERS = [
  { offset: { x: 4, y: 7 }, color: Colors.light.primaryShadow },
  { offset: { x: 2, y: 3 }, color: Colors.light.primaryShadow },
  { offset: { x: 0, y: 0 }, color: Colors.light.primaryPressed },
];

function LogoMark() {
  const { width } = useWindowDimensions();
  // Fill (almost) the full screen width, capped so it doesn't get absurd on tablets.
  const circleSize = Math.min(width * 0.82, 460);
  const scale = circleSize / BASE_CIRCLE;

  return (
    <View style={[styles.markContainer, { width: circleSize, height: circleSize }]}>
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: BASE_BORDER * scale,
          },
        ]}
      />
      {TEXT_LAYERS.map((layer, index) => (
          <View
            key={index}
            style={[
              styles.textLayer,
              {
                transform: [
                  { translateX: layer.offset.x * scale },
                  { translateY: layer.offset.y * scale },
                ],
              },
            ]}>
            <Text
              style={[
                styles.kicker,
                {
                  color: layer.color,
                  fontSize: BASE_KICKER * scale,
                  letterSpacing: BASE_LETTER_SPACING * scale,
                },
              ]}>
              Mon petit
            </Text>
            <Text
              style={[
                styles.title,
                {
                  color: layer.color,
                  fontSize: BASE_TITLE * scale,
                  lineHeight: BASE_TITLE * scale,
                  marginTop: -2 * scale,
                },
              ]}>
              nom
            </Text>
          </View>
        ))}
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
    borderColor: Colors.light.primary,
    opacity: 0.4,
  },
  textLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: 'CormorantGaramond_500Medium',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold_Italic',
  },
});
