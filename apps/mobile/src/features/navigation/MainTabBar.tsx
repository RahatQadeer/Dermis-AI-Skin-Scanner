import { usePathname, useRouter } from 'expo-router';

import { TabBar } from '@/src/components/layout/TabBar';
import type { TabId } from '@/src/components/layout/tabBarTypes';
import { useConsent } from '@/src/features/consent/ConsentContext';

import { routeForTab, tabIdFromPathname } from './tabRouting';

export function MainTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const consent = useConsent();
  const active = tabIdFromPathname(pathname);

  const onSelect = (id: TabId) => {
    router.navigate(routeForTab(id, consent.faceAnalysisGranted));
  };

  return <TabBar active={active} onSelect={onSelect} />;
}
