# 📝 Contract Builder CBA

> **The Definitive Digital Contract & E-Signature Platform for Maritime** ⚓

Build, sign, seal, and distribute employment contracts with a visual drag-and-drop editor, multi-party digital signatures, and end-to-end tamper-proof verification — all in one beautiful, enterprise-grade application.

## ✨ Why Contract Builder CBA?

- 🎨 **Visual-First Design** — Drag-and-drop canvas editor replaces tedious document editing with an interactive, design-driven experience
- ✍️ **5 Signature Methods** — Draw, Type, Upload, DSC (Digital Signature Certificate), and Aadhaar eSign in a single unified flow
- 🔒 **Tamper-Proof Security** — SHA-256 hashing, sealed PDFs, and real-time verification detect any unauthorized changes
- 🚢 **Maritime-Ready** — Purpose-built for seafarer employment contracts with MLC-compliant formatting and CBA wage structures
- ⚡ **Lightning Fast** — Next.js 16 + React 19 + PostgreSQL (AWS RDS) + Prisma for performance at scale
- 🔗 **SAC Integration** — Direct sync with Synergy App Central via Databricks for live seafarer and contract data

---

## 🎯 Feature Tour

### 📊 Dashboard — Your Command Center
- Real-time contract statistics: total, drafts, pending review, pending signing, signed, cancelled
- Quick action cards for creating contracts, importing from SAC, and browsing templates
- Recent contracts feed with instant navigation

### 🎨 Visual Canvas Editor — Design Contracts, Don't Just Fill Forms
- Drag-and-drop interface with 10+ element types: text, headings, fields, tables, signatures, dividers, images, checkboxes, clauses, page breaks
- Properties panel for fine-grained customization (fonts, colors, alignment, borders, field bindings)
- Multi-layer z-index control, grid snapping, zoom, undo/redo
- Pre-built clause library with categorized legal clauses (Termination, Liability, Confidentiality, Compliance)

### 📄 Contract Lifecycle — From Draft to Sealed Document
- **7-Step Creation Wizard**: Template selection → Personal details → Vessel details → Contract terms → Wages → Earnings & Deductions → Review & Sign
- **Status State Machine**: `DRAFT` → `PENDING_REVIEW` → `PENDING_SIGNING` → `PARTIALLY_SIGNED` → `SIGNED` (or `CANCELLED`)
- **Tabbed Contract View**: Form Editor, Live Preview, Signing Panel, Activity Log
- **Version History**: Full contract versioning with data snapshots

