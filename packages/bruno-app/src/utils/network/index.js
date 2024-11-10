import { globalEnvironmentStore } from 'src/store/globalEnvironmentStore';

export const sendNetworkRequest = async (item, collection, environment) => {
  if (!['http-request', 'graphql-request'].includes(item.type)) {
    return;
  }

  // Get current global environment and convert it from Array to Record
  const globalEnvState = globalEnvironmentStore.getState();
  const globalVariableList = globalEnvState.environments.get(globalEnvState.activeEnvironment)?.variables ?? [];
  const globalVariables = globalVariableList.reduce((acc, variable) => {
    if (variable.enabled) {
      acc[variable.name] = variable.value;
    }
    return acc;
  }, {});

  const response = await window.ipcRenderer.invoke('send-http-request', item, collection, environment, globalVariables);

  return {
    state: response.error ? 'Error' : 'success',
    headers: response.headers,
    size: response.size,
    status: response.status,
    statusText: response.statusText,
    duration: response.duration,
    isNew: response.isNew ?? false,
    timeline: response.timeline,
    timings: response.timings,
    debug: response.debug,
    error: response.error,
    isError: response.error ? true : undefined
  };
};

export const getResponseBody = async (requestId) => {
  return await window.ipcRenderer.invoke('renderer:get-response-body', requestId);
};

export const sendCollectionOauth2Request = async (collection, environment, runtimeVariables) => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;
    ipcRenderer
      .invoke('send-collection-oauth2-request', collection, environment, runtimeVariables)
      .then(resolve)
      .catch(reject);
  });
};

export const clearOauth2Cache = async (uid) => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;
    ipcRenderer.invoke('clear-oauth2-cache', uid).then(resolve).catch(reject);
  });
};

export const fetchGqlSchema = async (endpoint, environment, request, collection) => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;

    // Get current global environment and convert it from Array to Record
    const globalEnvState = globalEnvironmentStore.getState();
    const globalVariableList = globalEnvState.environments.get(globalEnvState.activeEnvironment)?.variables ?? [];
    const globalVariables = globalVariableList.reduce((acc, variable) => {
      if (variable.enabled) {
        acc[variable.name] = variable.value;
      }
      return acc;
    }, {});

    ipcRenderer
      .invoke('fetch-gql-schema', endpoint, environment, request, collection, globalVariables)
      .then(resolve)
      .catch(reject);
  });
};

export const cancelNetworkRequest = async (cancelTokenUid) => {
  return new Promise((resolve, reject) => {
    const { ipcRenderer } = window;

    ipcRenderer.invoke('cancel-http-request', cancelTokenUid).then(resolve).catch(reject);
  });
};
