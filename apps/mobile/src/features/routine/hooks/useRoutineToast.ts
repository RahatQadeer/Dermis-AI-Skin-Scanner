import { useCallback, useState } from 'react';

export function useRoutineToast() {
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const dismissToast = useCallback(() => setToastVisible(false), []);

  return { toastMessage, toastVisible, showToast, dismissToast };
}
