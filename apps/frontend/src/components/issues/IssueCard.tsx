import { Link } from 'react-router-dom';
import { Issue } from '../../types/issue.types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatDate';

interface IssueCardProps {
  issue: Issue;
  showOwnerActions?: boolean;
  canModify?: boolean;
}

export default function IssueCard({
  issue,
  showOwnerActions = false,
  canModify = false,
}: IssueCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <Link to={`/issues/${issue._id}`} className="block">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{issue.title}</h3>
        <PriorityBadge priority={issue.priority} />
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{issue.description}</p>
      <div className="flex items-center justify-between">
        <StatusBadge status={issue.status} />
        <span className="text-xs text-gray-400">{formatDate(issue.createdAt)}</span>
      </div>
      </Link>
      {showOwnerActions && canModify && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <Link to={`/issues/${issue._id}/edit`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">Edit</Button>
          </Link>
          <Link to={`/issues/${issue._id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full">View</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
