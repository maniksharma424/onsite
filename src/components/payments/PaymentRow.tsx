'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/settings';
import type { Payment } from '@/lib/types';
import { PAYMENT_MODE_CONFIG } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface PaymentRowProps {
  payment: Payment;
  vendorName: string;
  projectName?: string;
  showProject?: boolean;
  onDelete?: (paymentId: string) => void;
}

export function PaymentRow({
  payment,
  vendorName,
  projectName,
  showProject = false,
  onDelete,
}: PaymentRowProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isIncoming = payment.type === 'incoming';

  const modeLabel = payment.mode
    ? payment.mode === 'other' && payment.customMode
      ? payment.customMode
      : PAYMENT_MODE_CONFIG[payment.mode]?.label
    : null;

  return (
    <>
      <Card className="p-3 touch-feedback">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            {showProject && projectName && (
              <p className="text-xs text-zinc-500 mb-0.5">{projectName}</p>
            )}
            <p className="font-medium text-zinc-900 truncate">{vendorName}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-zinc-500">
                {format(new Date(payment.date), 'dd MMM yyyy')}
              </span>
              {modeLabel && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                  {modeLabel}
                </Badge>
              )}
              {payment.description && (
                <span className="text-xs text-zinc-400 truncate">
                  • {payment.description}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                'font-semibold text-sm',
                isIncoming ? 'text-green-600' : 'text-red-600'
              )}
            >
              {formatCurrency(payment.amount)}
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400 hover:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowConfirm(true);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Delete {formatCurrency(payment.amount)} {isIncoming ? 'IN' : 'OUT'} payment
              to {vendorName}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete?.(payment.id);
                setShowConfirm(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
