import React from 'react';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { IconTrash } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import {
  addQueryParam,
  deleteQueryParam,
  updatePathParam,
  updateQueryParam
} from 'providers/ReduxStore/slices/collections';
import { saveRequest, sendRequest } from 'providers/ReduxStore/slices/collections/actions';

import StyledWrapper from './StyledWrapper';
import CodeEditor from 'components/CodeEditor';

const QueryParams = ({ item, collection }) => {
  const dispatch = useDispatch();
  const params = item.draft ? get(item, 'draft.request.params') : get(item, 'request.params');
  const queryParams = params.filter((param) => param.type === 'query');
  const pathParams = params.filter((param) => param.type === 'path');

  const handleAddQueryParam = () => {
    dispatch(
      addQueryParam({
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));
  const handleRun = () => dispatch(sendRequest(item, collection.uid));

  const handleQueryParamChange = (e, data, key) => {
    let value;

    switch (key) {
      case 'name': {
        value = e.target.value;
        break;
      }
      case 'value': {
        value = e.target.value;
        break;
      }
      case 'enabled': {
        value = e.target.checked;
        break;
      }
    }

    let queryParam = cloneDeep(data);

    if (queryParam[key] === value) {
      return;
    }

    queryParam[key] = value;

    dispatch(
      updateQueryParam({
        queryParam,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const handlePathParamChange = (e, data) => {
    let value = e.target.value;

    let pathParam = cloneDeep(data);

    if (pathParam['value'] === value) {
      return;
    }

    pathParam['value'] = value;

    dispatch(
      updatePathParam({
        pathParam,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  const handleRemoveQueryParam = (param) => {
    dispatch(
      deleteQueryParam({
        paramUid: param.uid,
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  return (
    <StyledWrapper className="w-full flex flex-col">
      <div className="flex-1 mt-2">
        <div className="mb-1 title text-xs">Query</div>
        <table>
          <thead>
            <tr>
              <td>Name</td>
              <td>Value</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {queryParams && queryParams.length
              ? queryParams.map((param) => {
                  return (
                    <tr key={param.uid}>
                      <td>
                        <input
                          type="text"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          value={param.name}
                          className="mousetrap"
                          onChange={(e) => handleQueryParamChange(e, param, 'name')}
                        />
                      </td>
                      <td>
                        <CodeEditor
                          value={param.value}
                          onSave={onSave}
                          onChange={(newValue) =>
                            handleQueryParamChange(
                              {
                                target: {
                                  value: newValue
                                }
                              },
                              param,
                              'value'
                            )
                          }
                          onRun={handleRun}
                          singleLine
                          withVariables
                        />
                      </td>
                      <td>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={param.enabled}
                            tabIndex="-1"
                            className="mr-3 mousetrap"
                            onChange={(e) => handleQueryParamChange(e, param, 'enabled')}
                          />
                          <button tabIndex="-1" onClick={() => handleRemoveQueryParam(param)}>
                            <IconTrash strokeWidth={1.5} size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        <button className="btn-add-param text-link pr-2 py-3 mt-2 select-none" onClick={handleAddQueryParam}>
          +&nbsp;<span>Add Param</span>
        </button>
        <div className="mb-1 title text-xs">Path</div>
        <table>
          <thead>
            <tr>
              <td>Name</td>
              <td>Value</td>
            </tr>
          </thead>
          <tbody>
            {pathParams && pathParams.length
              ? pathParams.map((path, index) => {
                  return (
                    <tr key={path.uid}>
                      <td>
                        <input
                          type="text"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck="false"
                          value={path.name}
                          className="mousetrap"
                          readOnly={true}
                        />
                      </td>
                      <td>
                        <CodeEditor
                          value={path.value}
                          onSave={onSave}
                          onChange={(newValue) =>
                            handlePathParamChange(
                              {
                                target: {
                                  value: newValue
                                }
                              },
                              path
                            )
                          }
                          onRun={handleRun}
                          singleLine
                          withVariables
                        />
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        {!(pathParams && pathParams.length) ?
          <div className="title pr-2 py-3 mt-2 text-xs">
            Path variables are automatically added whenever the
            <code className="font-mono mx-2">:name</code>
            template is used in the URL, for example:
            <code className="font-mono mx-2">
              https://example.com/v1/users/<span>:id</span>
            </code>
          </div>
        : null}
      </div>
    </StyledWrapper>
  );
};
export default QueryParams;
