import { useNavigate } from 'react-router-dom';
import { useIssueStore } from '../store/issueStore';
import IssueForm from '../components/issues/IssueForm';
import Icon from '../components/common/Icon';

export default function CreateIssue() {
  const navigate = useNavigate();
  const { createIssue, loading, error, clearError } = useIssueStore();

  const handleSubmit = async (data: { title: string; description: string; priority: string; severity: string }) => {
    clearError();
    try {
      const issue = await createIssue(data as Parameters<typeof createIssue>[0]);
      navigate(`/issues/${issue._id}`);
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main form panel ── */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <Icon name="cancel" className="text-xl text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600">
                  <Icon name="add_circle" className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Create Issue</h2>
                  <p className="text-sm text-gray-500">Report a new issue to track</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <IssueForm
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
                loading={loading}
                submitLabel="Create Issue"
              />
            </div>
          </div>
        </div>

        {/* ── Guidelines sidebar ── */}
        <div className="hidden lg:block space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Icon name="lightbulb" className="text-xl text-indigo-500" />
              Writing Tips
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                Use a clear, concise title that summarizes the problem
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                Include steps to reproduce in the description
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                Mention the expected vs. actual behavior
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                Add browser/device info if relevant
              </li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Icon name="bar_chart" className="text-xl text-amber-500" />
              Priority Guide
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span><strong className="text-gray-700">Low</strong> — Minor inconvenience, workaround exists</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span><strong className="text-gray-700">Medium</strong> — Noticeable impact, should fix soon</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                <span><strong className="text-gray-700">High</strong> — Blocks key workflows</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span><strong className="text-gray-700">Critical</strong> — System down, data at risk</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
