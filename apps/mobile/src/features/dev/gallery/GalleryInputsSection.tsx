import { useState } from 'react';
import { View } from 'react-native';

import { OptionCard } from '@/src/components/OptionCard';
import { PasswordField } from '@/src/components/PasswordField';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { TextField } from '@/src/components/TextField';
import { Toggle } from '@/src/components/Toggle';
import { getCopy } from '@/src/copy';
import { spacing } from '@/src/theme';

import { GallerySection } from './GallerySection';

type RoutineSlot = 'am' | 'pm';

export function GalleryInputsSection() {
  const d = getCopy().dev.gallery.demos;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [slot, setSlot] = useState<RoutineSlot>('am');
  const [optionOn, setOptionOn] = useState(false);
  const [reminders, setReminders] = useState(true);

  const segmentOptions = [
    { value: 'am' as const, label: d.segmentAm },
    { value: 'pm' as const, label: d.segmentPm },
  ];

  return (
    <GallerySection title={getCopy().dev.gallery.sections.inputs}>
      <TextField
        label={d.emailLabel}
        value={email}
        onChangeText={setEmail}
        placeholder={d.emailPlaceholder}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <PasswordField label={d.passwordLabel} value={password} onChangeText={setPassword} />
      <SegmentedControl options={segmentOptions} value={slot} onChange={setSlot} />
      <OptionCard
        title={d.optionTitle}
        subtitle={d.optionBody}
        selected={optionOn}
        onPress={() => setOptionOn((v) => !v)}
      />
      <View style={{ gap: spacing.sm }}>
        <Toggle
          accessibilityLabel={d.remindersToggleA11y}
          value={reminders}
          onChange={setReminders}
        />
      </View>
    </GallerySection>
  );
}
