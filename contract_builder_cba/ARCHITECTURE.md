# Digital Contract Builder - Architecture

## Project Structure

```
contract_builder_cba/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main page with view toggle
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ContractForm.tsx   # Form for editing contract
│   └── ContractPreview.tsx # Preview/PDF view
├── types/                 # TypeScript definitions
│   └── contract.ts        # Contract data models
└── lib/                   # Utilities
    └── contract-utils.ts  # Helper functions

```

## Data Model

The contract structure is defined in `types/contract.ts`:

- **EmploymentContract**: Main contract interface
- **PersonalDetails**: Seafarer information
- **VesselDetails**: Ship and owner information
- **ContractTerms**: Duration and dates
- **WageBreakdown**: Salary components
- **OtherEarning**: Additional earnings/deductions
- **SalaryRevision**: Salary change history

## Components

### ContractForm
- Editable form with sections for all contract data
- Real-time updates to contract state
- Organized by logical sections (Personal, Vessel, Wages)

### ContractPreview
- Read-only view matching contract format
- Styled to resemble official document
- Ready for PDF generation integration

## Next Steps

1. **Expand Form**: Add all fields from the contract image
2. **PDF Generation**: Integrate library like `react-pdf` or `jsPDF`
3. **Validation**: Add form validation and error handling
4. **Storage**: Add database or local storage persistence
5. **Authentication**: Add user accounts if needed
6. **Templates**: Support multiple contract types
