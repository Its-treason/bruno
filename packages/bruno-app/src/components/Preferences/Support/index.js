import React from 'react';
import { IconSpeakerphone, IconBrandDiscord } from '@tabler/icons-react';
import StyledWrapper from './StyledWrapper';

const Support = () => {
  return (
    <StyledWrapper>
      <div className="rows">
        <div className="mt-2">
          <a href="https://github.com/its-treason/bruno/issues" target="_blank" className="flex items-end">
            <IconSpeakerphone size={18} strokeWidth={2} />
            <span className="label ml-2">Report issue</span>
          </a>
        </div>
        <div className="mt-2">
          <a href="https://discord.gg/GTj7QYWPur" target="_blank" className="flex items-end">
            <IconBrandDiscord size={18} strokeWidth={2} />
            <span className="label ml-2">Discord</span>
          </a>
        </div>
      </div>
    </StyledWrapper>
  );
};

export default Support;
