import React from 'react';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import { IconTrash } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { addFolderHeader, updateFolderHeader, deleteFolderHeader } from 'providers/ReduxStore/slices/collections';
import { saveFolderRoot } from 'providers/ReduxStore/slices/collections/actions';
import StyledWrapper from './StyledWrapper';
import CodeEditor from 'components/CodeEditor';

const Headers = ({ collection, folder }) => {
  const dispatch = useDispatch();
  const headers = get(folder, 'root.request.headers', []);

  const addHeader = () => {
    dispatch(
      addFolderHeader({
        collectionUid: collection.uid,
        folderUid: folder.uid
      })
    );
  };

  const handleSave = () => dispatch(saveFolderRoot(collection.uid, folder.uid));
  const handleHeaderValueChange = (e, _header, type) => {
    const header = cloneDeep(_header);
    switch (type) {
      case 'name': {
        header.name = e.target.value;
        break;
      }
      case 'value': {
        header.value = e.target.value;
        break;
      }
      case 'enabled': {
        header.enabled = e.target.checked;
        break;
      }
    }
    dispatch(
      updateFolderHeader({
        header: header,
        collectionUid: collection.uid,
        folderUid: folder.uid
      })
    );
  };

  const handleRemoveHeader = (header) => {
    dispatch(
      deleteFolderHeader({
        headerUid: header.uid,
        collectionUid: collection.uid,
        folderUid: folder.uid
      })
    );
  };

  return (
    <StyledWrapper className="w-full">
      <div className="text-xs mb-4 text-muted">
        Request headers that will be sent with every request inside this folder.
      </div>
      <table>
        <thead>
          <tr>
            <td>Name</td>
            <td>Value</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {headers && headers.length
            ? headers.map((header) => {
                return (
                  <tr key={header.uid}>
                    <td>
                      <CodeEditor
                        value={header.name}
                        onSave={handleSave}
                        onChange={(newValue) =>
                          handleHeaderValueChange(
                            {
                              target: {
                                value: newValue
                              }
                            },
                            header,
                            'name'
                          )
                        }
                        mode="headers"
                        singleLine
                        withVariables
                      />
                    </td>
                    <td>
                      <CodeEditor
                        value={header.value}
                        onSave={handleSave}
                        onChange={(newValue) =>
                          handleHeaderValueChange(
                            {
                              target: {
                                value: newValue
                              }
                            },
                            header,
                            'value'
                          )
                        }
                        mode={header.name.toLowerCase() === 'content-type' ? 'content-type' : 'plaintext'}
                        singleLine
                        withVariables
                      />
                    </td>
                    <td>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          tabIndex="-1"
                          className="mr-3 mousetrap"
                          onChange={(e) => handleHeaderValueChange(e, header, 'enabled')}
                        />
                        <button tabIndex="-1" onClick={() => handleRemoveHeader(header)}>
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
      <button className="btn-add-header text-link pr-2 py-3 mt-2 select-none" onClick={addHeader}>
        + Add Header
      </button>

      <div className="mt-6">
        <button type="submit" className="submit btn btn-sm btn-secondary" onClick={handleSave}>
          Save
        </button>
      </div>
    </StyledWrapper>
  );
};
export default Headers;
