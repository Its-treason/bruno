import { sendRequest, shellOpenCollectionPath } from 'providers/ReduxStore/slices/collections/actions';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

type ModalTypes = 'generate' | 'clone' | 'delete' | 'rename' | null;

export function useRequestMenu(collectionUid: string, item: any) {
  const [activeModal, setActiveModal] = useState<ModalTypes>(null);
  const dispatch = useDispatch();

  const onRun = useCallback(() => {
    dispatch(sendRequest(item, collectionUid));
  }, [item, collectionUid]);

  const onOpenInExplorer = useCallback(() => {
    dispatch(shellOpenCollectionPath(item.pathname, true, false));
  }, [item.pathname]);

  const onOpenInEditor = useCallback(() => {
    dispatch(shellOpenCollectionPath(item.pathname, true, true));
  }, [item.pathname]);

  return {
    activeModal,
    setActiveModal,

    onRun,
    onOpenInExplorer,
    onOpenInEditor
  };
}
