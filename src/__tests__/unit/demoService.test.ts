// src/__tests__/unit/demoService.test.ts

import { describe, it, expect } from 'vitest';
import { generateDemoReport } from '../../services/demoService';

describe('Demo Service', () => {
  it('generates a report with correct structure', () => {
    const report = generateDemoReport('test keyword', 'USA');

    expect(report).toHaveProperty('industry');
    expect(report).toHaveProperty('totalAnalyzed');
    expect(report).toHaveProperty('overallSentiment');
    expect(report).toHaveProperty('sentimentBreakdown');
    expect(report).toHaveProperty('gaps');
    expect(report).toHaveProperty('competitors');
    expect(report).toHaveProperty('marketTrends');
    expect(report).toHaveProperty('summary');
  });

  it('includes keyword in industry name', () => {
    const report = generateDemoReport('ergonomic chairs', 'USA');

    expect(report.industry.toLowerCase()).toContain('ergonomic');
  });

  it('includes geography in summary', () => {
    const report = generateDemoReport('test', 'Canada');

    expect(report.summary).toContain('Canada');
  });

  it('generates exactly 3 sample gaps', () => {
    const report = generateDemoReport('test', 'USA');

    expect(report.gaps.length).toBe(3);
  });

  it('generates exactly 5 competitors', () => {
    const report = generateDemoReport('test', 'USA');

    expect(report.competitors.length).toBe(5);
  });

  it('generates exactly 5 years of trend data', () => {
    const report = generateDemoReport('test', 'USA');

    expect(report.marketTrends.length).toBe(5);
  });

  it('does not include source names like Reddit or YouTube in summary', () => {
    const report = generateDemoReport('test', 'USA');

    expect(report.summary.toLowerCase()).not.toContain('reddit');
    expect(report.summary.toLowerCase()).not.toContain('youtube');
  });

  it('has valid sentiment breakdown that adds to 100', () => {
    const report = generateDemoReport('test', 'USA');

    const total = 
      report.sentimentBreakdown.positive + 
      report.sentimentBreakdown.neutral + 
      report.sentimentBreakdown.negative;

    expect(total).toBe(100);
  });
});