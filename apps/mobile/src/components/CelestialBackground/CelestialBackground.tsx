import { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

interface CelestialBackgroundProps {
  variant: 'splash' | 'subtle';
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Simple seeded random for deterministic positions */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const CONFIGS = {
  splash: {
    starCount: 25,
    starSizeRange: [1, 3],
    opacityRange: [0.15, 0.5],
    twinkleDuration: [2000, 5000],
    planetCount: 3,
    planetSizeRange: [4, 12],
    glowRadius: 8,
    floatDuration: [20000, 40000],
    planetColors: ['#FFD700', '#D4A017', '#FFB347'],
  },
  subtle: {
    starCount: 15,
    starSizeRange: [1, 2],
    opacityRange: [0.1, 0.2],
    twinkleDuration: [3000, 6000],
    planetCount: 1,
    planetSizeRange: [4, 8],
    glowRadius: 4,
    floatDuration: [25000, 40000],
    planetColors: ['#D4A017'],
  },
} as const;

export default function CelestialBackground({ variant }: CelestialBackgroundProps) {
  const config = CONFIGS[variant];
  const rand = useMemo(() => seededRandom(42), []);

  const stars = useMemo(() => {
    const r = rand;
    return Array.from({ length: config.starCount }, (_, i) => {
      const size = config.starSizeRange[0] + r() * (config.starSizeRange[1] - config.starSizeRange[0]);
      const dur = config.twinkleDuration[0] + r() * (config.twinkleDuration[1] - config.twinkleDuration[0]);
      return {
        id: i,
        left: r() * SCREEN_WIDTH,
        top: r() * SCREEN_HEIGHT,
        size,
        duration: dur,
        delay: r() * dur,
        opacityMin: config.opacityRange[0],
        opacityMax: config.opacityRange[1],
      };
    });
  }, [config, rand]);

  const planets = useMemo(() => {
    const r = rand;
    return Array.from({ length: config.planetCount }, (_, i) => {
      const size = config.planetSizeRange[0] + r() * (config.planetSizeRange[1] - config.planetSizeRange[0]);
      const dur = config.floatDuration[0] + r() * (config.floatDuration[1] - config.floatDuration[0]);
      return {
        id: i,
        left: 0.15 * SCREEN_WIDTH + r() * 0.7 * SCREEN_WIDTH,
        top: 0.1 * SCREEN_HEIGHT + r() * 0.8 * SCREEN_HEIGHT,
        size,
        color: config.planetColors[i % config.planetColors.length],
        duration: dur,
        delay: r() * 10000,
      };
    });
  }, [config, rand]);

  // Star twinkle animations
  const starAnims = useRef(stars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    starAnims.forEach((anim, i) => {
      const star = stars[i];
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: star.duration / 2,
            delay: i === 0 ? star.delay : 0,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: star.duration / 2,
            useNativeDriver: true,
          }),
        ]).start(() => twinkle());
      };
      twinkle();
    });
  }, [starAnims, stars]);

  // Planet float animations
  const planetTranslateY = useRef(planets.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    planetTranslateY.forEach((anim, i) => {
      const planet = planets[i];
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -15,
            duration: planet.duration / 2,
            delay: planet.delay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: planet.duration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [planetTranslateY, planets]);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star, i) => (
        <Animated.View
          key={`star-${star.id}`}
          style={[
            styles.star,
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              backgroundColor: variant === 'splash' ? '#D4A017' : '#FF8C00',
              opacity: starAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [star.opacityMin, star.opacityMax],
              }),
            },
          ]}
        />
      ))}
      {planets.map((planet, i) => (
        <Animated.View
          key={`planet-${planet.id}`}
          style={[
            styles.planet,
            {
              left: planet.left,
              top: planet.top,
              width: planet.size,
              height: planet.size,
              borderRadius: planet.size / 2,
              backgroundColor: planet.color,
              shadowColor: planet.color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: CONFIGS[variant].glowRadius,
              elevation: 4,
              transform: [{ translateY: planetTranslateY[i] }],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
  },
  planet: {
    position: 'absolute',
  },
});
