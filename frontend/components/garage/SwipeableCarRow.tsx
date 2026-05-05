import { ReactNode, useCallback, useEffect, memo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  Platform,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const ACTION_WIDTH = 88;
const SPRING = { damping: 22, stiffness: 200 };

type Props = {
  children: ReactNode;
  rowId: string;
  isOpen: boolean;
  onOpen: (id: string | null) => void;
  onRequestDelete: () => void;
  index: number;
  onPress: () => void;
};

function SwipeableCarRowInner({
  children,
  rowId,
  isOpen,
  onOpen,
  onRequestDelete,
  index,
  onPress,
}: Props) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);

  const close = useCallback(() => {
    translateX.value = withSpring(0, SPRING);
    onOpen(null);
  }, [onOpen, translateX]);

  useEffect(() => {
    if (!isOpen) {
      translateX.value = withSpring(0, SPRING);
    }
  }, [isOpen, translateX]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      "Delete vehicle",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel", onPress: close },
        {
          text: "Delete",
          style: "destructive",
          onPress: onRequestDelete,
        },
      ],
    );
  }, [close, onRequestDelete]);

  const triggerDeleteHaptic = useCallback(() => {
    if (Platform.OS === "ios") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, []);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-18, 18])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      const next = startX.value + e.translationX;
      if (next > 8) {
        translateX.value = 8;
        return;
      }
      if (next < -ACTION_WIDTH - 24) {
        translateX.value = -ACTION_WIDTH - 24;
        return;
      }
      translateX.value = next;
    })
    .onEnd(() => {
      const shouldOpen = translateX.value < -ACTION_WIDTH * 0.35;
      if (shouldOpen) {
        translateX.value = withSpring(-ACTION_WIDTH, SPRING);
        runOnJS(onOpen)(rowId);
      } else {
        translateX.value = withSpring(0, SPRING);
        runOnJS(onOpen)(null);
      }
    });

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onDeletePress = () => {
    triggerDeleteHaptic();
    confirmDelete();
  };

  return (
    <Animated.View
      entering={FadeInRight.duration(420)
        .delay(Math.min(index, 14) * 42)
        .springify()}
      style={styles.wrap}
    >
      <View style={styles.track}>
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.deleteBtn,
              pressed && styles.deleteBtnPressed,
            ]}
            onPress={onDeletePress}
          >
            <Text style={styles.deleteLabel}>Delete</Text>
          </Pressable>
        </View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.foreground, frontStyle]}>
            <Pressable
              style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressablePressed,
              ]}
              onPress={() => {
                if (isOpen) {
                  close();
                  return;
                }
                onPress();
              }}
            >
              {children}
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

export const SwipeableCarRow = memo(SwipeableCarRowInner);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
  },
  track: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1420",
  },
  actions: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  deleteBtn: {
    width: ACTION_WIDTH,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnPressed: {
    opacity: 0.88,
  },
  deleteLabel: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  foreground: {
    backgroundColor: "transparent",
  },
  pressable: {
    borderRadius: 16,
    overflow: "hidden",
  },
  pressablePressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
});
