import 'github-markdown-css/github-markdown.css';
import get from 'lodash/get';
import { updateRequestDocs } from 'providers/ReduxStore/slices/collections';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { saveRequest } from 'providers/ReduxStore/slices/collections/actions';
import Markdown from 'components/MarkDown';
import StyledWrapper from './StyledWrapper';
import CodeEditor from 'components/CodeEditor';

const Documentation = ({ item, collection }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const docs = item.draft ? get(item, 'draft.request.docs') : get(item, 'request.docs');

  const toggleViewMode = () => {
    setIsEditing((prev) => !prev);
  };

  const onEdit = (value) => {
    dispatch(
      updateRequestDocs({
        itemUid: item.uid,
        collectionUid: collection.uid,
        docs: value
      })
    );
  };

  const onSave = () => dispatch(saveRequest(item.uid, collection.uid));

  if (!item) {
    return null;
  }

  return (
    <StyledWrapper className="mt-1 h-full w-full relative">
      <div className="editing-mode mb-2" role="tab" onClick={toggleViewMode}>
        {isEditing ? 'Preview' : 'Edit'}
      </div>

      {isEditing ? (
        <CodeEditor value={docs || ''} onChange={onEdit} onSave={onSave} mode="application/text" />
      ) : (
        <Markdown onDoubleClick={toggleViewMode} content={docs} />
      )}
    </StyledWrapper>
  );
};

export default Documentation;
