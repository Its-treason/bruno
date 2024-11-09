import { cleanJson } from './runtime/utils';

type Logs = { title: string; data: unknown; date: number }[];
type LogStages = { stage: string; logs: Logs };

export class DebugLogger {
  private logs: LogStages[] = [];

  public log(title: string, data?: unknown): void {
    // CleanJson everything, so it loses its reference and can be send over ipc without any problem
    const log = cleanJson({ title, data, date: Date.now() });
    this.logs[this.logs.length - 1].logs.push(log);
  }

  public addStage(stage: string): void {
    this.logs.push({ stage, logs: [] });
  }

  getClean() {
    return this.logs;
  }
}
