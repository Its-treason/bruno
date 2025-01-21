import { RequestContext } from '../types';
import { Cookie, CookieJar } from 'tough-cookie';
import { cleanJson } from '../runtime/utils';

type Callback = (payload: any) => void;
export type RawCallbacks = {
  updateScriptEnvironment: Callback;
  cookieUpdated: Callback;
  requestEvent: Callback;
  runFolderEvent: Callback;
  consoleLog: Callback;
};

export class Callbacks {
  constructor(
    private rawCallbacks: Partial<RawCallbacks>,
    public fetchAuthorizationCode: (authorizeUrl: string, callbackUrl: string, collectionId: string) => Promise<string>
  ) {}

  private send(callbackName: keyof RawCallbacks, context: RequestContext, payload: any) {
    const callback = this.rawCallbacks[callbackName];
    if (!callback || context.abortController?.signal.aborted === true) {
      return;
    }
    callback(payload);
  }

  requestQueued(context: RequestContext) {
    this.send('requestEvent', context, {
      type: 'request-queued',
      requestUid: context.uid,
      collectionUid: context.collection.uid,
      itemUid: context.requestItem.uid,
      data: {
        cancelTokenUid: context.cancelToken
      }
    });
  }

  requestDelayed(context: RequestContext) {
    this.send('requestEvent', context, {
      type: 'request-delayed',
      requestUid: context.uid,
      collectionUid: context.collection.uid,
      itemUid: context.requestItem.uid
    });
  }

  requestSend(context: RequestContext) {
    this.send('requestEvent', context, {
      type: 'request-sent',
      collectionUid: context.collection.uid,
      itemUid: context.requestItem.uid,
      requestUid: context.uid,
      data: {
        cancelTokenUid: context.cancelToken
      }
    });
  }

  assertionResults(context: RequestContext, assertionResults: any[]) {
    this.send('requestEvent', context, {
      type: 'assertion-results',
      itemUid: context.requestItem.uid,
      requestUid: context.uid,
      collectionUid: context.collection.uid,
      data: {
        assertionResults
      }
    });
  }

  testResults(context: RequestContext, testResults: any[]) {
    this.send('requestEvent', context, {
      type: 'test-results',
      itemUid: context.requestItem.uid,
      requestUid: context.uid,
      collectionUid: context.collection.uid,
      data: {
        testResults
      }
    });
  }

  responseReceived(context: RequestContext) {
    this.send('requestEvent', context, {
      type: 'response-received',
      itemUid: context.requestItem.uid,
      requestUid: context.uid,
      collectionUid: context.collection.uid,
      data: {
        status: context.response?.statusCode,
        size: context.response?.size,
        duration: context.response?.responseTime,
        headers: context.response?.headers,
        previewModes: context.previewModes,
        debug: context.debug.getClean(),
        timeline: context.timeline,
        timings: context.timings.getAll()
      }
    });
  }

  responseError(context: RequestContext, error: string) {
    this.send('requestEvent', context, {
      type: 'response-error',
      itemUid: context.requestItem.uid,
      requestUid: context.uid,
      collectionUid: context.collection.uid,
      data: {
        error
      }
    });
  }

  updateScriptEnvironment(context: RequestContext) {
    this.send('updateScriptEnvironment', context, {
      envVariables: context.variables.getEnvironmentVariables(),
      runtimeVariables: context.variables.getRuntimeVariables(),
      globalVariables: context.variables.getGlobalVariables(),
      requestUid: context.requestItem.uid,
      collectionUid: context.collection.uid
    });
  }

  cookieUpdated(cookieJar: CookieJar) {
    // @ts-expect-error Not sure why the store is not included in the type
    cookieJar.store.getAllCookies((err: Error, cookies: Cookie[]) => {
      if (err) {
        throw err;
      }

      const domainCookieMap: Record<string, Cookie[]> = {};
      cookies.forEach((cookie) => {
        if (!cookie.domain) {
          return;
        }

        if (!domainCookieMap[cookie.domain]) {
          domainCookieMap[cookie.domain] = [cookie];
        } else {
          domainCookieMap[cookie.domain].push(cookie);
        }
      });

      const domains = Object.keys(domainCookieMap);
      const domainsWithCookies = [];

      for (const domain of domains) {
        const cookies = domainCookieMap[domain];
        const validCookies = cookies.filter(
          (cookie) => cookie.expires === 'Infinity' || (cookie.expires?.getTime() || 0) > Date.now()
        );

        if (validCookies.length) {
          domainsWithCookies.push({
            domain,
            cookies: validCookies,
            cookieString: validCookies.map((cookie) => cookie.cookieString()).join('; ')
          });
        }
      }

      if (!this.rawCallbacks.cookieUpdated) {
        return;
      }
      this.rawCallbacks.cookieUpdated(cleanJson(domainsWithCookies));
    });
  }

  consoleLog(type: string, args: any) {
    if (!this.rawCallbacks.consoleLog) {
      return;
    }

    this.rawCallbacks.consoleLog({ type, args });
  }

  folderRequestAdded(context: RequestContext) {
    this.send('runFolderEvent', context, {
      type: 'request-added',
      itemUid: context.requestItem.uid,
      requestId: context.uid,
      collectionUid: context.collection.uid
    });
  }
}
