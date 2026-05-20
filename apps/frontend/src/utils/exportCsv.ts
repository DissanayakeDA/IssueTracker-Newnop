import { Issue } from '../types/issue.types';

export function exportIssuesToCsv(issues: Issue[], filename = 'issues.csv') {
  const headers = ['Title', 'Status', 'Priority', 'Severity', 'Created At', 'Updated At'];

  const rows = issues.map((issue) => [
    `"${issue.title.replace(/"/g, '""')}"`,
    issue.status,
    issue.priority,
    issue.severity,
    new Date(issue.createdAt).toLocaleDateString(),
    new Date(issue.updatedAt).toLocaleDateString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
