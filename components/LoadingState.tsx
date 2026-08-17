import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme/tokens';

export function LoadingState() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.base, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.muted} />
    </View>
  );
}
