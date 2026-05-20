import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIssueStore } from '../store/issueStore';
import { useAuthStore } from '../store/authStore';
import { isIssueOwner } from '../utils/issueOwnership';
import { IssueStatus } from '../types/issue.types';
import StatusBadge from '../components/issues/StatusBadge';
import PriorityBadge from '../components/issues/PriorityBadge';
import SeverityBadge from '../components/issues/SeverityBadge';
import Button from '../components/common/Button';
import StatusSelect from '../components/issues/StatusSelect';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { formatDateTime } from '../utils/formatDate';

export default function IssueDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedIssue,
    loading,
    error,
    fetchIssueById,
    deleteIssue,
    updateIssueStatus,
    clearSelectedIssue,
    clearError,
  } = useIssueStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<IssueStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) fetchIssueById(id);
    return () => clearSelectedIssue();
  }, [id, fetchIssueById, clearSelectedIssue]);

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await deleteIssue(id);
      navigate('/issues');
    } catch {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = (status: IssueStatus) => {
    if (!id || status === selectedIssue?.status) return;
    if (status === 'Resolved' || status === 'Closed') {
      setPendingStatus(status);
      return;
    }
    applyStatusChange(status);
  };

  const applyStatusChange = async (status: IssueStatus) => {
    if (!id) return;
    setStatusLoading(true);
    try {
      await updateIssueStatus(id, status);
    } finally {
      setStatusLoading(false);
      setPendingStatus(null);
    }
  };

  if (loading) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  if (error || !selectedIssue) {
    const isNotFound = error === 'Issue not found';
    return (
      <div>
        <div className="mb-6">
          <Link to="/issues" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            &larr; Back to Issues
          </Link>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            title={isNotFound ? 'Issue not found' : 'Failed to load issue'}
            description={
              error ||
              'The issue could not be loaded. It may have been deleted or the link is invalid.'
            }
            action={
              <div className="flex flex-wrap justify-center gap-3">
                <Link to="/issues">
                  <Button variant="secondary">Back to Issues</Button>
                </Link>
                {id && (
                  <Button
                    onClick={() => {
                      clearError();
                      fetchIssueById(id);
                    }}
                  >
                    Try again
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </div>
    );
  }

  const ownsIssue = isIssueOwner(selectedIssue, user?._id);

  return (
    <div>
      <div className="mb-6">
        <Link to="/issues" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
          &larr; Back to Issues
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">{selectedIssue.title}</h1>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={selectedIssue.status} />
              <PriorityBadge priority={selectedIssue.priority} />
              <SeverityBadge severity={selectedIssue.severity} />
            </div>
          </div>
          {ownsIssue && (
            <div className="flex flex-wrap gap-2">
              <Link to={`/issues/${id}/edit`}>
                <Button variant="secondary" size="sm">Edit</Button>
              </Link>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                Delete
              </Button>
            </div>
          )}
        </div>

        {ownsIssue && (
          <div className="border-t border-gray-100 pt-4 mb-4">
            <StatusSelect
              label="Change status"
              value={selectedIssue.status}
              disabled={statusLoading}
              onChange={handleStatusChange}
            />
          </div>
        )}

        <div className="border-t border-gray-100 pt-4">
          <h2 className="text-sm font-medium text-gray-700 mb-2">Description</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedIssue.description}</p>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Created</p>
            <p className="text-sm text-gray-700">{formatDateTime(selectedIssue.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="text-sm text-gray-700">{formatDateTime(selectedIssue.updatedAt)}</p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Issue"
        message="Are you sure you want to delete this issue? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmModal
        isOpen={!!pendingStatus}
        title={`${pendingStatus} Issue`}
        message={`Are you sure you want to mark this issue as "${pendingStatus}"?`}
        confirmLabel={`Yes, ${pendingStatus === 'Resolved' ? 'Resolve' : 'Close'}`}
        variant="primary"
        loading={statusLoading}
        onConfirm={() => pendingStatus && applyStatusChange(pendingStatus)}
        onCancel={() => setPendingStatus(null)}
      />

    </div>
  );
}
