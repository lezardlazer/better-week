import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { DragReorderList } from './DragReorderList';
import { NeumorphicSurface } from './NeumorphicSurface';
import { colors, radius as radiusTokens, spacing, typography } from '../theme/tokens';
import { AppIcon } from '../lib/icons';
import { toDateISO } from '../lib/week';
import { useCategoryPositions, useReorderCategories } from '../lib/queries/useCategories';
import { useReorderHabits } from '../lib/queries/useHabits';

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const INFO_COLUMN_FLEX = 3.4;
const DATE_BADGE_SIZE = 24;
const ROW_VERTICAL_PADDING = spacing.sm;
const TOTAL_FLEX_UNITS = INFO_COLUMN_FLEX + 7;
const COLUMN_WIDTH_PERCENT = (1 / TOTAL_FLEX_UNITS) * 100;

export type GridHabit = {
  id: string;
  name: string;
  habitType: 'to_do' | 'to_avoid';
  frequency: 'weekly' | 'biweekly' | 'monthly';
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  target: number;
  completedDates: string[];
  streakWeeks: number;
  /** Whether this habit already had a completion last week — only
   * meaningful for biweekly habits, where doing it last week means this
   * week is an "off" week. */
  doneLastWeek: boolean;
};

type CategoryGroup = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  habits: GridHabit[];
};

