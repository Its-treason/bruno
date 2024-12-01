/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { parentPort } from 'process';
import { WorkerTask, WorkerTaskResult } from './types';
import { format } from 'prettier';

parentPort.on('message', (evt) => {
  const [port] = evt.ports;

  port.addListener('message', (evt) => {
    const task = evt.data as WorkerTask;

    handleTask(task)
      .then((result) => {
        port.postMessage({ success: true, result, id: task.id } satisfies WorkerTaskResult<any>);
      })
      .catch((error) => {
        port.postMessage({ success: false, error, id: task.id } satisfies WorkerTaskResult<any>);
      });
  });
  port.start();
});

async function handleTask(task: WorkerTask): Promise<any> {
  switch (task.type) {
    case 'prettier':
      return await format(task.payload.data, { parser: task.payload.parser });
  }

  throw new Error(`Unknown task type: ${task.type}`);
}
