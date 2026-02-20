import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const inputId = props.id || props.name || Math.random().toString(36);
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-2.5 
            ${icon ? 'pl-10' : ''}
            bg-white dark:bg-gray-800 
            border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
            rounded-lg 
            text-gray-900 dark:text-white 
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 
            ${error ? 'focus:ring-red-500' : 'focus:ring-yspOrange-500'}
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const textAreaId = props.id || props.name || Math.random().toString(36);
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={textAreaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <textarea
        id={textAreaId}
        className={`
          w-full px-4 py-2.5 
          bg-white dark:bg-gray-800 
          border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          rounded-lg 
          text-gray-900 dark:text-white 
          placeholder-gray-500 dark:placeholder-gray-400
          focus:outline-none focus:ring-2 
          ${error ? 'focus:ring-red-500' : 'focus:ring-yspOrange-500'}
          transition-all duration-200
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const selectId = props.id || props.name || Math.random().toString(36);
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-4 py-2.5 
          bg-white dark:bg-gray-800 
          border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
          rounded-lg 
          text-gray-900 dark:text-white 
          focus:outline-none focus:ring-2 
          ${error ? 'focus:ring-red-500' : 'focus:ring-yspOrange-500'}
          transition-all duration-200
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};