export function HabitsGrid({
  habits,
  weekDays,
  todayISO,
  onToggleDay,
  onPressHabit,
}: {
  habits: GridHabit[];
  weekDays: Date[];
  todayISO: string;
  onToggleDay: (habitId: string, dateISO: string) => void;
  onPressHabit: (habitId: string) => void;
}) {
  const categoryPositionsQuery = useCategoryPositions();
  const reorderCategoriesMutation = useReorderCategories();
  const reorderHabitsMutation = useReorderHabits();

  const [categories, setCategories] = useState<CategoryGroup[]>([]);

  useEffect(() => {
    setCategories(groupAndSortCategories(habits, categoryPositionsQuery.data ?? {}));
  }, [habits, categoryPositionsQuery.data]);

  const todayIndex = weekDays.findIndex((d) => toDateISO(d) === todayISO);
  // % position of the today column, matching the row's flex-based math
  // exactly (INFO_COLUMN_FLEX + 7 equal day columns), computed against a
  // content box of width (cardWidth - 2*spacing.lg) — every place that
  // paints this highlight (header, connectors, category cards) uses this
  // same percentage against a box padded by spacing.lg on each side, so
  // they all land on the exact same pixels regardless of card boundaries.
  const columnLeftPercent = todayIndex >= 0 ? ((INFO_COLUMN_FLEX + todayIndex) / TOTAL_FLEX_UNITS) * 100 : null;

  return (
    <View>
      <NeumorphicSurface variant="raised" style={{ padding: spacing.lg, overflow: 'hidden' }}>
        <View style={{ position: 'relative' }}>
          <ColumnHighlight columnLeftPercent={columnLeftPercent} bleedTop bleedBottom />
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: INFO_COLUMN_FLEX }} />
            {weekDays.map((day, i) => {
              const dateISO = toDateISO(day);
              const isToday = dateISO === todayISO;
              return (
                <View key={dateISO} style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: spacing.xs }}>
                  <Text style={{ ...typography.caption, color: colors.muted, fontSize: 11 }}>{DAY_LABELS[i]}</Text>
                  <View style={{ width: DATE_BADGE_SIZE, height: DATE_BADGE_SIZE, alignItems: 'center', justifyContent: 'center' }}>
                    {isToday ? (
                      <View
                        style={{
                          width: DATE_BADGE_SIZE,
                          height: DATE_BADGE_SIZE,
                          borderRadius: DATE_BADGE_SIZE / 2,
                          backgroundColor: colors.bauhaus.blue,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>{day.getDate()}</Text>
                      </View>
                    ) : (
                      <Text style={{ fontWeight: '600', fontSize: 13, color: colors.ink }}>{day.getDate()}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </NeumorphicSurface>

      <ColumnConnector columnLeftPercent={columnLeftPercent} />

      <DragReorderList
        data={categories}
        keyExtractor={(c) => c.categoryId}
        onReorderEnd={(reordered) => reorderCategoriesMutation.mutate(reordered.map((c) => c.categoryId))}
        renderItem={({ item, index, isDragging, dragProps }) => (
          <View>
            <NeumorphicSurface
              variant="raised"
              style={{ padding: spacing.lg, overflow: 'hidden', opacity: isDragging ? 0.9 : 1 }}
            >
              <View style={{ position: 'relative' }}>
                {/* One strip spanning the card's FULL height (bleeding into
                    its own padding on both ends) — this is what makes the
                    highlight run behind the category icon/label too, not
                    just behind the habit rows below it. */}
                <ColumnHighlight columnLeftPercent={columnLeftPercent} bleedTop bleedBottom />

                <GestureDetector gesture={dragProps.gesture}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
                    <NeumorphicSurface variant="pressed" radius={12} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
                      <AppIcon name={item.categoryIcon} size={16} color={colors.ink} />
                    </NeumorphicSurface>
                    <Text style={{ ...typography.caption, color: colors.muted }}>{item.categoryName.toUpperCase()}</Text>
                  </View>
                </GestureDetector>

                {/* Row wrapper owns the divider and the completed-habit
                    background — bled with negative margins so the yellow
                    fill reaches edge to edge and touches the card's true
                    bottom edge on the last row, rather than stopping short. */}
                <View style={{ marginHorizontal: -spacing.lg, marginBottom: -spacing.lg }}>
                  <DragReorderList
                    data={item.habits}
                    keyExtractor={(h) => h.id}
                    onReorderEnd={(reordered) => reorderHabitsMutation.mutate(reordered.map((h) => h.id))}
                    renderItem={({ item: habit, index: habitIndex, isDragging: habitDragging, dragProps: habitDragProps }) => {
                      const isComplete = habit.completedDates.length >= habit.target;
                      const isOffCycle = !isComplete && habit.frequency === 'biweekly' && habit.doneLastWeek;
                      const isAtRisk = !isComplete && !isOffCycle && isHabitAtRisk(habit, weekDays, todayISO);
                      const isLast = habitIndex === item.habits.length - 1;
                      return (
                        <View
                          style={{
                            borderTopWidth: habitIndex > 0 ? 1 : 0,
                            borderTopColor: 'rgba(0,0,0,0.08)',
                            backgroundColor: isComplete
                              ? colors.completedHighlight
                              : isAtRisk
                                ? colors.atRiskHighlight
                                : isOffCycle
                                  ? colors.offCycleHighlight
                                  : 'transparent',
                            paddingHorizontal: spacing.lg,
                            paddingTop: ROW_VERTICAL_PADDING,
                            paddingBottom: isLast ? spacing.lg : ROW_VERTICAL_PADDING,
                            borderBottomLeftRadius: isLast ? radiusTokens.lg : 0,
                            borderBottomRightRadius: isLast ? radiusTokens.lg : 0,
                            opacity: habitDragging ? 0.9 : 1,
                          }}
                        >
                          <GridRow
                            habit={habit}
                            isComplete={isComplete}
                            weekDays={weekDays}
                            onToggleDay={(dateISO) => onToggleDay(habit.id, dateISO)}
                            onPressHabit={() => onPressHabit(habit.id)}
                            dragGesture={habitDragProps.gesture}
                          />
                        </View>
                      );
                    }}
                  />
                </View>
              </View>
            </NeumorphicSurface>

            {index < categories.length - 1 ? <ColumnConnector columnLeftPercent={columnLeftPercent} /> : null}
          </View>
        )}
      />
    </View>
  );
}

/** The actual highlight strip. `left`/`width` are percentages of whatever
 * content box it's placed in — every caller places it inside a box padded
 * by spacing.lg on each side, so the percentages always resolve to the same
 * pixels regardless of which card it's in. `bleedTop`/`bleedBottom` extend
 * it past that box by spacing.lg to reach the card's true edge. */
function ColumnHighlight({
  columnLeftPercent,
  bleedTop,
  bleedBottom,
}: {
  columnLeftPercent: number | null;
  bleedTop?: boolean;
  bleedBottom?: boolean;
}) {
  if (columnLeftPercent === null) return null;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: `${columnLeftPercent}%`,
        width: `${COLUMN_WIDTH_PERCENT}%`,
        top: bleedTop ? -spacing.lg : 0,
        bottom: bleedBottom ? -spacing.lg : 0,
        backgroundColor: colors.todayHighlight,
      }}
    />
  );
}

/** Fills the gap between two stacked cards so the today-column highlight
 * reads as one continuous band instead of resetting at each card edge.
 * Padded the same as the cards so ColumnHighlight's percentages line up
 * exactly with the strip inside them — no horizontal jog at the seam. */
function ColumnConnector({ columnLeftPercent }: { columnLeftPercent: number | null }) {
  return (
    <View style={{ height: spacing.lg, paddingHorizontal: spacing.lg }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <ColumnHighlight columnLeftPercent={columnLeftPercent} />
      </View>
    </View>
  );
}

function GridRow({
  habit,
  isComplete,
  weekDays,
  onToggleDay,
  onPressHabit,
  dragGesture,
}: {
  habit: GridHabit;
  isComplete: boolean;
  weekDays: Date[];
  onToggleDay: (dateISO: string) => void;
  onPressHabit: () => void;
  dragGesture: Parameters<typeof GestureDetector>[0]['gesture'];
}) {
  const completedSet = new Set(habit.completedDates);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <GestureDetector gesture={dragGesture}>
        <Pressable onPress={onPressHabit} style={{ flex: INFO_COLUMN_FLEX, paddingRight: spacing.xs, minWidth: 0 }}>
          <Text
            style={{ ...typography.body, color: isComplete ? colors.bauhaus.blue : colors.ink }}
            numberOfLines={1}
          >
            {habit.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
            <Text style={{ color: isComplete ? colors.bauhaus.blue : colors.muted, fontSize: 12 }}>
              {habit.habitType === 'to_avoid' ? 'max ' : ''}
              {habit.completedDates.length}/{habit.target}
            </Text>
            <AppIcon name="flame" size={12} color={colors.bauhaus.yellow} />
            <Text style={{ color: colors.muted, fontSize: 12 }}>{habit.streakWeeks}w</Text>
          </View>
        </Pressable>
      </GestureDetector>

      {weekDays.map((day) => {
        const dateISO = toDateISO(day);
        const filled = completedSet.has(dateISO);
        const isAvoid = habit.habitType === 'to_avoid';

        return (
          <View key={dateISO} style={{ flex: 1, alignItems: 'center', paddingVertical: spacing.xs }}>
            <Pressable onPress={() => onToggleDay(dateISO)} hitSlop={4}>
              <NeumorphicSurface
                variant={filled ? 'raised' : 'pressed'}
                radius={999}
                backgroundColor={filled ? (isAvoid ? colors.bauhaus.red : colors.bauhaus.blue) : colors.base}
                style={{
                  width: 22,
                  height: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {filled ? <AppIcon name={isAvoid ? 'x' : 'check'} size={11} color="#fff" /> : null}
              </NeumorphicSurface>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

/** True once the habit can no longer afford to skip a day: the remaining
 * completions needed are greater than or equal to the days strictly after
 * today, meaning today's slot is now mandatory to still hit the weekly
 * target. Only applies to to_do habits — to_avoid habits have no such
 * deadline. */
function isHabitAtRisk(habit: GridHabit, weekDays: Date[], todayISO: string): boolean {
  if (habit.habitType !== 'to_do') return false;

  const remainingNeeded = habit.target - habit.completedDates.length;
  if (remainingNeeded <= 0) return false;

  const daysAfterToday = weekDays.filter((d) => toDateISO(d) > todayISO).length;
  return remainingNeeded >= daysAfterToday;
}

function groupAndSortCategories(habits: GridHabit[], positions: Record<string, number>): CategoryGroup[] {
  const byCategory = new Map<string, CategoryGroup>();

  for (const habit of habits) {
    const existing = byCategory.get(habit.categoryId);
    if (existing) {
      existing.habits.push(habit);
    } else {
      byCategory.set(habit.categoryId, {
        categoryId: habit.categoryId,
        categoryName: habit.categoryName,
        categoryIcon: habit.categoryIcon,
        habits: [habit],
      });
    }
  }

  return Array.from(byCategory.values()).sort((a, b) => {
    const posA = positions[a.categoryId];
    const posB = positions[b.categoryId];
    if (posA !== undefined && posB !== undefined) return posA - posB;
    if (posA !== undefined) return -1;
    if (posB !== undefined) return 1;
    return a.categoryName.localeCompare(b.categoryName);
  });
}
