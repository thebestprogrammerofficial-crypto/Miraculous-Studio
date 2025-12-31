import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-full font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-95";
  
  const variants = {
    primary: "bg-red-500 hover:bg-red-600 text-white border-2 border-transparent",
    secondary: "bg-gray-800 hover:bg-gray-900 text-white border-2 border-transparent",
    danger: "bg-white text-red-500 border-2 border-red-100 hover:bg-red-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 shadow-none border-2 border-transparent"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : children}
    </button>
  );
};