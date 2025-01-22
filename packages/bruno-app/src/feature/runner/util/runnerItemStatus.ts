/**
 * This file is part of bruno-app.
 * For license information, see the file LICENSE_GPL3 at the root directory of this distribution.
 */
import { Response } from 'src/store/responseStore';

// This converts the internal status into a Status for the UI
// Also checks tests & assertions
export default function runnerItemStatus(item: Response): 'passed' | 'failed' | 'running' | 'delayed' | 'skipped' {
  switch (item.requestState) {
    case 'delayed':
      return 'delayed';
    case 'skipped':
      return 'skipped';
    case 'queued':
    case 'sending':
      return 'running';
    case 'cancelled':
      return 'failed';
    case 'received':
      if (item.error) {
        return 'failed';
      }

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
