'use client';

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Header } from '@/components/layout/Header';
import { PageContainer } from '@/components/layout/PageContainer';
import { PaymentRow } from '@/components/payments/PaymentRow';
import { EmptyState } from '@/components/ui/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet } from 'lucide-react';
import type { PaymentType } from '@/lib/types';
import { getSettings } from '@/lib/settings';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

type FilterType = 'all' | PaymentType;

export default function PaymentsPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    setShowArchived(getSettings().showArchived);
  }, []);

  const payments = useLiveQuery(
    () =>
      db.payments
        .filter((p) => showArchived || !p.isArchived)
        .toArray()
        .then((items) =>
          items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        ),
    [showArchived]
  );

  const projects = useLiveQuery(() => db.projects.toArray());
  const vendors = useLiveQuery(() => db.vendors.toArray());

  const filteredPayments = payments?.filter((p) => {
    if (filter !== 'all' && p.type !== filter) return false;
    if (projectFilter !== 'all' && p.projectId !== projectFilter) return false;
    return true;
  });

  // Group payments by date
  const groupedPayments = filteredPayments?.reduce((acc, payment) => {
    const date = new Date(payment.date);
    let label: string;

    if (isToday(date)) {
      label = 'Today';
    } else if (isYesterday(date)) {
      label = 'Yesterday';
    } else if (isThisWeek(date)) {
      label = format(date, 'EEEE');
    } else {
      label = format(date, 'dd MMM yyyy');
    }

    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(payment);
    return acc;
  }, {} as Record<string, typeof filteredPayments>);

  return (
    <>
      <Header title="Payments" />
      <PageContainer>
        {/* Type Filter */}
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-3 h-9">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="incoming" className="text-xs text-green-600">🟢 IN</TabsTrigger>
            <TabsTrigger value="outgoing" className="text-xs text-red-600">🔴 OUT</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Project Filter */}
        <div className="mt-3">
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects?.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Payments List */}
        <div className="mt-4 space-y-4 animate-stagger">
          {(!filteredPayments || filteredPayments.length === 0) && (
            <EmptyState
              icon={Wallet}
              title="No payments yet"
              description="Payments will appear here once you add them from a project"
            />
          )}
          {groupedPayments &&
            Object.entries(groupedPayments).map(([dateLabel, datePayments]) => (
              <div key={dateLabel}>
                <h3 className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">
                  {dateLabel}
                </h3>
                <div className="space-y-2">
                  {datePayments?.map((payment) => {
                    const vendor = vendors?.find((v) => v.id === payment.partyId);
                    const project = projects?.find((p) => p.id === payment.projectId);
                    return (
                      <PaymentRow
                        key={payment.id}
                        payment={payment}
                        vendorName={vendor?.name || 'Unknown'}
                        projectName={project?.name}
                        showProject
                      />
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </PageContainer>
    </>
  );
}

