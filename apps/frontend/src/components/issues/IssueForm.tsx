import { useState, FormEvent } from 'react';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import Button from '../common/Button';
import { IssuePriority, IssueSeverity, IssueStatus } from '../../types/issue.types';

interface IssueFormData {
  title: string;
  description: string;
  status?: IssueStatus;
  priority: IssuePriority;
  severity: IssueSeverity;
}

interface IssueFormProps {
  initialData?: IssueFormData;
  showStatus?: boolean;
  loading?: boolean;
  onSubmit: (data: IssueFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const priorityConfig: { value: IssuePriority; label: string; dot: string; activeBg: string; activeBorder: string; activeText: string }[] = [
  { value: 'Low',      label: 'Low',      dot: 'bg-emerald-500', activeBg: 'bg-emerald-50',  activeBorder: 'border-emerald-300', activeText: 'text-emerald-700' },
  { value: 'Medium',   label: 'Medium',   dot: 'bg-amber-500',   activeBg: 'bg-amber-50',    activeBorder: 'border-amber-300',   activeText: 'text-amber-700' },
  { value: 'High',     label: 'High',     dot: 'bg-orange-500',  activeBg: 'bg-orange-50',   activeBorder: 'border-orange-300',  activeText: 'text-orange-700' },
  { value: 'Critical', label: 'Critical', dot: 'bg-red-500',     activeBg: 'bg-red-50',      activeBorder: 'border-red-300',     activeText: 'text-red-700' },
];

const severityConfig: { value: IssueSeverity; label: string; dot: string; activeBg: string; activeBorder: string; activeText: string }[] = [
  { value: 'Minor',    label: 'Minor',    dot: 'bg-sky-500',    activeBg: 'bg-sky-50',    activeBorder: 'border-sky-300',    activeText: 'text-sky-700' },
  { value: 'Major',    label: 'Major',    dot: 'bg-orange-500', activeBg: 'bg-orange-50', activeBorder: 'border-orange-300', activeText: 'text-orange-700' },
  { value: 'Critical', label: 'Critical', dot: 'bg-red-500',    activeBg: 'bg-red-50',    activeBorder: 'border-red-300',    activeText: 'text-red-700' },
];

const statusOptions = [
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
];

const DESC_MAX = 2000;

export default function IssueForm({
  initialData,
  showStatus = false,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel = 'Submit',
}: IssueFormProps) {
  const [formData, setFormData] = useState<IssueFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: initialData?.status || 'Open',
    priority: initialData?.priority || 'Medium',
    severity: initialData?.severity || 'Minor',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const descLength = formData.description.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Issue Details ── */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Issue Details
        </legend>

        <Input
          label="Title"
          required
          placeholder="e.g. Login page crashes on mobile Safari"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        <div>
          <Textarea
            label="Description"
            required
            placeholder="Steps to reproduce, expected vs actual behavior, screenshots…"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={errors.description}
            maxLength={DESC_MAX}
            rows={5}
          />
          <div className="flex justify-end mt-1">
            <span className={`text-xs tabular-nums ${descLength > DESC_MAX * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
              {descLength.toLocaleString()}/{DESC_MAX.toLocaleString()}
            </span>
          </div>
        </div>
      </fieldset>

      {/* ── Classification ── */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
          Classification
        </legend>

        {showStatus && (
          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as IssueStatus })}
          />
        )}

        <div className="space-y-3">
          {/* Priority selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex flex-wrap gap-2">
              {priorityConfig.map((opt) => {
                const selected = formData.priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: opt.value })}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer ${
                      selected
                        ? `${opt.activeBg} ${opt.activeBorder} ${opt.activeText} shadow-sm ring-1 ring-offset-0 ${opt.activeBorder.replace('border-', 'ring-')}`
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${selected ? opt.dot : 'bg-gray-300'}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
            <div className="flex flex-wrap gap-2">
              {severityConfig.map((opt) => {
                const selected = formData.severity === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, severity: opt.value })}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer ${
                      selected
                        ? `${opt.activeBg} ${opt.activeBorder} ${opt.activeText} shadow-sm ring-1 ring-offset-0 ${opt.activeBorder.replace('border-', 'ring-')}`
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${selected ? opt.dot : 'bg-gray-300'}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </fieldset>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        <Button type="submit" loading={loading} size="lg">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
