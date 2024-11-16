/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { BrowserWindow, session } from 'electron';
const { preferencesUtil } = require('../store/preferences');

export async function handleAuthorizationCodeInElectron(
  authorizeUrl: string,
  callbackUrl: string,
  collectionId: string
): Promise<string> {
  const window = new BrowserWindow({
    webPreferences: {
      partition: collectionId
    },
    show: false,
    center: true
  });
  window.on('ready-to-show', () => window.show());

  // Ignore invalid ssl certificates based on the app setting. See: https://github.com/usebruno/bruno/issues/1684
  window.webContents.on('certificate-error', (event, _url, _error, _certificate, callback) => {
    event.preventDefault();
    callback(!preferencesUtil.shouldVerifyTls());
  });

  let resolve: (value: string | PromiseLike<string>) => void, reject: (err: Error) => void;
  const promise = new Promise<string>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const handleRedirect = (url: string) => {
    const callbackUrlObj = new URL(callbackUrl);
    const urlObj = new URL(url);

    // Check if the side is the callbackUrl. See: https://github.com/usebruno/bruno/issues/2147
    if (urlObj.href.startsWith(callbackUrlObj.href)) {
      const code = urlObj.searchParams.get('code');
      if (code === null) {
        reject(new Error(`Callback URL does not contain "code" search parameter! Got the following URL: "${url}"`));
        return;
      }
      resolve(code);
      return;
    }

    // Check if we got redirect to an error page
    const error = urlObj.searchParams.get('error');
    const errorDescription = urlObj.searchParams.get('error_description');
    const errorUrl = urlObj.searchParams.get('error_uri');
    if (error || errorDescription || errorUrl) {
      let message;
      if (error) {
        message += ` error: "${error}",`;
      }
      if (errorDescription) {
        message += ` description: "${errorDescription}",`;
      }
      if (errorUrl) {
        message += ` URL: "${errorUrl}",`;
      }
      reject(new Error(`Authorization failed! Server returned${message} last Url was: "${url}"`));
    }
  };
  window.webContents.on('did-navigate', (_, url) => handleRedirect(url));
  window.webContents.on('will-redirect', (_, url) => handleRedirect(url));

  window.on('close', () => {
    reject(new Error('Authorization window closed!'));
  });

  try {
    await window.loadURL(authorizeUrl);
  } catch (error) {
    // The browser will sometimes redirect, before the page is fully loaded. See: https://github.com/usebruno/bruno/issues/1920
    if (error.code !== 'ERR_ABORTED') {
      window.destroy();
      throw new Error(`Could not load authorization url "${authorizeUrl}" error: ${error.message}`);
    }
  }

  try {
    return await promise;
  } catch (error) {
    throw new Error(`OAauth2 authorization failed: ${error.message}`);
  } finally {
    window.destroy();
  }
}

export async function clearSession(collectionId: string) {
  const localSession = session.fromPartition(collectionId);
  await localSession.clearData();
}
