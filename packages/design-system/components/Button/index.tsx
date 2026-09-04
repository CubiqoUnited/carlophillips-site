import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  children: ReactNode;
  busy?: boolean;
  size?: 'standard' | 'large';
  variant?: 'solid' | 'outline' | 'quiet';
  width?: 'auto' | 'full';
}

export function Button({
  children,
  busy = false,
  size = 'standard',
  type = 'button',
  variant = 'outline',
  width = 'auto',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`cp-action cp-action-${variant} cp-action-${size} cp-action-${width}`}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      {...props}
    >
      {children}
    </button>
  );
}
