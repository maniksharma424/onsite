# 🏗️ Construction Management - PRD

> **Version:** 1.1  
> **Last Updated:** December 27, 2024  
> **Status:** ✅ Confirmed Decisions / 🔄 Pending Schema Review

---

## 1. Executive Summary

A mobile-first Progressive Web App (PWA) for managing construction projects and tracking payments. Designed to work offline on iPhone and iPad with local device storage.

### Key Goals
- Track multiple construction projects
- Record incoming and outgoing payments
- Associate payments with parties (contractors, suppliers, clients, etc.)
- Generate PDF ledger reports
- Work 100% offline with local data backup/restore

### ✅ Confirmed Decisions
| Item | Decision |
|------|----------|
| App Name | **Construction Management** |
| Currency | **₹ (INR)** |
| Theme | **Light mode** |
| PDF Report | **Project Ledger** (green for IN, red for OUT) |
| Payment Status | **Removed** - entries made only after payment is sent/received |
| Data Storage | **Local only** (IndexedDB via Dexie.js) |
| Archive | **Soft delete** - archive instead of permanent delete |

---

## 2. Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 PWA (iPhone / iPad / Web)               │
├─────────────────────────────────────────────────────────┤
│  Next.js 15 (Static Export)                             │
│  + Tailwind CSS + shadcn/ui                             │
│  + Service Worker (Offline Support)                     │
├─────────────────────────────────────────────────────────┤
│  Dexie.js (IndexedDB Wrapper)                           │
│  Local device storage - No cloud required               │
├─────────────────────────────────────────────────────────┤
│  jsPDF (Client-side PDF Generation)                     │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (Static Export) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | Dexie.js (IndexedDB) |
| PWA | Serwist |
| PDF Export | jsPDF + jspdf-autotable |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |

---

## 3. Data Schema

### 3.1 Project

The central entity representing a construction project.

| Field | Type | Required | Description | Status |
|-------|------|----------|-------------|--------|
| `id` | string (UUID) | Auto | Unique identifier | ✅ Keep |
| `name` | string | ✅ Yes | Project name | ✅ Keep |
| `description` | string | No | Detailed project description | ✅ Keep |
| `clientName` | string | No | Name of the client/owner | 🔄 **Keep or Remove?** |
| `location` | string | No | Project site address | ✅ Keep |
| `status` | enum | ✅ Yes | Current project status | ✅ Keep |
| `startDate` | date | No | Project start date | ✅ Keep |
| `expectedEndDate` | date | No | Expected completion date | ✅ Keep |
| `actualEndDate` | date | No | Actual completion date | 🔄 **Keep or Remove?** |
| `estimatedBudget` | number | No | Estimated total budget | 🔄 **Keep or Remove?** |
| `notes` | string | No | Additional notes | ✅ Keep |
| `isArchived` | boolean | Auto | Soft delete flag (default: false) | ✅ Keep |
| `createdAt` | datetime | Auto | Record creation timestamp | ✅ Keep |
| `updatedAt` | datetime | Auto | Last update timestamp | ✅ Keep |

#### Project Status Options
| Value | Display Name | Description | Status |
|-------|--------------|-------------|--------|
| `planning` | Planning | Project in planning phase | ✅ Keep |
| `in_progress` | In Progress | Active construction | ✅ Keep |
| `on_hold` | On Hold | Temporarily paused | ✅ Keep |
| `completed` | Completed | Project finished | ✅ Keep |
| `cancelled` | Cancelled | Project cancelled | 🔄 **Keep or Remove?** |

#### Computed Fields (calculated from payments)
- `totalIncoming` - Sum of all incoming payments
- `totalOutgoing` - Sum of all outgoing payments  
- `balance` - totalIncoming - totalOutgoing

---

### 3.2 Party

Represents any entity involved in payments (contractors, suppliers, clients, etc.)

| Field | Type | Required | Description | Status |
|-------|------|----------|-------------|--------|
| `id` | string (UUID) | Auto | Unique identifier | ✅ Keep |
| `name` | string | ✅ Yes | Party name (person or company) | ✅ Keep |
| `type` | enum | ✅ Yes | Category of party | ✅ Keep |
| `contactPerson` | string | No | Primary contact name | 🔄 **Keep or Remove?** |
| `phone` | string | No | Phone number | ✅ Keep |
| `email` | string | No | Email address | 🔄 **Keep or Remove?** |
| `address` | string | No | Physical address | 🔄 **Keep or Remove?** |
| `gstin` | string | No | GST Identification Number | 🔄 **Keep or Remove?** |
| `pan` | string | No | PAN number | 🔄 **Keep or Remove?** |
| `bankName` | string | No | Bank name for transfers | 🔄 **Keep or Remove?** |
| `accountNumber` | string | No | Bank account number | 🔄 **Keep or Remove?** |
| `ifscCode` | string | No | Bank IFSC code | 🔄 **Keep or Remove?** |
| `notes` | string | No | Additional notes | ✅ Keep |
| `isArchived` | boolean | Auto | Soft delete flag (default: false) | ✅ Keep |
| `createdAt` | datetime | Auto | Record creation timestamp | ✅ Keep |
| `updatedAt` | datetime | Auto | Last update timestamp | ✅ Keep |

