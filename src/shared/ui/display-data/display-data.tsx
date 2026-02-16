import { type FC } from 'react';
import { Cell, Section } from '@telegram-apps/telegram-ui';

export interface DisplayDataRow {
  title: string;
  value?: unknown;
  type?: 'link' | 'default';
}

interface DisplayDataProps {
  header?: string;
  rows: DisplayDataRow[];
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean' || typeof val === 'bigint' || typeof val === 'symbol') {
    return String(val);
  }
  return '';
}

export const DisplayData: FC<DisplayDataProps> = ({ header, rows }) => {
  return (
    <Section header={header}>
      {rows.map((row, index) => {
        const rowValue = row.value;
        const handleClick = row.type === 'link' && typeof rowValue === 'string' 
          ? () => { window.location.href = rowValue; } 
          : undefined;
        return (
          <Cell
            key={index}
            subtitle={row.title}
            onClick={handleClick}
          >
            {formatValue(rowValue)}
          </Cell>
        );
      })}
    </Section>
  );
};
