# Campuxo Design System

## Overview
This document outlines the professional design system used throughout the Campuxo application, ensuring consistency, accessibility, and a polished user experience.

---

## Typography

### Font Stack
- **Primary (Headings)**: Poppins - Bold, modern, and professional
- **Secondary (Body)**: Inter - Clean, readable, and accessible
- **Monospace**: Fira Code - For code snippets and technical content

### Font Sizes & Hierarchy
```
h1: 1.875rem (30px) - Page titles
h2: 1.5rem (24px) - Section headers
h3: 1.25rem (20px) - Subsection headers
h4: 1.125rem (18px) - Card titles
h5: 1rem (16px) - Labels
h6: 0.875rem (14px) - Small labels

Body Large: 1rem (16px)
Body Medium: 0.875rem (14px)
Body Small: 0.75rem (12px)
```

### Font Weights
- Light: 300
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## Color Palette

### Primary Colors
- **Indigo 600**: `#4f46e5` - Primary action, links, active states
- **Indigo 700**: `#4338ca` - Hover states for primary
- **Indigo 50**: `#eef2ff` - Light backgrounds

### Status Colors
- **Success (Green)**: `#22c55e` - Positive actions, confirmations
- **Error (Red)**: `#ef4444` - Destructive actions, errors
- **Warning (Amber)**: `#f59e0b` - Warnings, cautions
- **Info (Blue)**: `#3b82f6` - Information, notifications

### Neutral Colors
- **Gray 900**: `#111827` - Primary text
- **Gray 700**: `#374151` - Secondary text
- **Gray 500**: `#6b7280` - Tertiary text
- **Gray 200**: `#e5e7eb` - Borders
- **Gray 50**: `#f9fafb` - Light backgrounds

---

## Components

### Button
```jsx
import { Button } from '@/shared/components/ui';
import { ActionIcons } from '@/shared/components/icons';

// Variants: primary, secondary, danger, success, warning, info, ghost, outline
// Sizes: xs, sm, md, lg, xl

<Button variant="primary" size="md" icon={ActionIcons.add}>
  Add New
</Button>

<Button variant="danger" size="sm" icon={ActionIcons.delete} iconPosition="right">
  Delete
</Button>
```

### Card
```jsx
import { Card } from '@/shared/components/ui';

<Card padding="md" shadow="lg" hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Badge
```jsx
import { Badge } from '@/shared/components/ui';

<Badge variant="success" size="md" withIcon>
  Active
</Badge>

<Badge variant="warning">Pending</Badge>
```

### Alert
```jsx
import { Alert } from '@/shared/components/ui';

<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

<Alert variant="error" onClose={() => {}}>
  An error occurred. Please try again.
</Alert>
```

### Input
```jsx
import { Input } from '@/shared/components/ui';
import { UserIcons } from '@/shared/components/icons';

<Input
  label="Email"
  placeholder="Enter your email"
  icon={UserIcons.email}
  iconPosition="left"
  required
/>

<Input
  label="Password"
  type="password"
  icon={UserIcons.lock}
  error="Password is required"
/>
```

---

## Icons

### Icon Library
All icons use Font Awesome Solid icons for consistency.

```jsx
import { Icon, ActionIcons, NavIcons, StatusIcons } from '@/shared/components/icons';

// Using preset icon sets
<Icon icon={ActionIcons.add} size="md" />
<Icon icon={NavIcons.dashboard} size="lg" />
<Icon icon={StatusIcons.success} size="sm" />

// Icon sizes: xs, sm, md, lg, xl
```

### Icon Categories
- **NavIcons**: Navigation and menu items
- **ActionIcons**: CRUD operations (add, edit, delete, etc.)
- **StatusIcons**: Status indicators (success, error, warning, info)
- **UserIcons**: User-related icons
- **AcademicIcons**: Education-related icons
- **TimeIcons**: Date and time icons
- **FileIcons**: File and folder icons
- **NotificationIcons**: Notification and alerts
- **UtilityIcons**: General utility icons
- **SecurityIcons**: Security and authentication

---

## Spacing System

```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 2.5rem (40px)
3xl: 3rem (48px)
```

---

## Border Radius

```
sm: 0.375rem (6px)
md: 0.5rem (8px)
lg: 0.75rem (12px)
xl: 1rem (16px)
full: 9999px (circular)
```

---

## Shadows

```
xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1)
md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

---

## Animations

### Transitions
- **Fast**: 150ms
- **Base**: 200ms
- **Slow**: 300ms

### Keyframe Animations
- `fadeIn`: Fade in with slight upward movement
- `slideInLeft`: Slide in from left
- `slideInRight`: Slide in from right
- `pulse`: Pulsing effect

```jsx
<div className="animate-fade-in">Content</div>
<div className="animate-slide-in-left">Content</div>
```

---

## Best Practices

### 1. Consistency
- Always use components from the design system
- Follow the established color palette
- Use the typography hierarchy correctly

### 2. Accessibility
- Use semantic HTML
- Include proper ARIA labels
- Ensure sufficient color contrast
- Support keyboard navigation

### 3. Responsive Design
- Mobile-first approach
- Use Tailwind breakpoints: sm, md, lg, xl, 2xl
- Test on multiple devices

### 4. Performance
- Lazy load images
- Optimize animations
- Use CSS classes instead of inline styles
- Minimize re-renders

### 5. Code Organization
```
src/
├── shared/
│   └── components/
│       ├── ui/           # Reusable UI components
│       ├── icons/        # Icon library
│       ├── layout/       # Layout components
│       └── feedback/     # Feedback components
├── features/            # Feature-specific components
└── config/
    └── designTokens.js  # Design system tokens
```

---

## Usage Examples

### Creating a Form
```jsx
import { Button, Input, Card, Alert } from '@/shared/components/ui';
import { ActionIcons, UserIcons } from '@/shared/components/icons';

export default function LoginForm() {
  const [error, setError] = useState('');

  return (
    <Card className="w-full max-w-md">
      <h2 className="mb-6">Sign In</h2>
      
      {error && <Alert variant="error">{error}</Alert>}
      
      <Input
        label="Email"
        icon={UserIcons.email}
        placeholder="your@email.com"
        required
      />
      
      <Input
        label="Password"
        type="password"
        icon={UserIcons.lock}
        required
      />
      
      <Button variant="primary" size="lg" className="w-full mt-6">
        Sign In
      </Button>
    </Card>
  );
}
```

### Creating a Data Table
```jsx
import { Badge, Button } from '@/shared/components/ui';
import { ActionIcons } from '@/shared/components/icons';

export default function UserTable({ users }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
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
              <Button size="sm" variant="ghost" icon={ActionIcons.edit} />
              <Button size="sm" variant="danger" icon={ActionIcons.delete} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Maintenance

### Adding New Colors
1. Update `src/config/designTokens.js`
2. Add corresponding Tailwind classes if needed
3. Document in this file

### Adding New Icons
1. Import from Font Awesome in `IconLibrary.jsx`
2. Add to appropriate category object
3. Export from `icons/index.js`

### Updating Typography
1. Modify `src/index.css`
2. Update `designTokens.js`
3. Test across all pages

---

## Support
For questions or suggestions about the design system, please contact the development team.
