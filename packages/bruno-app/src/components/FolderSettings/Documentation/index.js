import 'github-markdown-css/github-markdown.css';
import get from 'lodash/get';
import { updateFolderDocs } from 'providers/ReduxStore/slices/collections';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { saveFolderRoot } from 'providers/ReduxStore/slices/collections/actions';
import Markdown from 'components/MarkDown';
import CodeEditor from 'components/CodeEditor';
import StyledWrapper from './StyledWrapper';
import { MarkdownEditor } from 'components/MarkdownEditor';
import useLocalStorage from 'hooks/useLocalStorage';
import { Group, Switch } from '@mantine/core';

const Documentation = ({ collection, folder }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const docs = get(folder, 'root.docs', '');
  const [wysiwyg, setWysiwyg] = useLocalStorage('true');

  const toggleViewMode = () => {
    setIsEditing((prev) => !prev);
  };

  const onEdit = (value) => {
    dispatch(
      updateFolderDocs({
        folderUid: folder.uid,
        collectionUid: collection.uid,
        docs: value
      })
    );
  };

  const onSave = () => dispatch(saveFolderRoot(collection.uid, folder.uid));

  if (!folder) {
    return null;
  }

  return (
    <StyledWrapper className="flex flex-col gap-y-1 h-full w-full relative">
      <Group justify="space-between" align="center">
        <div className="editing-mode mb-2" role="tab" onClick={toggleViewMode}>
          {isEditing ? 'Preview' : 'Edit'}
        </div>

        {isEditing ? (
          <Switch
            checked={wysiwyg === 'true'}
            size="xs"
            onChange={() => setWysiwyg(wysiwyg === 'true' ? 'false' : 'true')}
            label="Use WYSIWYG editor"
          />
        ) : null}
      </Group>

      {isEditing ? (
        wysiwyg === 'true' ? (
          <MarkdownEditor value={docs ?? ''} onChange={onEdit} />
        ) : (
          <CodeEditor
            value={docs || ''}
            onChange={onEdit}
            onSave={onSave}
            mode="markdown"
            height={'calc(100% - var(--mantine-spacing-xl))'}
          />
        )
      ) : (
        <Markdown collectionPath={collection.pathname} onDoubleClick={toggleViewMode} content={docs} />
      )}
    </StyledWrapper>
  );
};

export default Documentation;
