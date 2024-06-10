import {
  runCollectionFolder,
  sendRequest,
  shellOpenCollectionPath
} from 'providers/ReduxStore/slices/collections/actions';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { uuid } from 'utils/common';

type ModalTypes = 'new-request' | 'new-folder' | 'clone' | 'delete' | 'rename' | null;

export function useFolderMenu(collectionUid: string, item: any) {
  const [activeModal, setActiveModal] = useState<ModalTypes>(null);
  const dispatch = useDispatch();

  const onRun = useCallback(() => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid,
        type: 'collection-runner'
      })
    );
    dispatch(runCollectionFolder(collectionUid, item ? item.uid : null, true));
  }, [item, collectionUid]);

  const onOpenInExplorer = useCallback(() => {
    dispatch(shellOpenCollectionPath(item.pathname, true, false));
  }, [item.pathname]);

  return {
    activeModal,
    setActiveModal,

    onRun,
    onOpenInExplorer
  };
}
