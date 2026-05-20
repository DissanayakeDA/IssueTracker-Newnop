import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useIssueStore } from '../store/issueStore';
import StatusCountCard from '../components/issues/StatusCountCard';
import IssueCard from '../components/issues/IssueCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { recentIssues, stats, recentLoading, fetchRecentIssues, fetchStats } = useIssueStore();

  useEffect(() => {
    fetchStats();
    fetchRecentIssues();
  }, [fetchStats, fetchRecentIssues]);

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white rounded-xl p-6 border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here&apos;s an overview of your issue tracker
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCountCard label="Open" count={stats.Open} color="blue" />
        <StatusCountCard label="In Progress" count={stats['In Progress']} color="amber" />
        <StatusCountCard label="Resolved" count={stats.Resolved} color="green" />
        <StatusCountCard label="Closed" count={stats.Closed} color="gray" />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
        <div className="flex gap-3">
          <Link to="/issues">
            <Button variant="secondary" size="sm">View All</Button>
          </Link>
          <Link to="/issues/create">
            <Button size="sm">Create Issue</Button>
          </Link>
        </div>
      </div>

      {recentLoading ? (
        <LoadingSpinner className="py-12" />
      ) : recentIssues.length === 0 ? (
        <EmptyState
          title="No issues yet"
          description="Create your first issue to get started."
          action={
            <Link to="/issues/create">
              <Button size="sm">Create Issue</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentIssues.map((issue) => (
            <IssueCard key={issue._id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
