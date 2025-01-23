import { Container } from '@mantine/core';
import { CollectionSchema } from '@usebruno/schema';
import { RuntimeVariables } from './RuntimeVariables';
import { EnvironmentVariables } from './EnvironmentVariables';

type VariablesViewer = {
  collection: CollectionSchema;
};

export const VariablesViewer: React.FC<VariablesViewer> = ({ collection }) => {
  return (
    <Container size={'xl'}>
      <RuntimeVariables collection={collection} />
      <EnvironmentVariables collection={collection} />
    </Container>
  );
};
