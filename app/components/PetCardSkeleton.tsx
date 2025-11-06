import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const PetCardSkeleton = () => {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.petCardContainer, animatedStyle]}>
      <View style={styles.petImage} />
      <View style={styles.petInfoContainer}>
        <View style={styles.skeletonTextLarge} />
        <View style={styles.skeletonTextSmall} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  petCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    padding: 12,
    borderRadius: 16,
    marginVertical: 8,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: '#E9EEF3',
  },
  petInfoContainer: { flex: 1 },
  skeletonTextLarge: {
    backgroundColor: '#E9EEF3',
    height: 20,
    width: '70%',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonTextSmall: {
    backgroundColor: '#E9EEF3',
    height: 14,
    width: '50%',
    borderRadius: 8,
  },
});

export default PetCardSkeleton;
