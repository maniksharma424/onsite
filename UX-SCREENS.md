# Construction Management - UX & Screens

## Navigation (3 Tabs)

```
┌─────────────────────────────────────┐
│ Construction Management      [⚙️]  │  ← Settings in header
├─────────────────────────────────────┤
│                                     │
│         [Active Screen]             │
│                                     │
├─────────────────────────────────────┤
│    🏗️          👥          💰      │
│  Projects    Vendors    Payments    │
└─────────────────────────────────────┘
```

**Note:** Settings accessible via gear icon in header (top right)

---

## Screen Flow

```
┌──────────────┐
│   Projects   │ ← Home
│    (List)    │
└──────┬───────┘
       │ Tap project card
       ▼
┌──────────────┐      ┌──────────────┐
│   Project    │─────►│  Export PDF  │
│    Detail    │
└──────┬───────┘
       │ Tap "Payment IN" or "Payment OUT"
       ▼
┌──────────────┐      ┌──────────────┐
│ Add Payment  │─────►│ Add Vendor   │ ← Can create new vendor
│    Form      │      │ (inline)     │
└──────────────┘      └──────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │   Contacts   │ ← Import from device
                      └──────────────┘
```

---

## 1. PROJECTS TAB

### 1.1 Projects List (Home)
**Route:** `/`

```
┌─────────────────────────────────────┐
│ Projects                     [⚙️]  │
├─────────────────────────────────────┤
│ [🔍 Search projects...]            │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🏗️ Green Valley Apartments    >│ │
│ │ In Progress                     │ │
│ │ IN: ₹25L  OUT: ₹18L  BAL: ₹7L  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏗️ Downtown Office Tower      >│ │
│ │ Planning                        │ │
│ │ IN: ₹0    OUT: ₹0    BAL: ₹0   │ │
│ └─────────────────────────────────┘ │
│                                     │
│                           [+ Add]   │  ← FAB button
├─────────────────────────────────────┤
│    🏗️          👥          💰      │
│  Projects    Vendors    Payments    │
└─────────────────────────────────────┘
```

**Actions:**
| Action | How |
|--------|-----|
| Add project | Tap [+ Add] FAB |
| View project | Tap card |
| Edit project | Swipe right OR long press |
| Delete project | Swipe left OR long press |

---

### 1.2 Project Detail
**Route:** `/project/[id]`

```
┌─────────────────────────────────────┐
│ ← Back        Green Valley   [Edit] │
├─────────────────────────────────────┤
│ 📍 Mumbai, Maharashtra              │
│ Status: In Progress                 │
│ Start: 01 Jan 2024                  │
├─────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │ 🟢 IN   │ │ 🔴 OUT  │ │ Balance │ │
│ │ ₹25,00L │ │ ₹18,00L │ │  ₹7,00L │ │
│ └─────────┘ └─────────┘ └─────────┘ │
├─────────────────────────────────────┤
│ [📄 Export PDF]                     │
├─────────────────────────────────────┤
│                                     │
│ ┌───────────────┐ ┌───────────────┐ │
│ │ 🟢 Payment IN │ │ 🔴 Payment OUT│ │
│ └───────────────┘ └───────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ RECENT PAYMENTS                     │
├─────────────────────────────────────┤
│ 27 Dec  ABC Client      🟢 +₹5,00L │
│ 25 Dec  Steel Traders   🔴 -₹2,00L │
│ 20 Dec  Labour Co.      🔴 -₹1,50L │
│ [View All Payments →]               │
└─────────────────────────────────────┘
```

**Actions:**
| Action | How |
|--------|-----|
| Edit project | Tap [Edit] |
| Export PDF | Tap [Export PDF] button |
| Add incoming payment | Tap [🟢 Payment IN] |
| Add outgoing payment | Tap [🔴 Payment OUT] |
| View payment | Tap payment row |

---

### 1.3 Add/Edit Project (Bottom Sheet)

```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Add Project                 [Save]  │
├─────────────────────────────────────┤
│ Name *                              │
│ [_____________________________]     │
│                                     │
│ Location                            │
│ [_____________________________]     │
│                                     │
│ Status                              │
│ [Planning                    🔽]    │
│                                     │
│ Start Date                          │
│ [Select date               📅]     │
│                                     │
│ Notes                               │
│ [_____________________________]     │
│                                     │
└─────────────────────────────────────┘
```

---

### 1.4 Add Payment (Bottom Sheet)
**Opens when:** Tap "Payment IN" or "Payment OUT" on Project Detail

```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ 🟢 Payment IN               [Save]  │  ← Or "🔴 Payment OUT"
├─────────────────────────────────────┤
│ Project: Green Valley (pre-filled)  │
├─────────────────────────────────────┤
│ Vendor *                            │
│ [Select vendor               🔽]    │
│ ┌─────────────────────────────────┐ │
│ │ + Add New Vendor                │ │  ← Opens vendor form
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Amount *                            │
│ [₹ ___________________________]     │
├─────────────────────────────────────┤
│ Date *                              │
│ [27 Dec 2024               📅]     │
├─────────────────────────────────────┤
│ Description                         │
│ [_____________________________]     │
│                                     │
└─────────────────────────────────────┘
```

---

## 2. VENDORS TAB

### 2.1 Vendors List
**Route:** `/vendors`

```
┌─────────────────────────────────────┐
│ Vendors                      [⚙️]  │
├─────────────────────────────────────┤
│ [🔍 Search vendors...]              │
├─────────────────────────────────────┤
│ [All] [Clients] [Contractors] [...]│  ← Filter by type
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 👤 ABC Constructions           >│ │
│ │ Contractor • 📞 9876543210      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Raj Kumar                   >│ │
│ │ Client • 📞 9123456789          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Steel Traders               >│ │
│ │ Supplier • 📞 9988776655        │ │
│ └─────────────────────────────────┘ │
│                                     │
│                           [+ Add]   │
├─────────────────────────────────────┤
│    🏗️          👥          💰      │
│  Projects    Vendors    Payments    │
└─────────────────────────────────────┘
```

