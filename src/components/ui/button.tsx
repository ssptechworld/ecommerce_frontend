import React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "default",
  size = "md",
  className = "",
  disabled,
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
