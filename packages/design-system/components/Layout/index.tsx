import React, {
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

export interface LayoutProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'className'
> {
  as?: ElementType;
  children: ReactNode;
  spacing?: 'none' | 'section';
  width?: 'medium' | 'wide';
}

export function Layout({
  as: Component = 'div',
  children,
  spacing = 'none',
  width = 'wide',
  ...props
}: LayoutProps) {
  return (
    <Component
      className={`cp-shell-${width} cp-layout-spacing-${spacing}`}
      {...props}
    >
      {children}
    </Component>
  );
}
