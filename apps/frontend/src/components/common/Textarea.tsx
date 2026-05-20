import { TextareaHTMLAttributes, forwardRef } from 'react';
import Icon from './Icon';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          required={required}
          className={`w-full px-3.5 py-2.5 border rounded-lg text-sm bg-white placeholder:text-gray-400 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-vertical min-h-[120px] ${
            error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 hover:border-gray-400'
          } ${className}`}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
export default Textarea;
