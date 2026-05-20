import { useState, useRef, useEffect } from "react";
import { IssueStatus } from "../../types/issue.types";
import Icon from "../common/Icon";

interface StatusSelectProps {
  value: IssueStatus;
  onChange: (status: IssueStatus) => void;
  disabled?: boolean;
  label?: string;
}

const statusConfig: Record<
  IssueStatus,
  { dot: string; bg: string; hoverBg: string; ring: string; text: string }
> = {
  Open: {
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    hoverBg: "hover:bg-blue-50",
    ring: "ring-blue-500",
    text: "text-blue-700",
  },
  "In Progress": {
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    hoverBg: "hover:bg-amber-50",
    ring: "ring-amber-500",
    text: "text-amber-700",
  },
  Resolved: {
    dot: "bg-green-500",
    bg: "bg-green-50",
    hoverBg: "hover:bg-green-50",
    ring: "ring-green-500",
    text: "text-green-700",
  },
  Closed: {
    dot: "bg-gray-400",
    bg: "bg-gray-100",
    hoverBg: "hover:bg-gray-100",
    ring: "ring-gray-400",
    text: "text-gray-600",
  },
};

const statuses: IssueStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

export default function StatusSelect({
  value,
  onChange,
  disabled,
  label,
}: StatusSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }

  function handleOptionKeyDown(e: React.KeyboardEvent, status: IssueStatus) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(status);
      setOpen(false);
    }
  }

  const current = statusConfig[value];

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`
          w-full flex items-center justify-between gap-2 px-3.5 py-2.5
          border border-gray-200 rounded-xl bg-white text-sm font-medium
          shadow-sm transition-all duration-200
          hover:border-gray-300 hover:shadow
          focus:outline-none
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      >
        <span className="flex items-center gap-2.5">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${current.dot} ring-2 ring-offset-1 ${current.ring}/30`}
          />
          <span className={current.text}>{value}</span>
        </span>

        <Icon
          name="expand_more"
          className={`text-xl text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className="
            absolute z-50 mt-1.5 w-full
            bg-white border border-gray-200 rounded-xl shadow-lg
            py-1.5 animate-dropdown-in
            overflow-hidden
          "
          role="listbox"
          aria-activedescendant={value}
        >
          {statuses.map((status) => {
            const config = statusConfig[status];
            const selected = status === value;
            return (
              <button
                key={status}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={0}
                onKeyDown={(e) => handleOptionKeyDown(e, status)}
                onClick={() => {
                  onChange(status);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between gap-2 px-3.5 py-2.5
                  text-sm font-medium transition-colors duration-150 cursor-pointer
                  ${selected ? `${config.bg} ${config.text}` : `text-gray-700 ${config.hoverBg}`}
                `}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${config.dot}`}
                  />
                  <span>{status}</span>
                </span>

                {selected && (
                  <Icon name="check" className={`text-xl ${config.text}`} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
