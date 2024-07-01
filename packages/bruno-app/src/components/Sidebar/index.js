import TitleBar from './TitleBar';
import Collections from './Collections';
import StyledWrapper from './StyledWrapper';
import Preferences from 'components/Preferences';
import Cookies from 'components/Cookies';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconSettings, IconCookie } from '@tabler/icons-react';
import { ActionIcon, Group, Tooltip, rem } from '@mantine/core';
import { updateLeftSidebarWidth, updateIsDragging, showPreferences } from 'providers/ReduxStore/slices/app';

const MIN_LEFT_SIDEBAR_WIDTH = 221;
const MAX_LEFT_SIDEBAR_WIDTH = 600;

const Sidebar = () => {
  const leftSidebarWidth = useSelector((state) => state.app.leftSidebarWidth);
  const preferencesOpen = useSelector((state) => state.app.showPreferences);

  const [asideWidth, setAsideWidth] = useState(leftSidebarWidth);
  const [cookiesOpen, setCookiesOpen] = useState(false);

  const dispatch = useDispatch();
  const [dragging, setDragging] = useState(false);

  const handleMouseMove = (e) => {
    if (dragging) {
      e.preventDefault();
      let width = e.clientX + 2;
      if (width < MIN_LEFT_SIDEBAR_WIDTH || width > MAX_LEFT_SIDEBAR_WIDTH) {
        return;
      }
      setAsideWidth(width);
    }
  };
  const handleMouseUp = (e) => {
    if (dragging) {
      e.preventDefault();
      setDragging(false);
      dispatch(
        updateLeftSidebarWidth({
          leftSidebarWidth: asideWidth
        })
      );
      dispatch(
        updateIsDragging({
          isDragging: false
        })
      );
    }
  };
  const handleDragbarMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    dispatch(
      updateIsDragging({
        isDragging: true
      })
    );
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [dragging, asideWidth]);

  useEffect(() => {
    setAsideWidth(leftSidebarWidth);
  }, [leftSidebarWidth]);

  return (
    <StyledWrapper className="flex relative h-screen">
      <aside>
        <div className="flex flex-row h-screen w-full">
          {preferencesOpen && <Preferences onClose={() => dispatch(showPreferences(false))} />}
          {cookiesOpen && <Cookies onClose={() => setCookiesOpen(false)} />}

          <div className="flex flex-col w-full" style={{ width: asideWidth }}>
            <div className="flex flex-col flex-grow">
              <TitleBar />
              <Collections />
            </div>

            <Group p={'xs'} justify="space-between">
              <ActionIcon.Group mr={'auto'}>
                <Tooltip label="Preferences" openDelay={250}>
                  <ActionIcon
                    variant="default"
                    size={'md'}
                    aria-label={'Preferences'}
                    onClick={() => dispatch(showPreferences(true))}
                  >
                    <IconSettings style={{ width: rem(16) }} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Cookies" openDelay={250}>
                  <ActionIcon variant="default" size={'md'} aria-label={'cookies'} onClick={() => setCookiesOpen(true)}>
                    <IconCookie style={{ width: rem(16) }} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              </ActionIcon.Group>

              <div className="text-xs">v1.20.0-lazer</div>
            </Group>
          </div>
        </div>
      </aside>
      <div className="absolute drag-sidebar h-full" onMouseDown={handleDragbarMouseDown}>
        <div className="drag-request-border" />
      </div>
    </StyledWrapper>
  );
};

export default Sidebar;
