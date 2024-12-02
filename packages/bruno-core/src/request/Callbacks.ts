import { RequestContext } from './types';
import { stringify, parse } from 'lossless-json';
import { STATUS_CODES } from 'node:http';
import { Cookie, CookieJar } from 'tough-cookie';
import { cleanJson } from './runtime/utils';

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
      requestUid: context.requestItem.uid,
      collectionUid: context.collection.uid,
      itemUid: context.requestItem.uid,
      cancelTokenUid: context.cancelToken
    });
  }

  requestSend(context: RequestContext) {
    this.send('requestEvent', context, {
      type: 'request-sent',
      requestSent: {
        url: context.requestItem.request.url,
        method: context.requestItem.request.method,
        headers: context.requestItem.request.headers,
        data: parse(stringify('{}')!)
      },
      collectionUid: context.collection.uid,
      itemUid: context.requestItem.uid,
      requestUid: context.uid,
      cancelTokenUid: ''
    });
  }

  assertionResults(context: RequestContext, results: any[]) {
    this.send('requestEvent', context, {
      type: 'assertion-results',
      results: results,
      itemUid: context.requestItem.uid,
      requestUid: context.uid,
      collectionUid: context.collection.uid
    });
  }

  testResults(context: RequestContext, results: any[]) {
    this.send('requestEvent', context, {
      type: 'test-results',
      results: results,
      itemUid: context.requestItem.uid,
      requestUid: context.uid,
      collectionUid: context.collection.uid
    });
  }

  updateScriptEnvironment(context: RequestContext, envVariables: any, runtimeVariables: any, globalVariables: any) {
    this.send('updateScriptEnvironment', context, {
      envVariables,
      runtimeVariables,
      globalVariables,
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

  folderRequestQueued(context: RequestContext) {
    this.send('runFolderEvent', context, {
      type: 'request-queued',
      itemUid: context.requestItem.uid,
      collectionUid: context.collection.uid
    });
  }

  folderRequestSent(context: RequestContext) {
    this.send('runFolderEvent', context, {
      type: 'request-sent',
      requestSent: {
        url: context.requestItem.request.url,
        method: context.httpRequest!.options.method,
        headers: context.httpRequest!.options.headers,
        data: context.httpRequest!.body ?? undefined
      },
      itemUid: context.requestItem.uid,
      collectionUid: context.collection.uid
    });
  }

  folderResponseReceived(context: RequestContext) {
    this.send('runFolderEvent', context, {
      type: 'response-received',
      responseReceived: {
        status: context.response?.statusCode,
        statusText: STATUS_CODES[context.response?.statusCode || 0] || 'Unknown',
        headers: context.response?.headers,
        duration: context.response?.responseTime,
        size: context.response?.size,
        responseTime: context.response?.responseTime
      },
      timeline: context.timeline,
      timings: context.timings.getClean(),
      debug: context.debug.getClean(),
      itemUid: context.requestItem.uid,
      collectionUid: context.collection.uid
    });
  }

  folderAssertionResults(context: RequestContext, results: any[]) {
    this.send('runFolderEvent', context, {
      type: 'assertion-results',
      assertionResults: results,
      itemUid: context.requestItem.uid,
      collectionUid: context.collection.uid
    });
  }

  folderTestResults(context: RequestContext, results: any[]) {
    this.send('runFolderEvent', context, {
      type: 'test-results',
      testResults: results,
      itemUid: context.requestItem.uid,
      collectionUid: context.collection.uid
    });
  }
}
