import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { BodyEditor } from './BodyEditor';
import { BodyMode } from './BodyMode';
import classes from './BodyPane.module.scss';

type BodyPaneProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const BodyPane: React.FC<BodyPaneProps> = ({ item, collection }) => {
  return (
    <div className={classes.wrapper}>
      <BodyMode item={item} collection={collection} />
      <div>
        <BodyEditor item={item} collection={collection} />
      </div>
    </div>
  );
};
