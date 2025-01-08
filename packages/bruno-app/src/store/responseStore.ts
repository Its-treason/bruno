import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { RequestContext } from '@usebruno/core';
import { DebugInfo } from 'src/feature/response-pane/components/debug/Debug';

type Actions = {
  requestQueued: (requestId: string, itemId: string, data: Partial<Response>) => void;
  requestDelayed: (requestId: string) => void;
  requestSent: (requestId: string, data: Partial<Response>) => void;
  requestTestResults: (requestId: string, data: Partial<Response>) => void;
  requestReceived: (requestId: string, data: Partial<Response>) => void;

  cancelResponse: (requestId: string) => void;
  responseError: (requestId: string, error: string) => void;
  clearResponse: (requestId: string, itemUd: string) => void;
};

export type Response = {
  requestId: string;
  itemId: string;
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
  testResults?: {
    status: 'pass' | 'fail';
    uid: string;
    description: string;
    error?: string;
  }[];
  assertionResults?: {
    status: 'pass' | 'fail';
    uid: string;
    lhsExpr: string;
    rhsExpr: string;
    error?: string;
  }[];
};

type ResponseStore = {
  // Maps ItemId to responseIds
  requestResponses: Map<string, string[]>;
  responses: Map<string, Response>;
};

export const responseStore = createStore(
  immer<ResponseStore & Actions>((set) => ({
    requestResponses: new Map(),
    responses: new Map(),

    requestQueued: (requestId: string, itemId: string, data: any) => {
      set((store) => {
        store.responses.set(requestId, {
          ...data,
          requestId,
          itemId,
          requestSentTimestamp: Date.now(),
          requestState: 'queued'
        });

        const responseList = store.requestResponses.get(itemId) ?? [];
        responseList.push(requestId);
        store.requestResponses.set(itemId, responseList);
      });
    },
    // This is only used in the collection runner
    requestDelayed: (requestId: string) => {
      set((store) => {
        const response = store.responses.get(requestId);
        if (!response || response.requestState === 'cancelled') {
          return;
        }

        response.requestState = 'delayed';
      });
    },
    requestSent: (requestId: string, data: any) => {
      set((store) => {
        const response = store.responses.get(requestId);
        if (!response || response.requestState === 'cancelled') {
          return;
        }

        const updatedData = {
          ...data,
          requestState: 'sending'
        } satisfies Response;

        store.responses.set(requestId, Object.assign(response, updatedData));
      });
    },
    requestTestResults: (requestId: string, data: any) => {
      set((store) => {
        const response = store.responses.get(requestId);
        if (!response || response.requestState === 'cancelled') {
          return;
        }

        store.responses.set(requestId, Object.assign(response, data));
      });
    },
    requestReceived: (requestId: string, data: any) => {
      set((store) => {
        const response = store.responses.get(requestId);
        if (response?.requestState === 'cancelled') {
          return;
        }

        const newData = {
          ...data,
          requestState: 'received'
        };

        store.responses.set(requestId, Object.assign(response, newData));
      });
    },

    cancelResponse: (requestId: string) => {
      set((store) => {
        const item = store.responses.get(requestId);
        if (!item) {
          return;
        }
        item.requestState = 'cancelled';
      });
    },
    responseError: (requestId: string, error: string) => {
      set((store) => {
        const item = store.responses.get(requestId);
        if (!item) {
          return;
        }
        item.requestState = 'received';
        item.error = error;
      });
    },
    clearResponse: (requestId: string, itemId: string) => {
      set((store) => {
        store.responses.delete(requestId);

        const responseList = store.requestResponses.get(itemId) ?? [];
        store.requestResponses.set(
          itemId,
          responseList.filter((value) => value !== requestId)
        );
      });
    }
  }))
);

window.ipcRenderer.on('main:run-request-event', (payload) => {
  const { type, data, requestUid, itemUid } = payload;

  switch (type) {
    case 'request-queued':
      responseStore.getState().requestQueued(requestUid, itemUid, data);
      break;
    case 'request-delayed':
      responseStore.getState().requestDelayed(requestUid);
      break;
    case 'request-sent':
      responseStore.getState().requestSent(requestUid, data);
      break;
    case 'assertion-results':
    case 'test-results':
      responseStore.getState().requestTestResults(requestUid, data);
      break;
    case 'response-received':
      responseStore.getState().requestReceived(requestUid, data);
      break;
    case 'response-error':
      responseStore.getState().responseError(requestUid, data.error);
      break;
    default:
      throw new Error(`case defined for "${type}" in "main:run-request-event" listener`);
  }
});
