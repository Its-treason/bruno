import { CollectionSchema, RequestItemSchema } from '@usebruno/schema';
import { BodyEditor } from './BodyEditor';
import { BodyMode } from './BodyMode';
import classes from './BodyPane.module.scss';

type BodyProps = {
  item: RequestItemSchema;
  collection: CollectionSchema;
};

export const Body: React.FC<BodyProps> = ({ item, collection }) => {
  return (
    <div className={classes.wrapper}>
      <BodyMode item={item} collection={collection} />
      <div>
        <BodyEditor item={item} collection={collection} />
      </div>
    </div>
  );
};
