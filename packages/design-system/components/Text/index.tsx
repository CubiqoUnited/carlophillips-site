import React, {
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

export interface TextProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'className'
> {
  as?: ElementType;
  children: ReactNode;
  role?:
    'body' | 'body-large' | 'label' | 'product-heading' | 'section-heading';
  tone?: 'ink' | 'copy' | 'muted';
}

const roleClasses = {
  body: 'cp-body',
  'body-large': 'cp-body-large',
  label: 'cp-label',
  'product-heading': 'cp-heading-product',
  'section-heading': 'cp-heading-section',
} as const;

export function Text({
  as: Component = 'p',
  children,
  role = 'body',
  tone = 'copy',
  ...props
}: TextProps) {
  return (
    <Component
      className={`${roleClasses[role]} cp-text-tone-${tone}`}
      {...props}
    >
      {children}
    </Component>
  );
}
