# Quick Reference Card

## 🚀 Common Imports

```jsx
// UI Components
import { Button, Card, Badge, Alert, Input } from '@/shared/components/ui';

// Icons
import { Icon, ActionIcons, NavIcons, StatusIcons, UserIcons, AcademicIcons } from '@/shared/components/icons';

// Design Tokens
import { DESIGN_TOKENS } from '@/config/designTokens';
```

---

## 🎨 Quick Snippets

### Button
```jsx
<Button variant="primary" size="md" icon={ActionIcons.add}>
  Add New
</Button>

<Button variant="danger" size="sm" icon={ActionIcons.delete}>
  Delete
</Button>

<Button variant="ghost" isLoading>
  Loading...
</Button>
```

### Card
```jsx
<Card padding="md" shadow="lg" hover>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### Badge
```jsx
<Badge variant="success" withIcon>Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Inactive</Badge>
```

### Alert
```jsx
<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

<Alert variant="error" onClose={() => {}}>
  An error occurred.
</Alert>
```

### Input
```jsx
<Input
  label="Email"
  icon={UserIcons.email}
  placeholder="Enter email"
  required
/>

<Input
  label="Password"
  type="password"
  icon={UserIcons.lock}
  error="Password is required"
/>
```

### Icon
```jsx
<Icon icon={ActionIcons.add} size="md" />
<Icon icon={NavIcons.dashboard} size="lg" className="text-indigo-600" />
<Icon icon={StatusIcons.success} size="sm" />
```

---

## 🎯 Icon Categories

| Category | Usage | Examples |
|----------|-------|----------|
| **NavIcons** | Navigation | dashboard, users, courses, faculty |
| **ActionIcons** | CRUD ops | add, edit, delete, search, filter |
| **StatusIcons** | Status | success, error, warning, info |
| **UserIcons** | User related | profile, logout, lock, email |
| **AcademicIcons** | Education | graduation, book, marks, award |
| **TimeIcons** | Date/Time | calendar, clock, history |
| **FileIcons** | Files | file, folder, pdf, excel |
| **NotificationIcons** | Alerts | bell, exclamation, question |

---

## 🎨 Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Primary** | #4f46e5 | Main actions, links |
| **Success** | #22c55e | Positive actions |
| **Error** | #ef4444 | Destructive actions |
| **Warning** | #f59e0b | Warnings |
| **Info** | #3b82f6 | Information |
| **Gray 900** | #111827 | Primary text |
| **Gray 500** | #6b7280 | Secondary text |
| **Gray 200** | #e5e7eb | Borders |

---

## 📏 Sizes

### Button Sizes
- `xs` - Extra small
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

### Icon Sizes
- `xs` - Extra small
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

### Spacing
- `xs` - 4px
- `sm` - 8px
- `md` - 16px
- `lg` - 24px
- `xl` - 32px

---

## 🎭 Button Variants

| Variant | Usage |
|---------|-------|
| **primary** | Main actions |
| **secondary** | Secondary actions |
| **danger** | Destructive actions |
| **success** | Positive actions |
| **warning** | Warning actions |
| **info** | Informational |
| **ghost** | Subtle actions |
| **outline** | Alternative primary |

---

## 🏷️ Badge Variants

| Variant | Usage |
|---------|-------|
| **success** | Active, approved |
| **error** | Inactive, rejected |
| **warning** | Pending, caution |
| **info** | Information |
| **neutral** | Default |
| **primary** | Highlighted |

---

## 📢 Alert Variants

| Variant | Usage |
|---------|-------|
| **success** | Success messages |
| **error** | Error messages |
| **warning** | Warning messages |
| **info** | Information messages |

---

## 🔤 Typography Classes

```jsx
<h1>Heading 1 (1.875rem)</h1>
<h2>Heading 2 (1.5rem)</h2>
<h3>Heading 3 (1.25rem)</h3>
<h4>Heading 4 (1.125rem)</h4>
<h5>Heading 5 (1rem)</h5>
<h6>Heading 6 (0.875rem)</h6>

<p className="text-body-lg">Large body text</p>
<p className="text-body-md">Medium body text</p>
<p className="text-body-sm">Small body text</p>
<p className="text-label">Label text</p>
```

---

## ✨ Utility Classes

```jsx
// Animations
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-in-left">Slide left</div>
<div className="animate-slide-in-right">Slide right</div>
<div className="animate-pulse-custom">Pulse</div>

// Text truncation
<p className="truncate-lines-2">Truncate to 2 lines</p>
<p className="truncate-lines-3">Truncate to 3 lines</p>

// Effects
<div className="glass-effect">Glass morphism</div>
<div className="gradient-primary">Gradient background</div>
```

---

## 🔍 Common Patterns

### Form with Validation
```jsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

<form onSubmit={handleSubmit} className="space-y-4">
  {error && <Alert variant="error">{error}</Alert>}
  <Input
    label="Email"
    icon={UserIcons.email}
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={error}
    required
  />
  <Button type="submit" variant="primary">Submit</Button>
</form>
```

### Data Table
```jsx
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
      {items.map(item => (
        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
          <td className="py-3 px-4">{item.name}</td>
          <td className="py-3 px-4">
            <Badge variant={item.active ? 'success' : 'warning'} withIcon>
              {item.active ? 'Active' : 'Inactive'}
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
</Card>
```

### Modal/Dialog
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
  <Card className="w-96 animate-fade-in">
    <h3 className="mb-4">Dialog Title</h3>
    <p className="text-gray-600 mb-6">Dialog content</p>
    <div className="flex gap-3">
      <Button variant="ghost" className="flex-1">Cancel</Button>
      <Button variant="primary" className="flex-1">Confirm</Button>
    </div>
  </Card>
</div>
```

---

## 🚨 Common Mistakes

❌ **Don't**
```jsx
// Using inline styles
<button style={{ padding: '10px', color: 'blue' }}>Click</button>

// Using custom SVG icons
<svg>...</svg>

// Inconsistent spacing
<div className="p-5 gap-3">

// Missing accessibility
<button onClick={handleClick}><Icon /></button>
```

✅ **Do**
```jsx
// Use design system components
<Button variant="primary">Click</Button>

// Use Font Awesome icons
<Icon icon={ActionIcons.add} />

// Use consistent spacing
<div className="p-6 gap-4">

// Add accessibility
<button onClick={handleClick} aria-label="Add item">
  <Icon icon={ActionIcons.add} />
</button>
```

---

## 📚 Documentation Links

- **Full Design System**: `DESIGN_SYSTEM.md`
- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`
- **Summary**: `DESIGN_SYSTEM_SUMMARY.md`

---

## 💡 Tips

1. **Always use the design system** - Don't create custom styles
2. **Check icon categories** - Use the right icon for the context
3. **Maintain consistency** - Use the same patterns throughout
4. **Test accessibility** - Ensure keyboard navigation works
5. **Mobile first** - Design for mobile, then scale up
6. **Use Tailwind classes** - Leverage existing utilities
7. **Keep it simple** - Don't over-complicate components

---

## 🔗 Useful Links

- Font Awesome Icons: https://fontawesome.com/icons
- Google Fonts: https://fonts.google.com
- Tailwind CSS: https://tailwindcss.com
- React Docs: https://react.dev

---

**Last Updated**: 2024
**Version**: 1.0
