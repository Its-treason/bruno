import { subscribe, getEventsSince, writeSnapshot, AsyncSubscription, Event } from '@parcel/watcher';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export class Watcher {
  private subscription: AsyncSubscription | null = null;
  private lastSnapshotPath: string | null = null;

  constructor(
    private dir: string,
    private ignore: string[], // GlobPattern or FilePath
    private tmpDir: string,
    private callback: (events: Event[]) => void,
    private errCallback: (err: Error) => void
  ) {}

  public async start() {
    this.subscription = await subscribe(
      this.dir,
      (err, events) => {
        if (err) {
          this.errCallback(err);
        }
        this.callback(events);
      },
      {
        ignore: this.ignore
      }
    );
  }

  public async suspend() {
    this.lastSnapshotPath = path.join(this.tmpDir, `parcel_snapshot_${randomUUID()}`);
    await writeSnapshot(this.dir, this.lastSnapshotPath, { ignore: this.ignore });

    await this.subscription?.unsubscribe();
  }

  public async resume() {
    if (!this.lastSnapshotPath) {
      throw new Error('No "lastSnapshotPath" set! Call suspend() first.');
    }

    const events = await getEventsSince(this.dir, this.lastSnapshotPath, { ignore: this.ignore });
    this.callback(events);
    this.lastSnapshotPath = null;

    await this.start();
  }
}
