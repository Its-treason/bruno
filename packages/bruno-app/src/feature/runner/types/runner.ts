/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
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
  testResults?: TestResult[];
  timeline?: any[];
  timings?: Record<string, number>;
  requestSent: any;
  debug?: any;
  assertionResults?: RunnerAssertion[];
};

export type RunnerResponse = {
  duration: number;
  headers: Record<string, string[]>;
  size: number;
  status: number;
  statusText: string;
};

export type RunnerAssertion = {
  lhsExpr: string;
  operator: string;
  rhsExpr: string;
  status: 'pass' | 'fail';
  uid: string;
};

export type TestResult = {
  description: string;
  status: 'pass' | 'fail';
  uid: string;
};
