// This is the internal context. Scripts use the "Runner" class inside `runtime/dataObject`.
export class RunnerContext {
  private nextRequest?: string;
  private stopExecution = false;
  private skipRequest = false;

  public getNextRequest() {
    return this.nextRequest;
  }
  public setNextRequest(nextRequest: string) {
    this.nextRequest = nextRequest;
  }

  public mustStopExecution() {
    return this.stopExecution;
  }
  public stopRunnerExecution() {
    this.stopExecution = false;
  }

  // This will only be checked after the pre-request-script
  public shouldSkipRequest() {
    return this.skipRequest;
  }
  public skipThisRequest() {
    this.stopExecution = false;
  }
}
