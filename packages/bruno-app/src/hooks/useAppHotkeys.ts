import { HotkeysSchema } from '@usebruno/schema';
import { defaultHotkeys, defaultHotkeysMac } from 'src/common/defaultHotkeys';
import { appStore } from 'src/store/appStore';
import { isMacOS } from 'utils/common/platform';
import { useStore } from 'zustand';

// Return active Hotkeys, takes hotkeysOverwrite from preferences into account;
export function useAppHotkeys(): HotkeysSchema {
  const hotkeysOverwrite = useStore(appStore, (state) => state.preferences.hotkeysOverwrite);

  return {
    ...(isMacOS() ? defaultHotkeysMac : defaultHotkeys),
    ...hotkeysOverwrite
  };
}
