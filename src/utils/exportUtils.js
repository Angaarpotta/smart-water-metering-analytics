/**
 * Export Utilities
 * Handles CSV export and print-ready report generation.
 */

/**
 * Convert an array of objects to CSV string.
 * @param {Object[]} data - Array of flat objects
 * @param {string[]} [columns] - Optional column order (defaults to object keys)
 * @returns {string} CSV string
 */
export function toCSV(data, columns = null) {
  if (!data || data.length === 0) return '';

  const cols = columns || Object.keys(data[0]);
  const header = cols.join(',');
  const rows = data.map(row =>
    cols.map(col => {
      const val = row[col] ?? '';
      const str = String(val);
      // Quote fields containing commas, quotes, or newlines
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 * @param {string} csvContent - CSV string
 * @param {string} filename - Download filename (without extension)
 */
export function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export KPI data as CSV.
 */
export function exportKpiHistory(history) {
  const csv = toCSV(history);
  downloadCSV(csv, `KPI_History_${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Export leakage events as CSV.
 */
export function exportLeakageEvents(events) {
  const csv = toCSV(events);
  downloadCSV(csv, `Leakage_Events_${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Export regulatory metrics as CSV (MOSL-formatted).
 */
export function exportMoslSubmission(metrics) {
  const formatted = metrics.map(m => ({
    'Metric Code': m.metric.split(' - ')[0],
    'Metric Description': m.metric.split(' - ')[1] || m.metric,
    'Reporting Period': new Date().toISOString().slice(0, 7),
    'Actual Value': m.value,
    'Target Value': m.target,
    'Unit': m.unit,
    'Compliance Status': m.status,
    'Submitted By': 'Smart Metering Analytics Platform',
    'Submission Date': new Date().toISOString().slice(0, 10),
  }));
  const csv = toCSV(formatted);
  downloadCSV(csv, `MOSL_Submission_${new Date().toISOString().slice(0, 7)}`);
}

/**
 * Export data quality issues as CSV.
 */
export function exportDataQuality(issues) {
  const csv = toCSV(issues);
  downloadCSV(csv, `Data_Quality_Report_${new Date().toISOString().slice(0, 10)}`);
}

/**
 * Trigger browser print for a clean report view.
 */
export function printReport(title) {
  const originalTitle = document.title;
  document.title = title;
  window.print();
  document.title = originalTitle;
}

/**
 * Format a number to a given number of decimal places with commas.
 */
export function formatNumber(n, decimals = 1) {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en-GB', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a date string to UK format (DD/MM/YYYY).
 */
export function formatDateUK(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB');
}
