import { requestSchema } from '@usebruno/schema';
import toast from 'react-hot-toast';
import { appStore } from 'src/store/appStore';
import { collectionStore } from 'src/store/collectionStore';
import { responseStore } from 'src/store/responseStore';
import { sendNetworkRequest } from 'utils/network';

export const saveRequest = async (itemId: string, saveSilently: boolean = false) => {
  const state = collectionStore.getState();

  const item = state.draftItems.get(itemId) || state.items.get(itemId);
  if (!item || item.type !== 'request') {
    console.error('Could not save!', item);
    throw new Error('Invalid item provided');
  }

  const parseResult = requestSchema.safeParse(item.data);
  if (!parseResult.success) {
    toast.error('Could not save, request item is invalid');
    throw new Error(`Item is invalid: ${parseResult.error}`);
  }

  try {
    await window.ipcRenderer.invoke('renderer:save-request', item.meta.path, parseResult.data);
  } catch (error) {
    toast.error('Failed to save request!');
    throw error;
  }

  state.deleteItemDraft(itemId);

  if (!saveSilently) {
    toast.success('Request saved successfully');
  }
};

export const sendRequest = async (itemId: string, collectionId: string) => {
  if (appStore.getState().preferences.request.autoSave) {
    await saveRequest(itemId);
  }

  const collectionState = collectionStore.getState();
  const collection = collectionState.collections.get(collectionId);
  if (!collection) {
    toast.error('Invalid Collection id');
    throw new Error('Invalid Collection id');
  }

  const item = collectionState.draftItems.get(itemId) ?? collectionState.items.get(itemId);
  if (!item) {
    toast.error('Invalid Item id');
    throw new Error('Invalid Item id');
  }

  const environment = collection.environments.get(collection.activeEnvironmentId) ?? null;

  const store = responseStore.getState();
  // Prevent a request from being sent, while a request is still running
  const lastRequestId = store.requestResponses.get(itemId)?.at(-1);
  if (lastRequestId) {
    const response = store.responses.get(lastRequestId);
    if (response.requestState !== 'received' && response.requestState !== 'cancelled') {
      return;
    }
  }

  try {
    await sendNetworkRequest(item, collection, environment);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Request cancelled')) {
      store.cancelResponse(itemId);
      return;
    }
    store.responseError(itemId, { error: message });
  }
};
