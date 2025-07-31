import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseClasses = 'rounded-lg font-semibold shadow-sm transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 inline-flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-brand-primary text-white hover:bg-opacity-90',
    secondary: 'bg-brand-secondary text-brand-text hover:bg-opacity-90',
    danger: 'bg-brand-danger text-white hover:bg-opacity-90',
    success: 'bg-brand-success text-white hover:bg-opacity-90',
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-sm',
    sm: 'p-2', // for icon buttons
    md: 'px-4 py-2', // default
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
