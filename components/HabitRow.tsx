import { Pressable, Text, View } from 'react-native';
import { NeumorphicSurface } from './NeumorphicSurface';
import { colors, spacing, typography } from '../theme/tokens';
import { toDateISO } from '../lib/week';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function HabitRow({
  name,
  categoryLabel,
  target,
  completedDates,
  weekDays,
  todayISO,
  onToggleDay,
  onPressHeader,
  readOnly,
}: {
  name: string;
  categoryLabel: string;
  target: number;
  completedDates: string[];
  weekDays: Date[];
  todayISO: string;
  onToggleDay?: (dateISO: string) => void;
  onPressHeader?: () => void;
  readOnly?: boolean;
}) {
  const completedSet = new Set(completedDates);

  return (
    <NeumorphicSurface variant="raised" style={{ padding: spacing.lg }}>
      <Pressable onPress={onPressHeader} disabled={!onPressHeader}>
        <Text style={{ ...typography.title, color: colors.ink }}>{name}</Text>
        <Text style={{ color: colors.muted, marginTop: 2 }}>
          {categoryLabel} · {completedDates.length}/{target}
        </Text>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
        {weekDays.map((day, i) => {
          const dateISO = toDateISO(day);
          const filled = completedSet.has(dateISO);
          const isToday = dateISO === todayISO;

          return (
            <View key={dateISO} style={{ alignItems: 'center', gap: spacing.xs }}>
              <Text style={{ ...typography.caption, color: colors.muted, fontSize: 11 }}>
                {DAY_LABELS[i]}
              </Text>
              <Pressable onPress={() => onToggleDay?.(dateISO)} disabled={readOnly} hitSlop={4}>
                <NeumorphicSurface
                  variant={filled ? 'raised' : 'pressed'}
                  radius={999}
                  backgroundColor={filled ? colors.bauhaus.blue : colors.base}
                  style={{
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: isToday ? 2 : 0,
                    borderColor: colors.bauhaus.red,
                  }}
                >
                  <Text style={{ color: filled ? '#fff' : colors.muted, fontWeight: '600', fontSize: 12 }}>
                    {day.getDate()}
                  </Text>
                </NeumorphicSurface>
              </Pressable>
            </View>
          );
        })}
      </View>
    </NeumorphicSurface>
  );
}
