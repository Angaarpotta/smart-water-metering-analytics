/**
 * Anomaly Detection Engine
 * Implements Z-score and rolling-average based leakage detection
 * to flag unusual consumption patterns in smart meter data.
 */

/**
 * Calculate mean of an array of numbers.
 */
export function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

/**
 * Calculate standard deviation.
 */
export function stdDev(arr) {
  const m = mean(arr);
  const variance = arr.reduce((s, v) => s + Math.pow(v - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

/**
 * Compute Z-score for a single value against a reference dataset.
 * @param {number} value - The observation to score
 * @param {number[]} reference - Reference population
 * @returns {number} Z-score (positive = above mean)
 */
export function zScore(value, reference) {
  const m = mean(reference);
  const sd = stdDev(reference);
  if (sd === 0) return 0;
  return (value - m) / sd;
}

/**
 * Classify severity based on Z-score magnitude.
 */
export function classifySeverity(absZ) {
  if (absZ >= 4.0) return 'Critical';
  if (absZ >= 3.0) return 'High';
  if (absZ >= 2.5) return 'Medium';
  return 'Low';
}

/**
 * Compute rolling average for a time-series array.
 * @param {number[]} values - Ordered time-series values
 * @param {number} window - Rolling window size
 * @returns {number[]} Rolling averages (same length, NaN for insufficient window)
 */
export function rollingAvg(values, window = 7) {
  return values.map((_, i) => {
    if (i < window - 1) return null;
    const slice = values.slice(i - window + 1, i + 1);
    return parseFloat(mean(slice).toFixed(2));
  });
}

/**
 * Detect anomalies in a time series using Z-score method.
 * Returns flagged indices with severity and Z-score.
 * @param {number[]} values - Consumption time-series
 * @param {number} threshold - Z-score threshold for flagging (default: 2.5)
 */
export function detectAnomalies(values, threshold = 2.5) {
  const m = mean(values);
  const sd = stdDev(values);
  return values.map((v, i) => {
    const z = sd === 0 ? 0 : (v - m) / sd;
    const absZ = Math.abs(z);
    return {
      index: i,
      value: v,
      zScore: parseFloat(z.toFixed(2)),
      isAnomaly: absZ >= threshold,
      severity: absZ >= threshold ? classifySeverity(absZ) : null,
    };
  });
}

/**
 * Generate a simulated 90-day consumption time-series with embedded anomalies
 * for a given meter, for demonstration in the Leakage Analysis page.
 */
export function generateConsumptionTimeSeries(meterId, days = 90) {
  // Deterministic seeded random per meter
  let seed = meterId.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  const baseConsumption = 120 + rand() * 60; // 120–180 L/day baseline
  const values = [];
  const startDate = new Date(2026, 3, 1);

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + d);

    let consumption = baseConsumption + (rand() - 0.5) * 30;

    // Seed a leakage event around day 25–35
    if (d >= 25 && d <= 40 && rand() < 0.6) {
      consumption += 80 + rand() * 120; // sustained spike
    }

    // Occasional overnight burst
    if (rand() < 0.05) {
      consumption += 50 + rand() * 100;
    }

    values.push({
      date: date.toISOString().split('T')[0],
      consumption: parseFloat(Math.max(0, consumption).toFixed(1)),
    });
  }

  const rawValues = values.map(v => v.consumption);
  const anomalies = detectAnomalies(rawValues);
  const rolling = rollingAvg(rawValues);

  return values.map((v, i) => ({
    ...v,
    rollingAvg: rolling[i],
    zScore: anomalies[i].zScore,
    isAnomaly: anomalies[i].isAnomaly,
    severity: anomalies[i].severity,
  }));
}

/**
 * Summarise leakage event statistics by zone and severity.
 */
export function summariseLeakageByZone(events) {
  const summary = {};
  events.forEach(e => {
    if (!summary[e.zone]) {
      summary[e.zone] = { zone: e.zone, total: 0, critical: 0, high: 0, medium: 0, low: 0, totalVolume: 0 };
    }
    summary[e.zone].total++;
    summary[e.zone][e.severity.toLowerCase()]++;
    summary[e.zone].totalVolume += e.estimatedVolumeLitres;
  });
  return Object.values(summary).map(s => ({
    ...s,
    totalVolume: parseFloat(s.totalVolume.toFixed(0)),
  }));
}
