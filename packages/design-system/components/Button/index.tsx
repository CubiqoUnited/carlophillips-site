import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  children: ReactNode;
  size?: 'standard' | 'large';
  variant?: 'solid' | 'outline' | 'quiet';
}

export function Button({
  children,
  size = 'standard',
  type = 'button',
  variant = 'outline',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`cp-action cp-action-${variant} cp-action-${size}`}
      {...props}
    >
      {children}
    </button>
  );
}
