import { Redirect, Tabs } from 'expo-router';

import { FullScreenLoader } from '@/src/components/layout/FullScreenLoader';
import { getCopy } from '@/src/copy';
import { MainTabBar } from '@/src/features/navigation/MainTabBar';
import { resolveAuthedRoute } from '@/src/features/session/authRoute';
import { useSession } from '@/src/features/session/SessionContext';
import { colors } from '@/src/theme';

export default function TabLayout() {
  const nav = getCopy().nav;
  const session = useSession();

  if (!session.hydrated) {
    return null;
  }
  if (!session.accessToken) {
    return <Redirect href={session.onboardingComplete ? '/sign-up' : '/welcome'} />;
  }
  // Authed: an incomplete backend profile must still finish the quiz first.
  const route = resolveAuthedRoute(session.skinProfileStatus);
  if (!route) {
    return <FullScreenLoader />;
  }
  if (route === '/quiz') {
    return <Redirect href="/quiz" />;
  }

  return (
    <Tabs
      tabBar={() => <MainTabBar />}
      screenOptions={{
        headerShown: false,
        // Full-bleed scene so the mint canvas shows through the floating pill.
        sceneStyle: { backgroundColor: colors.background },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ title: nav.home }} />
      <Tabs.Screen name="routine" options={{ title: nav.routine }} />
      <Tabs.Screen name="progress" options={{ title: nav.progress }} />
      <Tabs.Screen name="profile" options={{ title: nav.profile }} />
      <Tabs.Screen name="results" options={{ title: nav.results, href: null }} />
      <Tabs.Screen name="recommendations" options={{ title: nav.recommendations, href: null }} />
      <Tabs.Screen name="assistant" options={{ title: nav.assistant, href: null }} />
    </Tabs>
  );
}
