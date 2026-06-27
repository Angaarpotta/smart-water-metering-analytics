/**
 * KPI Calculator Utility
 * Computes derived KPIs, trends, and RAG (Red/Amber/Green) statuses
 * from raw meter and performance data.
 */

/**
 * Determine RAG status for a KPI value vs its targets.
 * @param {number} value - Current value
 * @param {number} internal - Internal target
 * @param {number|null} regulatory - Regulatory threshold (stricter)
 * @param {boolean} lowerIsBetter - If true, lower values are better (e.g. leakage)
 */
export function ragStatus(value, internal, regulatory = null, lowerIsBetter = false) {
  const primaryTarget = regulatory ?? internal;

  if (lowerIsBetter) {
    if (value <= primaryTarget * 0.9) return 'green';
    if (value <= primaryTarget) return 'amber';
    return 'red';
  } else {
    if (value >= primaryTarget) return 'green';
    if (value >= primaryTarget * 0.97) return 'amber';
    return 'red';
  }
}

/**
 * Calculate month-over-month trend percentage.
 */
export function calcTrend(history, field) {
  if (history.length < 2) return 0;
  const current = history[history.length - 1][field];
  const previous = history[history.length - 2][field];
  if (previous === 0) return 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}

/**
 * Get rolling 3-month average for a KPI field.
 */
export function rollingAverage(history, field, window = 3) {
  if (history.length < window) return null;
  const slice = history.slice(-window);
  return parseFloat((slice.reduce((sum, r) => sum + r[field], 0) / window).toFixed(1));
}

/**
 * Summarise the most recent KPI snapshot with targets, trends, and RAG status.
 */
export function buildKpiSummary(history, targets) {
  if (!history || history.length === 0) return [];

  const latest = history[history.length - 1];

  return [
    {
      id: 'readRate',
      label: 'Meter Read Rate',
      value: latest.readRate,
      unit: '%',
      target: targets.readRate.internal,
      regulatoryTarget: targets.readRate.ofwat,
      trend: calcTrend(history, 'readRate'),
      rag: ragStatus(latest.readRate, targets.readRate.internal, targets.readRate.ofwat),
      description: 'Percentage of expected meter reads successfully received',
      category: 'Operational',
    },
    {
      id: 'dataCompleteness',
      label: 'Data Completeness',
      value: latest.dataCompleteness,
      unit: '%',
      target: targets.dataCompleteness.internal,
      regulatoryTarget: targets.dataCompleteness.ofwat,
      trend: calcTrend(history, 'dataCompleteness'),
      rag: ragStatus(latest.dataCompleteness, targets.dataCompleteness.internal, targets.dataCompleteness.ofwat),
      description: 'Proportion of meter records with complete, valid data',
      category: 'Data Quality',
    },
    {
      id: 'timelySubmission',
      label: 'Timely Submission',
      value: latest.timelySubmission,
      unit: '%',
      target: targets.timelySubmission.internal,
      regulatoryTarget: targets.timelySubmission.mosl,
      trend: calcTrend(history, 'timelySubmission'),
      rag: ragStatus(latest.timelySubmission, targets.timelySubmission.internal, targets.timelySubmission.mosl),
      description: 'Reads submitted to MOSL within SLA window',
      category: 'Regulatory',
    },
    {
      id: 'moslScore',
      label: 'MOSL Score',
      value: latest.moslScore,
      unit: '',
      target: targets.moslScore.internal,
      regulatoryTarget: targets.moslScore.mosl,
      trend: calcTrend(history, 'moslScore'),
      rag: ragStatus(latest.moslScore, targets.moslScore.internal, targets.moslScore.mosl),
      description: 'Overall MOSL performance index score',
      category: 'Regulatory',
    },
    {
      id: 'activeAlerts',
      label: 'Active Alerts',
      value: latest.activeAlerts,
      unit: '',
      target: targets.activeAlerts.internal,
      regulatoryTarget: null,
      trend: calcTrend(history, 'activeAlerts'),
      rag: ragStatus(latest.activeAlerts, targets.activeAlerts.internal, null, true),
      description: 'Open anomaly/leakage alerts requiring action',
      category: 'Operational',
      lowerIsBetter: true,
    },
    {
      id: 'rolloutPercent',
      label: 'Rollout Progress',
      value: latest.rolloutPercent,
      unit: '%',
      target: targets.rolloutPercent.internal,
      regulatoryTarget: targets.rolloutPercent.ofwat,
      trend: calcTrend(history, 'rolloutPercent'),
      rag: ragStatus(latest.rolloutPercent, targets.rolloutPercent.internal, targets.rolloutPercent.ofwat),
      description: 'Smart meter installation programme completion',
      category: 'Programme',
    },
    {
      id: 'avgDailyConsumption',
      label: 'Avg. Daily Consumption',
      value: latest.avgDailyConsumption,
      unit: 'L/p/d',
      target: targets.avgDailyConsumption.internal,
      regulatoryTarget: targets.avgDailyConsumption.ofwat,
      trend: calcTrend(history, 'avgDailyConsumption'),
      rag: ragStatus(latest.avgDailyConsumption, targets.avgDailyConsumption.internal, targets.avgDailyConsumption.ofwat, true),
      description: 'Average per-capita daily water consumption (litres)',
      category: 'Environmental',
      lowerIsBetter: true,
    },
    {
      id: 'leakageEventsDetected',
      label: 'Leakage Events',
      value: latest.leakageEventsDetected,
      unit: '',
      target: null,
      regulatoryTarget: null,
      trend: calcTrend(history, 'leakageEventsDetected'),
      rag: 'blue',
      description: 'Leakage anomaly events detected this month',
      category: 'Leakage',
    },
  ];
}
