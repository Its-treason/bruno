import { RequestContext } from '../types';
import { FolderData } from './collectFolderData';

function applyCollectionHeader(context: RequestContext, folderData: FolderData[]) {
  const folderHeaders = folderData.reduce<any[]>((acc, data) => {
    return [...acc, ...(data.headers ?? [])];
  }, []);

  const mergedHeaders = [
    ...(context.collection.root?.request?.headers ?? []),
    ...folderHeaders,
    ...context.requestItem.request.headers
  ];

  context.debug.log('Collection header applied', {
    collectionHeaders: context.collection.root?.request?.headers ?? [],
    requestHeaders: context.requestItem.request.headers,
    mergedHeaders
  });

  context.requestItem.request.headers = mergedHeaders;
}

function applyCollectionAuth(context: RequestContext) {
  if (context.requestItem.request.auth.mode !== 'inherit') {
    context.debug.log('Collection auth skipped', {
      requestMode: context.requestItem.request.auth.mode,
      collectionMode: context.collection.root?.request?.auth?.mode,
      finalAuth: context.requestItem.request.auth
    });
    return;
  }

  context.requestItem.request.auth = context.collection.root?.request?.auth || { mode: 'none' };

  context.debug.log('Collection auth applied', {
    requestMode: 'inherit', // Its always inherit at this point
    collectionMode: context.requestItem.request.auth.mode,
    finalAuth: context.requestItem.request.auth
  });
}

function applyGlobalProxy(context: RequestContext) {
  const proxyStatus = context.collection.brunoConfig.proxy?.enabled ?? 'global';
  if (proxyStatus === 'global') {
    context.debug.log('Global proxy config applied', context.preferences.proxy);
    if (context.preferences.proxy.mode === 'system') {
      // TODO: Handle system Proxy
      return;
    }

    context.collection.brunoConfig.proxy = {
      ...context.preferences.proxy,
      enabled: context.preferences.proxy.mode === 'on'
    };
  }
}

export function applyCollectionSettings(context: RequestContext, folderData: FolderData[]) {
  applyCollectionHeader(context, folderData);
  applyCollectionAuth(context);

  applyGlobalProxy(context);
}
