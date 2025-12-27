import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FABProps {
  onClick: () => void;
  className?: string;
}

export function FAB({ onClick, className }: FABProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        'fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg',
        'bg-zinc-900 hover:bg-zinc-800 text-white',
        'transition-all duration-200 hover:scale-105 active:scale-95',
        'z-40',
        className
      )}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}

