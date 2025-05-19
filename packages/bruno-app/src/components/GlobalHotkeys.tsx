import { useHotkeys } from '@mantine/hooks';
import { useAppHotkeys } from 'hooks/useAppHotkeys';
import { appStore } from 'src/store/appStore';
import { useStore } from 'zustand';

export const GlobalHotkeys: React.FC = () => {
  const hotkeys = useAppHotkeys();
  const { setCookiesOpen, setPreferencesOpen } = useStore(appStore);

  useHotkeys([
    [
      hotkeys.openCookies,
      () => {
        setCookiesOpen(true);
      }
    ],
    [
      hotkeys.openPreferences,
      () => {
        setPreferencesOpen(true);
      }
    ]
  ]);

  return null;
};
