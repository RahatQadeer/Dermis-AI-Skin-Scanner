import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type ReactNode } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ConsentProvider } from '../src/features/consent/ConsentContext';
import { QuotaRefreshProvider } from '../src/features/quota/QuotaRefreshContext';
import { PurchasesProvider } from '../src/features/purchases/context/PurchasesContext';
import { ScanCaptureProvider } from '../src/features/scan/context/ScanCaptureContext';
import { SessionProvider, useSession } from '../src/features/session/SessionContext';
import { RootErrorBoundary } from '../src/components/RootErrorBoundary';
import { useAppFonts } from '../src/theme/loadFonts';

export { RootErrorBoundary as ErrorBoundary };

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <ConsentProvider>
          <QuotaRefreshProvider>
            <PurchasesProvider>
              <ScanCaptureProvider>
                <SplashGate>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="(onboarding)" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(scan)" />
                    <Stack.Screen name="(dev)" />
                  </Stack>
                </SplashGate>
              </ScanCaptureProvider>
            </PurchasesProvider>
          </QuotaRefreshProvider>
        </ConsentProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

/** Keep the native splash until fonts + session hydrate. */
function SplashGate({ children }: { children: ReactNode }) {
  const session = useSession();

  useEffect(() => {
    if (session.hydrated) {
      void SplashScreen.hideAsync();
    }
  }, [session.hydrated]);

  if (!session.hydrated) {
    return null;
  }

  return children;
}
