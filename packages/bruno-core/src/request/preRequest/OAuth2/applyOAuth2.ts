import { RequestContext } from '../../types';
import { applyAuthorizationCode } from './authorizationCode';
import { applyClientCredentials } from './clientCredentials';
import { applyPassword } from './password';

export async function applyOAuth2(context: RequestContext) {
  const auth = context.requestItem.request.auth;

  if (auth.mode !== 'oauth2') {
    throw new Error('Expected request auth mode to be "oauth2" at this point');
  }

  switch (auth.oauth2.grantType) {
    case 'authorization_code':
      await applyAuthorizationCode(context, auth.oauth2);
      break;
    case 'client_credentials':
      await applyClientCredentials(context, auth.oauth2);
      break;
    case 'password':
      await applyPassword(context, auth.oauth2);
      return;
    default:
      // @ts-expect-error
      throw new Error(`Unknown "grantType": "${auth.oauth2.grantType}" provided`);
  }
}
