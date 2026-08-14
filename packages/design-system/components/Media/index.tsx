import React, {
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

export interface MediaFrameProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'className'
> {
  as?: ElementType;
  aspect?: 'portrait' | 'featured' | 'wide';
  children: ReactNode;
}

export function MediaFrame({
  as: Component = 'figure',
  aspect = 'portrait',
  children,
  ...props
}: MediaFrameProps) {
  return (
    <Component className={`cp-card-media cp-media-aspect-${aspect}`} {...props}>
      {children}
    </Component>
  );
}
