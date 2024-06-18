/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { SidebarActionProvider } from 'src/feature/sidebar-menu';
import { BottomButtons } from './BottomButtons';
import { RequestList } from './RequestList/RequestList';
import { ResizableSidebarBox } from './ResizableSidebarBox';
import { TopPanel } from './TopPanel';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CollectionFilter } from './CollectionFilter';

export const Sidebar: React.FC = ({}) => {
  return (
    <ResizableSidebarBox>
      <TopPanel />
      <div>
        <CollectionFilter />
        <SidebarActionProvider>
          <DndProvider backend={HTML5Backend}>
            <RequestList />
          </DndProvider>
        </SidebarActionProvider>
      </div>
      <BottomButtons />
    </ResizableSidebarBox>
  );
};
