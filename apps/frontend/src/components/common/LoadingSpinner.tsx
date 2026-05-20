import Icon from './Icon';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Icon
        name="progress_activity"
        className={`animate-spin text-indigo-600 ${sizes[size]}`}
      />
    </div>
  );
}
