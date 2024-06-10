import { shellOpenCollectionPath } from 'providers/ReduxStore/slices/collections/actions';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { uuid } from 'utils/common';

type ModalTypes = 'new-request' | 'new-folder' | 'clone' | 'close' | 'export' | 'rename' | null;

export function useCollectionMenu(collectionUid: string, collectionPathname: string) {
  const [activeModal, setActiveModal] = useState<ModalTypes>(null);
  const dispatch = useDispatch();

  const onOpenInExplorer = useCallback(() => {
    dispatch(shellOpenCollectionPath(collectionPathname, true, false));
  }, [collectionPathname]);

  const onEditBrunoJson = useCallback(() => {
    dispatch(shellOpenCollectionPath(collectionPathname, true, true));
  }, [collectionPathname]);

  const onOpenCollectionSettings = useCallback(() => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid,
        type: 'collection-settings'
      })
    );
  }, [collectionUid]);

  const onRun = useCallback(() => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid,
        type: 'collection-runner'
      })
    );
  }, [collectionUid]);

  return {
    activeModal,
    setActiveModal,

    onEditBrunoJson,
    onOpenInExplorer,
    onOpenCollectionSettings,
    onRun
  };
}
