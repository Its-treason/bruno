import { parse } from 'lossless-json';
import { RequestItem } from '../../types';
import decomment from 'decomment';

export class BrunoRequest {
  constructor(private _req: RequestItem, private readonly: boolean, private executionMode: string) {}

  get url() {
    return this.getUrl();
  }
  getUrl() {
    return this._req.request.url;
  }
  set url(newUrl: string) {
    this.setUrl(newUrl);
  }
  setUrl(url: string) {
    if (this.readonly) {
      throw new Error('Cannot update "url" request is readonly');
    }
    this._req.request.url = url;
  }

  get method() {
    return this.getMethod();
  }
  getMethod() {
    return this._req.request.method;
  }
  set method(newMethod: string) {
    this.setMethod(newMethod);
  }
  setMethod(method: string) {
    if (this.readonly) {
      throw new Error('Cannot update "method" request is readonly');
    }
    this._req.request.method = method;
  }

  get headers() {
    return this.getHeaders();
  }
  getHeaders(): Record<string, string> {
    const rawHeaders = this._req.request.headers;

    return rawHeaders.reduce((acc, curr) => {
      if (curr.enabled) {
        acc[curr.name] = acc.value;
      }
      return acc;
    }, {} as Record<string, string>);
  }
  setHeaders(headers: Record<string, string>) {
    if (this.readonly) {
      throw new Error('Cannot update "headers" request is readonly');
    }
    this._req.request.headers = Object.entries(headers).map(([name, value]) => {
      return {
        name,
        value,
        enabled: true
      };
    });
  }

  getHeader(name: string): string | null {
    const header = this._req.request.headers.find((header) => header.name.toLowerCase() === name.toLowerCase());
    return header?.value ?? null;
  }
  setHeader(name: string, value: string) {
    if (this.readonly) {
      throw new Error('Cannot update "header" request is readonly');
    }
    const newHeader = {
      name,
      value,
      enabled: true
    };

    const index = this._req.request.headers.findIndex((header) => header.name.toLowerCase() === name.toLowerCase());
    if (index === -1) {
      this._req.request.headers.push(newHeader);
      return;
    }
    this._req.request.headers[index] = newHeader;
  }

  get body() {
    return this.getBody();
  }
  getBody() {
    switch (this._req.request.body.mode) {
      case 'text':
        return this._req.request.body.text;
      case 'sparql':
        return this._req.request.body.sparql;
      case 'multipartForm':
        return this._req.request.body.multipartForm;
      case 'xml':
        return this._req.request.body.xml;
      case 'formUrlEncoded':
        return this._req.request.body.formUrlEncoded;
      case 'json':
        if (typeof this._req.request.body.json === 'string') {
          try {
            return parse(decomment(this._req.request.body.json, { tolerant: true }));
          } catch {}
        }
        return this._req.request.body.json;
    }
  }
  setBody(data: any) {
    if (this.readonly) {
      throw new Error('Cannot update "body" request is readonly');
    }
    switch (this._req.request.body.mode) {
      case 'text':
        this._req.request.body.text = data;
        break;
      case 'sparql':
        this._req.request.body.sparql = data;
        break;
      case 'multipartForm':
        this._req.request.body.multipartForm = data;
        break;
      case 'xml':
        this._req.request.body.xml = data;
        break;
      case 'formUrlEncoded':
        this._req.request.body.formUrlEncoded = data;
        break;
      case 'json':
        this._req.request.body.json = data;
        break;
    }
  }

  get authMode() {
    return this.getAuthMode();
  }
  getAuthMode() {
    return this._req.request.auth.mode;
  }

  setMaxRedirects(maxRedirects: number) {
    if (this.readonly) {
      throw new Error('Cannot update "maxRedirects" request is readonly');
    }
    this._req.request.maxRedirects = maxRedirects;
  }

  get timeout() {
    return this.getTimeout();
  }
  getTimeout(): number {
    return this._req.request.timeout;
  }
  set timeout(newTimeout: number) {
    this.setTimeout(newTimeout);
  }
  setTimeout(timeout: number) {
    if (this.readonly) {
      throw new Error('Cannot update "timeout" request is readonly');
    }
    this._req.request.timeout = timeout;
  }

  disableParsingResponseJson() {
    // This method is only for compatibly purpose with Bruno
    // Lazer handles Response parsing correctly, so no need to disable it here
  }

  getExecutionMode() {
    return this.executionMode;
  }
}
