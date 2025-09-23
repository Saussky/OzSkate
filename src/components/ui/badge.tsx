'use client';

import * as React from 'react';
import Link from 'next/link';

type BadgeProps = {
  href: string;
  cancelHref?: string;
  className?: string;
  children: React.ReactNode;
};

const wrapperClasses = 'group relative inline-flex items-center';

//ToDO: remove group hover I think
const mainLinkClasses =
  'inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs font-medium ' +
  'whitespace-nowrap shrink-0 gap-1 overflow-hidden transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring ' +
  'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive ' +
  'text-foreground group-hover:bg-accent group-hover:text-accent-foreground ' +
  'group-hover:pr-6';

const cancelLinkClasses =
  'absolute right-1 top-1/2 -translate-y-1/2 z-10 ' +
  'opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-150 ' +
  'translate-x-1 group-hover:translate-x-0 ' +
  'text-black dark:text-black pointer-events-auto';

export function Badge({
  href,
  cancelHref,
  className,
  children,
}: BadgeProps): JSX.Element {
  return (
    <span className={`${wrapperClasses} ${className ?? ''}`}>
      <Link href={href} className={mainLinkClasses} data-slot="badge">
        {children}
      </Link>

      {cancelHref ? (
        <Link
          href={cancelHref}
          onClick={(mouseEvent) => {
            mouseEvent.stopPropagation();
          }}
          aria-label="Remove store filter"
          className={cancelLinkClasses}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 12 12"
            className="w-3 h-3 block"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            vectorEffect="non-scaling-stroke"
          >
            <line x1="2" y1="2" x2="10" y2="10" />
            <line x1="10" y1="2" x2="2" y2="10" />
          </svg>
        </Link>
      ) : null}
    </span>
  );
}
