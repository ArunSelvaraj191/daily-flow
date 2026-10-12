import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusChip } from '../../components/common/StatusChip.jsx';
import { PriorityChip } from '../../components/common/PriorityChip.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { SummaryCard } from '../dashboard/SummaryCard.jsx';
import { formatDuration, formatTimerSeconds } from '../../utils/formatters.js';

describe('Common Components & Utilities', () => {
  it('renders StatusChip correctly', () => {
    render(<StatusChip status="In Progress" />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('renders PriorityChip correctly', () => {
    render(<PriorityChip priority="Urgent" />);
    expect(screen.getByText('Urgent')).toBeInTheDocument();
  });

  it('renders EmptyState with custom title and description', () => {
    render(
      <EmptyState
        title="No items found"
        description="Try clearing your filters."
        actionLabel="Create Item"
        onAction={() => {}}
      />
    );
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Try clearing your filters.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Item' })).toBeInTheDocument();
  });

  it('renders SummaryCard with title and formatted value', () => {
    render(
      <SummaryCard
        title="Completion Rate"
        value="85.5%"
        subtitle="12 of 14 completed"
      />
    );
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('85.5%')).toBeInTheDocument();
    expect(screen.getByText('12 of 14 completed')).toBeInTheDocument();
  });

  it('formats duration and timer seconds properly', () => {
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(0)).toBe('0m');

    expect(formatTimerSeconds(65)).toBe('01:05');
    expect(formatTimerSeconds(3665)).toBe('01:01:05');
  });
});
