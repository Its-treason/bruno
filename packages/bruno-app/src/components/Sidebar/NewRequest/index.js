import React, { useRef, useEffect, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { uuid } from 'utils/common';
import Modal from 'components/Modal';
import { useDispatch } from 'react-redux';
import { newEphemeralHttpRequest } from 'providers/ReduxStore/slices/collections';
import { newHttpRequest } from 'providers/ReduxStore/slices/collections/actions';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import HttpMethodSelector from 'components/RequestPane/QueryUrl/HttpMethodSelector';
import { getDefaultRequestPaneTab } from 'utils/collections';
import StyledWrapper from './StyledWrapper';
import { getRequestFromCurlCommand } from 'utils/curl';
import toast from 'components/Toast';

const NewRequest = ({ collection, item, isEphemeral, onClose }) => {
  const dispatch = useDispatch();
  const inputRef = useRef();
  const {
    brunoConfig: { presets: collectionPresets = {} }
  } = collection;

  const createRequest = useMutation({
    mutationFn: async (values) => {
      // TODO: Is always false, remove?
      if (isEphemeral) {
        const uid = uuid();
        await dispatch(
          newEphemeralHttpRequest({
            uid: uid,
            requestName: values.requestName,
            requestType: values.requestType,
            requestUrl: values.requestUrl,
            requestMethod: values.requestMethod,
            collectionUid: collection.uid
          })
        );
        await dispatch(
          addTab({
            uid: uid,
            collectionUid: collection.uid,
            requestPaneTab: getDefaultRequestPaneTab({ type: values.requestType })
          })
        );
        return;
      }

      switch (values.requestType) {
        case 'from-curl':
          const request = getRequestFromCurlCommand(values.curlCommand);
          dispatch(
            newHttpRequest({
              requestName: values.requestName,
              requestType: 'http-request',
              requestUrl: request.url,
              requestMethod: request.method,
              collectionUid: collection.uid,
              itemUid: item ? item.uid : null,
              headers: request.headers,
              body: request.body
            })
          );
          return;
        case 'http-request':
        case 'graphql-request':
          await dispatch(
            newHttpRequest({
              requestName: values.requestName,
              requestType: values.requestType,
              requestUrl: values.requestUrl,
              requestMethod: values.requestMethod,
              collectionUid: collection.uid,
              itemUid: item ? item.uid : null
            })
          );
          return;
        default:
          throw new Error(`Unknown request type: "${values.requestType}"`);
      }
    },
    onSuccess: () => {
      onClose();
      toast.success(`New request created`);
    }
  });

  const getInitialRequestType = (collectionPresets = {}) => {
    // Note: Why different labels for the same thing?
    // http-request and graphql-request are used inside the app's json representation of a request
    // http and graphql are used in Bru DSL as well as collection exports
    // We need to eventually standardize the app's DSL to use the same labels as bru DSL
    if (collectionPresets.requestType === 'graphql') {
      return 'graphql-request';
    }
    return 'http-request';
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      requestName: '',
      requestType: getInitialRequestType(collectionPresets),
      requestUrl: collectionPresets.requestUrl || '',
      requestMethod: 'GET',
      curlCommand: ''
    },
    validationSchema: Yup.object({
      requestName: Yup.string()
        .trim()
        .min(1, 'Name must be at least 1 character long')
        .required('Name is required')
        .test({
          name: 'requestName',
          message: `The request names - collection and folder is reserved in bruno`,
          test: (value) => {
            const trimmedValue = value ? value.trim().toLowerCase() : '';
            return !['collection', 'folder'].includes(trimmedValue);
          }
        }),
      curlCommand: Yup.string().when('requestType', {
        is: (requestType) => requestType === 'from-curl',
        then: Yup.string()
          .min(1, 'must be at least 1 character')
          .required('curlCommand is required')
          .test({
            name: 'curlCommand',
            message: `Invalid cURL Command`,
            test: (value) => getRequestFromCurlCommand(value) !== null
          })
      })
    }),
    onSubmit: createRequest.mutate
  });

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const onSubmit = () => formik.handleSubmit();

  const handlePaste = useCallback(
    (event) => {
      const clipboardData = event.clipboardData || window.clipboardData;
      const pastedData = clipboardData.getData('Text');

      // Check if pasted data looks like a cURL command
      const curlCommandRegex = /^\s*curl\s/i;
      if (curlCommandRegex.test(pastedData)) {
        // Switch to the 'from-curl' request type
        formik.setFieldValue('requestType', 'from-curl');
        formik.setFieldValue('curlCommand', pastedData);

        // Prevent the default paste behavior to avoid pasting into the textarea
        event.preventDefault();
      }
    },
    [formik]
  );

  return (
    <StyledWrapper>
      <Modal
        size="md"
        title="New Request"
        confirmText="Create"
        errorMessage={createRequest.isError ? String(createRequest.error) : null}
        handleConfirm={onSubmit}
        handleCancel={onClose}
      >
        <form className="bruno-form" onSubmit={formik.handleSubmit}>
          <div>
            <label htmlFor="requestName" className="block font-semibold">
              Type
            </label>

            <div className="flex items-center mt-2">
              <input
                id="http-request"
                className="cursor-pointer"
                type="radio"
                name="requestType"
                onChange={formik.handleChange}
                value="http-request"
                checked={formik.values.requestType === 'http-request'}
              />
              <label htmlFor="http-request" className="ml-1 cursor-pointer select-none">
                HTTP
              </label>

              <input
                id="graphql-request"
                className="ml-4 cursor-pointer"
                type="radio"
                name="requestType"
                onChange={(event) => {
                  formik.setFieldValue('requestMethod', 'POST');
                  formik.handleChange(event);
                }}
                value="graphql-request"
                checked={formik.values.requestType === 'graphql-request'}
              />
              <label htmlFor="graphql-request" className="ml-1 cursor-pointer select-none">
                GraphQL
              </label>

              <input
                id="from-curl"
                className="cursor-pointer ml-auto"
                type="radio"
                name="requestType"
                onChange={formik.handleChange}
                value="from-curl"
                checked={formik.values.requestType === 'from-curl'}
              />

              <label htmlFor="from-curl" className="ml-1 cursor-pointer select-none">
                From cURL
              </label>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="requestName" className="block font-semibold">
              Name
            </label>
            <input
              id="request-name"
              type="text"
              name="requestName"
              ref={inputRef}
              className="block textbox mt-2 w-full"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onChange={formik.handleChange}
              value={formik.values.requestName || ''}
            />
            {formik.touched.requestName && formik.errors.requestName ? (
              <div className="text-red-500">{formik.errors.requestName}</div>
            ) : null}
          </div>
          {formik.values.requestType !== 'from-curl' ? (
            <>
              <div className="mt-4">
                <label htmlFor="request-url" className="block font-semibold">
                  URL
                </label>

                <div className="flex items-center mt-2 ">
                  <div className="flex items-center h-full method-selector-container">
                    <HttpMethodSelector
                      method={formik.values.requestMethod}
                      onMethodSelect={(val) => formik.setFieldValue('requestMethod', val)}
                    />
                  </div>
                  <div className="flex items-center flex-grow input-container h-full">
                    <input
                      id="request-url"
                      type="text"
                      name="requestUrl"
                      className="px-3 w-full "
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      onChange={formik.handleChange}
                      value={formik.values.requestUrl || ''}
                      onPaste={handlePaste}
                    />
                  </div>
                </div>
                {formik.touched.requestUrl && formik.errors.requestUrl ? (
                  <div className="text-red-500">{formik.errors.requestUrl}</div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="mt-4">
              <label htmlFor="request-url" className="block font-semibold">
                cURL Command
              </label>
              <textarea
                name="curlCommand"
                placeholder="Enter cURL request here.."
                className="block textbox w-full mt-4 curl-command"
                value={formik.values.curlCommand}
                onChange={formik.handleChange}
              ></textarea>
              {formik.touched.curlCommand && formik.errors.curlCommand ? (
                <div className="text-red-500">{formik.errors.curlCommand}</div>
              ) : null}
            </div>
          )}
        </form>
      </Modal>
    </StyledWrapper>
  );
};

export default NewRequest;
