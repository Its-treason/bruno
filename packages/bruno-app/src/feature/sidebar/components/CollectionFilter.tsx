import { ActionIcon, CloseButton, Group, TextInput, Tooltip, rem } from '@mantine/core';
import { useDebouncedState, useDebouncedValue } from '@mantine/hooks';
import { IconArrowsSort, IconSearch, IconSortAscendingLetters, IconSortDescendingLetters } from '@tabler/icons-react';
import { sortCollections, filterCollections } from 'providers/ReduxStore/slices/collections/actions';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

type ReduxState = {
  collections: {
    collectionSortOrder: 'default' | 'alphabetical' | 'reverseAlphabetical';
    collectionFilter: string;
  };
};

export const CollectionFilter: React.FC = () => {
  const dispatch = useDispatch();
  const { collectionSortOrder, collectionFilter } = useSelector((state: ReduxState) => state.collections);

  const [searchValue, setSearchValue] = useState(collectionFilter ?? '');
  const [debounced] = useDebouncedValue(searchValue, 200);
  useEffect(() => {
    dispatch(filterCollections({ filter: debounced }));
  }, [debounced]);

  const sortCollectionOrder = () => {
    let order;
    switch (collectionSortOrder) {
      case 'default':
        order = 'alphabetical';
        break;
      case 'alphabetical':
        order = 'reverseAlphabetical';
        break;
      case 'reverseAlphabetical':
        order = 'default';
        break;
    }
    dispatch(sortCollections({ order }));
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
          {collectionSortOrder == 'default' ? (
            <IconArrowsSort style={{ width: rem(16) }} strokeWidth={1.5} />
          ) : collectionSortOrder == 'alphabetical' ? (
            <IconSortAscendingLetters style={{ width: rem(16) }} strokeWidth={1.5} />
          ) : (
            <IconSortDescendingLetters style={{ width: rem(16) }} strokeWidth={1.5} />
          )}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};
