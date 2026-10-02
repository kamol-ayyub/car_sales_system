import { Field, FieldError, FieldLabel } from '@repo/ui/components/field';
import { Input } from '@repo/ui/components/input';
import { ToggleGroup, ToggleGroupItem } from '@repo/ui/components/toggle-group';
import {
  reportRangePresets,
  toIsoDate,
  type ReportRangePreset,
} from '../report-ranges';

const RANGE_ERROR_ID = 'report-range-error';

interface ReportRangePickerProps {
  preset: ReportRangePreset;
  onPresetChange: (preset: ReportRangePreset) => void;
  customFrom: string;
  onCustomFromChange: (value: string) => void;
  customTo: string;
  onCustomToChange: (value: string) => void;
}

export const ReportRangePicker = ({
  preset,
  onPresetChange,
  customFrom,
  onCustomFromChange,
  customTo,
  onCustomToChange,
}: ReportRangePickerProps) => {
  const today = toIsoDate(new Date());
  const invalidRange = Boolean(customFrom && customTo && customFrom > customTo);

  return (
    <div className='flex flex-col gap-3'>
      <ToggleGroup
        aria-label='Select report period'
        value={[preset]}
        onValueChange={(next) => {
          onPresetChange((next[0] as ReportRangePreset) ?? preset);
        }}
        variant='outline'
        spacing={0}
        className='flex-wrap'
      >
        {reportRangePresets.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {preset === 'custom' ? (
        <div
          role='group'
          aria-label='Custom report period'
          className='flex flex-col gap-2'
        >
          <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
            <Field
              className='w-full sm:w-44'
              data-invalid={invalidRange || undefined}
            >
              <FieldLabel htmlFor='report-from'>From</FieldLabel>
              <Input
                id='report-from'
                type='date'
                value={customFrom}
                max={customTo || today}
                aria-invalid={invalidRange || undefined}
                aria-describedby={invalidRange ? RANGE_ERROR_ID : undefined}
                onChange={(event) => onCustomFromChange(event.target.value)}
              />
            </Field>
            <Field
              className='w-full sm:w-44'
              data-invalid={invalidRange || undefined}
            >
              <FieldLabel htmlFor='report-to'>To</FieldLabel>
              <Input
                id='report-to'
                type='date'
                value={customTo}
                min={customFrom || undefined}
                max={today}
                aria-invalid={invalidRange || undefined}
                aria-describedby={invalidRange ? RANGE_ERROR_ID : undefined}
                onChange={(event) => onCustomToChange(event.target.value)}
              />
            </Field>
          </div>
          {invalidRange ? (
            <FieldError
              id={RANGE_ERROR_ID}
              errors={[
                {
                  message: 'The start date must be on or before the end date.',
                },
              ]}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
