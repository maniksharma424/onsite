import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn(
        'flex-1 overflow-y-auto pb-20 px-4 max-w-md mx-auto w-full',
        className
      )}
    >
      {children}
    </main>
  );
}

