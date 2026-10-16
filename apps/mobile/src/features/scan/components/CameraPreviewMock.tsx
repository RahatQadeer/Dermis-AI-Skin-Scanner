import { StyleSheet, View } from 'react-native';

import { getCopy } from '@/src/copy';
import { colors, radii } from '@/src/theme';

import { FaceGuideOval } from './FaceGuideOval';

export function CameraPreviewMock() {
  const c = getCopy().screens.camera;

  return (
    <View style={styles.preview} accessibilityLabel={c.previewA11y} accessibilityRole="image">
      <FaceGuideOval />
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    flex: 1,
    minHeight: 360,
    backgroundColor: colors.sheepOutline,
    borderRadius: radii.xl,
    overflow: 'hidden',
    justifyContent: 'center',
  },
});
