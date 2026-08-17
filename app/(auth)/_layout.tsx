import { Redirect, Stack } from 'expo-router';
import { useSessionStore } from '../../lib/store/session';

export default function AuthLayout() {
  const session = useSessionStore((s) => s.session);

  if (session) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
