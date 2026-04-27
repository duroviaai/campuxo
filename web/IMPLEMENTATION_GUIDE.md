# Design System Implementation Guide

## Quick Start

### 1. Installation
After pulling the latest changes, install dependencies:

```bash
cd web
npm install
# or
pnpm install
```

This will install:
- `@fortawesome/fontawesome-svg-core` - Font Awesome core
- `@fortawesome/free-solid-svg-icons` - Solid icons
- `@fortawesome/react-fontawesome` - React wrapper

### 2. Key Files Created

```
src/
├── config/
│   └── designTokens.js          # Design system tokens
├── index.css                     # Global styles with Google Fonts
├── shared/components/
│   ├── icons/
│   │   ├── IconLibrary.jsx      # All icon definitions
│   │   └── index.js             # Icon exports
│   ├── ui/
│   │   ├── Button.jsx           # Updated button component
│   │   ├── Card.jsx             # New card component
│   │   ├── Badge.jsx            # New badge component
│   │   ├── Alert.jsx            # New alert component
│   │   ├── Input.jsx            # New input component
│   │   └── index.js             # UI exports
│   └── layout/
│       ├── Navbar.jsx           # Updated with icons
│       ├── Sidebar.jsx          # Updated with icons
│       └── SidebarItem.jsx      # Updated with icons
└── DESIGN_SYSTEM.md             # Design documentation
```

---

## Usage Examples

### Using Icons

```jsx
import { Icon, ActionIcons, NavIcons, StatusIcons } from '@/shared/components/icons';

// In your component
<Icon icon={ActionIcons.add} size="md" className="text-indigo-600" />
<Icon icon={NavIcons.dashboard} size="lg" />
<Icon icon={StatusIcons.success} size="sm" />
```

### Using UI Components

```jsx
import { Button, Card, Badge, Alert, Input } from '@/shared/components/ui';
import { ActionIcons, UserIcons } from '@/shared/components/icons';

// Button with icon
<Button variant="primary" size="md" icon={ActionIcons.add}>
  Add New Item
</Button>

// Card
<Card padding="md" shadow="lg">
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Badge
<Badge variant="success" withIcon>Active</Badge>

// Alert
<Alert variant="error" title="Error">
  Something went wrong
</Alert>

// Input with icon
<Input
  label="Email"
  icon={UserIcons.email}
  placeholder="Enter email"
  required
/>
```

---

## Component API Reference

### Button
```jsx
<Button
  variant="primary"           // primary, secondary, danger, success, warning, info, ghost, outline
  size="md"                   // xs, sm, md, lg, xl
  icon={ActionIcons.add}      // Font Awesome icon
  iconPosition="left"         // left, right
  isLoading={false}           // Shows spinner
  disabled={false}
  className=""                // Additional classes
>
  Button Text
</Button>
```

### Card
```jsx
<Card
  padding="md"                // sm, md, lg
  shadow="md"                 // none, sm, md, lg
  border={true}               // Show border
  hover={false}               // Hover effect
  className=""
>
  Content
</Card>
```

### Badge
```jsx
<Badge
  variant="neutral"           // success, error, warning, info, neutral, primary
  size="md"                   // sm, md, lg
  icon={StatusIcons.success}  // Optional icon
  withIcon={false}            // Auto-add status icon
  className=""
>
  Badge Text
</Badge>
```

### Alert
```jsx
<Alert
  variant="info"              // success, error, warning, info
  title="Title"               // Optional title
  icon={StatusIcons.info}     // Optional custom icon
  onClose={() => {}}          // Optional close handler
  className=""
>
  Alert message
</Alert>
```

### Input
```jsx
<Input
  label="Label"
  placeholder="Placeholder"
  type="text"                 // text, email, password, number, etc.
  icon={UserIcons.email}      // Optional icon
  iconPosition="left"         // left, right
  error="Error message"       // Shows error state
  helperText="Helper text"    // Helper text below input
  disabled={false}
  required={false}
  className=""
  containerClassName=""
/>
```

---

## Icon Categories

### Navigation Icons
```jsx
NavIcons.dashboard
NavIcons.users
NavIcons.courses
NavIcons.faculty
NavIcons.attendance
NavIcons.students
NavIcons.schedule
NavIcons.settings
NavIcons.logout
```

### Action Icons
```jsx
ActionIcons.add
ActionIcons.edit
ActionIcons.delete
ActionIcons.search
ActionIcons.filter
ActionIcons.download
ActionIcons.upload
ActionIcons.view
ActionIcons.hide
ActionIcons.refresh
ActionIcons.sync
ActionIcons.undo
ActionIcons.redo
ActionIcons.copy
ActionIcons.share
ActionIcons.print
ActionIcons.archive
```

### Status Icons
```jsx
StatusIcons.success
StatusIcons.error
StatusIcons.warning
StatusIcons.info
StatusIcons.check
StatusIcons.close
StatusIcons.pending
```

### User Icons
```jsx
UserIcons.profile
UserIcons.logout
UserIcons.lock
UserIcons.email
UserIcons.phone
UserIcons.location
UserIcons.userCheck
UserIcons.userTimes
UserIcons.userPlus
```

### Academic Icons
```jsx
AcademicIcons.graduation
AcademicIcons.school
AcademicIcons.book
AcademicIcons.clipboard
AcademicIcons.assignment
AcademicIcons.exam
AcademicIcons.marks
AcademicIcons.award
AcademicIcons.briefcase
```

