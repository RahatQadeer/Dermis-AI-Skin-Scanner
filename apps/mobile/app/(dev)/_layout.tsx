import { Redirect, Stack } from 'expo-router';

export default function DevLayout() {
  // Internal component gallery — never reachable (e.g. by deep link) in release builds.
  if (!__DEV__) {
    return <Redirect href="/" />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
