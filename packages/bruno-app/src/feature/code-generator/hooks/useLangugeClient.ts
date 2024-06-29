/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { useLocalStorage } from '@mantine/hooks';
import { useEffect, useState } from 'react';

export function useLanguageClient() {
  const [targetId, setTargetId] = useLocalStorage({ key: 'code-generator-selected-target-id', defaultValue: 'shell' });
  const [lastClientIds, setLastClientIds] = useLocalStorage({
    key: 'code-generator-last-client-ids',
    defaultValue: '{}'
  });

  const [clientId, setClientId] = useState('curl');

  useEffect(() => {
    // After changing the targetId select the last ClientId
    const lastClientIdsObj = JSON.parse(lastClientIds);
    if (lastClientIdsObj[targetId]) {
      setClientId(lastClientIdsObj[targetId]);
    } else {
      // Effect hook in "useLanguageClient" will set the clientId to default
      setClientId('');
    }
  }, [targetId]);

  useEffect(() => {
    if (!targetId) {
      return;
    }
    // Save the last ClientId
    const lastClientIdsObj = JSON.parse(lastClientIds);
    lastClientIdsObj[targetId] = clientId;
    setLastClientIds(JSON.stringify(lastClientIdsObj));
  }, [clientId]);

  return {
    targetId,
    setTargetId,
    clientId,
    setClientId
  };
}
