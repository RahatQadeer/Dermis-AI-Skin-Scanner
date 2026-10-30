import { useRef, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/Button';
import { AppText } from '@/src/components/text/AppText';
import { getCopy } from '@/src/copy';
import {
  CameraPreviewLive,
  type CameraPreviewLiveHandle,
} from '@/src/features/scan/components/CameraPreviewLive';
import { CameraPermissionCard } from '@/src/features/scan/components/CameraPermissionCard';
import { useCameraPermissionFlow } from '@/src/features/scan/hooks/useCameraPermissions';
import { prepareScanImage } from '@/src/features/scan/lib/prepareScanImage';
import { colors, spacing } from '@/src/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onCaptured: (photo: { base64: string; contentType: 'image/jpeg' }) => void;
  onError: (message: string) => void;
};

/** Takes one photo for an assistant question; it is never stored. */
export function AssistantPhotoSheet({ visible, onClose, onCaptured, onError }: Props) {
  const a = getCopy().screens.assistant;
  const cameraRef = useRef<CameraPreviewLiveHandle>(null);
  const permission = useCameraPermissionFlow();
  const [busy, setBusy] = useState(false);

  const capture = async () => {
    setBusy(true);
    try {
      const uri = await cameraRef.current?.takePhoto();
      if (!uri) {
        throw new Error('no_photo');
      }
      const prepared = await prepareScanImage(uri);
      onCaptured({ base64: prepared.base64, contentType: prepared.contentType });
      onClose();
    } catch {
      onError(a.errorPhoto);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.root}>
        <View style={styles.stage}>
          {permission.granted ? <CameraPreviewLive ref={cameraRef} active={visible} /> : null}
          {!permission.granted ? (
            <CameraPermissionCard
              canAskAgain={permission.canAskAgain}
              onRequest={() => void permission.ensureCamera()}
            />
          ) : null}
        </View>
        <AppText variant="caption" color={colors.surface} align="center">
          {a.photoNote}
        </AppText>
        <View style={styles.actions}>
          <Button label={a.cancel} variant="outline" onPress={onClose} style={styles.flex} />
          <Button
            label={a.takePhoto}
            onPress={() => void capture()}
            loading={busy}
            disabled={!permission.granted}
            style={styles.flex}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink, gap: spacing.md, padding: spacing.md },
  stage: { flex: 1, borderRadius: 24, overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: spacing.md },
  flex: { flex: 1 },
});
