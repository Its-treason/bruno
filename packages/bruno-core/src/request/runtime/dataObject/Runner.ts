import { RunnerContext } from '../../dataObject/RunnerContext';

const ctx = Symbol('internal');

export class Runner {
  private readonly [ctx]: RunnerContext;
  constructor(context: RunnerContext) {
    this[ctx] = context;
  }

  public setNextRequest(nextRequestName: string): void {
    this[ctx].setNextRequest(nextRequestName);
  }

  public skipRequest(): void {
    this[ctx].skipThisRequest();
  }

  public stopExecution(): void {
    this[ctx].stopRunnerExecution();
  }
}
