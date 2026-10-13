import { Separator } from '@/components/ui/separator';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  return <Separator orientation={orientation} className={className} />;
}
