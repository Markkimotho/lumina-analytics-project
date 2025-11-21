import * as ss from 'simple-statistics';
import { Dataset, NumericSummary, CorrelationResult, DataPoint } from '../types';

export const calculateNumericSummary = (dataset: Dataset): NumericSummary[] => {
  const summaries: NumericSummary[] = [];

  dataset.numericColumns.forEach(col => {
    // Extract valid numbers
    const values = dataset.data
      .map(row => Number(row[col]))
      .filter(val => !isNaN(val) && val !== null);

    if (values.length === 0) {
      summaries.push({
        column: col,
        min: 0, max: 0, mean: 0, median: 0, stdDev: 0, q1: 0, q3: 0,
        nullCount: dataset.data.length
      });
      return;
    }

    summaries.push({
      column: col,
      min: ss.min(values),
      max: ss.max(values),
      mean: ss.mean(values),
      median: ss.median(values),
      stdDev: ss.standardDeviation(values),
      q1: ss.quantile(values, 0.25),
      q3: ss.quantile(values, 0.75),
      nullCount: dataset.data.length - values.length
    });
  });

  return summaries;
};

export const calculateCorrelations = (dataset: Dataset): CorrelationResult[] => {
  const results: CorrelationResult[] = [];
  const cols = dataset.numericColumns;

  for (let i = 0; i < cols.length; i++) {
    for (let j = i + 1; j < cols.length; j++) {
      const col1 = cols[i];
      const col2 = cols[j];

      // Get paired values where both are numeric
      const pairs = dataset.data
        .map(row => [Number(row[col1]), Number(row[col2])])
        .filter(pair => !isNaN(pair[0]) && !isNaN(pair[1]));

      if (pairs.length > 5) {
        const val1 = pairs.map(p => p[0]);
        const val2 = pairs.map(p => p[1]);
        const correlation = ss.sampleCorrelation(val1, val2);
        
        results.push({
          col1,
          col2,
          correlation: isNaN(correlation) ? 0 : correlation
        });
      }
    }
  }

  return results;
};

// Helper to get histogram data
export const getHistogramData = (dataset: Dataset, column: string, bins: number = 10) => {
  const values = dataset.data
    .map(row => Number(row[column]))
    .filter(val => !isNaN(val));

  if (values.length === 0) return [];

  const min = ss.min(values);
  const max = ss.max(values);
  const step = (max - min) / bins;
  
  // Create buckets
  const buckets = Array(bins).fill(0).map((_, i) => ({
    range: `${(min + i * step).toFixed(1)} - ${(min + (i + 1) * step).toFixed(1)}`,
    count: 0,
    min: min + i * step,
    max: min + (i + 1) * step
  }));

  values.forEach(v => {
    const bucketIndex = Math.min(Math.floor((v - min) / step), bins - 1);
    if (bucketIndex >= 0) buckets[bucketIndex].count++;
  });

  return buckets;
};