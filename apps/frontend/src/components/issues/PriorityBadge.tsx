import { IssuePriority } from '../../types/issue.types';

interface PriorityBadgeProps {
  priority: IssuePriority;
}

const priorityConfig: Record<IssuePriority, { bg: string; text: string }> = {
  Low: { bg: 'bg-green-50', text: 'text-green-700' },
  Medium: { bg: 'bg-blue-50', text: 'text-blue-700' },
  High: { bg: 'bg-orange-50', text: 'text-orange-700' },
  Critical: { bg: 'bg-red-50', text: 'text-red-700' },
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {priority}
    </span>
  );
}
