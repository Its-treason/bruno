import { Alert, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { RequestItemSchema } from '@usebruno/schema';
import CodeEditor from 'components/CodeEditor';
import { useGenerateCode } from 'feature/code-generator';
import { useEffect } from 'react';

type UrlPreviewProps = {
  item: RequestItemSchema;
  collectionUid: string;
};

export const UrlPreview: React.FC<UrlPreviewProps> = ({ collectionUid, item }) => {
  const generateCode = useGenerateCode(collectionUid, item.uid, 'url-only', '', 'false');

  const [debouncedItem] = useDebouncedValue(item.draft ? item.draft : item, 500);
  useEffect(() => {
    generateCode.refetch();
  }, [debouncedItem.request]);

  if (generateCode.isError) {
    return (
      <Alert color="red" title="Could not generate URL preview!">
        {String(generateCode.error)}
      </Alert>
    );
  }

  return (
    <CodeEditor
      label="URL preview"
      value={generateCode.data ?? 'Loading...'}
      singleLine
      withVariables
      readOnly
      asInput
    />
  );
};
