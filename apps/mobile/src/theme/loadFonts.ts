import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

const FONT_WAIT_MS = 4000;

/** Loads Fredoka + Nunito. Call once from root layout. */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (loaded || error) {
      return;
    }
    const id = setTimeout(() => setTimedOut(true), FONT_WAIT_MS);
    return () => clearTimeout(id);
  }, [error, loaded]);

  // Never block the whole app if fonts fail or hang (Expo Go / offline).
  return loaded || Boolean(error) || timedOut;
}
