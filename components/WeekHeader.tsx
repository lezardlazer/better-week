import { Text, View } from 'react-native';
import { NeumorphicSurface } from './NeumorphicSurface';
import { colors, spacing, typography } from '../theme/tokens';

export function WeekHeader({
  weekRangeLabel,
  percent,
  doneCount,
  plannedCount,
  headerRight,
}: {
  weekRangeLabel: string;
  percent: number;
  doneCount: number;
  plannedCount: number;
  headerRight?: React.ReactNode;
}) {
  const clampedPercent = Math.min(percent, 1);

  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bauhaus.blue }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bauhaus.yellow }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bauhaus.red }} />
          <Text style={{ ...typography.caption, color: colors.muted, marginLeft: spacing.xs }}>
            BETTER WEEK
          </Text>
        </View>
        {headerRight}
      </View>

      <Text style={{ ...typography.display, color: colors.ink }}>{weekRangeLabel}</Text>

      <NeumorphicSurface variant="raised" backgroundColor={colors.bauhaus.blue} style={{ padding: spacing.xl }}>
        <Text style={{ fontSize: 44, fontWeight: '700', color: '#fff' }}>
          {Math.round(clampedPercent * 100)}%
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs }}>Weekly goal</Text>
        <NeumorphicSurface
          variant="pressed"
          backgroundColor="rgba(255,255,255,0.25)"
          radius={999}
          style={{ height: 8, marginTop: spacing.lg, overflow: 'hidden' }}
        >
          <View
            style={{
              width: `${clampedPercent * 100}%`,
              height: '100%',
              borderRadius: 999,
              backgroundColor: colors.bauhaus.yellow,
            }}
          />
        </NeumorphicSurface>
      </NeumorphicSurface>

      <View style={{ flexDirection: 'row', gap: spacing.lg }}>
        <NeumorphicSurface variant="raised" style={{ flex: 1, padding: spacing.lg }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bauhaus.blue }} />
          <Text style={{ ...typography.display, fontSize: 28, color: colors.ink, marginTop: spacing.sm }}>
            {doneCount}
          </Text>
          <Text style={{ color: colors.muted }}>Done</Text>
        </NeumorphicSurface>
        <NeumorphicSurface variant="raised" style={{ flex: 1, padding: spacing.lg }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.bauhaus.yellow }} />
          <Text style={{ ...typography.display, fontSize: 28, color: colors.ink, marginTop: spacing.sm }}>
            {plannedCount}
          </Text>
          <Text style={{ color: colors.muted }}>Planned</Text>
        </NeumorphicSurface>
      </View>
    </View>
  );
}
