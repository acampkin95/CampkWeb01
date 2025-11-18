# UI Components Library

A collection of accessible, reusable, and consistent UI components for the Campkin Motor & Warehouse application.

## Features

- ✅ **Accessible**: Built with ARIA attributes and keyboard navigation in mind
- 🎨 **Themeable**: Uses CSS variables for easy customization
- 📱 **Responsive**: Works seamlessly across all device sizes
- ⚡ **Performant**: Optimized with React best practices
- 🔧 **TypeScript**: Fully typed for better DX
- 🎭 **Animated**: Smooth transitions and animations

## Components

### Button

Versatile button component with multiple variants and states.

```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md" isLoading={false}>
  Click me
</Button>
```

**Props:**
- `variant`: "primary" | "secondary" | "outline" | "ghost" | "danger"
- `size`: "sm" | "md" | "lg"
- `isLoading`: boolean - Shows spinner and disables button
- All standard HTML button attributes

### Input

Accessible input field with label, error, and helper text support.

```tsx
import { Input } from "@/components/ui/input";

<Input
  label="Email"
  type="email"
  error="Invalid email"
  helperText="We'll never share your email"
  required
/>
```

**Props:**
- `label`: string - Displays above input
- `error`: string - Shows error message with red styling
- `helperText`: string - Shows helper text below input
- All standard HTML input attributes

### Textarea

Multi-line text input with the same features as Input.

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea
  label="Message"
  rows={4}
  helperText="Max 500 characters"
/>
```

### Toast Notifications

Context-based toast notification system.

```tsx
import { ToastProvider, useToast } from "@/components/ui/toast";

// Wrap your app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
function MyComponent() {
  const { showToast } = useToast();

  return (
    <button onClick={() => showToast("Success!", "success", 5000)}>
      Show Toast
    </button>
  );
}
```

**Toast Types:**
- `success` - Green checkmark icon
- `error` - Red X icon
- `warning` - Yellow warning icon
- `info` - Blue info icon

### Spinner

Loading spinner component.

```tsx
import { Spinner } from "@/components/ui/spinner";

<Spinner size="md" />
```

### Badge

Status badge component.

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Active</Badge>
```

## Styling

All components use Tailwind CSS with custom utilities:

- `cn()`: Utility function that merges Tailwind classes intelligently
- CSS variables for theming
- Focus-visible states for accessibility
- Smooth transitions

## Animations

Available animation classes:
- `.animate-fade-in` - Fade in from transparent
- `.animate-scale-in` - Scale in from 95%
- `.animate-slide-in-from-right` - Slide in from right

## Accessibility

All components follow WCAG 2.1 AA standards:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus visible states
- Error announcements
- Required field indicators

## Examples

### Form with validation

```tsx
import { Input, Button } from "@/components/ui";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <form>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error}
        required
        autoComplete="email"
      />
      <Button type="submit" variant="primary" className="w-full">
        Sign in
      </Button>
    </form>
  );
}
```

### Loading state

```tsx
import { Button } from "@/components/ui/button";

<Button isLoading={isSubmitting}>
  {isSubmitting ? "Saving..." : "Save changes"}
</Button>
```

### Toast notifications

```tsx
import { useToast } from "@/components/ui/toast";

function SaveButton() {
  const { showToast } = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      showToast("Saved successfully!", "success");
    } catch (error) {
      showToast("Failed to save", "error");
    }
  };

  return <button onClick={handleSave}>Save</button>;
}
```

## Customization

Override styles using className:

```tsx
<Button
  variant="primary"
  className="w-full shadow-2xl"
>
  Custom styled button
</Button>
```

Modify theme colors in `globals.css`:

```css
:root {
  --brand-color: #0f172a;
  --accent-color: #f97316;
}
```

## Best Practices

1. **Always provide labels**: Use the `label` prop for form inputs
2. **Show error states**: Use the `error` prop to communicate validation issues
3. **Use loading states**: Set `isLoading` on buttons during async operations
4. **Provide helper text**: Guide users with `helperText` when needed
5. **Set autocomplete**: Always set appropriate `autoComplete` attributes
6. **Mark required fields**: Use the `required` attribute for mandatory fields

## Migration Guide

### From old Button to new Button

```tsx
// Before
<button
  disabled={isSubmitting}
  className="w-full rounded-2xl bg-slate-900 py-3 text-white"
>
  {isSubmitting ? "Saving..." : "Save"}
</button>

// After
<Button
  variant="primary"
  size="lg"
  className="w-full"
  isLoading={isSubmitting}
>
  Save
</Button>
```

### From old Input to new Input

```tsx
// Before
<label className="text-xs font-semibold uppercase">
  Email
  <input
    type="email"
    className="mt-1 w-full rounded-2xl border px-3 py-2"
    required
  />
</label>

// After
<Input
  label="Email"
  type="email"
  required
  autoComplete="email"
/>
```
