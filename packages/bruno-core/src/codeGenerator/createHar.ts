import { HarRequest } from '@readme/httpsnippet';
import { RequestBody, RequestContext } from '../request/types';
import { parse, stringify } from 'lossless-json';
import fs from 'node:fs/promises';
import path from 'node:path';
import { CookieJar } from 'tough-cookie';
import { createAuthHeader } from '../request/preRequest/createHttpRequest';

type PostData = {
  mimeType: string;
  params?: any[]; // http://www.softwareishard.com/blog/har-12-spec/#params
  text: string;
};

async function createBody(body: RequestBody): Promise<PostData | undefined> {
  switch (body.mode) {
    case 'multipartForm':
      const params = [];
      for (const param of body.multipartForm) {
        if (!param.enabled) {
          continue;
        }
        if (param.type === 'text') {
          params.push({
            name: param.name,
            value: param.value
          });
          continue;
        }
        const value = (await fs.readFile(param.value[0])).toString('utf8');
        params.push({
          name: param.name,
          value,
          fileName: path.basename(param.value[0])
        });
      }

      return {
        params,
        mimeType: 'multipart/form-data',
        text: ''
      };
    case 'formUrlEncoded': {
      const params = [];
      for (const param of body.formUrlEncoded) {
        if (!param.enabled) {
          continue;
        }
        params.push({
          name: param.name,
          value: param.value
        });
      }
      return {
        params,
        mimeType: 'application/x-www-form-urlencoded',
        text: ''
      };
    }
    case 'json':
      if (typeof body.json !== 'string') {
        return {
          mimeType: 'application/json',
          text: stringify(body.json) ?? ''
        };
      }
      return {
        mimeType: 'application/json',
        text: body.json
      };
    case 'xml':
      return {
        mimeType: 'application/xml',
        text: body.xml
      };
    case 'text':
      return {
        mimeType: 'text/plain',
        text: body.text
      };
    case 'sparql':
      return {
        mimeType: 'application/sparql-query',
        text: body.sparql
      };
    case 'graphql':
      let variables;
      try {
        variables = parse(body.graphql.variables || '{}');
      } catch (e) {
        throw new Error(
          `Could not parse GraphQL variables JSON: ${e}\n\n=== Start of preview ===\n${body.graphql.variables}\n=== End of preview ===`
        );
      }
      return {
        text:
          stringify({
            query: body.graphql.query,
            variables
          }) ?? '',
        mimeType: 'application/json'
      };
    default:
      return {
        text: '',
        mimeType: ''
      };
  }
}

function removeDisabled(headers: { name: string; value: string; enabled: boolean; type?: string }[]) {
  return headers
    .filter((header) => header.enabled && header.type !== 'path')
    .map((header) => ({ name: header.name, value: header.value }));
}

async function getCookies(cookieJar: CookieJar, url: string) {
  const cookies = await cookieJar.getCookies(url);
  return cookies.map((cookie) => ({
    ...cookie,
    name: cookie.key
  }));
}

export async function createHar(context: RequestContext): Promise<HarRequest> {
  const headers = removeDisabled(context.requestItem.request.headers);
  const postData = await createBody(context.requestItem.request.body);
  if (postData?.mimeType && !postData.params) {
    headers.push({
      name: 'content-type',
      value: postData.mimeType
    });
  }
  const authHeaders = createAuthHeader(context.requestItem);
  Object.entries(authHeaders).forEach(([name, value]) => {
    headers.push({ name, value });
  });

  // Reference: http://www.softwareishard.com/blog/har-12-spec/#request
  return {
    method: context.requestItem.request.method,
    url: context.requestItem.request.url,
    httpVersion: 'HTTP/1.1',
    cookies: await getCookies(context.cookieJar, context.requestItem.request.url),
    headers,
    queryString: removeDisabled(context.requestItem.request.params),
    postData,
    headersSize: -1,
    bodySize: -1
  };
}
