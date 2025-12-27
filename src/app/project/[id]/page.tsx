'use client';

import { useState, use } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getProjectWithTotals } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { PaymentForm } from '@/components/payments/PaymentForm';
import { PaymentRow } from '@/components/payments/PaymentRow';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/settings';
import { PROJECT_STATUS_CONFIG } from '@/lib/types';
import type { Project, PaymentType } from '@/lib/types';
import {
  MapPin,
  Calendar,
  FileDown,
  Pencil,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateProjectLedgerPDF } from '@/lib/pdf';
import { toast } from 'sonner';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentType, setPaymentType] = useState<PaymentType>('incoming');

  const projectData = useLiveQuery(() => getProjectWithTotals(id), [id]);

  const payments = useLiveQuery(
    () =>
      db.payments
        .where('projectId')
        .equals(id)
        .and((p) => !p.isArchived)
        .reverse()
        .sortBy('date'),
    [id]
  );

  const vendors = useLiveQuery(() => db.vendors.toArray());

  if (!projectData) {
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

  const statusConfig = PROJECT_STATUS_CONFIG[projectData.status];

  const handleAddPayment = (type: PaymentType) => {
    setPaymentType(type);
    setShowPaymentForm(true);
  };

  const handleExportPDF = async () => {
    try {
      await generateProjectLedgerPDF(projectData, payments || [], vendors || []);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <>
      <Header
        title={projectData.name}
        showBack
        rightAction={
          <Button variant="ghost" size="icon" onClick={() => setShowEditForm(true)}>
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
      <PageContainer>
        {/* Project Info */}
        <div className="mt-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={cn('text-xs', statusConfig.color)}>
              {statusConfig.label}
            </Badge>
            {projectData.location && (
              <span className="text-sm text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {projectData.location}
              </span>
            )}
            {projectData.startDate && (
              <span className="text-sm text-zinc-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(projectData.startDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <Card className="mt-4 p-4 animate-slide-up">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-zinc-500 mb-1">IN</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(projectData.totalIncoming)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">OUT</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(projectData.totalOutgoing)}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Balance</p>
              <p
                className={cn(
                  'text-lg font-semibold',
                  projectData.balance >= 0 ? 'text-zinc-900' : 'text-red-600'
                )}
              >
                {formatCurrency(projectData.balance)}
              </p>
            </div>
          </div>
        </Card>

        {/* Export PDF Button */}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleExportPDF}
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export PDF
        </Button>

        {/* Payment Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button
            onClick={() => handleAddPayment('incoming')}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ArrowDownCircle className="w-4 h-4 mr-2" />
            Payment IN
          </Button>
          <Button
            onClick={() => handleAddPayment('outgoing')}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            Payment OUT
          </Button>
        </div>

        {/* Payments List */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-zinc-500 mb-3">Recent Payments</h3>
          <div className="space-y-2 animate-stagger">
            {payments?.length === 0 && (
              <EmptyState
                icon={Wallet}
                title="No payments yet"
                description="Add your first payment using the buttons above"
              />
            )}
            {payments?.map((payment) => {
              const vendor = vendors?.find((v) => v.id === payment.partyId);
              return (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  vendorName={vendor?.name || 'Unknown'}
                />
              );
            })}
          </div>
        </div>
      </PageContainer>

      <ProjectForm
        open={showEditForm}
        onClose={() => setShowEditForm(false)}
        project={projectData as Project}
      />

      <PaymentForm
        open={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        projectId={id}
        defaultType={paymentType}
      />
    </>
  );
}

