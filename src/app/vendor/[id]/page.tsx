'use client';

import { useState, use } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getVendorWithTotals } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { VendorForm } from '@/components/vendors/VendorForm';
import { PaymentRow } from '@/components/payments/PaymentRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/settings';
import { VENDOR_TYPE_CONFIG } from '@/lib/types';
import type { Vendor, PaymentType, Payment } from '@/lib/types';
import { Phone, Pencil, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showEditForm, setShowEditForm] = useState(false);
  const [filter, setFilter] = useState<'all' | PaymentType>('all');

  const vendorData = useLiveQuery(() => getVendorWithTotals(id), [id]);

  const projects = useLiveQuery(() => db.projects.toArray());

  if (!vendorData) {
    return (
      <>
        <Header title="Loading..." showBack />
        <PageContainer>
          <div className="animate-pulse space-y-4 mt-4">
            <div className="h-24 bg-zinc-100 rounded-lg" />
            <div className="h-32 bg-zinc-100 rounded-lg" />
          </div>
        </PageContainer>
      </>
    );
  }

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await db.payments.delete(paymentId);
      toast.success('Payment deleted');
    } catch {
      toast.error('Failed to delete payment');
    }
  };

  const typeConfig = VENDOR_TYPE_CONFIG[vendorData.type];

  const filteredPayments = vendorData.payments?.filter((p) => {
    if (filter === 'all') return true;
    return p.type === filter;
  });

  // Group payments by project
  const paymentsByProject = filteredPayments?.reduce((acc, payment) => {
    if (!acc[payment.projectId]) {
      acc[payment.projectId] = [];
    }
    acc[payment.projectId].push(payment);
    return acc;
  }, {} as Record<string, typeof filteredPayments>);

  return (
    <>
      <Header
        title={vendorData.name}
        showBack
        rightAction={
          <Button variant="ghost" size="icon" onClick={() => setShowEditForm(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <PageContainer>
        {/* Vendor Info */}
        <div className="mt-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{typeConfig.label}</Badge>
            {vendorData.phone && (
              <a
                href={`tel:${vendorData.phone}`}
                className="text-sm text-zinc-500 flex items-center gap-1 hover:text-zinc-700"
              >
                <Phone className="w-3 h-3" />
                {vendorData.phone}
              </a>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <Card className="mt-4 p-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Received</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(vendorData.totalReceived)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Paid</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(vendorData.totalPaid)}
              </p>
            </div>
          </div>
        </Card>

        {/* Payments Filter */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-500">All Payments</h3>
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as 'all' | PaymentType)}
            className="mb-4"
          >
            <TabsList className="grid grid-cols-3 h-9">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="incoming" className="text-xs">IN</TabsTrigger>
              <TabsTrigger value="outgoing" className="text-xs">OUT</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Payments grouped by project */}
          <div className="space-y-4 animate-stagger">
            {(!filteredPayments || filteredPayments.length === 0) && (
              <EmptyState
                icon={Wallet}
                title="No payments yet"
                description="Payments with this vendor will appear here"
              />
            )}
            {paymentsByProject &&
              Object.entries(paymentsByProject).map(([projectId, payments]) => {
                const project = projects?.find((p) => p.id === projectId);
                const projectIn = (payments ?? [])
                  .filter((p: Payment) => p.type === 'incoming')
                  .reduce((sum: number, p: Payment) => sum + p.amount, 0);
                const projectOut = (payments ?? [])
                  .filter((p: Payment) => p.type === 'outgoing')
                  .reduce((sum: number, p: Payment) => sum + p.amount, 0);
                return (
                  <div key={projectId}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-zinc-400 flex items-center gap-1">
                        🏗️ {project?.name || 'Unknown Project'}
                      </h4>
                      <div className="flex items-center gap-3 text-xs">
                        {projectIn > 0 && (
                          <span className="text-green-600 font-medium">
                            IN {formatCurrency(projectIn)}
                          </span>
                        )}
                        {projectOut > 0 && (
                          <span className="text-red-600 font-medium">
                            OUT {formatCurrency(projectOut)}
                          </span>
                        )}
                        <span className={cn(
                          'font-semibold',
                          projectIn - projectOut >= 0 ? 'text-zinc-700' : 'text-red-600'
                        )}>
                          Bal {formatCurrency(projectIn - projectOut)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {payments?.map((payment: Payment) => (
                        <PaymentRow
                          key={payment.id}
                          payment={payment}
                          vendorName={vendorData.name}
                          onDelete={handleDeletePayment}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </PageContainer>

      <VendorForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        vendor={vendorData as Vendor}
      />
    </>
  );
}

