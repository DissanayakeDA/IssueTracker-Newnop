import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import Icon from './Icon';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, leftIcon, rightIcon, className = '', ...props }, ref) => {
    const hasLeft = Boolean(leftIcon);
    const hasRight = Boolean(rightIcon);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {hasLeft && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            required={required}
            className={`w-full ${hasLeft ? 'pl-10' : 'pl-3.5'} ${hasRight ? 'pr-10' : 'pr-3.5'} py-2.5 border rounded-lg text-sm bg-white placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
              error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
            } ${className}`}
            {...props}
          />
          {hasRight && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <Icon name="error" className="text-sm" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
