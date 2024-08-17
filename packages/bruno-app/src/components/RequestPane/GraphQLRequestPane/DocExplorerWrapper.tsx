import { DocExplorer } from '@usebruno/graphql-docs';
import { createPortal } from 'react-dom';
import classes from './DocExplorerWrapper.module.scss';

type DocExplorerWrapperProps = {
  schema: any;
  opened: boolean;
  onClose: () => void;
};

export const DocExplorerWrapper: React.FC<DocExplorerWrapperProps> = ({ onClose, opened, schema }) => {
  if (!opened) {
    return null;
  }

  return createPortal(
    <div className={classes.container}>
      <DocExplorer schema={schema}>
        <button className="mr-2" onClick={onClose} aria-label="Close Documentation Explorer">
          {'\u2715'}
        </button>
      </DocExplorer>
    </div>,
    document.body
  );
};
