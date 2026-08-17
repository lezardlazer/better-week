import { Pressable, Text, View } from 'react-native';
import { NeumorphicSurface } from './NeumorphicSurface';
import { colors, spacing } from '../theme/tokens';

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable key={option.value} onPress={() => onChange(option.value)}>
            <NeumorphicSurface
              variant={isSelected ? 'raised' : 'pressed'}
              backgroundColor={isSelected ? colors.ink : colors.base}
              radius={999}
              style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}
            >
              <Text style={{ color: isSelected ? '#fff' : colors.muted, fontWeight: '600', fontSize: 14 }}>
                {option.label}
              </Text>
            </NeumorphicSurface>
          </Pressable>
        );
      })}
    </View>
  );
}
