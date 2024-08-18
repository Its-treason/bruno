import React from 'react';
import get from 'lodash/get';
import VarsTable from './VarsTable';
import StyledWrapper from './StyledWrapper';

const Vars = ({ item, collection }) => {
  const requestVars = item.draft ? get(item, 'draft.request.vars.req') : get(item, 'request.vars.req');
  const responseVars = item.draft ? get(item, 'draft.request.vars.res') : get(item, 'request.vars.res');

  return (
    <StyledWrapper className="w-full flex flex-col">
      <h3 className="my-2 title text-xs">Pre Request</h3>
      <VarsTable item={item} collection={collection} vars={requestVars} varType="request" />
      <h3 className="my-2 title text-xs">Post Response</h3>
      <VarsTable item={item} collection={collection} vars={responseVars} varType="response" />
    </StyledWrapper>
  );
};

export default Vars;
