import { Pressable, Text, View } from 'react-native';
import { NeumorphicSurface } from './NeumorphicSurface';
import { colors, spacing, typography } from '../theme/tokens';

export function WeekListItem({
  weekRangeLabel,
  percent,
  doneCount,
  plannedCount,
  onPress,
}: {
  weekRangeLabel: string;
  percent: number;
  doneCount: number;
  plannedCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <NeumorphicSurface
        variant="raised"
        style={{
          padding: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View>
          <Text style={{ ...typography.title, fontSize: 16, color: colors.ink }}>{weekRangeLabel}</Text>
          <Text style={{ color: colors.muted, marginTop: 2 }}>
            {doneCount}/{plannedCount} completed
          </Text>
        </View>
        <Text style={{ ...typography.display, fontSize: 22, color: colors.bauhaus.blue }}>
          {Math.round(Math.max(0, Math.min(percent, 1)) * 100)}%
        </Text>
      </NeumorphicSurface>
    </Pressable>
  );
}