**Actions:**
| Action | How |
|--------|-----|
| Add vendor | Tap [+ Add] FAB |
| View vendor | Tap card |
| Edit vendor | Swipe right OR long press |
| Delete vendor | Swipe left OR long press |

---

### 2.2 Add/Edit Vendor (Bottom Sheet)

```
┌─────────────────────────────────────┐
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│ Add Vendor                  [Save]  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📱 Import from Contacts         │ │  ← NEW: Device contacts
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Name *                              │
│ [_____________________________]     │
│                                     │
│ Type *                              │
│ [Select type               🔽]     │
│  • Client                           │
│  • Contractor                       │
│  • Supplier                         │
│  • Labour                           │
│  • Other                            │
│                                     │
│ Phone                               │
│ [_____________________________]     │
│                                     │
│ Notes                               │
│ [_____________________________]     │
│                                     │
└─────────────────────────────────────┘
```

**📱 Import from Contacts:**
- Opens device contact picker
- Auto-fills: Name, Phone
- User just selects vendor type and saves

---

### 2.3 Vendor Detail
**Route:** `/vendor/[id]`

Shows all payments made to or received from this vendor across ALL projects.

```
┌─────────────────────────────────────┐
│ ← Back                       [Edit] │
├─────────────────────────────────────┤
│ 👤 ABC Constructions               │
│ Type: Contractor                    │
│ 📞 9876543210                       │
├─────────────────────────────────────┤
│ SUMMARY                             │
│ ┌───────────────┐ ┌───────────────┐ │
│ │ 🟢 Received   │ │ 🔴 Paid       │ │
│ │ ₹0            │ │ ₹15,00,000    │ │
│ └───────────────┘ └───────────────┘ │
├─────────────────────────────────────┤
│ ALL PAYMENTS                        │
│ [All] [🟢 IN] [🔴 OUT]             │  ← Filter
├─────────────────────────────────────┤
│                                     │
│ 🏗️ Green Valley Apartments         │  ← Grouped by project
│ ├─ 27 Dec  Cement advance  🔴-₹5,00L│
│ └─ 20 Dec  Labour Nov      🔴-₹3,00L│
│                                     │
│ 🏗️ Downtown Office Tower           │
│ └─ 15 Dec  Steel work      🔴-₹7,00L│
│                                     │
└─────────────────────────────────────┘
```

**Actions:**
| Action | How |
|--------|-----|
| Edit vendor | Tap [Edit] |
| View payment detail | Tap payment row |
| Filter by type | Tap All/IN/OUT tabs |

---

## 3. PAYMENTS TAB

### 3.1 Payments List
**Route:** `/payments`

```
┌─────────────────────────────────────┐
│ Payments                     [⚙️]  │
├─────────────────────────────────────┤
│ [All] [🟢 IN] [🔴 OUT]             │  ← Quick filters
├─────────────────────────────────────┤
│ [Filter: Project 🔽] [Date 🔽]     │  ← Advanced filters
├─────────────────────────────────────┤
│ TODAY                               │
│ ┌─────────────────────────────────┐ │
│ │ Green Valley                    │ │
│ │ ABC Client        🟢 +₹5,00,000 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ YESTERDAY                           │
│ ┌─────────────────────────────────┐ │
│ │ Green Valley                    │ │
│ │ Steel Traders     🔴 -₹2,00,000 │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Office Tower                    │ │
│ │ Raj Kumar         🟢+₹10,00,000 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ EARLIER                             │
│ ...                                 │
├─────────────────────────────────────┤
│    🏗️          👥          💰      │
│  Projects    Vendors    Payments    │
└─────────────────────────────────────┘
```

**Filters:**
| Filter | Options |
|--------|---------|
| Type | All / IN / OUT |
| Project | Dropdown of all projects |
| Date Range | Today / This Week / This Month / Custom |

**Note:** No add button here - payments are added from Project Detail

---

## 4. SETTINGS (Header Menu)

**Access:** Tap ⚙️ in header (top right)

```
┌─────────────────────────────────────┐
│ Settings                            │
├─────────────────────────────────────┤
│ DATA                                │
│ ├─ 📤 Export Backup (JSON)    [→]  │
│ ├─ 📥 Import Backup           [→]  │
│ └─ 👁️ Show Archived          [○]  │
├─────────────────────────────────────┤
│ DANGER ZONE                         │
│ └─ 🗑️ Clear All Data          [→]  │
├─────────────────────────────────────┤
│ ABOUT                               │
│ └─ Version 1.0.0                   │
└─────────────────────────────────────┘
```

---

## Summary of Changes from Previous Version

| Before | After |
|--------|-------|
| 4 tabs (Projects, Parties, Payments, Settings) | 3 tabs (Projects, Vendors, Payments) |
| "Parties" | Renamed to **"Vendors"** |
| Settings as tab | Settings in **header menu** |
| Add payment from multiple places | Add payment only from **Project Detail** |
| Manual vendor entry only | **Import from device contacts** |

---

## Device Permissions Needed

| Permission | Purpose |
|------------|---------|
| Contacts (Read) | Import vendor name/phone from device contacts |

---

## Questions

1. **Vendor Detail screen** - needed or just edit in bottom sheet?
2. **Payment filters** - are Project + Date Range + Type enough?
3. **Anything else to add/change?**

Ready for your feedback! 🏗️
