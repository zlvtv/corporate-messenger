import React from 'react';
import styles from './input.module.css';

type InputType = 'text' | 'email' | 'password' | 'number';
type InputSize = 'small' | 'medium';

interface InputProps {
  type?: InputType;
  placeholder?: string;
  fullWidth?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  error?: string;
  size?: InputSize;
  'aria-label'?: string;
  'aria-describedby'?: string;

  textarea?: boolean;
  rows?: number; 
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  fullWidth = false,
  disabled = false,
  className = '',
  name,
  autoComplete,
  autoFocus = false,
  error,
  size = 'medium',
  textarea = false,
  rows,
  ...props
}) => {
  const commonProps = {
    placeholder,
    value,
    onChange,
    required,
    disabled,
    className: `${styles.input} 
      ${size === 'small' ? styles['input--small'] : ''} 
      ${error ? styles['input--error'] : ''}
      ${fullWidth ? styles['input--full-width'] : ''}
      ${className}`.trim(),
    name,
    autoComplete,
    autoFocus,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : undefined,
    ...props,
  };

  return (
    <>
      {textarea ? (
        <textarea
          {...commonProps}
          rows={rows}
          {...('type' in commonProps ? { type: undefined } : {})}
        />
      ) : (
        <input
          type={type}
          {...commonProps}
        />
      )}
      {error && (
        <div id={`${name}-error`} className={styles['error-message']} role="alert">
          {error}
        </div>
      )}
    </>
  );
};

export default Input;
