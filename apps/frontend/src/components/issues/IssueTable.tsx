import { Link } from 'react-router-dom';
import { Issue } from '../../types/issue.types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import SeverityBadge from './SeverityBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatDate';

interface IssueTableProps {
  issues: Issue[];
  showOwnerActions?: boolean;
  canModify?: (issue: Issue) => boolean;
}

export default function IssueTable({
  issues,
  showOwnerActions = false,
  canModify,
}: IssueTableProps) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Priority</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Severity</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
            {showOwnerActions && (
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => {
            const editable = canModify?.(issue) ?? false;
            return (
            <tr key={issue._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link
                  to={`/issues/${issue._id}`}
                  className="text-gray-900 font-medium hover:text-indigo-600 transition-colors"
                >
                  {issue.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={issue.status} />
              </td>
              <td className="px-4 py-3">
                <PriorityBadge priority={issue.priority} />
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={issue.severity} />
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">
                {formatDate(issue.createdAt)}
              </td>
              {showOwnerActions && (
                <td className="px-4 py-3 text-right">
                  {editable ? (
                    <div className="flex justify-end gap-2">
                      <Link to={`/issues/${issue._id}/edit`}>
                        <Button variant="secondary" size="sm">Edit</Button>
                      </Link>
                      <Link to={`/issues/${issue._id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  ) : (
                    <Link to={`/issues/${issue._id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  )}
                </td>
              )}
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}
