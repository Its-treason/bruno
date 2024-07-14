/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import classes from './RequestMethodIcon.module.css';
import {
  IconHttpDelete,
  IconHttpGet,
  IconHttpHead,
  IconHttpOptions,
  IconHttpPatch,
  IconHttpPost,
  IconHttpPut,
  IconSend
} from '@tabler/icons-react';

type RequestMethodIconProps = {
  method: string;
};

export const RequestMethodIcon: React.FC<RequestMethodIconProps> = ({ method }) => {
  switch (method) {
    case 'GET':
      return <IconHttpGet className={classes.icon} color="var(--mantine-color-lime-7)" />;
    case 'POST':
      return <IconHttpPost className={classes.icon} color="var(--mantine-color-grape-7)" />;
    case 'PUT':
      return <IconHttpPut className={classes.icon} color="var(--mantine-color-teal-7)" />;
    case 'DELETE':
      return <IconHttpDelete className={classes.icon} color="var(--mantine-color-red-7)" />;
    case 'PATCH':
      return <IconHttpPatch className={classes.icon} color="var(--mantine-color-yellow-7)" />;
    case 'OPTIONS':
      return <IconHttpOptions className={classes.icon} color="var(--mantine-color-cyan-7)" />;
    case 'HEAD':
      return <IconHttpHead className={classes.icon} color="var(--mantine-color-pink-7)" />;
    default:
      return <IconSend className={classes.icon} />;
  }
};
