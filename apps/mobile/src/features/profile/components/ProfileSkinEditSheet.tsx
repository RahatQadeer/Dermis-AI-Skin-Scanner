import type { AgeBand } from '@dermis/domain';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import { colors, radii, spacing } from '@/src/theme';

import {
  patchProfile,
  type ProfileDto,
  type Sensitivity,
  type SkinTone,
  type SkinType,
} from '../api/profileApi';

const SKIN_TYPES: SkinType[] = ['oily', 'combination', 'dry', 'normal'];
const SKIN_TONES: SkinTone[] = ['typeI_II', 'typeIII', 'typeIV', 'typeV_VI'];
const SENSITIVITIES: Sensitivity[] = ['rarely', 'sometimes', 'easily'];
const AGE_BANDS: AgeBand[] = ['18_24', '25_34', '35_44', '45_plus'];

export type ProfileSkinEditSheetProps = {
  visible: boolean;
  profile: ProfileDto;
  onClose: () => void;
  onSaved: (profile: ProfileDto) => void;
  showToast: (message: string) => void;
};

/** Lightweight editor for skin assessment fields (not a full quiz re-run). */
export function ProfileSkinEditSheet(props: ProfileSkinEditSheetProps) {
  const fields = useSkinEditFields(props.profile);
  const { saving, save } = useSkinEditSave(props, fields);

  return (
    <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <AppText variant="headline">{getCopy().screens.profile.editProfile}</AppText>
          <SkinEditFieldList fields={fields} />
          <View style={styles.actions}>
            <Button
              label={getCopy().screens.profile.editCancel}
              variant="outline"
              onPress={props.onClose}
            />
            <Button
              label={getCopy().screens.profile.editSave}
              loading={saving}
              onPress={() => void save()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

type SkinFields = {
  skinType: SkinType;
  setSkinType: (v: SkinType) => void;
  skinTone: SkinTone;
  setSkinTone: (v: SkinTone) => void;
  sensitivity: Sensitivity;
  setSensitivity: (v: Sensitivity) => void;
  ageBand: AgeBand;
  setAgeBand: (v: AgeBand) => void;
};

function useSkinEditFields(profile: ProfileDto): SkinFields {
  const [skinType, setSkinType] = useState<SkinType>(profile.skinType ?? 'combination');
  const [skinTone, setSkinTone] = useState<SkinTone>(profile.skinTone ?? 'typeIII');
  const [sensitivity, setSensitivity] = useState<Sensitivity>(profile.sensitivity ?? 'sometimes');
  const [ageBand, setAgeBand] = useState<AgeBand>(profile.ageBand ?? '25_34');
  return {
    skinType,
    setSkinType,
    skinTone,
    setSkinTone,
    sensitivity,
    setSensitivity,
    ageBand,
    setAgeBand,
  };
}

function useSkinEditSave(props: ProfileSkinEditSheetProps, fields: SkinFields) {
  const p = getCopy().screens.profile;
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const next = await patchProfile({
        skinType: fields.skinType,
        skinTone: fields.skinTone,
        sensitivity: fields.sensitivity,
        ageBand: fields.ageBand,
        priorityConcerns: props.profile.priorityConcerns,
      });
      props.onSaved(next);
      props.showToast(p.editSavedToast);
      props.onClose();
    } catch {
      props.showToast(p.editFailToast);
    } finally {
      setSaving(false);
    }
  };
  return { saving, save };
}

function SkinEditFieldList({ fields }: { fields: SkinFields }) {
  const p = getCopy().screens.profile;
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <ChipGroup
        label={p.statSkinType}
        options={SKIN_TYPES.map((id) => ({ id, label: p.skinTypeLabels[id] }))}
        value={fields.skinType}
        onChange={fields.setSkinType}
      />
      <ChipGroup
        label={p.statFitzpatrick}
        options={SKIN_TONES.map((id) => ({ id, label: p.skinToneLabels[id] }))}
        value={fields.skinTone}
        onChange={fields.setSkinTone}
      />
      <ChipGroup
        label={p.statSensitivity}
        options={SENSITIVITIES.map((id) => ({ id, label: p.sensitivityLabels[id] }))}
        value={fields.sensitivity}
        onChange={fields.setSensitivity}
      />
      <ChipGroup
        label={p.statAgeBand}
        options={AGE_BANDS.map((id) => ({ id, label: p.ageBandLabels[id] }))}
        value={fields.ageBand}
        onChange={fields.setAgeBand}
      />
    </ScrollView>
  );
}

function ChipGroup<T extends string>(props: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.group}>
      <AppText variant="caption" color={colors.mute}>
        {props.label}
      </AppText>
      <View style={styles.chips}>
        {props.options.map((option) => {
          const selected = option.id === props.value;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => props.onChange(option.id)}
              style={[styles.chip, selected ? styles.chipOn : null]}
            >
              <AppText variant="bodyStrong" color={selected ? colors.surface : colors.ink}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '85%',
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  group: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  chipOn: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  actions: {
    gap: spacing.sm,
  },
});
