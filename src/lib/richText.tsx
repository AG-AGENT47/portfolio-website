import { Fragment, type ReactNode } from 'react';

/**
 * Renders a plain-text string from the DB with two lightweight conventions:
 *   - a newline ("\n")  → line break
 *   - "*phrase*"         → <em>phrase</em>
 *
 * Content lives in portfolio-store (personal_info); this keeps the one bit of
 * inline emphasis the copy needs without storing raw HTML in the database.
 */
export function richText(input: string | null | undefined): ReactNode {
  if (!input) return null;

  const lines = input.split(/\r?\n/);

  return lines.map((line, li) => (
    <Fragment key={li}>
      {li > 0 && <br />}
      {renderEmphasis(line)}
    </Fragment>
  ));
}

function renderEmphasis(line: string): ReactNode {
  // Split on *...* keeping the delimiters' contents.
  const parts = line.split(/\*([^*]+)\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <em key={i}>{part}</em> : <Fragment key={i}>{part}</Fragment>
  );
}

/** Split a "|"-separated DB string into trimmed, non-empty items. */
export function splitList(input: string | null | undefined, sep = '|'): string[] {
  if (!input) return [];
  return input
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}
