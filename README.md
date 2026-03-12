# Contract Builder CBA

A modern, visual contract building application that enables users to create, customize, and manage contracts through an intuitive drag-and-drop canvas interface.

## Overview

Contract Builder CBA is a full-stack web application built with Next.js that transforms the contract creation process from a tedious document editing task into an interactive, visual experience. Users can design contracts by dragging elements onto a canvas, customizing properties, and generating professional contract documents.

## End Product Vision

### Core Features

**Visual Canvas Editor**
- Drag-and-drop interface for building contract layouts
- Real-time preview of contract structure
- Interactive toolbox with pre-built contract elements (text blocks, signature fields, date fields, tables, clauses)
- Properties panel for customizing element attributes (font, size, color, alignment, borders)
- Multi-layer element management with z-index control
- Undo/redo functionality for editing actions

**Contract Management**
- Create, read, update, and delete contracts (CRUD operations)
- Save contracts as drafts or mark as finalized
- Version history tracking
- Template library for common contract types
- Search and filter contracts by status, date, or custom fields

**Data Persistence**
- PostgreSQL database via AWS RDS for production-grade reliability
- Prisma ORM for type-safe database operations
- Automatic schema migrations
- Secure data storage with encryption at rest

**User Experience**
- Responsive design that works on desktop and tablet devices
- Intuitive UI with modern styling using Tailwind CSS
- Real-time validation and error handling
- Export contracts to PDF format
- Print-ready contract layouts

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (AWS RDS)
- **ORM**: Prisma
- **API**: Next.js API Routes (RESTful)
- **Deployment**: Vercel (frontend) + AWS RDS (database)

### User Workflow

1. **Create New Contract**: User clicks "New Contract" and selects a template or starts blank
2. **Design Layout**: Drag elements from toolbox onto canvas workspace
3. **Customize Elements**: Select elements and adjust properties in the properties panel
4. **Add Content**: Fill in text fields, add clauses, insert signature blocks
5. **Preview**: Review the contract in real-time as it's being built
6. **Save**: Save as draft or finalize the contract
7. **Export**: Generate PDF or print the final contract document

### Key Differentiators

- Visual-first approach eliminates the need for complex document editors
- Pre-built contract elements speed up creation time
- Template system ensures consistency and compliance
- Cloud-based storage enables access from anywhere
- Type-safe development reduces bugs and improves maintainability

## Project Structure

```
contract_builder_cba/          # Main application directory
├── app/                       # Next.js app directory
│   ├── api/                   # API routes
│   │   └── contracts/         # Contract CRUD endpoints
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/                # React components
│   ├── CanvasEditor.tsx       # Main canvas editor
│   ├── CanvasToolbox.tsx      # Element toolbox
│   ├── CanvasWorkspace.tsx    # Canvas workspace
│   ├── CanvasPropertiesPanel.tsx  # Properties editor
│   ├── ContractForm.tsx       # Contract metadata form
│   └── ContractPreview.tsx    # Contract preview
├── lib/                       # Utility libraries
│   ├── prisma.ts              # Prisma client
│   └── contract-utils.ts      # Contract helpers
├── prisma/                    # Database schema
│   └── schema.prisma          # Prisma schema
├── types/                     # TypeScript types
│   └── contract.ts            # Contract type definitions
└── public/                    # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or AWS RDS)
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
# Navigate to project directory
cd contract_builder_cba

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Database Setup

See [contract_builder_cba/PRISMA_SETUP.md](./contract_builder_cba/PRISMA_SETUP.md) for detailed Prisma configuration instructions.

See [contract_builder_cba/AWS_RDS_SETUP.md](./contract_builder_cba/AWS_RDS_SETUP.md) for AWS RDS PostgreSQL setup guide.

## Documentation

- [ARCHITECTURE.md](./contract_builder_cba/ARCHITECTURE.md) - System architecture and design decisions
- [CANVAS_EDITOR.md](./contract_builder_cba/CANVAS_EDITOR.md) - Canvas editor implementation details
- [PRISMA_SETUP.md](./contract_builder_cba/PRISMA_SETUP.md) - Database and Prisma configuration
- [AWS_RDS_SETUP.md](./contract_builder_cba/AWS_RDS_SETUP.md) - AWS RDS setup instructions

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from contract_builder_cba directory
cd contract_builder_cba
vercel
```

### Environment Variables

Required environment variables for production:

```
DATABASE_URL="postgresql://user:password@host:5432/database"
```

## Contributing

This is a private project. For questions or issues, contact the development team.

## License

Proprietary - All rights reserved
