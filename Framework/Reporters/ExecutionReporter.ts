import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { mkdirSync, writeFileSync } from 'node:fs';

export default class ExecutionReporter implements Reporter {
  private results: Array<{ outcome: string; [key: string]: unknown }> = [];
  onTestEnd(test: TestCase, result: TestResult) {
    const blocked = result.status !== 'passed' && result.errors.some(error => error.message?.includes('[PRECONDICION:'));
    this.results.push({ id: test.id, title: test.titlePath(), status: result.status,
      outcome: blocked ? 'blocked' : result.status,
      expectedStatus: test.expectedStatus, durationMs: result.duration, retry: result.retry,
      errors: result.errors.map(error => error.message), annotations: test.annotations });
  }
  onEnd(result: FullResult) {
    const finalResults = [...new Map(this.results.map(entry => [entry.id, entry] as const)).values()];
    mkdirSync('Workspace/Reportes/json', { recursive: true });
    writeFileSync('Workspace/Reportes/json/execution.json', JSON.stringify({
      status: result.status, startedAt: result.startTime, durationMs: result.duration, tests: finalResults,
      attempts: this.results,
      summary: {
        total: finalResults.length,
        attempts: this.results.length,
        passed: finalResults.filter(test => test.outcome === 'passed').length,
        blocked: finalResults.filter(test => test.outcome === 'blocked').length,
        failed: finalResults.filter(test => ['failed', 'timedOut'].includes(test.outcome)).length,
        skipped: finalResults.filter(test => test.outcome === 'skipped').length,
      },
    }, null, 2));
  }
}
