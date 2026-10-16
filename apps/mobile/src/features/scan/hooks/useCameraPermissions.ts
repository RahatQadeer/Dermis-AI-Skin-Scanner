import { useCameraPermissions } from 'expo-camera';
import { useCallback } from 'react';

export function useCameraPermissionFlow() {
  const [permission, requestPermission] = useCameraPermissions();

  const ensureCamera = useCallback(async (): Promise<boolean> => {
    if (permission?.granted) {
      return true;
    }
    const result = await requestPermission();
    return result.granted;
  }, [permission?.granted, requestPermission]);

  return {
    granted: permission?.granted ?? false,
    canAskAgain: permission?.canAskAgain ?? true,
    ensureCamera,
  };
}
