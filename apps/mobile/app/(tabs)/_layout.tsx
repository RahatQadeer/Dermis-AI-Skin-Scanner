import { Redirect, Tabs } from 'expo-router';

import { getCopy } from '@/src/copy';
import { MainTabBar } from '@/src/features/navigation/MainTabBar';
import { useSession } from '@/src/features/session/SessionContext';
import { colors } from '@/src/theme';

export default function TabLayout() {
  const nav = getCopy().nav;
  const session = useSession();

  if (!session.hydrated) {
    return null;
  }
  if (!session.onboardingComplete) {
    return <Redirect href="/welcome" />;
  }
  if (!session.accessToken) {
    return <Redirect href="/sign-up" />;
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
    </Tabs>
  );
}
