import { Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm }}>
      <Text style={{ ...typography.title, color: colors.ink, textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: colors.muted, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
