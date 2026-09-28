import { Alert, Platform } from 'react-native';

type Button = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };

/** Alert.alert that also works on web (RN Web ignores Alert). */
export function showAlert(title: string, message?: string, buttons?: Button[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }

  const text = message ? `${title}\n\n${message}` : title;
  const actions = buttons ?? [];
  const cancel = actions.find((b) => b.style === 'cancel');
  const confirm = actions.find((b) => b.style !== 'cancel');

  if (actions.length > 1) {
    if (globalThis.confirm(text)) confirm?.onPress?.();
    else cancel?.onPress?.();
    return;
  }

  globalThis.alert(text);
  actions[0]?.onPress?.();
}