---

## Color System

### Primary Colors
- Indigo 600: `#4f46e5` - Main brand color
- Indigo 700: `#4338ca` - Hover state

### Status Colors
- Success: `#22c55e` (Green)
- Error: `#ef4444` (Red)
- Warning: `#f59e0b` (Amber)
- Info: `#3b82f6` (Blue)

### Neutral Colors
- Gray 900: `#111827` - Primary text
- Gray 700: `#374151` - Secondary text
- Gray 500: `#6b7280` - Tertiary text
- Gray 200: `#e5e7eb` - Borders
- Gray 50: `#f9fafb` - Light backgrounds

---

## Typography

### Fonts
- **Headings**: Poppins (Bold, modern)
- **Body**: Inter (Clean, readable)
- **Code**: Fira Code (Monospace)

### Sizes
- h1: 1.875rem (30px)
- h2: 1.5rem (24px)
- h3: 1.25rem (20px)
- Body: 0.875rem (14px)
- Small: 0.75rem (12px)

---

## Migration Guide

### Updating Existing Components

#### Before (Old SVG Icons)
```jsx
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
</svg>
```

#### After (Font Awesome Icons)
```jsx
import { Icon, ActionIcons } from '@/shared/components/icons';

<Icon icon={ActionIcons.add} size="sm" />
```

#### Before (Old Button)
```jsx
<button className="px-4 py-2 bg-blue-600 text-white rounded">
  Click me
</button>
```

#### After (New Button)
```jsx
import { Button } from '@/shared/components/ui';
import { ActionIcons } from '@/shared/components/icons';

<Button variant="primary" icon={ActionIcons.add}>
  Click me
</Button>
```

---

## Best Practices

### 1. Always Use Design System Components
```jsx
// ✅ Good
import { Button, Card } from '@/shared/components/ui';

// ❌ Avoid
<button className="...">Click</button>
```

### 2. Use Icon Categories
```jsx
// ✅ Good
import { ActionIcons } from '@/shared/components/icons';
<Icon icon={ActionIcons.add} />

// ❌ Avoid
import { faPlus } from '@fortawesome/free-solid-svg-icons';
<Icon icon={faPlus} />
```

### 3. Consistent Spacing
```jsx
// ✅ Good
<div className="p-6 gap-4">

// ❌ Avoid
<div className="p-5 gap-3">
```

### 4. Semantic HTML
```jsx
// ✅ Good
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// ❌ Avoid
<div>Email</div>
<input type="text" />
```

### 5. Accessibility
```jsx
// ✅ Good
<button aria-label="Close dialog" onClick={onClose}>
  <Icon icon={ActionIcons.close} />
</button>

// ❌ Avoid
<button onClick={onClose}>
  <Icon icon={ActionIcons.close} />
</button>
```

---

## Common Patterns

### Form with Validation
```jsx
import { Input, Button, Alert } from '@/shared/components/ui';
import { UserIcons, ActionIcons } from '@/shared/components/icons';
import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    // Submit logic
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      
      <Input
        label="Email"
        type="email"
        icon={UserIcons.email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error ? 'Email is required' : ''}
        required
      />
      
      <Button type="submit" variant="primary" icon={ActionIcons.add}>
        Submit
      </Button>
    </form>
  );
}
```

### Data Table with Actions
```jsx
import { Badge, Button, Card } from '@/shared/components/ui';
import { ActionIcons } from '@/shared/components/icons';

export default function UserTable({ users, onEdit, onDelete }) {
  return (
    <Card>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold">Name</th>
            <th className="text-left py-3 px-4 font-semibold">Status</th>
            <th className="text-left py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">{user.name}</td>
              <td className="py-3 px-4">
                <Badge variant={user.active ? 'success' : 'warning'} withIcon>
                  {user.active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="py-3 px-4 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={ActionIcons.edit}
                  onClick={() => onEdit(user.id)}
                />
                <Button
                  size="sm"
                  variant="danger"
                  icon={ActionIcons.delete}
                  onClick={() => onDelete(user.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
```

---

## Troubleshooting

### Icons not showing
1. Ensure Font Awesome packages are installed: `npm install`
2. Check that you're importing from the correct path
3. Verify the icon exists in `IconLibrary.jsx`

### Styles not applying
1. Clear cache: `npm run build` then restart dev server
2. Check that Tailwind CSS is properly configured
3. Verify class names are spelled correctly

### Components not found
1. Check import paths use `@/` alias
2. Verify component exists in the correct directory
3. Check that component is exported in `index.js`

---

## Next Steps

1. **Update all existing components** to use the new design system
2. **Test across browsers** for consistency
3. **Gather feedback** from team members
4. **Document any custom patterns** used in your features
5. **Maintain consistency** as new features are added

---

## Support & Questions

For questions about the design system:
1. Check `DESIGN_SYSTEM.md` for detailed documentation
2. Review component examples in this guide
3. Look at existing component implementations
4. Contact the development team

---

## Version History

- **v1.0** (Current)
  - Initial design system implementation
  - Font Awesome icons integration
  - Google Fonts (Poppins, Inter)
  - Core UI components (Button, Card, Badge, Alert, Input)
  - Professional color palette and typography
