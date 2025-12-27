// Project types
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description?: string;
  location?: string;
  status: ProjectStatus;
  startDate?: string;
  expectedEndDate?: string;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Vendor types
export type VendorType = 'client' | 'contractor' | 'subcontractor' | 'supplier' | 'labour' | 'consultant' | 'government' | 'other';

export interface Vendor {
  id: string;
  name: string;
  type: VendorType;
  phone?: string;
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export type PaymentType = 'incoming' | 'outgoing';

export interface Payment {
  id: string;
  projectId: string;
  partyId: string;
  type: PaymentType;
  amount: number;
  date: string;
  description?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// App settings
export interface AppSettings {
  currency: {
    symbol: string;
    code: string;
    position: 'before' | 'after';
  };
  showArchived: boolean;
  lastBackupDate?: string;
}

// Status display config
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string }> = {
  planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
  on_hold: { label: 'On Hold', color: 'bg-gray-100 text-gray-800' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export const VENDOR_TYPE_CONFIG: Record<VendorType, { label: string }> = {
  client: { label: 'Client' },
  contractor: { label: 'Contractor' },
  subcontractor: { label: 'Sub-Contractor' },
  supplier: { label: 'Supplier' },
  labour: { label: 'Labour' },
  consultant: { label: 'Consultant' },
  government: { label: 'Government' },
  other: { label: 'Other' },
};

