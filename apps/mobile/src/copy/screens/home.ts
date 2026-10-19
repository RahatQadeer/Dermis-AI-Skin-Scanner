import { commonCopy } from '../common';

export const homeCopy = {
  greeting: (name: string) => `Hi, ${name}`,
  greetingMorning: (name: string) => `Good morning, ${name}`,
  greetingAfternoon: (name: string) => `Good afternoon, ${name}`,
  greetingEvening: (name: string) => `Good evening, ${name}`,
  greetingMorningAnon: 'Good morning',
  greetingAfternoonAnon: 'Good afternoon',
  greetingEveningAnon: 'Good evening',
  indexTitle: 'Skin Health Index',
  indexCaption: 'Overall wellness score from your latest scan',
  indexEmptyTitle: 'Your index is waiting',
  indexEmptyBody: 'Take one front-facing selfie to get your Skin Health Index and concern scores.',
  indexDelta: (n: number) => `▲ ${String(n)}`,
  heroBubble: 'Up 4 points this week. Nice work!',
  heroBubbleEmpty: "Let's get your baseline!",
  viewReport: 'View report →',
  lastScanToday: 'Last scan today',
  lastScanYesterday: 'Last scan yesterday',
  lastScanDaysAgo: (n: number) => `Last scan ${String(n)} days ago`,
  lastScanUnknown: 'Last scan',
  scanCta: 'Take a scan',
  scanAgainCta: 'Scan again',
  startScanCta: 'Start free scan',
  startScanProCta: 'Start a scan',
  quotaTitle: 'Scans',
  planFree: 'Free',
  planPro: 'Pro',
  scansRemainingFree: (n: number) =>
    n === 1 ? '1 free scan left' : `${String(n)} free scans left`,
  scansRemainingPro: (n: number) =>
    n === 1 ? '1 scan left today' : `${String(n)} scans left today`,
  scansAvailableFree: (n: number) =>
    n === 1 ? '1 free scan available' : `${String(n)} free scans available`,
  scansAvailablePro: (n: number) =>
    n === 1 ? '1 scan available today' : `${String(n)} scans available today`,
  quotaLimitFree: 'Free scan used — upgrade for daily scans',
  quotaLimitPro: 'Daily scan limit reached — try again tomorrow',
  getMoreCta: 'Get 5/day',
  routineTitle: 'Today’s routine',
  routineSubtitle: (amDone: number, amTotal: number, pmDone: number, pmTotal: number) =>
    `AM ${String(amDone)}/${String(amTotal)} · PM ${String(pmDone)}/${String(pmTotal)}`,
  routineStepsToGo: (n: number) =>
    n === 0
      ? 'All morning steps done'
      : `${String(n)} morning step${n === 1 ? '' : 's'} to go`,
  routineLockedHint: 'Full routine tracking is a Pro feature',
  metricsTitle: 'Concern scores',
  metricsEmpty: 'Complete a scan to see scores for six skin concerns.',
  hydrationTitle: 'Hydration',
  hydrationCaption: 'Improving · +6 in 30d',
  // UV-index claim is banned by the compliance audit (no live UV source);
  // keep the amber sun-care tile as a generic SPF reminder instead.
  spfTitle: 'SPF reminder',
  spfValue: '2pm',
  spfCaption: 'Reapply before you head out',
  prioritiesTitle: "Professor's priorities",
  prioritiesLede: 'What to focus on from your latest report.',
  mascotLines: [
    'Welcome back! Your skin story starts with a scan.',
    'Small steps each day add up — check your routine when you’re ready.',
    'Scores are estimates for wellness, not a diagnosis.',
  ],
  title: commonCopy.appName,
} as const;
