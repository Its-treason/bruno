import { writeFileSync } from 'node:fs';
import { Response } from '../../types';
import { stringify } from 'lossless-json';

export class BrunoResponse {
  constructor(private _res: Response, public body: any) {}

  get status() {
    return this.getStatus();
  }
  getStatus(): number {
    return this._res.statusCode;
  }

  getHeader(name: string): string | undefined {
    const header = this._res.headers[name];

    return Array.isArray(header) ? header[0] : header;
  }

  get headers() {
    return this.getHeaders();
  }
  getHeaders() {
    return Object.entries(this._res.headers).reduce((acc, [name, value]) => {
      acc[name] = Array.isArray(value) ? value[0] : value;
      return acc;
    }, {} as Record<string, string | undefined>);
  }

  getBody() {
    return this.body;
  }

  get responseTime() {
    return this.getResponseTime();
  }
  getResponseTime() {
    return this._res.responseTime;
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

    writeFileSync(this._res.path, stringifiedBody);
  }
}
