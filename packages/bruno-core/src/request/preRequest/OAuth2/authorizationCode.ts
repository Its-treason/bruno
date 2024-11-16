import { OAuth2AuthSchema, RequestBodySchema } from 'packages/bruno-schema/dist';
import { RequestContext } from '../../types';
import crypto from 'node:crypto';

export async function applyAuthorizationCode(context: RequestContext, auth: OAuth2AuthSchema) {
  if (auth.grantType !== 'authorization_code') {
    return;
  }

  const { challenge, codeVerifier } = createPkceKeys();

  const authorizationUrl = createAuthorizationUrl(auth, challenge);
  const code = await context.callback.fetchAuthorizationCode(
    authorizationUrl,
    auth.callbackUrl,
    context.collection.uid
  );

  const body = {
    mode: 'formUrlEncoded',
    formUrlEncoded: [
      { name: 'grant_type', value: 'authorization_code', enabled: true },
      { name: 'code', value: code, enabled: true },
      { name: 'redirect_url', value: auth.callbackUrl, enabled: true },
      { name: 'client_id', value: auth.clientId, enabled: true },
      { name: 'client_secret', value: auth.clientSecret, enabled: true },
      { name: 'code_verifier', value: codeVerifier, enabled: !!auth.pkce }
    ]
  } as RequestBodySchema;

  const req = context.requestItem.request;
  req.body = body;
  req.url = auth.accessTokenUrl;
  req.method = 'POST';
}

// Referenz: https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce/add-login-using-the-authorization-code-flow-with-pkce
function base64URLEncode(str: Buffer) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function createPkceKeys() {
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));

  const sha256 = crypto.createHash('sha256').update(codeVerifier).digest();
  const challenge = base64URLEncode(sha256);

  return { challenge, codeVerifier } as const;
}

function createAuthorizationUrl(auth: OAuth2AuthSchema, codeChallange: string): string {
  if (auth.grantType !== 'authorization_code') {
    throw new Error('GrantType must be "authorization_code" at this point');
  }

  // Ref: https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.1
  const authUrl = new URL(auth.authorizationUrl);
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', auth.clientId);
  if (auth.callbackUrl) {
    authUrl.searchParams.append('redirect_uri', auth.callbackUrl);
  }
  if (auth.scope) {
    authUrl.searchParams.append('scope', auth.scope);
  }
  if (auth.pkce) {
    authUrl.searchParams.append('code_challange', codeChallange);
    authUrl.searchParams.append('code_challange_method', 'S256');
  }
  if (auth.state) {
    authUrl.searchParams.append('state', auth.state);
  }

  return authUrl.href;
}
