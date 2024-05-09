import { ActionIcon, Tooltip, rem } from '@mantine/core';
import { IconRun, IconSettings, IconVariable } from '@tabler/icons-react';
import { addTab } from 'providers/ReduxStore/slices/tabs';
import { useDispatch } from 'react-redux';
import { uuid } from 'utils/common';

type CollectionTabButtonsProps = {
  collectionUid: string;
  activeTabType: 'collection-runner' | 'collection-settings' | 'variables' | null;
};

export const CollectionTabButtons: React.FC<CollectionTabButtonsProps> = ({ collectionUid, activeTabType }) => {
  const dispatch = useDispatch();

  const openTab = (type: 'collection-runner' | 'collection-settings' | 'variables') => {
    dispatch(
      addTab({
        uid: uuid(),
        collectionUid,
        type
      })
    );
  };

  return (
    <ActionIcon.Group mr={'md'}>
      <Tooltip label="Collection runner" openDelay={250}>
        <ActionIcon
          variant={activeTabType === 'collection-runner' ? 'filled' : 'default'}
          size={'input-sm'}
          aria-label={'Collection runner'}
          onClick={() => openTab('collection-runner')}
        >
          <IconRun style={{ width: rem(18) }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Collection variables" openDelay={250}>
        <ActionIcon
          variant={activeTabType === 'variables' ? 'filled' : 'default'}
          size={'input-sm'}
          aria-label={'Collection variables'}
          onClick={() => openTab('variables')}
        >
          <IconVariable style={{ width: rem(18) }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Collection settings" openDelay={250}>
        <ActionIcon
          variant={activeTabType === 'collection-settings' ? 'filled' : 'default'}
          size={'input-sm'}
          aria-label={'Collection settings'}
          onClick={() => openTab('collection-settings')}
        >
          <IconSettings style={{ width: rem(18) }} stroke={1.5} />
        </ActionIcon>
      </Tooltip>
    </ActionIcon.Group>
  );
};
