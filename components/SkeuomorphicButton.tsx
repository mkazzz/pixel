import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'login';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', leftIcon, rightIcon, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center font-semibold focus:outline-none border-1 border-pixel-border-light dark:border-pixel-border-dark transition-colors duration-100";
  
  const sizeStyles = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm", // Adjusted padding for pixel style
    lg: "px-4 py-2 text-base",
  };

  const variantStyles = {
    primary: "bg-pixel-primary text-white border-pixel-primary hover:bg-pixel-primary-hover active:shadow-pixel-button-press dark:active:shadow-pixel-button-press-dark",
    secondary: "bg-pixel-secondary text-pixel-text-dark dark:bg-pixel-secondary dark:text-pixel-text-dark border-pixel-secondary hover:bg-pixel-secondary-hover active:shadow-pixel-button-press dark:active:shadow-pixel-button-press-dark",
    danger: "bg-pixel-danger text-white border-pixel-danger hover:bg-pixel-danger-hover active:shadow-pixel-button-press dark:active:shadow-pixel-button-press-dark",
    ghost: "bg-transparent text-pixel-text-light dark:text-pixel-text-dark border-transparent hover:bg-pixel-card-light dark:hover:bg-pixel-card-dark hover:border-pixel-border-light dark:hover:border-pixel-border-dark active:bg-pixel-bg-light dark:active:bg-pixel-bg-dark",
    login: "bg-pixel-primary text-white border-pixel-primary hover:bg-pixel-primary-hover active:shadow-pixel-button-press dark:active:shadow-pixel-button-press-dark text-base px-5 py-2.5", // Larger login button
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className} rounded-none`} // Ensure no rounding
      {...props}
    >
      {leftIcon && <span className="mr-1.5">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-1.5">{rightIcon}</span>}
    </button>
  );
};

export default ActionButton;