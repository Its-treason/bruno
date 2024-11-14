import { OAuth2AuthSchema, RequestBodySchema } from 'packages/bruno-schema/dist';
import { RequestContext } from '../../types';

export async function applyClientCredentials(context: RequestContext, auth: OAuth2AuthSchema) {
  if (auth.grantType !== 'client_credentials') {
    return;
  }

  const body = {
    mode: 'formUrlEncoded',
    formUrlEncoded: [
      { name: 'grant_type', value: 'client_credentials', enabled: true },
      { name: 'client_id', value: auth.clientId, enabled: true },
      { name: 'client_secret', value: auth.clientSecret, enabled: true },
      // If scope is an empty it should not be sent: https://github.com/usebruno/bruno/pull/2447
      { name: 'scope', value: auth.scope, enabled: !!auth.scope }
    ]
  } as RequestBodySchema;

  const req = context.requestItem.request;
  req.body = body;
  req.url = auth.accessTokenUrl;
  req.method = 'POST';
}
