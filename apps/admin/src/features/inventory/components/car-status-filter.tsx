import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/toggle-group';
import {
  carStatusFilterOptions,
  type CarStatusFilterValue,
} from '../car-status-filter-options';

interface CarStatusFilterProps {
  value: CarStatusFilterValue;
  onChange: (value: CarStatusFilterValue) => void;
}

export const CarStatusFilter = ({ value, onChange }: CarStatusFilterProps) => {
  return (
    <ToggleGroup
      aria-label='Filter cars by status'
      value={[value]}
      onValueChange={(next) => {
        onChange((next[0] as CarStatusFilterValue) ?? 'all');
      }}
      variant='outline'
      spacing={0}
    >
      {carStatusFilterOptions.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};
