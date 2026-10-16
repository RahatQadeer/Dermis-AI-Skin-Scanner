import { useRouter } from 'expo-router';

import { EmptyState } from '@/src/components/EmptyState';
import { getCopy } from '@/src/copy';
import { useScanNavigation } from '@/src/features/consent/hooks/useScanNavigation';
import { useSession } from '@/src/features/session/SessionContext';

import type { ProgressLoadError } from '../hooks/useProgressScans';

export function ProgressEmptyStates({ loadError }: { loadError: ProgressLoadError | null }) {
  const p = getCopy().screens.progress;
  const { goScan } = useScanNavigation();
  const session = useSession();
  const router = useRouter();

  if (loadError === 'session') {
    return (
      <EmptyState
        title={p.sessionErrorTitle}
        body={p.sessionErrorBody}
        actionLabel={p.sessionErrorCta}
        onAction={() => {
          session.signOut();
          router.replace('/sign-up');
        }}
      />
    );
  }
  if (loadError === 'network') {
    return (
      <EmptyState
        title={p.loadErrorTitle}
        body={p.loadErrorBody}
        actionLabel={p.emptyCta}
        onAction={goScan}
      />
    );
  }
  return (
    <EmptyState title={p.emptyTitle} body={p.emptyBody} actionLabel={p.emptyCta} onAction={goScan} />
  );
}
