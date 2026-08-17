import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '../../lib/store/session';

export default function AppLayout() {
  const session = useSessionStore((s) => s.session);

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
