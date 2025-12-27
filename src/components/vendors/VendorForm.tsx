'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { db } from '@/lib/db';
import type { Vendor, VendorType } from '@/lib/types';
import { VENDOR_TYPE_CONFIG } from '@/lib/types';
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
import { toast } from 'sonner';
import { Contact } from 'lucide-react';

const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['client', 'contractor', 'subcontractor', 'supplier', 'labour', 'consultant', 'government', 'other']),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  open: boolean;
  onClose: () => void;
  vendor?: Vendor | null;
  onCreated?: (vendorId: string) => void;
}

export function VendorForm({ open, onClose, vendor, onCreated }: VendorFormProps) {
  const [isImporting, setIsImporting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      type: 'contractor',
      phone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (vendor) {
      reset({
        name: vendor.name,
        type: vendor.type,
        phone: vendor.phone || '',
        notes: vendor.notes || '',
      });
    } else {
      reset({
        name: '',
        type: 'contractor',
        phone: '',
        notes: '',
      });
    }
  }, [vendor, reset, open]);

  const onSubmit = async (data: VendorFormData) => {
    try {
      const now = new Date().toISOString();
      let vendorId = vendor?.id;

      if (vendor) {
        await db.vendors.update(vendor.id, {
          ...data,
          updatedAt: now,
        });
        toast.success('Vendor updated');
      } else {
        vendorId = uuid();
        await db.vendors.add({
          id: vendorId,
          ...data,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        });
        toast.success('Vendor created');
      }

      if (onCreated && vendorId) {
        onCreated(vendorId);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save vendor:', error);
      toast.error('Failed to save vendor');
    }
  };

  const handleImportContact = async () => {
    if (!('contacts' in navigator)) {
      toast.error('Contact access not supported on this device');
      return;
    }

    setIsImporting(true);
    try {
      // @ts-expect-error - Contacts API not in TypeScript types yet
      const contacts = await navigator.contacts.select(['name', 'tel'], {
        multiple: false,
      });

      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        if (contact.name && contact.name.length > 0) {
          setValue('name', contact.name[0]);
        }
        if (contact.tel && contact.tel.length > 0) {
          setValue('phone', contact.tel[0]);
        }
        toast.success('Contact imported');
      }
    } catch (error) {
      // User cancelled or error
      console.log('Contact import cancelled or failed:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const typeValue = watch('type');

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{vendor ? 'Edit Vendor' : 'Add Vendor'}</SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-6 overflow-y-auto">
        {/* Import from Contacts */}
        {!vendor && (
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            onClick={handleImportContact}
            disabled={isImporting}
          >
            <Contact className="w-4 h-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import from Contacts'}
          </Button>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Vendor name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type *</Label>
            <Select
              value={typeValue}
              onValueChange={(value) => setValue('type', value as VendorType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VENDOR_TYPE_CONFIG).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Phone number"
              {...register('phone')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Additional notes"
              {...register('notes')}
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
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Saving...' : vendor ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

