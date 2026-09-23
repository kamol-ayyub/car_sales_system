import { cn } from 'cn';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { SearchIcon, XIcon } from 'lucide-react';

interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

function TableSearch({
  value,
  onChange,
  placeholder = 'Search…',
  label = 'Search',
  className,
}: TableSearchProps) {
  return (
    <InputGroup className={cn('w-full sm:w-64', className)}>
      <InputGroupAddon>
        <SearchIcon aria-hidden='true' />
      </InputGroupAddon>
      <InputGroupInput
        type='text'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        autoComplete='off'
      />
      {value ? (
        <InputGroupAddon align='inline-end'>
          <InputGroupButton
            size='icon-xs'
            onClick={() => onChange('')}
            aria-label='Clear search'
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

export { TableSearch };
export type { TableSearchProps };
