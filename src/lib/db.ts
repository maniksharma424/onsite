import Dexie, { type EntityTable } from 'dexie';
import type { Project, Vendor, Payment } from './types';
import { SEED_PROJECTS, SEED_VENDORS, SEED_PAYMENTS } from './seed-data';

// Database schema
const db = new Dexie('ConstructionManagement') as Dexie & {
  projects: EntityTable<Project, 'id'>;
  vendors: EntityTable<Vendor, 'id'>;
  payments: EntityTable<Payment, 'id'>;
};

db.version(1).stores({
  projects: 'id, name, status, isArchived, createdAt',
  vendors: 'id, name, type, isArchived, createdAt',
  payments: 'id, projectId, partyId, type, date, isArchived, createdAt',
});

export { db };

export async function seedDatabaseIfEmpty() {
  const projectCount = await db.projects.count();
  const vendorCount = await db.vendors.count();
  const paymentCount = await db.payments.count();

  if (projectCount === 0 && vendorCount === 0 && paymentCount === 0) {
    await db.vendors.bulkAdd(SEED_VENDORS);
    await db.projects.bulkAdd(SEED_PROJECTS);
    await db.payments.bulkAdd(SEED_PAYMENTS);
  }
}

// Helper functions
export async function getProjectWithTotals(projectId: string) {
  const project = await db.projects.get(projectId);
  if (!project) return null;

  const payments = await db.payments
    .where('projectId')
    .equals(projectId)
    .and((p) => !p.isArchived)
    .toArray();

  const totalIncoming = payments
    .filter((p) => p.type === 'incoming')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOutgoing = payments
    .filter((p) => p.type === 'outgoing')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    ...project,
    totalIncoming,
    totalOutgoing,
    balance: totalIncoming - totalOutgoing,
  };
}

export async function getVendorWithTotals(vendorId: string) {
  const vendor = await db.vendors.get(vendorId);
  if (!vendor) return null;

  const payments = await db.payments
    .where('partyId')
    .equals(vendorId)
    .and((p) => !p.isArchived)
    .toArray();

  const totalReceived = payments
    .filter((p) => p.type === 'incoming')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = payments
    .filter((p) => p.type === 'outgoing')
    .reduce((sum, p) => sum + p.amount, 0);

  return {
    ...vendor,
    totalReceived,
    totalPaid,
    payments,
  };
}

export async function getAllProjectsWithTotals(showArchived: boolean = false) {
  const projects = await db.projects
    .filter((p) => showArchived || !p.isArchived)
    .toArray();

  const projectsWithTotals = await Promise.all(
    projects.map(async (project) => {
      const payments = await db.payments
        .where('projectId')
        .equals(project.id)
        .and((p) => !p.isArchived)
        .toArray();

      const totalIncoming = payments
        .filter((p) => p.type === 'incoming')
        .reduce((sum, p) => sum + p.amount, 0);

      const totalOutgoing = payments
        .filter((p) => p.type === 'outgoing')
        .reduce((sum, p) => sum + p.amount, 0);

      return {
        ...project,
        totalIncoming,
        totalOutgoing,
        balance: totalIncoming - totalOutgoing,
      };
    })
  );

  return projectsWithTotals.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Export data for backup
export async function exportAllData() {
  const projects = await db.projects.toArray();
  const vendors = await db.vendors.toArray();
  const payments = await db.payments.toArray();

  return {
    appName: 'ConstructionManagement',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    currency: {
      symbol: '₹',
      code: 'INR',
    },
    data: {
      projects,
      vendors,
      payments,
    },
  };
}

// Import data from backup
export async function importData(data: {
  data: {
    projects: Project[];
    vendors: Vendor[];
    payments: Payment[];
  };
}, replace: boolean = true) {
  if (replace) {
    await db.projects.clear();
    await db.vendors.clear();
    await db.payments.clear();
  }

  await db.projects.bulkAdd(data.data.projects);
  await db.vendors.bulkAdd(data.data.vendors);
  await db.payments.bulkAdd(data.data.payments);
}

// Clear all data
export async function clearAllData() {
  await db.projects.clear();
  await db.vendors.clear();
  await db.payments.clear();
}

