import { ReactNode } from 'react';

interface EmptyStateProps {
  illustration?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ illustration, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {illustration && (
        <img src={illustration} alt={title} className="w-48 h-48 mb-6 opacity-90" />
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
