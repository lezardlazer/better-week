import { useEffect, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector, type GestureType } from 'react-native-gesture-handler';
import Animated, {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * A minimal long-press-to-drag reorder list, built directly on gesture-handler
 * + reanimated rather than react-native-draggable-flatlist — that library's
 * Nestable variant calls the legacy `findNodeHandle` API internally, which
 * react-native-web throws on unconditionally, breaking it on web entirely
 * (our primary target). This only uses onLayout + shared values, so it works
 * the same on web and native.
 *
 * The pan gesture is exposed via `dragProps.gesture` rather than attached to
 * the whole row, so the caller can wrap just a specific handle element (e.g.
 * a category header, not the whole card that also contains a nested
 * reorderable list) — attaching it to the full row would make nested drag
 * lists fight over the same touch area.
 *
 * Behavior: long-press the handle to lift the row (scale + shadow, no
 * haptics — not available on iOS Safari PWA), drag up/down, release to drop.
 * Siblings only animate once on drop (via reanimated's layout transition),
 * not live during the drag — simpler to get right than a live-reflow list,
 * still reads as a real reorder interaction.
 */
export function DragReorderList<T>({
  data,
  keyExtractor,
  onReorderEnd,
  renderItem,
  enabled = true,
}: {
  data: T[];
  keyExtractor: (item: T) => string;
  onReorderEnd: (newData: T[]) => void;
  renderItem: (params: {
    item: T;
    index: number;
    isDragging: boolean;
    dragProps: { gesture: GestureType };
  }) => React.ReactNode;
  enabled?: boolean;
}) {
  const [items, setItems] = useState(data);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const layouts = useRef<Map<string, { y: number; height: number }>>(new Map());

  useEffect(() => {
    // Only resync from upstream while nothing is actively being dragged —
    // otherwise an unrelated re-render (e.g. another habit's toggle) would
    // yank the item back mid-gesture.
    if (draggingKey === null) setItems(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleDrop = (key: string, centerY: number) => {
    setItems((current) => {
      const fromIndex = current.findIndex((it) => keyExtractor(it) === key);
      if (fromIndex === -1) return current;

      let toIndex = current.findIndex((it) => {
        const l = layouts.current.get(keyExtractor(it));
        return !!l && centerY >= l.y && centerY < l.y + l.height;
      });
      if (toIndex === -1) {
        const first = layouts.current.get(keyExtractor(current[0]));
        toIndex = first && centerY < first.y ? 0 : current.length - 1;
      }
      if (toIndex === fromIndex) return current;

      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      onReorderEnd(next);
      return next;
    });
    setDraggingKey(null);
  };

  return (
    <View>
      {items.map((item, index) => {
        const key = keyExtractor(item);
        return (
          <DragRow
            key={key}
            enabled={enabled}
            onLayout={(e) => {
              layouts.current.set(key, { y: e.nativeEvent.layout.y, height: e.nativeEvent.layout.height });
            }}
            onDragStart={() => setDraggingKey(key)}
            onDragEnd={(centerYDelta) => {
              const l = layouts.current.get(key);
              const centerY = (l ? l.y + l.height / 2 : 0) + centerYDelta;
              handleDrop(key, centerY);
            }}
            renderContent={(gesture) =>
              renderItem({ item, index, isDragging: draggingKey === key, dragProps: { gesture } })
            }
          />
        );
      })}
    </View>
  );
}

function DragRow({
  enabled,
  onLayout,
  onDragStart,
  onDragEnd,
  renderContent,
}: {
  enabled: boolean;
  onLayout: (e: LayoutChangeEvent) => void;
  onDragStart: () => void;
  onDragEnd: (centerYDelta: number) => void;
  renderContent: (gesture: GestureType) => React.ReactNode;
}) {
  const translateY = useSharedValue(0);
  const lift = useSharedValue(0);

  const pan = Gesture.Pan()
    .enabled(enabled)
    .activateAfterLongPress(280)
    .onStart(() => {
      lift.value = withTiming(1, { duration: 120 });
      runOnJS(onDragStart)();
    })
    .onUpdate((e) => {
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const delta = e.translationY;
      translateY.value = withTiming(0, { duration: 150 });
      lift.value = withTiming(0, { duration: 150 });
      runOnJS(onDragEnd)(delta);
    })
    .onFinalize(() => {
      translateY.value = withTiming(0, { duration: 150 });
      lift.value = withTiming(0, { duration: 150 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: 1 + lift.value * 0.03 }],
    zIndex: lift.value > 0 ? 10 : 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: lift.value * 8 },
    shadowOpacity: lift.value * 0.25,
    shadowRadius: lift.value * 12,
    elevation: lift.value * 8,
  }));

  return (
    <Animated.View layout={LinearTransition.duration(200)} onLayout={onLayout} style={animatedStyle}>
      {renderContent(pan)}
    </Animated.View>
  );
}
