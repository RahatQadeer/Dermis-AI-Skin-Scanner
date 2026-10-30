import { galleryCopy } from './dev/gallery';
import { authCopy } from './auth';
import { commonCopy } from './common';
import { complianceCopy } from './compliance';
import { concernCopy, concernList } from './concerns';
import { feedbackCopy } from './feedback';
import { inputsCopy } from './inputs';
import { dermisMascotCopy } from './mascot/dermis';
import { mascotPlaceholderCopy } from './mascot/placeholders';
import { professorPuffCopy } from './mascot/professorPuff';
import { navCopy } from './nav';
import { paywallCopy } from './paywall';
import { shellCopy } from './shell';
import { quizCopy } from './quiz';
import { analysingCopy } from './screens/analysing';
import { assistantCopy } from './screens/assistant';
import { cameraCopy } from './screens/camera';
import { homeCopy } from './screens/home';
import { privacyCopy } from './screens/privacy';
import { progressCopy } from './screens/progress';
import { profileCopy } from './screens/profile';
import { recommendationsCopy } from './screens/recommendations';
import { resultsCopy } from './screens/results';
import { routineCopy } from './screens/routine';
import { scanConsentCopy } from './screens/scanConsent';
import { notFoundCopy } from './screens/notFound';
import { summaryCopy } from './screens/summary';
import { welcomeCopy } from './screens/welcome';
import { zoneCopy } from './zones';

/** Default English copy tree — single source for UI strings. */
export const copy = {
  common: commonCopy,
  nav: navCopy,
  compliance: complianceCopy,
  concerns: concernCopy,
  concernList,
  zones: zoneCopy,
  inputs: inputsCopy,
  feedback: feedbackCopy,
  mascot: {
    dermis: dermisMascotCopy,
    professorPuff: professorPuffCopy,
    placeholders: mascotPlaceholderCopy,
  },
  screens: {
    analysing: analysingCopy,
    camera: cameraCopy,
    home: homeCopy,
    privacy: privacyCopy,
    progress: progressCopy,
    assistant: assistantCopy,
    profile: profileCopy,
    recommendations: recommendationsCopy,
    results: resultsCopy,
    routine: routineCopy,
    scanConsent: scanConsentCopy,
    notFound: notFoundCopy,
    summary: summaryCopy,
    welcome: welcomeCopy,
  },
  quiz: quizCopy,
  auth: authCopy,
  paywall: paywallCopy,
  shell: shellCopy,
  dev: {
    gallery: galleryCopy,
  },
} as const;

export type CopyTree = typeof copy;
