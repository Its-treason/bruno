/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
export type WorkerTask = {
  id: string;
} & WorkerTaskPayloads;

export type WorkerTaskPayloads = PrettierWorkerPayload;

export type PrettierWorkerPayload = {
  type: 'prettier';
  payload: {
    parser: string;
    data: string;
  };
};

export type WorkerTaskResult<T> =
  | {
      id: string;
      success: true;
      result: T;
    }
  | {
      id: string;
      success: false;
      error: Error;
    };
