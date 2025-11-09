import { ActionIcon, CloseButton, Group, TextInput, Tooltip, rem } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconArrowsSort, IconSearch, IconSortAscendingLetters, IconSortDescendingLetters } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { appStore } from 'src/store/appStore';
import { useStore } from 'zustand';

export const CollectionFilter: React.FC = () => {
  const [searchValue, setSearchValue] = useState(() => appStore.getState().sidebarFilter);
  const [debouncedFilter] = useDebouncedValue(searchValue, 200);
  useEffect(() => {
    appStore.getState().updateSidebarFilter(debouncedFilter);
  }, [debouncedFilter]);

  const sortOrder = useStore(appStore, (state) => state.collectionSortOrder);
  const sortCollectionOrder = () => {
    let order;
    switch (sortOrder) {
      case 'default':
        order = 'asc';
        break;
      case 'asc':
        order = 'desc';
        break;
      case 'desc':
        order = 'default';
        break;
    }
    appStore.getState().updateCollectionSortOrder(order);
  };

  return (
    <Group p={'xs'} gap={'xs'}>
      <TextInput
        value={searchValue}
        placeholder={'Search for request'}
        onChange={(evt) => setSearchValue(evt.currentTarget.value)}
        flex={1}
        size="xs"
        leftSection={<IconSearch style={{ width: rem(20) }} stroke={1.5} />}
        rightSectionPointerEvents="all"
        rightSection={
          <CloseButton
            aria-label="Clear search"
            onClick={() => setSearchValue('')}
            style={{ display: searchValue ? undefined : 'none' }}
          />
        }
      />

      <Tooltip label="Change collection sorting" openDelay={250}>
        <ActionIcon
          size={'input-xs'}
          variant={'default'}
          onClick={sortCollectionOrder}
          aria-label={'Change collection sorting'}
        >
          {sortOrder == 'default' ? (
            <IconArrowsSort style={{ width: rem(16) }} strokeWidth={1.5} />
          ) : sortOrder == 'asc' ? (
            <IconSortAscendingLetters style={{ width: rem(16) }} strokeWidth={1.5} />
          ) : (
            <IconSortDescendingLetters style={{ width: rem(16) }} strokeWidth={1.5} />
          )}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};
