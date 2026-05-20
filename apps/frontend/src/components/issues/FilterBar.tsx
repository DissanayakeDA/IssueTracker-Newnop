import { useState, useRef, useEffect, useCallback } from 'react';
import { IssueFilters } from '../../types/issue.types';
import SearchInput from './SearchInput';
import Button from '../common/Button';
import Icon from '../common/Icon';

interface FilterOption {
  value: string;
  label: string;
  dot: string;
  bg: string;
  hoverBg: string;
  text: string;
}

const statusOptions: FilterOption[] = [
  { value: '',            label: 'All Status',   dot: 'bg-indigo-400', bg: 'bg-indigo-50', hoverBg: 'hover:bg-indigo-50/60', text: 'text-indigo-600' },
  { value: 'Open',        label: 'Open',         dot: 'bg-blue-500',  bg: 'bg-blue-50',   hoverBg: 'hover:bg-blue-50',      text: 'text-blue-700' },
  { value: 'In Progress', label: 'In Progress',  dot: 'bg-amber-500', bg: 'bg-amber-50',  hoverBg: 'hover:bg-amber-50',     text: 'text-amber-700' },
  { value: 'Resolved',    label: 'Resolved',     dot: 'bg-green-500', bg: 'bg-green-50',  hoverBg: 'hover:bg-green-50',     text: 'text-green-700' },
  { value: 'Closed',      label: 'Closed',       dot: 'bg-gray-400',  bg: 'bg-gray-100',  hoverBg: 'hover:bg-gray-100',     text: 'text-gray-600' },
];

const priorityOptions: FilterOption[] = [
  { value: '',         label: 'All Priority', dot: 'bg-indigo-400',  bg: 'bg-indigo-50',  hoverBg: 'hover:bg-indigo-50/60', text: 'text-indigo-600' },
  { value: 'Low',      label: 'Low',          dot: 'bg-green-500',   bg: 'bg-green-50',   hoverBg: 'hover:bg-green-50',     text: 'text-green-700' },
  { value: 'Medium',   label: 'Medium',       dot: 'bg-blue-500',    bg: 'bg-blue-50',    hoverBg: 'hover:bg-blue-50',      text: 'text-blue-700' },
  { value: 'High',     label: 'High',         dot: 'bg-orange-500',  bg: 'bg-orange-50',  hoverBg: 'hover:bg-orange-50',    text: 'text-orange-700' },
  { value: 'Critical', label: 'Critical',     dot: 'bg-red-500',     bg: 'bg-red-50',     hoverBg: 'hover:bg-red-50',       text: 'text-red-700' },
];

function FilterDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') close();
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }

  function handleOptionKeyDown(e: React.KeyboardEvent, optValue: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(optValue);
      close();
    }
  }

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`
          flex items-center justify-between gap-2 px-3.5 py-2.5 min-w-[150px]
          border border-gray-200 rounded-xl bg-white text-sm font-medium
          shadow-sm transition-all duration-200
          hover:border-gray-300 hover:shadow
          focus:outline-none
        `}
      >
        <span className="flex items-center gap-2.5">
          <span className={`inline-block w-2 h-2 rounded-full ${current.dot}`} />
          <span className={value ? current.text : 'text-gray-600'}>{current.label}</span>
        </span>

        <Icon
          name="expand_more"
          className={`text-xl text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="
            absolute z-50 mt-1.5 w-full min-w-[170px]
            bg-white border border-gray-200 rounded-xl shadow-lg
            py-1.5 animate-dropdown-in overflow-hidden
          "
          role="listbox"
        >
          {options.map((opt) => {
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onKeyDown={(e) => handleOptionKeyDown(e, opt.value)}
                onClick={() => {
                  onChange(opt.value);
                  close();
                }}
                className={`
                  w-full flex items-center justify-between gap-2 px-3.5 py-2.5
                  text-sm font-medium transition-colors duration-150 cursor-pointer
                  ${selected ? `${opt.bg} ${opt.text}` : `text-gray-700 ${opt.hoverBg}`}
                `}
              >
                <span className="flex items-center gap-2.5">
                  <span className={`inline-block w-2 h-2 rounded-full ${opt.dot}`} />
                  <span>{opt.label}</span>
                </span>

                {selected && (
                  <Icon name="check" className={`text-xl ${opt.text}`} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface FilterBarProps {
  filters: IssueFilters;
  onFilterChange: (filters: Partial<IssueFilters>) => void;
  onClear: () => void;
}

export default function FilterBar({ filters, onFilterChange, onClear }: FilterBarProps) {
  const hasFilters = filters.search || filters.status || filters.priority;

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="flex-1">
        <SearchInput
          value={filters.search}
          onChange={(search) => onFilterChange({ search })}
        />
      </div>
      <div className="flex gap-3 items-center">
        <FilterDropdown
          value={filters.status}
          options={statusOptions}
          onChange={(status) => onFilterChange({ status })}
        />
        <FilterDropdown
          value={filters.priority}
          options={priorityOptions}
          onChange={(priority) => onFilterChange({ priority })}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
