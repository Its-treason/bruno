import { writeFileSync } from 'node:fs';
import { Response } from '../../types';
import { stringify } from 'lossless-json';
import { get } from '@usebruno/query';

const res = Symbol('internalResponse');

export class BrunoResponse {
  private [res]: Response;

  constructor(
    response: Response,
    public body: any
  ) {
    this[res] = response;

    // Make the instance callable
    const callable = (path: string, ...fns: any[]) => get(this.body, path, fns);
    Object.setPrototypeOf(callable, this.constructor.prototype);
    Object.assign(callable, this);
    // @ts-expect-error This is a hack to make BrunoResponse callable
    return callable;
  }

  get status() {
    return this.getStatus();
  }
  getStatus(): number {
    return this[res].statusCode;
  }

  getHeader(name: string): string | undefined {
    const header = this[res].headers[name];

    return Array.isArray(header) ? header[0] : header;
  }

  get headers() {
    return this.getHeaders();
  }
  getHeaders() {
    return Object.entries(this[res].headers).reduce(
      (acc, [name, value]) => {
        acc[name] = Array.isArray(value) ? value[0] : value;
        return acc;
      },
      {} as Record<string, string | undefined>
    );
  }

  getBody() {
    return this.body;
  }

  get responseTime() {
    return this.getResponseTime();
  }
  getResponseTime() {
    return this[res].responseTime;
  }

  setBody(newBody: unknown) {
    this.body = newBody;

    // Write the new Body to disk
    let stringifiedBody: string;
    if (typeof newBody !== 'string') {
      stringifiedBody = stringify(newBody) as string;
    } else {
      stringifiedBody = newBody;
    }

    writeFileSync(this[res].path, stringifiedBody);
  }
}
