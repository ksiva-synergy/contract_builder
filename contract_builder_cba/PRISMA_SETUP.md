# Prisma Setup Guide

## What's Been Configured

✅ Prisma installed and initialized
✅ Database schema created for Employment Contracts
✅ Prisma Client singleton configured
✅ API routes created for CRUD operations
✅ AWS RDS PostgreSQL connection configured

## Project Structure

```
contract_builder_cba/
├── prisma/
│   └── schema.prisma          # Database schema
├── lib/
│   └── prisma.ts              # Prisma Client singleton
├── app/api/contracts/
│   ├── route.ts               # GET all, POST create
│   └── [id]/route.ts          # GET, PUT, DELETE by ID
└── .env                       # Database connection string
```

## Database Schema

The schema includes:

- **EmploymentContract** - Main contract table
- **OtherEarning** - Additional earnings (one-to-many)
- **Deduction** - Deductions (one-to-many)
- **SalaryRevision** - Salary history (one-to-many)

## Setup Steps

### 1. Configure Database Connection

Edit `.env` file with your AWS RDS credentials:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@ENDPOINT:5432/DATABASE?schema=public"
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma Client based on your schema.

### 3. Push Schema to Database

For development (quick setup):
```bash
npx prisma db push
```

For production (with migrations):
```bash
npx prisma migrate dev --name init
```

### 4. Verify Connection

Open Prisma Studio to browse your database:
```bash
npx prisma studio
```

This opens a GUI at http://localhost:5555

## API Endpoints

### GET /api/contracts
Fetch all contracts with related data

```typescript
const response = await fetch('/api/contracts');
const contracts = await response.json();
```

### POST /api/contracts
Create a new contract

```typescript
const response = await fetch('/api/contracts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(contractData),
});
```

### GET /api/contracts/[id]
Fetch a single contract

```typescript
const response = await fetch(`/api/contracts/${id}`);
const contract = await response.json();
```

### PUT /api/contracts/[id]
Update a contract

```typescript
const response = await fetch(`/api/contracts/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedData),
});
```

### DELETE /api/contracts/[id]
Delete a contract

```typescript
const response = await fetch(`/api/contracts/${id}`, {
  method: 'DELETE',
});
```

## Using Prisma Client in Your Code

```typescript
import { prisma } from '@/lib/prisma';

// Create
const contract = await prisma.employmentContract.create({
  data: { /* contract data */ },
});

// Read
const contracts = await prisma.employmentContract.findMany({
  include: {
    otherEarnings: true,
    deductions: true,
    salaryRevisions: true,
  },
});

// Update
const updated = await prisma.employmentContract.update({
  where: { id: contractId },
  data: { /* updated fields */ },
});

// Delete
await prisma.employmentContract.delete({
  where: { id: contractId },
});
```

## Common Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Push schema changes to database (dev)
npx prisma db push

# Create a migration (production)
npx prisma migrate dev --name description

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Pull schema from existing database
npx prisma db pull

# Format schema file
npx prisma format
```

## Schema Modifications

When you need to modify the schema:

1. Edit `prisma/schema.prisma`
2. Run `npx prisma generate` to update the client
3. Run `npx prisma db push` (dev) or `npx prisma migrate dev` (prod)

## Environment Variables

Required in `.env`:

```env
# Database connection
DATABASE_URL="postgresql://..."

# Optional: For Prisma Studio
PRISMA_STUDIO_PORT=5555
```

## Production Considerations

1. **Use migrations** instead of `db push`
2. **Connection pooling** - Add to DATABASE_URL:
   ```
   ?connection_limit=10&pool_timeout=20
   ```
3. **Enable SSL** for RDS:
   ```
   ?sslmode=require
   ```
4. **Prisma logging** - Configure in `lib/prisma.ts`
5. **Error handling** - Already implemented in API routes

## Troubleshooting

### "Can't reach database server"
- Check DATABASE_URL in `.env`
- Verify RDS security group allows your IP
- Ensure RDS instance is running

### "Table does not exist"
- Run `npx prisma db push` or `npx prisma migrate dev`

### "Prisma Client not generated"
- Run `npx prisma generate`

### Type errors after schema changes
- Run `npx prisma generate` to regenerate types
- Restart TypeScript server in your IDE

## Next Steps

1. ✅ Configure AWS RDS (see AWS_RDS_SETUP.md)
2. ✅ Update .env with RDS credentials
3. ✅ Run `npx prisma generate`
4. ✅ Run `npx prisma db push`
5. ✅ Test with `npx prisma studio`
6. Update frontend to use API endpoints
7. Add authentication/authorization
8. Implement data validation
