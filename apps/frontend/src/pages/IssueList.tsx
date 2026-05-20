import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIssueStore } from '../store/issueStore';
import { useAuthStore } from '../store/authStore';
import { isIssueOwner } from '../utils/issueOwnership';
import { issueApi } from '../api/issueApi';
import PageHeader from '../components/layout/PageHeader';
import FilterBar from '../components/issues/FilterBar';
import IssueTable from '../components/issues/IssueTable';
import IssueCard from '../components/issues/IssueCard';
import Pagination from '../components/issues/Pagination';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { exportIssuesToCsv } from '../utils/exportCsv';

interface IssueListProps {
  mineOnly?: boolean;
}

export default function IssueList({ mineOnly = false }: IssueListProps) {
  const { user } = useAuthStore();
  const {
    issues,
    loading,
    filters,
    pagination,
    fetchIssues,
    setFilters,
    setPage,
    setListScope,
    listScope,
  } = useIssueStore();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    setListScope(mineOnly ? 'mine' : 'all');
  }, [mineOnly, setListScope]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues, filters, pagination.page, listScope]);

  const handleClearFilters = () => {
    setFilters({ search: '', status: '', priority: '' });
  };

  const handleExportCsv = async () => {
    setExportError(null);
    setExporting(true);
    try {
      const params: Record<string, string | boolean> = {};
      if (listScope === 'mine') params.mine = true;
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;

      const allIssues = await issueApi.fetchAllFilteredIssues(params);
      if (allIssues.length === 0) {
        setExportError('No issues to export for the current filters.');
        return;
      }
      exportIssuesToCsv(allIssues);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setExportError(error.message || 'Failed to export issues');
    } finally {
      setExporting(false);
    }
  };

  const canExport = pagination.total > 0 || issues.length > 0;

  return (
    <div>
      <PageHeader
        title={mineOnly ? 'My Issues' : 'All Issues'}
        description={
          mineOnly
            ? 'Issues you have created'
            : 'Browse all issues from every user'
        }
        action={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCsv}
              disabled={!canExport || exporting}
              loading={exporting}
            >
              Export CSV
            </Button>
            <Link to="/issues/create">
              <Button size="sm">New Issue</Button>
            </Link>
          </div>
        }
      />

      {exportError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {exportError}
        </div>
      )}

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onClear={handleClearFilters}
      />

      {loading ? (
        <LoadingSpinner className="py-12" />
      ) : issues.length === 0 ? (
        <EmptyState
          title="No issues found"
          description={
            filters.search || filters.status || filters.priority
              ? 'Try adjusting your filters to find what you are looking for.'
              : mineOnly
                ? 'You have not created any issues yet.'
                : 'No issues have been created yet.'
          }
          action={
            <Link to="/issues/create">
              <Button size="sm">Create Issue</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <IssueTable
              issues={issues}
              showOwnerActions={mineOnly}
              canModify={(issue) => isIssueOwner(issue, user?._id)}
            />
          </div>
          <div className="md:hidden grid gap-3">
            {issues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                showOwnerActions={mineOnly}
                canModify={isIssueOwner(issue, user?._id)}
              />
            ))}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
