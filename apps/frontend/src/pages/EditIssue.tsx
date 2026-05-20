import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useIssueStore } from '../store/issueStore';
import { useAuthStore } from '../store/authStore';
import { isIssueOwner } from '../utils/issueOwnership';
import { IssueStatus } from '../types/issue.types';
import IssueForm from '../components/issues/IssueForm';
import PageHeader from '../components/layout/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import Button from '../components/common/Button';
import Icon from '../components/common/Icon';

interface EditFormData {
  title: string;
  description: string;
  status?: IssueStatus;
  priority: string;
  severity: string;
}

export default function EditIssue() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedIssue, loading, error, fetchIssueById, updateIssue, clearError, clearSelectedIssue } = useIssueStore();
  const [pendingSubmit, setPendingSubmit] = useState<EditFormData | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (id) fetchIssueById(id);
    return () => clearSelectedIssue();
  }, [id, fetchIssueById, clearSelectedIssue]);

  useEffect(() => {
    if (selectedIssue && user && !isIssueOwner(selectedIssue, user._id) && id) {
      navigate(`/issues/${id}`, { replace: true });
    }
  }, [selectedIssue, user, id, navigate]);

  const applySubmit = async (data: EditFormData) => {
    if (!id) return;
    clearError();
    setSubmitLoading(true);
    try {
      await updateIssue(id, data as Parameters<typeof updateIssue>[1]);
      navigate(`/issues/${id}`);
    } catch {
      // Error handled by store
    } finally {
      setSubmitLoading(false);
      setPendingSubmit(null);
    }
  };

  const handleSubmit = async (data: EditFormData) => {
    const newStatus = data.status;
    const currentStatus = selectedIssue?.status;
    const needsConfirmation =
      (newStatus === 'Resolved' || newStatus === 'Closed') &&
      newStatus !== currentStatus;

    if (needsConfirmation) {
      setPendingSubmit(data);
      return;
    }

    await applySubmit(data);
  };

  if (loading && !selectedIssue) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  if (!loading && !selectedIssue) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl">
        <EmptyState
          title={error === 'Issue not found' ? 'Issue not found' : 'Failed to load issue'}
          description={error || 'The issue could not be loaded. It may have been deleted or the link is invalid.'}
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/issues">
                <Button variant="secondary">Back to Issues</Button>
              </Link>
              {id && (
                <Button onClick={() => { clearError(); fetchIssueById(id); }}>
                  Try again
                </Button>
              )}
            </div>
          }
        />
      </div>
    );
  }

  if (selectedIssue && !isIssueOwner(selectedIssue, user?._id)) {
    return <LoadingSpinner className="py-20" size="lg" />;
  }

  const pendingStatus = pendingSubmit?.status;

  return (
    <div>
      <PageHeader
        title="Edit Issue"
        description="Update the issue details"
      />

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-2xl">
        <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600">
              <Icon name="edit" className="text-xl" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Edit Issue</h2>
              <p className="text-xs text-gray-500">Modify the fields below and save your changes</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <IssueForm
            initialData={{
              title: selectedIssue.title,
              description: selectedIssue.description,
              status: selectedIssue.status,
              priority: selectedIssue.priority,
              severity: selectedIssue.severity,
            }}
            showStatus
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/issues/${id}`)}
            loading={loading || submitLoading}
            submitLabel="Update Issue"
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={!!pendingStatus}
        title={`${pendingStatus} Issue`}
        message={`Are you sure you want to mark this issue as "${pendingStatus}"?`}
        confirmLabel={`Yes, ${pendingStatus === 'Resolved' ? 'Resolve' : 'Close'}`}
        variant="primary"
        loading={submitLoading}
        onConfirm={() => pendingSubmit && applySubmit(pendingSubmit)}
        onCancel={() => setPendingSubmit(null)}
      />
    </div>
  );
}
