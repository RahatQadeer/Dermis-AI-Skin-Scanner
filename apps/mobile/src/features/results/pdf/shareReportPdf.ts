import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export type ShareReportPdfResult = 'shared' | 'printed' | 'unavailable' | 'cancelled' | 'error';

export async function shareReportPdf(html: string): Promise<ShareReportPdfResult> {
  try {
    if (Platform.OS === 'web') {
      await Print.printAsync({ html });
      return 'printed';
    }
    const file = await Print.printToFileAsync({ html });
    if (!(await Sharing.isAvailableAsync())) {
      return 'unavailable';
    }
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Dermis report',
    });
    return 'shared';
  } catch (error: unknown) {
    if (isUserDismiss(error)) {
      return 'cancelled';
    }
    return 'error';
  }
}

function isUserDismiss(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const message = String((error as { message?: string }).message ?? '').toLowerCase();
  return message.includes('cancel') || message.includes('dismiss');
}