#### Party Type Options
| Value | Display Name | Description | Status |
|-------|--------------|-------------|--------|
| `client` | Client | Project owner/client (payments IN) | ✅ Keep |
| `contractor` | Contractor | Main contractors (payments OUT) | ✅ Keep |
| `subcontractor` | Sub-Contractor | Sub-contractors (payments OUT) | ✅ Keep |
| `supplier` | Supplier | Material suppliers (payments OUT) | ✅ Keep |
| `labour` | Labour | Labour contractors (payments OUT) | ✅ Keep |
| `consultant` | Consultant | Architects, engineers (payments OUT) | ✅ Keep |
| `government` | Government | Taxes, permits, fees (payments OUT) | ✅ Keep |
| `other` | Other | Miscellaneous | ✅ Keep |

---

### 3.3 Payment

Records individual payment transactions linked to a project and party.

> ⚠️ **Note:** No `status` field - entries are only created when payment is actually sent/received.

| Field | Type | Required | Description | Status |
|-------|------|----------|-------------|--------|
| `id` | string (UUID) | Auto | Unique identifier | ✅ Keep |
| `projectId` | string (UUID) | ✅ Yes | Reference to Project | ✅ Keep |
| `partyId` | string (UUID) | ✅ Yes | Reference to Party | ✅ Keep |
| `type` | enum | ✅ Yes | `incoming` or `outgoing` | ✅ Keep |
| `category` | enum | No | Payment category (see below) | 🔄 **Keep or Remove?** |
| `amount` | number | ✅ Yes | Payment amount | ✅ Keep |
| `date` | date | ✅ Yes | Payment date | ✅ Keep |
| `method` | enum | No | Payment method | 🔄 **Keep or Remove?** |
| `reference` | string | No | Cheque #, UTR, transaction ID | 🔄 **Keep or Remove?** |
| `description` | string | No | Payment description/purpose | ✅ Keep |
| `isArchived` | boolean | Auto | Soft delete flag (default: false) | ✅ Keep |
| `createdAt` | datetime | Auto | Record creation timestamp | ✅ Keep |
| `updatedAt` | datetime | Auto | Last update timestamp | ✅ Keep |

#### Payment Type (Required)
| Value | Display Name | Color in PDF |
|-------|--------------|--------------|
| `incoming` | Payment In | 🟢 **Green** |
| `outgoing` | Payment Out | 🔴 **Red** |

#### Payment Category Options (Optional)
🔄 **Keep these categories or just use in/out type?**

**For Incoming Payments:**
| Value | Display Name | Status |
|-------|--------------|--------|
| `advance` | Advance Payment | 🔄 Keep? |
| `milestone` | Milestone Payment | 🔄 Keep? |
| `final` | Final Payment | 🔄 Keep? |
| `retention_release` | Retention Release | 🔄 Keep? |
| `other_income` | Other Income | 🔄 Keep? |

**For Outgoing Payments:**
| Value | Display Name | Status |
|-------|--------------|--------|
| `material` | Material Purchase | 🔄 Keep? |
| `labour` | Labour Payment | 🔄 Keep? |
| `equipment` | Equipment/Machinery | 🔄 Keep? |
| `subcontract` | Sub-contract Payment | 🔄 Keep? |
| `professional_fees` | Professional Fees | 🔄 Keep? |
| `permits` | Permits & Approvals | 🔄 Keep? |
| `utilities` | Utilities (Power, Water) | 🔄 Keep? |
| `transport` | Transportation | 🔄 Keep? |
| `miscellaneous` | Miscellaneous | 🔄 Keep? |

#### Payment Method Options (Optional)
🔄 **Keep payment methods or remove?**

| Value | Display Name | Status |
|-------|--------------|--------|
| `cash` | Cash | 🔄 Keep? |
| `bank_transfer` | Bank Transfer (NEFT/RTGS/IMPS) | 🔄 Keep? |
| `upi` | UPI | 🔄 Keep? |
| `cheque` | Cheque | 🔄 Keep? |
| `demand_draft` | Demand Draft | 🔄 Keep? |
| `card` | Credit/Debit Card | 🔄 Keep? |
| `other` | Other | 🔄 Keep? |

