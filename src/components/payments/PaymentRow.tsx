'use client';

import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/settings';
import type { Payment } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PaymentRowProps {
  payment: Payment;
  vendorName: string;
  projectName?: string;
  showProject?: boolean;
}

export function PaymentRow({
  payment,
  vendorName,
  projectName,
  showProject = false,
}: PaymentRowProps) {
  const isIncoming = payment.type === 'incoming';

  return (
    <Card className="p-3 touch-feedback">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          {showProject && projectName && (
            <p className="text-xs text-zinc-500 mb-0.5">{projectName}</p>
          )}
          <p className="font-medium text-zinc-900 truncate">{vendorName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-zinc-500">
              {format(new Date(payment.date), 'dd MMM yyyy')}
            </span>
            {payment.description && (
              <span className="text-xs text-zinc-400 truncate">
                • {payment.description}
              </span>
            )}
          </div>
        </div>
        <div
          className={cn(
            'font-semibold text-sm',
            isIncoming ? 'text-green-600' : 'text-red-600'
          )}
        >
          {formatCurrency(payment.amount)}
        </div>
      </div>
    </Card>
  );
}

