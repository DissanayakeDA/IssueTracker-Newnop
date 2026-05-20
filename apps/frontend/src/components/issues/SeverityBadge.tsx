import { IssueSeverity } from '../../types/issue.types';

interface SeverityBadgeProps {
  severity: IssueSeverity;
}

const severityConfig: Record<IssueSeverity, { bg: string; text: string }> = {
  Minor: { bg: 'bg-slate-50', text: 'text-slate-600' },
  Major: { bg: 'bg-orange-50', text: 'text-orange-700' },
  Critical: { bg: 'bg-red-50', text: 'text-red-700' },
};

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {severity}
    </span>
  );
}
