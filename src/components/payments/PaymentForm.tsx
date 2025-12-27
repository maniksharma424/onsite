'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { PaymentType } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorForm } from '@/components/vendors/VendorForm';
import { toast } from 'sonner';
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const paymentSchema = z.object({
  partyId: z.string().min(1, 'Vendor is required'),
  amount: z.string().min(1, 'Amount is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  defaultType?: PaymentType;
}

export function PaymentForm({
  open,
  onClose,
  projectId,
  defaultType = 'outgoing',
}: PaymentFormProps) {
  const [paymentType, setPaymentType] = useState<PaymentType>(defaultType);
  const [showVendorForm, setShowVendorForm] = useState(false);

  const vendors = useLiveQuery(
    () => db.vendors.filter((v) => !v.isArchived).toArray(),
    []
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      partyId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    },
  });

  useEffect(() => {
    setPaymentType(defaultType);
    reset({
      partyId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  }, [open, defaultType, reset]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      const now = new Date().toISOString();

      await db.payments.add({
        id: uuid(),
        projectId,
        partyId: data.partyId,
        type: paymentType,
        amount: parseFloat(data.amount),
        date: data.date,
        description: data.description || undefined,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      });

      toast.success('Payment added');
      onClose();
    } catch (error) {
      console.error('Failed to add payment:', error);
      toast.error('Failed to add payment');
    }
  };

  const partyIdValue = watch('partyId');

  const handleVendorCreated = (vendorId: string) => {
    setValue('partyId', vendorId);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {paymentType === 'incoming' ? (
                <>
                  <ArrowDownCircle className="w-5 h-5 text-green-600" />
                  <span>Payment IN</span>
                </>
              ) : (
                <>
                  <ArrowUpCircle className="w-5 h-5 text-red-600" />
                  <span>Payment OUT</span>
                </>
              )}
            </SheetTitle>
          </SheetHeader>

          <div className="px-6 pb-6 overflow-y-auto">
          {/* Payment Type Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={paymentType === 'incoming' ? 'default' : 'outline'}
              className={cn(
                'flex-1',
                paymentType === 'incoming' && 'bg-green-600 hover:bg-green-700'
              )}
              onClick={() => setPaymentType('incoming')}
            >
              IN
            </Button>
            <Button
              type="button"
              variant={paymentType === 'outgoing' ? 'default' : 'outline'}
              className={cn(
                'flex-1',
                paymentType === 'outgoing' && 'bg-red-600 hover:bg-red-700'
              )}
              onClick={() => setPaymentType('outgoing')}
            >
              OUT
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendor *</Label>
              <Select
                value={partyIdValue}
                onValueChange={(value) => setValue('partyId', value)}
              >
                <SelectTrigger className={errors.partyId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors?.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.partyId && (
                <p className="text-xs text-red-500">{errors.partyId.message}</p>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-zinc-500"
                onClick={() => setShowVendorForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add New Vendor
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  ₹
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={cn('pl-7', errors.amount && 'border-red-500')}
                  {...register('amount')}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Payment description"
                {...register('description')}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'flex-1',
                  paymentType === 'incoming'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {isSubmitting ? 'Saving...' : 'Add Payment'}
              </Button>
            </div>
          </form>
          </div>
        </SheetContent>
      </Sheet>

      <VendorForm
        open={showVendorForm}
        onClose={() => setShowVendorForm(false)}
        onCreated={handleVendorCreated}
      />
    </>
  );
}

