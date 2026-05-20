import { IssueStatus } from '../../types/issue.types';

interface StatusBadgeProps {
  status: IssueStatus;
}

const statusConfig: Record<IssueStatus, { bg: string; text: string }> = {
  Open: { bg: 'bg-blue-50', text: 'text-blue-700' },
  'In Progress': { bg: 'bg-amber-50', text: 'text-amber-700' },
  Resolved: { bg: 'bg-green-50', text: 'text-green-700' },
  Closed: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status}
    </span>
  );
}
