import { type ReactNode } from 'react';

interface CardProps {
  readonly children: ReactNode;
  /** Extra utility classes appended to the token-derived base (layout only). */
  readonly className?: string;
  /** Accessible region label (from src/strings/) — makes the card a landmark. */
  readonly ariaLabel: string;
}

/**
 * Card / panel — the design-system container that groups a region of the app
 * (docs/design.md Components: radius `lg`, `shadow.sm`, `border` token, padding
 * from the spacing scale). Purely presentational; all utilities resolve to the
 * design tokens in src/styles/tokens.css.
 */
export function Card({ children, className, ariaLabel }: CardProps): JSX.Element {
  return (
    <section
      aria-label={ariaLabel}
      className={`rounded-lg border border-border bg-background p-6 shadow-sm ${
        className ?? ''
      }`}
    >
      {children}
    </section>
  );
}
