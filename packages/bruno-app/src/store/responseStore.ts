import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { RequestContext } from '@usebruno/core';
import { DebugInfo } from 'components/ResponsePane/Debug';

type Actions = {
  requestQueued: (id: string, requestId: string, data: Partial<Response>) => void;
  requestDelayed: (id: string, requestId: string) => void;
  requestSent: (id: string, requestId: string, data: Partial<Response>) => void;
  requestTestResults: (id: string, requestId: string, data: Partial<Response>) => void;
  requestReceived: (id: string, requestId: string, data: Partial<Response>) => void;

  cancelResponse: (id: string) => void;
  responseError: (id: string, error: string) => void;
  clearResponse: (id: string) => void;
};

export type Response = {
  requestId: string;
  requestSentTimestamp: number;
  requestState: 'queued' | 'delayed' | 'sending' | 'received' | 'cancelled';

  error?: string;

  // request-queued & request-sent
  cancelTokenUid: string;

  // response-received
  status?: number;
  size?: number;
  headers?: Record<string, string[]>;
  previewModes?: RequestContext['previewModes'];
  duration?: number;
  timeline?: RequestContext['timeline'];
  timings?: RequestContext['timings'];
  debug?: DebugInfo;

  // assertion-results & test-results
  assertionResults?: any[];
  testResults?: any[];
};

type ResponseStore = {
  responses: Map<string, Response>;
};

export const responseStore = createStore(
  immer<ResponseStore & Actions>((set) => ({
    responses: new Map(),

    requestQueued: (id: string, requestId: string, data: any) => {
      set((store) => {
        store.responses.set(id, {
          ...data,
          requestId,
          requestSentTimestamp: Date.now(),
          requestState: 'queued'
        });
      });
    },
    // This is only used in the collection runner
    requestDelayed: (id: string, requestId: string) => {
      set((store) => {
        const response = store.responses.get(id);
        if (response?.requestId !== requestId || response?.requestState === 'cancelled') {
          return;
        }

        response.requestState = 'delayed';
      });
    },
    requestSent: (id: string, requestId: string, data: any) => {
      set((store) => {
        const response = store.responses.get(id);
        if (response?.requestId !== requestId || response?.requestState === 'cancelled') {
          return;
        }

        const updatedData = {
          ...data,
          requestId,
          requestState: 'sending'
        } satisfies Response;

        store.responses.set(id, Object.assign(response, updatedData));
      });
    },
    requestTestResults: (id: string, requestId: string, data: any) => {
      set((store) => {
        const response = store.responses.get(id);
        if (response?.requestId !== requestId || response?.requestState === 'cancelled') {
          return;
        }

        store.responses.set(id, Object.assign(response, data));
      });
    },
    requestReceived: (id: string, requestId: string, data: any) => {
      set((store) => {
        const response = store.responses.get(id);
        if (response?.requestId !== requestId || response?.requestState === 'cancelled') {
          return;
        }

        const newData = {
          ...data,
          requestState: 'received'
        };

        store.responses.set(id, Object.assign(response, newData));
      });
    },

    cancelResponse: (id: string) => {
      set((store) => {
        const item = store.responses.get(id);
        if (!item) {
          return;
        }
        item.requestState = 'cancelled';
      });
    },
    responseError: (id: string, error: string) => {
      set((store) => {
        const item = store.responses.get(id);
        if (!item) {
          return;
        }
        item.requestState = 'received';
        item.error = error;
      });
    },
    clearResponse: (id: string) => {
      set((store) => {
        store.responses.delete(id);
      });
    }
  }))
);

window.ipcRenderer.on('main:run-request-event', (payload) => {
  const { type, data, requestUid, itemUid } = payload;

  switch (type) {
    case 'request-queued':
      responseStore.getState().requestQueued(itemUid, requestUid, data);
      break;
    case 'request-delayed':
      responseStore.getState().requestDelayed(itemUid, requestUid);
      break;
    case 'request-sent':
      responseStore.getState().requestSent(itemUid, requestUid, data);
      break;
    case 'assertion-results':
    case 'test-results':
      responseStore.getState().requestTestResults(itemUid, requestUid, data);
      break;
    case 'response-received':
      responseStore.getState().requestReceived(itemUid, requestUid, data);
      break;
    case 'response-error':
      responseStore.getState().responseError(itemUid, data.error);
      break;
    default:
      throw new Error(`case defined for "${type}" in "main:run-request-event" listener`);
  }
});
