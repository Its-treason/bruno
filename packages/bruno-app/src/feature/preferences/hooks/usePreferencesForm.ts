import { useForm, zodResolver } from '@mantine/form';
import { useMutation } from '@tanstack/react-query';
import { Preferences, preferencesSchema } from '@usebruno/schema';
import { useEffect } from 'react';
import { appStore } from 'src/store/appStore';
import { useStore } from 'zustand';

export function usePreferencesForm() {
  const preferences = useStore(appStore, (state) => state.preferences);

  const form = useForm<Preferences>({
    mode: 'controlled',
    validate: zodResolver(preferencesSchema),
    initialValues: structuredClone(preferences)
  });

  useEffect(() => {
    form.setInitialValues(structuredClone(preferences));
    form.reset();
  }, [preferences]);

  const savePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Preferences) => {
      await window.ipcRenderer.invoke('renderer:save-preferences', newPreferences);
      appStore.getState().updatePreferences(newPreferences);
    }
  });

  return [form, savePreferencesMutation] as const;
}
