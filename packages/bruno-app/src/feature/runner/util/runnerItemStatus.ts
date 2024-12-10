/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { RunnerResultItem } from '../types/runner';

// This converts the internal status into a Status for the UI
// Also checks tests & assertions
export default function runnerItemStatus(item: RunnerResultItem): 'passed' | 'failed' | 'running' | 'delayed' {
  switch (item.status) {
    case 'delayed':
      return 'delayed';
    case 'running':
    case 'queued':
      return 'running';
    case 'error':
      return 'failed';
    case 'completed':
      const hasFailedTests = item.testResults?.some((result) => result.status === 'fail');
      if (hasFailedTests) {
        return 'failed';
      }

      const hasFailedAssertions = item.assertionResults?.some((result) => result.status === 'fail');
      if (hasFailedAssertions) {
        return 'failed';
      }

      return 'passed';
    default:
      throw new Error(`Unknown case ${item.status} of item.status in "runnerItemStatus"`);
  }
}
