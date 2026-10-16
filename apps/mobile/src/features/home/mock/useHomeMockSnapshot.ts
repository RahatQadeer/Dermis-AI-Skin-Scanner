import {
  HOME_MOCK_SCENARIOS,
  resolveHomeMockScenarioId,
  type HomeSnapshot,
} from './homeMockScenarios';

export function useHomeMockSnapshot(): HomeSnapshot {
  const id = resolveHomeMockScenarioId();
  return HOME_MOCK_SCENARIOS[id];
}
