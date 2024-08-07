import { IconFilter, IconX } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { debounce } from 'lodash';

const QueryResultFilter = ({ onChange, mode }) => {
  const inputRef = useRef(null);
  const [isExpanded, toggleExpand] = useState(false);

  const handleFilterClick = () => {
    // Toggle filter search bar
    toggleExpand(!isExpanded);
    // Reset filter search input
    onChange({ target: { value: '' } });
    // Reset input value
    if (inputRef?.current) {
      inputRef.current.value = '';
    }
  };

  const tooltipText = useMemo(() => {
    if (mode.includes('json')) {
      return 'Filter with JSONPath';
    }

    if (mode.includes('xml')) {
      return 'Filter with XPath';
    }

    return null;
  }, [mode]);

  const placeholderText = useMemo(() => {
    if (mode.includes('json')) {
      return '$.store.books..author';
    }

    if (mode.includes('xml')) {
      return '/store/books//author';
    }

    return null;
  }, [mode]);

  const debouncedOnChange = debounce((e) => {
    onChange(e.target.value);
  }, 250);

  return (
    <div
      className={
        'response-filter absolute bottom-2 w-full justify-end right-0 flex flex-row items-center gap-2 py-4 px-2 pointer-events-none'
      }
    >
      {tooltipText && !isExpanded && (
        <ReactTooltip anchorId={'request-filter-icon'} html={tooltipText} className="z-50" />
      )}
      <input
        ref={inputRef}
        type="text"
        name="response-filter"
        id="response-filter"
        placeholder={placeholderText}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onChange={debouncedOnChange}
        className={`block ml-14 p-2 py-1 sm:text-sm transition-all duration-200 ease-in-out border border-gray-300 rounded-md z-50 ${
          isExpanded ? 'w-full opacity-100 pointer-events-auto' : 'w-[0] opacity-0'
        }`}
      />
      <div
        className="text-gray-500 sm:text-sm cursor-pointer pointer-events-auto z-50"
        id="request-filter-icon"
        onClick={handleFilterClick}
      >
        {isExpanded ? <IconX size={20} strokeWidth={1.5} /> : <IconFilter size={20} strokeWidth={1.5} />}
      </div>
    </div>
  );
};

export default QueryResultFilter;
