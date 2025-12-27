'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Phone, ChevronRight } from 'lucide-react';
import { VENDOR_TYPE_CONFIG } from '@/lib/types';
import type { Vendor } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface VendorCardProps {
  vendor: Vendor;
  onEdit: () => void;
  onArchive: () => void;
}

export function VendorCard({ vendor, onEdit, onArchive }: VendorCardProps) {
  const typeConfig = VENDOR_TYPE_CONFIG[vendor.type];

  return (
    <Link href={`/vendor/${vendor.id}`}>
      <Card
        className={cn(
          'p-4 touch-feedback cursor-pointer transition-all duration-200 hover:shadow-md',
          vendor.isArchived && 'opacity-60'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-zinc-900 truncate">{vendor.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {typeConfig.label}
                </Badge>
                {vendor.phone && (
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {vendor.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-zinc-300 flex-shrink-0" />
        </div>
      </Card>
    </Link>
  );
}

