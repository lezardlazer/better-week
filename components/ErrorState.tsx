import { Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export function ErrorState({ message }: { message: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
      <Text style={{ color: colors.bauhaus.red, textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
