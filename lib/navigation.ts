import { router } from 'expo-router';

/**
 * router.back() throws when there's no history to pop (e.g. a direct/deep
 * link straight into a modal-like screen). Fall back to the dashboard.
 */
export function goBackOrHome() {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}
