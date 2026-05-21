import { Issue } from '../types/issue.types';

/** ISO-like local datetime without commas — safe for Excel CSV import. */
function formatCsvDateTime(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + ' ' + [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(':');
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportIssuesToCsv(issues: Issue[], filename = 'issues.csv') {
  const headers = ['Title', 'Status', 'Priority', 'Severity', 'Created At', 'Updated At'];

  const rows = issues.map((issue) => [
    issue.title,
    issue.status,
    issue.priority,
    issue.severity,
    formatCsvDateTime(issue.createdAt),
    formatCsvDateTime(issue.updatedAt),
  ].map(escapeCsvField));

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
