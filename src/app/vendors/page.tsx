'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { VendorCard } from '@/components/vendors/VendorCard';
import { VendorForm } from '@/components/vendors/VendorForm';
import { FAB } from '@/components/ui/fab';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import type { Vendor, VendorType } from '@/lib/types';
import { getSettings } from '@/lib/settings';

type FilterType = 'all' | VendorType;

export default function VendorsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    setShowArchived(getSettings().showArchived);
  }, []);

  const vendors = useLiveQuery(
    () =>
      db.vendors
        .filter((v) => showArchived || !v.isArchived)
        .toArray()
        .then((items) =>
          items.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        ),
    [showArchived]
  );

  const filteredVendors = vendors?.filter((v) => {
    if (filter === 'all') return true;
    return v.type === filter;
  });

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleArchive = async (vendor: Vendor) => {
    await db.vendors.update(vendor.id, {
      isArchived: !vendor.isArchived,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  return (
    <>
      <Header title="Vendors" />
      <PageContainer>
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
          className="mt-4"
        >
          <TabsList className="w-full flex overflow-x-auto scrollbar-hide h-9">
            <TabsTrigger value="all" className="text-xs flex-shrink-0">All</TabsTrigger>
            <TabsTrigger value="client" className="text-xs flex-shrink-0">Clients</TabsTrigger>
            <TabsTrigger value="contractor" className="text-xs flex-shrink-0">Contractors</TabsTrigger>
            <TabsTrigger value="supplier" className="text-xs flex-shrink-0">Suppliers</TabsTrigger>
            <TabsTrigger value="labour" className="text-xs flex-shrink-0">Labour</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-3 animate-stagger">
          {filteredVendors?.length === 0 && (
            <EmptyState
              icon={Users}
              title="No vendors yet"
              description="Add your first vendor to start tracking payments"
            />
          )}
          {filteredVendors?.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onEdit={() => handleEdit(vendor)}
              onArchive={() => handleArchive(vendor)}
            />
          ))}
        </div>
      </PageContainer>

      <FAB onClick={() => setShowForm(true)} />

      <VendorForm
        open={showForm}
        onClose={handleCloseForm}
        vendor={editingVendor}
      />
    </>
  );
}

