import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';

interface MetricCardProps {
  title: string;
  value: string;
  hint?: string;
}

export const MetricCard = ({ title, value, hint }: MetricCardProps) => {
  return (
    <Card size='sm'>
      <CardHeader>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-2xl font-semibold tracking-tight tabular-nums'>
          {value}
        </p>
        {hint ? (
          <p className='text-xs text-muted-foreground'>{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};
