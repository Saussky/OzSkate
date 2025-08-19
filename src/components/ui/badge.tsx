'use client';

import * as React from 'react';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const baseClasses =
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 overflow-hidden transition-[color,box-shadow] ' +
  '[&>svg]:size-3 [&>svg]:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring ' +
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive';

const variantClasses: Record<BadgeVariant, string> = {
  default:
    'border-transparent bg-primary text-primary-foreground hover:bg-primary/90',
  secondary:
    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90',
  destructive:
    'border-transparent bg-destructive text-white hover:bg-destructive/90 ' +
    'focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
  outline: 'text-foreground hover:bg-accent hover:text-accent-foreground',
};

// Tiny local class merger to avoid extra deps.
function mergeClassNames(...classNames: Array<string | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

// Polymorphic props using a type alias (not interface) to support generics cleanly.
type PolymorphicBadgeProps<GenericElement extends React.ElementType> = {
  as?: GenericElement;
  variant?: BadgeVariant;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<GenericElement>, 'as' | 'color'>;

export function Badge<GenericElement extends React.ElementType = 'span'>({
  as,
  variant = 'default',
  className,
  children,
  ...restProps
}: PolymorphicBadgeProps<GenericElement>): JSX.Element {
  const Component = (as ?? 'span') as React.ElementType;
  const combinedClassName = mergeClassNames(
    baseClasses,
    variantClasses[variant],
    className
  );

  return (
    <Component data-slot="badge" className={combinedClassName} {...restProps}>
      {children}
    </Component>
  );
}
