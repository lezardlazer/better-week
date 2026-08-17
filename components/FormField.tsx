import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Text, TextInput, View } from 'react-native';
import { NeumorphicSurface } from './NeumorphicSurface';
import { colors, spacing, typography } from '../theme/tokens';

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  secureTextEntry,
  keyboardType,
  capitalizeFirst,
}: {
  control: Control<T>;
  name: Path<T>;
  label: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'email-address' | 'default' | 'numeric';
  /** Uppercases just the first character as the user types. Forced (not
   * just suggested via the soft keyboard) so it also applies on desktop
   * web, where autoCapitalize has no effect with a physical keyboard. */
  capitalizeFirst?: boolean;
}) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ ...typography.caption, color: colors.muted }}>{label.toUpperCase()}</Text>
      <NeumorphicSurface variant="pressed" style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value ?? ''}
              onChangeText={(text) =>
                onChange(capitalizeFirst ? text.charAt(0).toUpperCase() + text.slice(1) : text)
              }
              onBlur={onBlur}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={capitalizeFirst ? 'sentences' : 'none'}
              style={{ fontSize: 16, color: colors.ink }}
              placeholderTextColor={colors.muted}
            />
          )}
        />
      </NeumorphicSurface>
      {error ? <Text style={{ color: colors.bauhaus.red, fontSize: 12 }}>{error}</Text> : null}
    </View>
  );
}