---

## 4. Entity Relationships

```
┌─────────────────┐
│     PROJECT     │
│─────────────────│
│ id              │
│ name            │
│ status          │
│ ...             │
└────────┬────────┘
         │
         │ One project has many payments
         │
         ▼
┌─────────────────┐         ┌─────────────────┐
│     PAYMENT     │         │      PARTY      │
│─────────────────│         │─────────────────│
│ id              │         │ id              │
│ projectId ──────┼─────────│ name            │
│ partyId ────────┼────────►│ type            │
│ type            │         │ ...             │
│ amount          │         └─────────────────┘
│ ...             │
└─────────────────┘
         │
         │ Each payment links to one party
         │ Parties are reusable across projects
```

### Relationship Rules
1. **Project → Payments**: One-to-Many (A project has many payments)
2. **Party → Payments**: One-to-Many (A party can have many payments)
3. **Parties are global**: Same party can receive/make payments across multiple projects
4. **Cascade on archive**: When a project is archived, its payments remain but are hidden in default views

---

## 5. Application Features

### 5.1 Project Management
- [ ] View all projects (list/card view)
- [ ] Filter projects by status
- [ ] Search projects by name
- [ ] Create new project
- [ ] Edit project details
- [ ] Archive/restore project
- [ ] View project dashboard (financial summary)
- [ ] View all payments for a project

### 5.2 Party Management
- [ ] View all parties (list view)
- [ ] Filter parties by type
- [ ] Search parties by name
- [ ] Create new party
- [ ] Edit party details
- [ ] Archive/restore party
- [ ] View payment history for a party (across all projects)

### 5.3 Payment Management
- [ ] View all payments (list view)
- [ ] Filter payments by project, party, type, date range
- [ ] Add new payment (linked to project + party)
- [ ] Edit payment details
- [ ] Archive/restore payment
- [ ] Quick add: Create party inline while adding payment

### 5.4 Reports & Export
- [ ] **Project Ledger PDF** (all payments in a table - green/red colors)
- [ ] Export all data as JSON (backup)
- [ ] Import data from JSON (restore)

### 5.5 Settings
- [ ] View/toggle archived items
- [ ] Data export (JSON backup)
- [ ] Data import (JSON restore)
- [ ] Clear all data (with confirmation)

---

## 6. User Interface

### 6.1 Navigation Structure (Bottom Tabs)

```
┌─────────────────────────────────────┐
│                                     │
│         [Screen Content]            │
│                                     │
├─────────────────────────────────────┤
│  🏗️        👥        💰       ⚙️   │
│Projects  Parties  Payments  Settings│
└─────────────────────────────────────┘
```

### 6.2 Screen List

| Screen | Route | Description |
|--------|-------|-------------|
| Projects List | `/` | Home - List of all projects |
| Project Detail | `/project/[id]` | Single project view with payments |
| Add/Edit Project | `/project/new` or `/project/[id]/edit` | Project form |
| Parties List | `/parties` | List of all parties |
| Party Detail | `/party/[id]` | Single party with payment history |
| Add/Edit Party | `/party/new` or `/party/[id]/edit` | Party form |
| Payments List | `/payments` | All payments (filterable) |
| Add/Edit Payment | `/payment/new` or `/payment/[id]/edit` | Payment form |
| Settings | `/settings` | App settings |

### 6.3 Mobile UX Patterns
- Bottom sheet modals for forms
- Swipe left to archive
- Swipe right to edit
- Pull down to refresh
- Floating Action Button (FAB) for quick add
- iOS safe area handling

---

## 7. Configuration

### 7.1 App Settings (stored in localStorage)

```typescript
{
  currency: {
    symbol: "₹",
    code: "INR",
    position: "before"  // ₹100
  },
  showArchived: false,
  theme: "light"  // ✅ Confirmed: Light mode
}
```

---

## 8. PDF Report: Project Ledger

The primary PDF export - a detailed payment ledger for a project.

