/*
 * This file is part of bruno-electron.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { utilityProcess, app, MessageChannelMain, MessagePortMain, UtilityProcess } from 'electron';
import path from 'path';
import { WorkerTaskPayloads, WorkerTaskResult } from './types';
import { randomUUID } from 'node:crypto';

app.whenReady().then(() => {
  // Create the worker process
  const _ = WorkerManager.getInstance();
});

// WorkerManager is a singleton. There must only be one active worker process active.
export class WorkerManager {
  private static instance: WorkerManager;
  static getInstance() {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  private port2: MessagePortMain;
  private child: UtilityProcess;

  private taskMap: Map<string, { resolve: (value: any) => void; reject: (error: any) => void }> = new Map();

  private constructor() {
    const { port1, port2 } = new MessageChannelMain();
    const child = utilityProcess.fork(path.join(__dirname + '/entrypoint.js'), [], {
      serviceName: 'Bruno lazer worker'
    });

    this.port2 = port2;
    this.child = child;

    child.postMessage('message', [port1]);
    port2.on('message', (message) => {
      const data = message.data as WorkerTaskResult<any>;

      const { reject, resolve } = this.taskMap.get(data.id)!;

      if (data.success) {
        resolve(data.result);
      } else {
        reject(data.error);
      }
      this.taskMap.delete(data.id);
    });
    port2.start();
  }

  private addTask<T>(payload: WorkerTaskPayloads): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = randomUUID();

      this.taskMap.set(id, { reject, resolve });

      this.port2.postMessage({
        id,
        ...payload
      });
    });
  }

  public format(data: string, parser: string) {
    return this.addTask<string>({
      type: 'prettier',
      payload: {
        data,
        parser
      }
    });
  }

  public kill() {
    this.child.kill();
  }
}
