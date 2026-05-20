interface StatusCountCardProps {
  label: string;
  count: number;
  color: 'blue' | 'amber' | 'green' | 'gray';
}

const colorConfig = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

export default function StatusCountCard({ label, count, color }: StatusCountCardProps) {
  const config = colorConfig[color];
  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-5`}>
      <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${config.text}`}>{count}</p>
    </div>
  );
}
