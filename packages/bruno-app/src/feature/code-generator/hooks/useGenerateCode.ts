/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { HTTPSnippet } from '@readme/httpsnippet';
import { CollectionSchema } from '@usebruno/schema';
import { get } from 'lodash';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { findCollectionByUid, findEnvironmentInCollection, findItemInCollection } from 'utils/collections';
import { interpolateUrl, interpolateUrlPathParams } from 'utils/url';
import { buildHarRequest } from '../util/har';
import { getAuthHeaders } from '../util/auth';
import { interpolate } from '@usebruno/common';

type GenerateCodeResult =
  | {
      success: true;
      code: string;
    }
  | {
      success: false;
      error: string;
    };

type ReduxStore = { collections: { collections: CollectionSchema[] } };

export function useGenerateCode(
  collectionId: string,
  requestId: string,
  targetId: string,
  clientId: string
): GenerateCodeResult {
  const collection: CollectionSchema = useSelector((store: ReduxStore) =>
    findCollectionByUid(store.collections.collections, collectionId)
  );

  return useMemo((): GenerateCodeResult => {
    if (!collection) {
      return {
        success: false,
        error: `Could not find collection with ID: ${collectionId}. (This is a Bug)`
      };
    }
    const item = findItemInCollection(collection, requestId);
    if (!item) {
      return {
        success: false,
        error: `Could not find request with ID: ${requestId}. (This is a Bug)`
      };
    }

    const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);
    let envVars = {};
    if (environment) {
      const vars = get(environment, 'variables', []);
      envVars = vars.reduce((acc, curr) => {
        acc[curr.name] = curr.value;
        return acc;
      }, {});
    }

    const requestUrl =
      get(item, 'draft.request.url') !== undefined ? get(item, 'draft.request.url') : get(item, 'request.url');

    // interpolate the url
    const interpolatedUrl = interpolateUrl({
      url: requestUrl,
      envVars,
      collectionVariables: collection.collectionVariables,
      processEnvVars: collection.processEnvVariables
    });

    // interpolate the path params
    const finalUrl = interpolateUrlPathParams(
      interpolatedUrl,
      get(item, 'draft.request.params') !== undefined ? get(item, 'draft.request.params') : get(item, 'request.params')
    );

    const requestHeaders = item.draft ? get(item, 'draft.request.headers') : get(item, 'request.headers');

    const collectionRootAuth = collection?.root?.request?.auth;
    const requestAuth = item.draft ? get(item, 'draft.request.auth') : get(item, 'request.auth');

    const headers = [
      ...getAuthHeaders(collectionRootAuth, requestAuth),
      ...(collection?.root?.request?.headers || []),
      ...(requestHeaders || [])
    ];

    const harRequest = buildHarRequest({ request: item.request, headers });
    try {
      // @ts-expect-error TargetId as a type is not exposed from the lib
      const code = new HTTPSnippet(harRequest).convert(targetId, clientId);
      if (!code) {
        return {
          success: false,
          error: 'Could not generate snippet. Unknown error'
        };
      }
      return {
        success: true,
        // The generated snippet can still container variable placeholder
        code: interpolate(code[0], {
          ...envVars,
          ...collection.collectionVariables,
          process: {
            env: {
              ...collection.processEnvVariables
            }
          }
        })
      };
    } catch (e) {
      console.error('Could not generate snippet! Generator threw an error', e);
      return {
        success: false,
        error: `Could not generate snippet! Generator threw an error: ${e}`
      };
    }
  }, [collection, requestId, targetId, clientId]);
}