### ✍️ Multi-Party Digital Signing — Enterprise E-Signatures
- **5 Signature Methods**: Draw on canvas, Type with cursive fonts, Upload image, DSC (PKCS#11/PEM), Aadhaar eSign (UIDAI/NSDL)
- **Sequential & Parallel Signing**: Enforce signing order or allow simultaneous signatures
- **Reviewer Workflow**: Assign reviewers who can approve or return contracts before signing begins
- **Token-Based External Signing**: Send signing links via email — signers don't need an account
- **OTP Identity Verification**: 6-digit OTP via email before signature capture for external signers
- **Auto-Seal & Auto-Distribute**: Final signature triggers automatic document sealing and email distribution

### 🛡️ Document Sealing & Verification — Tamper-Proof Contracts
- **PDF Sealing**: Generates sealed PDFs with embedded signatures, certificate of completion, and SHA-256 hash using `pdf-lib`
- **Digital Verification**: Verify contract integrity by contract number — detects any post-signing modifications
- **Audit Trail**: Timestamped, color-coded activity log with user info, IP addresses, and action details
- **E-Stamping**: Apply judicial, non-judicial, or commercial e-stamps with SHCIL gateway integration (India jurisdiction)

### 📧 Notifications & Distribution
- **Signing Requests**: Automated email with unique token-based signing links
- **OTP Delivery**: Secure one-time passwords for identity verification
- **Completion Notices**: Notify all parties when signing is complete
- **Sealed Document Distribution**: Email sealed PDF to all participants (creator, signers, reviewers)
- **Rejection Notices**: Inform initiators when a contract is returned by a reviewer

### 🔄 SAC / Databricks Integration — Live Data Sync
- **Synergy App Central**: Direct sync with the central maritime operations platform
- **Databricks SQL**: OAuth-authenticated queries to the `open_analytics_zone` data warehouse
- **Automated Import**: Sync vessels, seafarers, and contracts with intelligent field mapping
- **Smart Search**: Search SAC data by seafarer name, IMO number, or crew code

### 📦 Bulk Operations — Scale Without Limits
- **Bulk Upload**: Drag-and-drop multiple PDF contracts for batch ingestion
- **Bulk Signing**: Select multiple pending contracts and sign them all with a single signature capture

### 🔁 Workflow Templates — Reusable Signing Pipelines
- **Visual Step Builder**: Create multi-step signing/review workflows with drag-and-drop ordering
- **Role Assignment**: Assign Signer or Reviewer roles to each step with required/optional flags
- **Template Library**: Save and reuse workflow templates across contracts

### 📑 Template Library — Start Fast, Stay Consistent
- **6 Pre-Built Templates**: SEC Standard Employment, Fixed-Term, Crew NDA, Vessel Service Agreement, Manning Agency, Training Agreement
- **Custom Templates**: Save canvas layouts with default values for rapid contract creation
- **Searchable & Filterable**: Browse by category with instant search

### 📂 Document Attachments — Supporting Documentation
- **Drag-and-Drop Upload**: Attach supporting files to any contract
- **File Management**: Download, delete, and track file sizes and types
- **Audit Linkage**: All attachment operations logged in the audit trail

### 📊 Monitor Dashboard — Real-Time Oversight
- **Status Breakdown**: Visual bar chart of contracts by status
- **Activity Feed**: Live stream of recent contract actions across the system
- **Document Table**: Filterable, sortable view of all contracts with key metadata

### 🔐 Authentication & Role-Based Access
- **NextAuth Credentials**: Email/password authentication with bcrypt hashing and JWT sessions
- **4 Roles**: `ADMIN` | `INITIATOR` | `SIGNER` | `REVIEWER`
- **Middleware Protection**: All routes except login, external signing portal, and auth APIs require authentication
- **Admin Controls**: User management with role assignment and status toggling

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────┐
│                    Next.js 16 App                    │
│              (App Router + API Routes)               │
├──────────┬──────────┬──────────┬────────────────────┤
│  Canvas  │ Signing  │  Verify  │  SAC Integration   │
│  Editor  │  Engine  │  Engine  │  (Databricks SQL)  │
├──────────┴──────────┴──────────┴────────────────────┤
│           Prisma ORM (Type-Safe Queries)             │
├─────────────────────────────────────────────────────┤
│        PostgreSQL (AWS RDS) + SSL + Pooling          │
└─────────────────────────────────────────────────────┘
```

### 🛠 Technical Highlights

- **Next.js 16 App Router** with type-safe API route handlers
- **React 19** with server components and streaming
- **Prisma 7** ORM with PostgreSQL adapter and connection pooling
- **PDF Generation**: `jsPDF` for contract PDFs, `pdf-lib` for sealed documents
- **Signature Capture**: `signature_pad` + `react-signature-canvas` with draw/type/upload modes
- **Drag-and-Drop**: `@dnd-kit` for canvas element manipulation and workflow building
- **Form Validation**: `zod` schemas for all contract sections with comprehensive error handling
- **Cryptography**: SHA-256 hashing, RSA-SHA256 verification, Web Crypto API for DSC signing
- **Email**: Nodemailer with SMTP transport and mock mode for development
- **Charts**: Recharts for dashboard and monitor visualizations
- **UI System**: Shadcn/ui primitives with Tailwind CSS 4 and `class-variance-authority`

### 🔐 Security Architecture
- JWT-based sessions with role claims
- Middleware-enforced route protection
- Bcrypt password hashing (cost factor configurable)
- SHA-256 document integrity hashing
- OTP-based identity verification for external signers
- Token-based signing with expiry and single-use enforcement
- Full audit trail with IP tracking

---

## 🗂️ Project Structure

```
contract_builder_cba/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth authentication
│   │   ├── contracts/[id]/          # CRUD + status, audit, export, pdf,
│   │   │                            #   attachments, estamp, seal, distribute
│   │   ├── signing/                 # Sign, assign, review, status,
│   │   │                            #   token-based signing + OTP
│   │   ├── bulk/                    # Bulk upload & bulk sign
│   │   ├── clauses/                 # Clause library CRUD
│   │   ├── templates/               # Contract templates CRUD
│   │   ├── users/                   # User management (admin)
│   │   ├── search/                  # SAC data search
│   │   ├── verify/                  # Contract verification
│   │   ├── notify/                  # Email notifications
│   │   ├── estamp/verify/           # E-stamp verification
│   │   ├── workflows/               # Workflow template CRUD
│   │   └── dashboard/stats/         # Dashboard aggregations
│   ├── contracts/                   # List, create, detail pages
│   ├── templates/                   # Template browser
│   ├── users/                       # User management page
│   ├── settings/                    # App settings
│   ├── verify/                      # Signature verification
│   ├── bulk/                        # Bulk operations
│   ├── monitor/                     # System monitor
│   ├── workflows/                   # Workflow management
│   ├── sign/[token]/                # External signing portal
│   └── login/                       # Authentication
├── components/
│   ├── CanvasEditor.tsx             # Visual contract editor
│   ├── CanvasToolbox.tsx            # Element palette
│   ├── CanvasWorkspace.tsx          # Canvas rendering area
│   ├── CanvasPropertiesPanel.tsx    # Element property inspector
│   ├── ContractForm.tsx             # Form-based editor
│   ├── ContractPreview.tsx          # MLC-compliant preview
│   ├── SigningModal.tsx             # Signing dialog
│   ├── SignaturePad.tsx             # Multi-mode signature input
│   ├── SignatureCapture.tsx         # Alternative signature capture
│   ├── ClauseLibrary.tsx            # Legal clause browser
│   ├── AuditTrail.tsx               # Activity timeline
│   ├── WorkflowBuilder.tsx          # Visual workflow step builder
│   ├── DocumentAttachments.tsx      # File attachment manager
│   ├── EStampForm.tsx               # E-stamping interface
│   ├── AadhaarSign.tsx              # Aadhaar eSign component
│   ├── DSCSign.tsx                  # DSC signing component
│   ├── layout/                      # AppShell, Header, Sidebar
│   ├── providers/                   # AuthProvider (NextAuth session)
│   └── ui/                          # Shadcn/ui primitives
├── lib/
│   ├── auth.ts                      # NextAuth config & helpers
│   ├── prisma.ts                    # Database client singleton
│   ├── validations.ts               # Zod schemas
│   ├── utils.ts                     # Tailwind utilities
│   ├── email.ts                     # SMTP transport
│   ├── notifications.ts             # Email templates
│   ├── otp.ts                       # OTP generation & verification
│   ├── file-storage.ts              # Local file storage
│   ├── estamp-service.ts            # E-stamp gateway integration
│   ├── sealing-service.ts           # PDF sealing engine
│   ├── distribution-service.ts      # Sealed doc distribution
│   ├── aadhaar-service.ts           # Aadhaar eSign gateway
│   ├── dsc-service.ts               # DSC signing & verification
│   ├── pdf/contract-pdf.ts          # jsPDF contract generation
│   └── services/
│       ├── verification-service.ts  # Tamper detection engine
│       ├── core/sync-orchestrator.ts # SAC data sync coordinator
│       └── contracts/sac-service.ts # Databricks SQL queries
├── prisma/
│   └── schema.prisma                # 15+ models, enums, indexes
├── middleware.ts                     # Route protection
├── types/                           # TypeScript declarations
└── scripts/                         # Seed & utility scripts
```

---

## 🚀 Getting Started

### 📋 Prerequisites

- 🟢 **Node.js 18+** (LTS recommended)
- 🐘 **PostgreSQL** database (AWS RDS or local)
- 📦 **npm**, **yarn**, **pnpm**, or **bun**

### ⚡ Install & Run

```bash
cd contract_builder_cba

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed initial users (optional)
npx ts-node scripts/seed-users.ts

# Start development server
npm run dev
# → http://localhost:3002
```

### 🔧 Environment Setup

```bash
# .env

# PostgreSQL (AWS RDS)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# Databricks / SAC Integration
DATABRICKS_CLIENT_ID=your_client_id
DATABRICKS_CLIENT_SECRET=your_client_secret
DATABRICKS_HOST=your_host.azuredatabricks.net
DATABRICKS_WORKSPACE_ID=your_workspace_id
DATABRICKS_HTTP_PATH="/sql/1.0/warehouses/your_warehouse_id"

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3002

# Email (SMTP)
WS_SMTP_HOST=smtp.example.com
WS_SMTP_PORT=587
WS_SMTP_USER=your_smtp_user
WS_SMTP_PASS=your_smtp_pass
WS_SMTP_FROM=noreply@yourdomain.com

# App URL (for email links)
WS_APP_URL=http://localhost:3002

# E-Stamping Gateway (optional)
WS_ESTAMP_API_URL=
WS_ESTAMP_API_KEY=

# Aadhaar eSign Gateway (optional)
WS_AADHAAR_ESIGN_URL=
WS_AADHAAR_ESIGN_KEY=
```

---

## ⚡ 60-Second Workflows

### 📝 Create & Sign a Contract
🎨 **Pick template** → ✏️ **Fill details** → 👀 **Preview** → 👥 **Assign signers** → ✅ **Submit for signing** → ✍️ **Sign** → 🔒 **Auto-seal** → 📧 **Auto-distribute**

### ✍️ External Signing (No Account Needed)
📧 **Receive email link** → 🔑 **Verify OTP** → ✍️ **Draw/type/upload signature** → ✅ **Done**

### 🔍 Verify a Contract
🔢 **Enter contract number** → 🛡️ **System checks SHA-256 hash** → ✅ **Integrity confirmed** (or ⚠️ **Tampering detected**)

### 📦 Bulk Sign Multiple Contracts
☑️ **Select contracts** → ✍️ **Draw signature once** → 🚀 **Sign all** → 📧 **Notifications sent**

---

## 🏆 Key Differentiators

| | Contract Builder CBA | Traditional Tools |
|---|---|---|
| **Contract Design** | Visual drag-and-drop canvas | Static form filling |
| **Signature Methods** | 5 methods (Draw, Type, Upload, DSC, Aadhaar) | Usually 1-2 |
| **External Signing** | Token + OTP — no account needed | Requires registration |
| **Document Integrity** | SHA-256 hash + sealed PDF + verification | Basic or none |
| **Maritime Compliance** | MLC-format, CBA wages, e-stamping | Generic templates |
| **Data Integration** | Live SAC/Databricks sync | Manual import |
| **Auto-Seal & Distribute** | On final signature, automatic | Manual post-signing |
| **Audit Trail** | Every action, timestamped, with IP | Basic logging |

---

## 🗺️ Roadmap

- 📊 **Interactive Reporting** with drill-down analytics and contract benchmarking
- 📡 **Offline-First Mode** for low-connectivity maritime environments
- 🤖 **AI Contract Assistant** for clause suggestions and compliance checking
- 📱 **Mobile Signing** — native mobile experience for on-the-go approvals
- 🌐 **Multi-Language Support** — localization for global fleet operations
- 🔄 **Webhook Integrations** — real-time event notifications to external systems
- 📈 **Advanced Analytics Dashboard** — signing velocity, bottleneck detection, SLA tracking

---

## 🏢 About Synergy

**Synergy Group** is a global leader in maritime innovation, operating one of the world's largest and most diverse fleets. With deep domain expertise in maritime operations, Synergy builds technology solutions that address real-world challenges faced by the shipping industry.

### 🌟 Synergy at a Glance

| | |
|---|---|
| 🚢 **700+ Vessels** | Managed across multiple segments worldwide |
| 👥 **15,000+ Seafarers** | Across global operations |
| 🌍 **50+ Countries** | Operational and crew presence |
| ⚖️ **MLC 2006 Pioneers** | Leading maritime labor compliance |
| 📊 **Decades of Data** | Powering intelligent maritime solutions |

### 🎯 Why Synergy Solutions Matter

Our solutions aren't built in isolation — they're born from real operational challenges and battle-tested in the most demanding maritime environments. Contract Builder CBA represents Synergy's commitment to digitizing maritime operations: from paper-based processes to intelligent, automated, and verifiable digital workflows.

### 🔗 Synergy App Central (SAC)

**SAC** serves as the central nervous system for Synergy's maritime operations:
- **Real-time data synchronization** across vessels, seafarers, and contracts
- **Intelligent field mapping** adapting to various contract and data formats
- **Automated validation** ensuring accuracy across all operations
- **Seamless integration** with existing maritime systems and workflows

---

## 📞 License & Support

This project is **proprietary software** developed by **Synergy Group**. For access, onboarding, or support, contact the development team.

Interested in Synergy's maritime technology solutions? Reach out to learn how our innovations can transform your maritime operations.

---

<div align="center">

### 📝 **Build. Sign. Seal. Verify.** ⚓

**Contract Builder CBA** — Enterprise digital contract management, built by Synergy.

*From maritime experts, for maritime professionals worldwide.*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://prisma.io/)
[![AWS](https://img.shields.io/badge/AWS_RDS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/rds/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)

</div>
