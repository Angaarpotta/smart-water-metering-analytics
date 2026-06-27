/**
 * Mock Data Generator
 * Generates realistic synthetic smart meter data for the analytics platform.
 * Covers 500 properties, 12 months of hourly readings, leakage events, and KPI history.
 */

const ZONES = ['Zone A - Brighton', 'Zone B - Worthing', 'Zone C - Chichester', 'Zone D - Eastbourne', 'Zone E - Hastings'];
const PROPERTY_TYPES = ['Residential', 'Commercial', 'Industrial'];
const DATA_SOURCES = ['AMS Provider', 'SOC Direct', 'Manual Entry'];
const METER_STATUSES = ['Active', 'Active', 'Active', 'Active', 'Comms Fault', 'Low Battery', 'Tamper Alert'];

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function randomBetween(rng, min, max) {
  return min + rng() * (max - min);
}

function randomChoice(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

// ────────────────────────────────────────────────────────────────────────────────
// METER REGISTRY (500 properties)
// ────────────────────────────────────────────────────────────────────────────────
export function generateMeterRegistry() {
  const rng = seededRandom(42);
  const meters = [];
  for (let i = 1; i <= 500; i++) {
    const zone = randomChoice(rng, ZONES);
    const type = randomChoice(rng, PROPERTY_TYPES);
    const status = randomChoice(rng, METER_STATUSES);
    const installDate = new Date(2023, Math.floor(rng() * 12), Math.floor(rng() * 28) + 1);
    meters.push({
      meterId: `SW${String(i).padStart(5, '0')}`,
      zone,
      propertyType: type,
      status,
      source: randomChoice(rng, DATA_SOURCES),
      installDate: installDate.toISOString().split('T')[0],
      latitude: randomBetween(rng, 50.7, 51.0),
      longitude: randomBetween(rng, -0.8, 0.6),
    });
  }
  return meters;
}

// ────────────────────────────────────────────────────────────────────────────────
// MONTHLY KPI HISTORY (24 months)
// ────────────────────────────────────────────────────────────────────────────────
export function generateKpiHistory() {
  const rng = seededRandom(99);
  const history = [];
  const startDate = new Date(2024, 6, 1); // July 2024

  for (let m = 0; m < 24; m++) {
    const date = new Date(startDate);
    date.setMonth(startDate.getMonth() + m);

    // Simulate gradual improvement over time
    const trend = m / 24;
    const readRate = Math.min(99.5, 82 + trend * 14 + randomBetween(rng, -1.5, 1.5));
    const dataCompleteness = Math.min(99.8, 85 + trend * 12 + randomBetween(rng, -1, 1));
    const timely = Math.min(99, 78 + trend * 18 + randomBetween(rng, -2, 2));
    const activeAlerts = Math.floor(Math.max(2, 45 - trend * 38 + randomBetween(rng, -3, 5)));
    const leakageDetected = Math.floor(randomBetween(rng, 3, 18));
    const moslScore = Math.min(100, 70 + trend * 25 + randomBetween(rng, -2, 2));
    const rolloutPct = Math.min(100, 35 + trend * 62);

    history.push({
      period: date.toISOString().split('T')[0].slice(0, 7),
      readRate: parseFloat(readRate.toFixed(1)),
      dataCompleteness: parseFloat(dataCompleteness.toFixed(1)),
      timelySubmission: parseFloat(timely.toFixed(1)),
      activeAlerts,
      leakageEventsDetected: leakageDetected,
      moslScore: parseFloat(moslScore.toFixed(1)),
      rolloutPercent: parseFloat(rolloutPct.toFixed(1)),
      metersInstalled: Math.floor(500 * (rolloutPct / 100)),
      avgDailyConsumption: parseFloat(randomBetween(rng, 118, 145).toFixed(1)),
    });
  }
  return history;
}

// ────────────────────────────────────────────────────────────────────────────────
// KPI TARGETS (regulatory & internal)
// ────────────────────────────────────────────────────────────────────────────────
export function generateKpiTargets() {
  return {
    readRate: { internal: 95, ofwat: 97, mosl: 96 },
    dataCompleteness: { internal: 95, ofwat: 98, mosl: 97 },
    timelySubmission: { internal: 95, ofwat: 98, mosl: 95 },
    moslScore: { internal: 90, ofwat: null, mosl: 85 },
    rolloutPercent: { internal: 100, ofwat: 100, mosl: null },
    activeAlerts: { internal: 10, ofwat: null, mosl: null }, // target: below this
    avgDailyConsumption: { internal: 130, ofwat: 110, mosl: null }, // target: below (litres/person/day)
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// LEAKAGE / ANOMALY EVENTS
// ────────────────────────────────────────────────────────────────────────────────
export function generateLeakageEvents() {
  const rng = seededRandom(77);
  const meters = generateMeterRegistry();
  const events = [];
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'Open', 'In Progress', 'Resolved'];
  const types = [
    'Sustained High Flow',
    'Overnight Usage Spike',
    'Zero Read Anomaly',
    'Reverse Flow Detected',
    'Consumption > 3σ Baseline',
    'Step Change in Daily Profile',
  ];

  for (let i = 0; i < 120; i++) {
    const meter = randomChoice(rng, meters);
    const eventDate = new Date(2025, Math.floor(rng() * 12), Math.floor(rng() * 28) + 1);
    const severity = randomChoice(rng, severities);
    const volumeLost = severity === 'Critical' ? randomBetween(rng, 200, 600)
      : severity === 'High' ? randomBetween(rng, 80, 200)
        : severity === 'Medium' ? randomBetween(rng, 30, 80)
          : randomBetween(rng, 5, 30);

    events.push({
      eventId: `LEK${String(i + 1).padStart(4, '0')}`,
      meterId: meter.meterId,
      zone: meter.zone,
      detectionDate: eventDate.toISOString().split('T')[0],
      type: randomChoice(rng, types),
      severity,
      status: randomChoice(rng, statuses),
      estimatedVolumeLitres: parseFloat(volumeLost.toFixed(0)),
      zScore: parseFloat(randomBetween(rng, 2.1, 6.5).toFixed(2)),
      daysActive: Math.floor(randomBetween(rng, 1, 45)),
    });
  }
  return events.sort((a, b) => new Date(b.detectionDate) - new Date(a.detectionDate));
}

// ────────────────────────────────────────────────────────────────────────────────
// DATA QUALITY ISSUES
// ────────────────────────────────────────────────────────────────────────────────
export function generateDataQualityIssues() {
  const rng = seededRandom(55);
  const meters = generateMeterRegistry();
  const issues = [];
  const issueTypes = [
    { type: 'Missing Read', description: 'No reading received for expected period', severity: 'Medium' },
    { type: 'Out-of-Range Value', description: 'Reading exceeds physical meter capacity', severity: 'High' },
    { type: 'Duplicate Record', description: 'Identical timestamp and meter ID submitted twice', severity: 'Low' },
    { type: 'Null Meter ID', description: 'Record received with no meter identifier', severity: 'High' },
    { type: 'Future Timestamp', description: 'Read timestamp is in the future', severity: 'Medium' },
    { type: 'Negative Consumption', description: 'Calculated consumption is negative (counter regression)', severity: 'High' },
    { type: 'Stale Data', description: 'Reading more than 48h old when received', severity: 'Low' },
  ];

  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
    '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12'];

  for (let i = 0; i < 80; i++) {
    const meter = randomChoice(rng, meters);
    const issue = randomChoice(rng, issueTypes);
    const month = randomChoice(rng, months);
    issues.push({
      issueId: `DQ${String(i + 1).padStart(4, '0')}`,
      meterId: meter.meterId,
      zone: meter.zone,
      source: meter.source,
      period: month,
      ...issue,
      recordsAffected: Math.floor(randomBetween(rng, 1, 250)),
      resolved: rng() > 0.4,
    });
  }
  return issues;
}

// ────────────────────────────────────────────────────────────────────────────────
// ZONE PERFORMANCE SUMMARY (for heatmap)
// ────────────────────────────────────────────────────────────────────────────────
export function generateZonePerformance() {
  const rng = seededRandom(33);
  return ZONES.map(zone => ({
    zone,
    readRate: parseFloat(randomBetween(rng, 88, 99).toFixed(1)),
    activeMeters: Math.floor(randomBetween(rng, 70, 130)),
    leakageEvents: Math.floor(randomBetween(rng, 5, 30)),
    avgConsumption: parseFloat(randomBetween(rng, 110, 155).toFixed(1)),
    dataQualityScore: parseFloat(randomBetween(rng, 85, 99).toFixed(1)),
    alertsOpen: Math.floor(randomBetween(rng, 0, 12)),
  }));
}

// ────────────────────────────────────────────────────────────────────────────────
// REGULATORY SUBMISSION DATA
// ────────────────────────────────────────────────────────────────────────────────
export function generateRegulatoryData() {
  const rng = seededRandom(11);

  const moslMetrics = [
    { metric: 'PR1 - Meter Read Rate', value: 96.4, target: 96, unit: '%', status: 'Compliant' },
    { metric: 'PR2 - Data Completeness', value: 97.1, target: 97, unit: '%', status: 'Compliant' },
    { metric: 'PR3 - Timely Submission', value: 94.8, target: 95, unit: '%', status: 'Non-Compliant' },
    { metric: 'PR4 - Billing Accuracy', value: 99.2, target: 99, unit: '%', status: 'Compliant' },
    { metric: 'PR5 - Data Quality Score', value: 88.3, target: 85, unit: 'Score', status: 'Compliant' },
    { metric: 'PR6 - Fault Resolution (days)', value: 4.2, target: 5, unit: 'days', status: 'Compliant' },
  ];

  const ofwatMetrics = [
    { metric: 'C-MEx Smart Meter Satisfaction', value: 82, target: 80, unit: 'score', status: 'Compliant' },
    { metric: 'Per Capita Consumption (PCC)', value: 127, target: 140, unit: 'L/p/d', status: 'Compliant', lowerIsBetter: true },
    { metric: 'Leakage (Ml/d)', value: 68.4, target: 75, unit: 'Ml/d', status: 'Compliant', lowerIsBetter: true },
    { metric: 'Smart Meter Penetration', value: 97.2, target: 100, unit: '%', status: 'On Track' },
    { metric: 'Void Properties Data', value: 91.4, target: 90, unit: '%', status: 'Compliant' },
  ];

  const waterUkMetrics = [
    { metric: 'Smart Meter Rollout Progress', value: 97.2, target: 100, unit: '%', status: 'On Track' },
    { metric: 'Industry Data Quality Benchmark', value: 92.1, target: 90, unit: 'score', status: 'Above Benchmark' },
    { metric: 'Customer Satisfaction (Smart Meters)', value: 7.8, target: 7.5, unit: '/10', status: 'Above Target' },
  ];

  const submissionHistory = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(2025, i, 15);
    submissionHistory.push({
      period: date.toISOString().slice(0, 7),
      mosl: { submitted: true, onTime: rng() > 0.1, records: Math.floor(randomBetween(rng, 45000, 65000)) },
      ofwat: { submitted: i % 3 === 2, onTime: true, records: i % 3 === 2 ? Math.floor(randomBetween(rng, 5, 15)) : null },
      waterUk: { submitted: i % 6 === 5, onTime: true, records: i % 6 === 5 ? 12 : null },
    });
  }

  return { moslMetrics, ofwatMetrics, waterUkMetrics, submissionHistory };
}

// ────────────────────────────────────────────────────────────────────────────────
// DAILY READ VOLUME (last 90 days for time-series)
// ────────────────────────────────────────────────────────────────────────────────
export function generateDailyReadVolume() {
  const rng = seededRandom(66);
  const data = [];
  const startDate = new Date(2026, 3, 1); // April 1 2026

  for (let d = 0; d < 90; d++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + d);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Weekend dip in automated reads
    const base = isWeekend ? 470 : 492;
    const reads = Math.floor(base + randomBetween(rng, -15, 15));
    const expected = 500;
    const rate = parseFloat(((reads / expected) * 100).toFixed(1));

    data.push({
      date: date.toISOString().split('T')[0],
      readsReceived: reads,
      expectedReads: expected,
      readRate: rate,
      amsReads: Math.floor(reads * 0.72),
      socReads: Math.floor(reads * 0.22),
      manualReads: reads - Math.floor(reads * 0.72) - Math.floor(reads * 0.22),
    });
  }
  return data;
}