### Design Specifications

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONSTRUCTION MANAGEMENT                      │
│                       PROJECT LEDGER                            │
├─────────────────────────────────────────────────────────────────┤
│ Project: Green Valley Apartments                                │
│ Location: Mumbai, Maharashtra                                   │
│ Period: 01-Jan-2024 to 27-Dec-2024                              │
├──────────┬──────────────────┬──────────┬────────────────────────┤
│ Date     │ Party            │ Type     │ Amount                 │
├──────────┼──────────────────┼──────────┼────────────────────────┤
│ 05-Jan   │ ABC Client       │ IN       │ 🟢 +₹10,00,000         │
│ 10-Jan   │ XYZ Supplier     │ OUT      │ 🔴  -₹2,00,000         │
│ 15-Jan   │ Labour Co.       │ OUT      │ 🔴  -₹1,50,000         │
│ 20-Jan   │ ABC Client       │ IN       │ 🟢 +₹15,00,000         │
│ 25-Jan   │ Steel Traders    │ OUT      │ 🔴  -₹5,00,000         │
│ ...      │ ...              │ ...      │ ...                    │
├──────────┴──────────────────┴──────────┼────────────────────────┤
│                          Total IN      │ 🟢 +₹25,00,000         │
│                          Total OUT     │ 🔴 -₹18,00,000         │
│                          Balance       │     ₹7,00,000          │
├─────────────────────────────────────────────────────────────────┤
│ Generated on: 27-Dec-2024                                       │
└─────────────────────────────────────────────────────────────────┘
```

### PDF Color Coding
| Payment Type | Text Color | Amount Format |
|--------------|------------|---------------|
| Incoming (IN) | Green (#16a34a) | +₹XX,XX,XXX |
| Outgoing (OUT) | Red (#dc2626) | -₹XX,XX,XXX |

---

## 9. Data Backup & Restore

### 9.1 Export Format (JSON)
```json
{
  "appName": "ConstructionManagement",
  "version": "1.0.0",
  "exportedAt": "2024-12-27T10:30:00.000Z",
  "currency": {
    "symbol": "₹",
    "code": "INR"
  },
  "data": {
    "projects": [...],
    "parties": [...],
    "payments": [...]
  }
}
```

### 9.2 Import Behavior
- Validate JSON structure before import
- Option to: **Replace all data** OR **Merge with existing**
- Show preview of data counts before confirming

---

## 10. Pending Decisions - Schema Review

Please answer these to finalize the schema:

### 10.1 Project Fields

| Field | Purpose | Keep? (Yes/No) |
|-------|---------|----------------|
| `clientName` | Store client name on project | |
| `estimatedBudget` | Track planned budget | |
| `actualEndDate` | Track when project actually finished | |

### 10.2 Party Fields

| Field | Purpose | Keep? (Yes/No) |
|-------|---------|----------------|
| `contactPerson` | Primary contact name | |
| `email` | Email address | |
| `address` | Physical address | |
| `gstin` | GST number | |
| `pan` | PAN number | |
| `bankName` | Bank name | |
| `accountNumber` | Account number | |
| `ifscCode` | IFSC code | |

### 10.3 Payment Fields

| Field | Purpose | Keep? (Yes/No) |
|-------|---------|----------------|
| `category` | Granular categories (material, labour, etc.) | |
| `method` | Payment method (cash, UPI, etc.) | |
| `reference` | Cheque/UTR number | |

### 10.4 Project Status

| Status | Keep? (Yes/No) |
|--------|----------------|
| `planning` | |
| `in_progress` | |
| `on_hold` | |
| `completed` | |
| `cancelled` | |

---

## 11. Development Phases

### Phase 1: Foundation (MVP)
- [x] Next.js project setup
- [ ] PWA configuration (manifest, service worker)
- [ ] Database setup (Dexie.js)
- [ ] Basic UI layout with navigation

### Phase 2: Core CRUD
- [ ] Project CRUD operations
- [ ] Party CRUD operations
- [ ] Payment CRUD operations
- [ ] Link payments to projects and parties

### Phase 3: Views & Filters
- [ ] Project list with filters
- [ ] Party list with filters
- [ ] Payment list with filters
- [ ] Project detail view (with payments)
- [ ] Party detail view (payment history)

### Phase 4: Reports & Export
- [ ] PDF ledger generation (green/red colors)
- [ ] JSON data export
- [ ] JSON data import

### Phase 5: Polish
- [ ] Animations and transitions
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] iOS-specific optimizations

---

## Appendix: Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 27, 2024 | Initial draft |
| 1.1 | Dec 27, 2024 | Confirmed: Currency (₹), Theme (Light), App name, PDF format, Removed payment status |

---

## Next Steps

Once you confirm **Section 10** (pending decisions), we'll start building!

Quick way to respond - just copy and fill:

```
Project Fields:
- clientName: Yes/No
- estimatedBudget: Yes/No  
- actualEndDate: Yes/No

Party Fields:
- contactPerson: Yes/No
- email: Yes/No
- address: Yes/No
- gstin: Yes/No
- pan: Yes/No
- bankName: Yes/No
- accountNumber: Yes/No
- ifscCode: Yes/No

Payment Fields:
- category: Yes/No
- method: Yes/No
- reference: Yes/No

Project Statuses:
- planning: Yes/No
- in_progress: Yes/No
- on_hold: Yes/No
- completed: Yes/No
- cancelled: Yes/No
```

🚀
