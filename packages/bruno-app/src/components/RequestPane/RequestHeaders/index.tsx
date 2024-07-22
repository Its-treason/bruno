/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import React, { useState } from 'react';
import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { BulkEditEditor } from './BulkEditEditor';
import { HeaderTable } from './HeaderTable';

type RequestHeadersProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const RequestHeaders: React.FC<RequestHeadersProps> = ({ item, collection }) => {
  const [bulkEdit, setBulkEdit] = useState(false);

  return bulkEdit ? (
    <BulkEditEditor
      collection={collection}
      item={item}
      onUpdateMode={() => setBulkEdit(false)}
    />
  ) : (
    <HeaderTable
      collection={collection}
      item={item}
      onUpdateMode={() => setBulkEdit(true)}
    />
  )
};
