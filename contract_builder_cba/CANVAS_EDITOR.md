# Canvas Editor - Figma/Miro-Inspired Contract Builder

## Overview

The Canvas Editor provides a visual, drag-and-drop interface for building contracts, inspired by design tools like Figma and Miro. It features a toolbox panel on the left, a central canvas workspace, and a properties panel on the right.

## Features

### 1. Left Toolbox Panel
- **Element Library**: Click to add various contract elements
  - 📝 Heading - Section titles
  - 📄 Text - Paragraph content
  - 📋 Field - Input fields that can map to contract data
  - 📊 Table - Data tables for wage breakdowns, etc.
  - ✍️ Signature - Signature lines
  - ➖ Divider - Horizontal separators

- **Quick Templates**: Pre-built sections for common contract parts
  - Personal Details Section
  - Vessel Information
  - Wage Breakdown Table
  - Contract Terms

- **Keyboard Shortcuts**: Quick reference for common actions

### 2. Central Canvas Workspace
- **A4 Paper Format**: Standard document size (794x1123px)
- **Grid Background**: Visual alignment guide
- **Zoom Controls**: 50% to 200% zoom levels
- **Pan & Zoom**: Navigate large documents easily
- **Drag & Drop**: Move elements freely on the canvas
- **Double-Click to Edit**: Quick inline editing of text content
- **Visual Selection**: Blue outline shows selected elements
- **Delete Key Support**: Remove selected elements

### 3. Right Properties Panel
Shows when an element is selected:
- **Content Editing**: Modify element text
- **Position & Size**: Precise X, Y, Width, Height controls
- **Typography**: Font size, weight, and color
- **Background & Border**: Styling options
- **Padding**: Internal spacing
- **Field Mapping**: Connect fields to contract data

### 4. Top Toolbar
- **Zoom Controls**: +/- buttons and percentage display
- **Reset View**: Return to default zoom and position
- **Export PDF**: Generate PDF from canvas (to be implemented)
- **Save**: Persist canvas layout

## Usage

### Adding Elements
1. Click any element in the left toolbox
2. Element appears on canvas at default position
3. Drag to reposition

### Editing Elements
1. **Move**: Click and drag
2. **Edit Content**: Double-click to enter edit mode
3. **Resize**: Click element, drag corner handle (to be enhanced)
4. **Style**: Select element, use properties panel
5. **Delete**: Select element, press Delete key

### Building a Contract
1. Start with a heading for the contract title
2. Add text elements for paragraphs
3. Use fields for data that changes per contract
4. Add tables for structured data (wages, terms)
5. Include signature lines at the bottom
6. Use dividers to separate sections

### Mapping to Contract Data
1. Add a field element
2. Select the field
3. In properties panel, choose "Map to Contract Field"
4. Select the contract property (e.g., "Full Name", "Vessel Name")
5. Field will auto-populate from contract data

## Technical Architecture

### Components
- **CanvasEditor.tsx**: Main container, manages state
- **CanvasToolbox.tsx**: Left panel with element library
- **CanvasWorkspace.tsx**: Central canvas with drag/drop
- **CanvasPropertiesPanel.tsx**: Right panel for styling

### Data Structure
```typescript
interface CanvasElement {
  id: string;
  type: 'text' | 'heading' | 'field' | 'table' | 'signature' | 'divider';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fieldKey?: string; // Maps to contract field
  style?: {
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    padding?: number;
  };
}
```

## Future Enhancements

1. **Advanced Resize**: Corner and edge handles for all directions
2. **Multi-Select**: Select and move multiple elements
3. **Alignment Tools**: Align left, center, right, distribute
4. **Layers Panel**: Reorder elements (z-index)
5. **Undo/Redo**: History management
6. **Copy/Paste**: Duplicate elements
7. **Templates**: Save and load canvas layouts
8. **PDF Export**: Generate PDF from canvas layout
9. **Collaboration**: Real-time multi-user editing
10. **Smart Guides**: Snap to align with other elements
11. **Groups**: Group elements together
12. **Text Formatting**: Bold, italic, underline within text
13. **Image Support**: Add logos and images
14. **Table Builder**: Visual table creation with rows/columns

## Keyboard Shortcuts

- **Delete**: Remove selected element
- **Esc**: Deselect element (to be implemented)
- **Ctrl+Z**: Undo (to be implemented)
- **Ctrl+Y**: Redo (to be implemented)
- **Ctrl+C**: Copy (to be implemented)
- **Ctrl+V**: Paste (to be implemented)

## Switching Between Editors

Use the view toggle buttons at the top:
- **Canvas Editor**: Visual drag-and-drop interface
- **Form Editor**: Traditional form-based editing
- **Preview**: Read-only contract preview

All three views share the same contract data, so changes in one view reflect in others.
