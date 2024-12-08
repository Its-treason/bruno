export type RunnerConfig = {
  path?: string;
  delay?: number;
  recursive: boolean;
};

export type RunnerResult = {
  info: RunnerInfo;
  items: RunnerResultItem[];
};

export type RunnerInfo = {
  cancelTokenUid: string;
  collectionUid: string;
  folderUid: string;
  isRecursive: boolean;
  status: 'started' | 'ended';
};

export type RunnerResultItem = {
  error?: string;
  status: 'delayed' | 'queued' | 'running' | 'completed' | 'error';
  uid: string; // Id of the request
  responseReceived: RunnerResponse;
  testResults?: any[];
  timeline?: any[];
  timings?: Record<string, number>;
  requestSent: any;
  debug?: any;
  assertionResults?: any[];
};

export type RunnerResponse = {
  duration: number;
  headers: Record<string, string[]>;
  size: number;
  status: number;
  statusText: string;
};

export type RunnerAsertion = {
  lhsExpr: string;
  operator: string;
  rhsExpr: string;
  status: 'pass' | 'fail';
  uid: string;
};
