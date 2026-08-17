import '../global.css';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LoadingState } from '../components/LoadingState';
import { supabase } from '../lib/supabase/client';
import { useSessionStore } from '../lib/store/session';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const setSession = useSessionStore((s) => s.setSession);
  const setLoading = useSessionStore((s) => s.setLoading);
  const isLoading = useSessionStore((s) => s.isLoading);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, [setSession, setLoading]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Slot />
        <StatusBar style="auto" />
        {Platform.OS === 'web' ? <Analytics /> : null}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
