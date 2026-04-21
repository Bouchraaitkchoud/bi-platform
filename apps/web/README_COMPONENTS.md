# BI Platform Frontend - Component & Hook Documentation

This is a comprehensive Next.js application with a complete set of reusable UI components, custom hooks, utilities, and services.

## Project Structure

```
src/
├── components/
│   └── ui/              # Reusable UI components
├── hooks/               # Custom React hooks
├── services/            # API clients and external services
├── context/             # React Context providers
├── types/               # TypeScript type definitions
├── constants/           # Application constants
├── utils/               # Utility functions
├── config/              # Application configuration
├── app/                 # Next.js app router pages
└── lib/                 # Third-party integrations (clsx, tailwind-merge)
```

## UI Components

All UI components are located in `src/components/ui/` and can be imported from `@/components/ui`.

### Available Components

#### Basic Components
- **Button** - Standard button component with multiple variants
- **Input** - Input field with label, error, and helper text support
- **Card** - Container component with title support
- **Modal** - Modal dialog with backdrop
- **Alert** - Alert message with different types (success, error, warning, info)
- **Badge** - Badge labels with different variants

#### Form Components
- **Form** - Complete form builder with validation
- **Checkbox** - Custom checkbox input
- **Radio** - Custom radio button input
- **Select** - Dropdown select component
- **Toggle** - Toggle switch component
- **Tabs** - Tabbed interface component

#### Data Components
- **DataTable** - Feature-rich data table with sorting and pagination
- **Pagination** - Pagination control component
- **Progress** - Progress bar component
- **Skeleton** - Loading skeleton placeholder

#### Utility Components
- **Spinner** - Loading spinner
- **Dropdown** - Dropdown menu component

### Component Usage Examples

```tsx
import { Button, Input, Card, Alert } from '@/components/ui';

export function Example() {
  return (
    <Card title="Example Card">
      <Alert type="success" title="Success!" message="Operation completed" />
      <Input label="Name" placeholder="Enter your name" />
      <Button>Submit</Button>
    </Card>
  );
}
```

```tsx
import { DataTable, DataTableColumn } from '@/components/ui';

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role' },
];

const data = [
  { name: 'John', email: 'john@example.com', role: 'Admin' },
];

export function Table() {
  return <DataTable columns={columns} data={data} />;
}
```

```tsx
import { Form, FormFieldProps } from '@/components/ui';

const fields: FormFieldProps[] = [
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'message', label: 'Message', type: 'textarea' },
];

export function ContactForm() {
  const handleSubmit = async (data) => {
    console.log(data);
  };

  return <Form fields={fields} onSubmit={handleSubmit} submitLabel="Send" />;
}
```

## Custom Hooks

All custom hooks are located in `src/hooks/` and can be imported from `@/hooks`.

### Available Hooks

#### Form & Validation Hooks
- **useForm** - Comprehensive form state management with validation
- **useFetch** - Data fetching with loading and error states
- **useAsync** - Generic async operation handler

#### State Management Hooks
- **useLocalStorage** - Persistent local storage state
- **useCounter** - Counter state management
- **usePrevious** - Track previous value

#### UI & Behavior Hooks
- **useDebounce** - Debounce values
- **useThrottle** - Throttle function calls
- **useMediaQuery** - Responsive media queries
- **useClickOutside** - Detect clicks outside element
- **useKeyPress** - Detect keyboard key presses

### Hook Usage Examples

```tsx
import { useForm } from '@/hooks';

export function LoginForm() {
  const { values, errors, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    onSubmit: async (data) => {
      console.log(data);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={values.email} onChange={handleChange} />
      {errors.email && <span>{errors.email}</span>}
    </form>
  );
}
```

```tsx
import { useFetch } from '@/hooks';

export function UserList() {
  const { data, loading, error, refetch } = useFetch('/api/users');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

```tsx
import { useLocalStorage } from '@/hooks';

export function Preferences() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  );
}
```

```tsx
import { useMediaQuery } from '@/hooks';

export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return <div>{isMobile ? 'Mobile View' : 'Desktop View'}</div>;
}
```

## Context Providers

React Context providers are located in `src/context/`.

### Available Providers

- **ThemeProvider** - Theme management (light/dark mode)
- **AuthProvider** - Authentication state management
- **NotificationProvider** - Toast/notification management

### Provider Setup

In `src/app/layout.tsx`:

```tsx
import { ThemeProvider, AuthProvider, NotificationProvider } from '@/context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Using Providers

