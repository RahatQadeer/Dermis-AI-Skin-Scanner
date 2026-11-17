export const faceEnrollCopy = {
  // Intro (after signup / before first scan)
  introTitle: 'Register your face',
  introBody:
    'One quick selfie — once at the start. After that you only scan your skin. Update your face anytime in Profile.',
  introPrivacy:
    'We store a private face match (not a public photo). Used only to confirm it is you before each skin scan.',
  introCta: 'Take my selfie',
  introLater: 'Not now',

  // Selfie capture (not the analysis scanner)
  title: 'Your selfie',
  body: 'Center your whole face in the circle with soft, even light — then tap Register once.',
  privacyFooter: 'Saved securely to your profile. Not shared. You can update it later in Profile.',
  framePrompt: 'Allow the camera, then center your face in the circle.',
  holdPrompt: 'Almost — hold still until the circle turns ready.',
  readyPrompt: 'Face looks clear — tap Register.',
  needClearFace:
    'We could not see your face clearly. Center one face in the circle with even light, then try again.',
  preparingModel: 'Preparing face match… hang tight.',
  savingPrompt: 'Saving your face…',
  shutterLabel: 'Register',
  needReady: 'Wait until your face looks clear in the circle, then tap Register.',
  captureFailed: 'Could not capture a photo. Try again.',
  saveFailed: 'Could not save your face. Try again.',
  saveFailedServer:
    'Could not reach face save on the server. Restart the backend, check your connection, then try again.',
  successTitle: 'You are registered',
  successBody: 'Done — you will not register again. Next is your skin scan.',
  successCta: 'Start skin scan',
  successHome: 'Go to Home',
  addFaceSuccessTitle: 'Hi, new face',
  addFaceSuccessBody:
    'This face is now active for scans. Your earlier history stays on Progress with a New face marker.',
} as const;
