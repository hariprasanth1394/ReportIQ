import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 text-sm">
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      <button
        onClick={onRemove}
        className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}

interface FilterBarProps {
  activeFilters?: Array<{ label: string; value: string; id: string }>;
  onClearAll?: () => void;
  onRemoveFilter?: (id: string) => void;
  children?: React.ReactNode;
}

export function FilterBar({ activeFilters = [], onClearAll, onRemoveFilter, children }: FilterBarProps) {
  return (
    <div className="space-y-4">
      {children}
      
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-slate-600">Active filters:</span>
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.id}
              label={filter.label}
              value={filter.value}
              onRemove={() => onRemoveFilter?.(filter.id)}
            />
          ))}
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