```tsx
import { useTheme, useAuth, useNotifications } from '@/context';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();

  return (
    <header>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <span>{user?.name}</span>
      <button onClick={() => {
        logout();
        addNotification({ title: 'Logged out', type: 'success' });
      }}>
        Logout
      </button>
    </header>
  );
}
```

## Utility Functions

Utility functions are located in `src/utils/helpers.ts` and can be imported from `@/utils`.

### Available Utilities

#### String Utilities
- `capitalize()` - Capitalize first letter
- `camelToKebab()` - Convert camelCase to kebab-case
- `kebabToCamel()` - Convert kebab-case to camelCase
- `truncate()` - Truncate string with ellipsis
- `slugify()` - Convert to URL-friendly slug
- `toTitleCase()` - Convert to Title Case

#### Number Utilities
- `formatCurrency()` - Format as currency
- `formatNumber()` - Format with decimal places
- `percentage()` - Calculate percentage
- `clamp()` - Clamp value between min/max

#### Date Utilities
- `formatDate()` - Format date with custom format
- `isDate()` - Check if value is Date
- `daysFromNow()` - Get date N days from now
- `isToday()` - Check if date is today

#### Array Utilities
- `chunk()` - Split array into chunks
- `unique()` - Get unique items
- `flatten()` - Flatten nested arrays
- `groupBy()` - Group by key
- `sortBy()` - Sort by property

#### Object Utilities
- `pick()` - Pick specific properties
- `omit()` - Omit specific properties
- `isEmpty()` - Check if object is empty

#### Validation Utilities
- `isEmail()` - Validate email
- `isUrl()` - Validate URL
- `isPhone()` - Validate phone number
- `isStrongPassword()` - Validate password strength

### Utility Usage Examples

```tsx
import { formatCurrency, truncate, isEmail, chunk } from '@/utils';

// String utilities
console.log(capitalize('hello')); // 'Hello'
console.log(truncate('Long text...', 10)); // 'Long text.'

// Number utilities
console.log(formatCurrency(1234.56)); // '$1,234.56'

// Validation
console.log(isEmail('user@example.com')); // true
console.log(isStrongPassword('Weak')); // false

// Array utilities
console.log(chunk([1,2,3,4,5], 2)); // [[1,2], [3,4], [5]]
```

## Services

API services are located in `src/services/`.

### Available Services

- **apiClient** - Low-level HTTP client for making API requests
- **userService** - User-related API operations

### Service Usage Examples

```tsx
import { userService } from '@/services';

// Login
const { user, token } = await userService.login({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const currentUser = await userService.getCurrentUser();

// Update profile
await userService.updateProfile({ name: 'New Name' });
```

## Types

TypeScript types are defined in `src/types/index.ts` and include:

- API response types
- Pagination types
- Filter types
- Form types
- Entity types
- UI component types

### Type Usage Examples

```tsx
import { PaginatedResponse, User, FormState } from '@/types';

function data(users: PaginatedResponse<User>) {
  return users.items.map(user => user.name);
}
```

## Constants

Application constants are defined in `src/constants/index.ts` and include:

- API configuration
- Validation rules
- Date/time formats
- Animation durations
- Color palette
- Breakpoints
- Z-index values

### Constants Usage Examples

```tsx
import { COLORS, BREAKPOINTS, VALIDATE } from '@/constants';

const breakpoints = {
  mobile: `(max-width: ${BREAKPOINTS.SM}px)`,
  tablet: `(max-width: ${BREAKPOINTS.MD}px)`,
};

const validation = {
  minPassword: VALIDATION.MIN_PASSWORD_LENGTH,
  emailRegex: VALIDATION.EMAIL_REGEX,
};
```

## Configuration

Application configuration is located in `src/config/index.ts` and includes:

- App info (name, version)
- API configuration
- Auth settings
- Feature flags
- UI settings
- Third-party services
- Development settings

## Best Practices

1. **Component Naming**: Use PascalCase for component names
2. **Hook Naming**: Start with `use` prefix
3. **File Organization**: Keep related files together
4. **Type Safety**: Use TypeScript types throughout
5. **Error Handling**: Always handle errors in services/hooks
6. **Performance**: Use React.memo for expensive components
7. **Accessibility**: Include proper ARIA labels and semantic HTML
8. **Responsive Design**: Use mobile-first approach with Tailwind CSS

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GA_ENABLED=false
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SENTRY_ENABLED=false
NEXT_PUBLIC_SENTRY_DSN=
```

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
