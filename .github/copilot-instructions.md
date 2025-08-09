# GitHub Copilot Instructions - EZMedTech Payment Portal

## Project Context
You are assisting with the EZMedTech Payment Portal, a healthcare SaaS platform built with Next.js 14, TypeScript, and Stripe. This is a production-ready payment system for medical professionals requiring HIPAA compliance and PCI DSS security standards.

## Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (New York style)
- **Payments**: Stripe v18.4.0
- **Deployment**: AWS Amplify
- **State**: React hooks only (no Redux/Zustand)
- **Icons**: Lucide React
- **Notifications**: Sonner

## Code Standards

### TypeScript Requirements
- Always use strict TypeScript
- Define interfaces for all props and return types
- Avoid `any` type - use `unknown` if type is truly unknown
- Export interfaces that might be reused

### Component Patterns
```typescript
// ALWAYS follow this structure for React components:
'use client'; // Only add if component needs interactivity

import { ComponentProps } from '@/types';

export interface ComponentNameProps {
  className?: string;
  // other props with JSDoc comments
}

export default function ComponentName({ 
  className,
  ...props 
}: ComponentNameProps) {
  // 1. Hooks
  // 2. Effects  
  // 3. Handlers
  // 4. Return JSX
}
```

### API Route Patterns
```typescript
// ALWAYS structure API routes like this:
import { NextRequest, NextResponse } from 'next/server';

interface RequestBody {
  // define request shape
}

interface SuccessResponse {
  success: true;
  // data fields
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // implementation
  } catch (error) {
    // handle errors
  }
}
```

## File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `PricingTable.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- API routes: `route.ts` in kebab-case folders
- Types: `types.ts` or `ComponentName.types.ts`
- Tests: `ComponentName.test.tsx` or `util.test.ts`

## Import Order
1. React/Next.js imports
2. Third-party libraries
3. Internal aliases (@/ imports)
4. Relative imports
5. Type imports

Example:
```typescript
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { SubscriptionData } from '@/types';
```

## Tailwind CSS Patterns
- Use `cn()` utility for conditional classes
- Prefer Tailwind classes over inline styles
- Use consistent spacing scale (4, 6, 8, 12, 16, 20, 24)
- Follow mobile-first responsive design

```typescript
// GOOD
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)}>

// BAD
<div style={{ padding: '10px' }}>
```

## Stripe Integration Patterns
- Never handle raw card data
- Always validate sessions server-side
- Use proper error handling for Stripe API calls
- Include metadata in all Stripe operations

```typescript
// Example Stripe pattern
const stripe = await getStripeServer();
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  // ... configuration
  metadata: {
    source: 'pricing_page',
    timestamp: new Date().toISOString()
  }
});
```

## Security Requirements
### NEVER:
- Log sensitive data (PHI, payment info, passwords)
- Store card numbers or payment details
- Use eval() or dangerouslySetInnerHTML without sanitization
- Expose internal API endpoints publicly
- Commit .env files with real keys

### ALWAYS:
- Validate and sanitize user inputs
- Use parameterized queries
- Implement proper CORS headers
- Check authentication before data access
- Use HTTPS for all external calls

## Error Handling
```typescript
// ALWAYS use this error pattern:
try {
  // operation
} catch (error) {
  console.error('Context-specific message:', error);
  
  // User-friendly error response
  return {
    success: false,
    error: 'Something went wrong',
    details: process.env.NODE_ENV === 'development' 
      ? error.message 
      : undefined
  };
}
```

## Healthcare Compliance
- No PHI in logs or error messages
- Audit trail for all data access
- Encrypted data transmission (TLS 1.3)
- Session timeout after inactivity
- Role-based access control

## Testing Patterns
```typescript
// Use this structure for tests:
describe('ComponentName', () => {
  it('should render correctly', () => {
    // test implementation
  });
  
  it('should handle user interaction', () => {
    // test implementation
  });
  
  it('should handle errors gracefully', () => {
    // test implementation
  });
});
```

## Performance Guidelines
- Implement loading states for all async operations
- Use React.memo() for expensive components
- Lazy load heavy components
- Optimize images with Next.js Image
- Implement proper caching strategies

## Common Utilities
```typescript
// Currency formatting
formatCurrency(amount: number): string

// Date formatting
formatDate(date: string | Date): string

// Class name merging
cn(...classes: ClassValue[]): string

// Stripe amount conversion (dollars to cents)
formatStripeAmount(dollars: number): number
```

## Project Structure Reference
```
src/
├── app/
│   ├── api/stripe/       # Stripe endpoints
│   ├── dashboard/        # Protected routes
│   └── (public)/         # Public pages
├── components/
│   ├── billing/          # Payment components
│   ├── shared/           # Reusable components
│   └── ui/               # shadcn/ui components
├── lib/
│   ├── stripe/           # Stripe helpers
│   ├── aws/              # AWS integrations
│   └── utils.ts          # Utilities
└── types/                # TypeScript types
```

## DO NOT SUGGEST:
- Class components (use functional only)
- Redux or complex state management
- CSS modules or styled-components
- JavaScript files (TypeScript only)
- Inline styles except for dynamic values
- Direct DOM manipulation
- Global variables
- Synchronous file operations

## PREFER TO SUGGEST:
- React hooks for state management
- Server components where possible
- Tailwind CSS for styling
- TypeScript with strict types
- Early returns for cleaner code
- Descriptive variable names
- Small, focused functions
- Comprehensive error handling

## Common Code Snippets

### Protected Route Check
```typescript
// Check authentication before rendering
if (!session?.user) {
  redirect('/login');
}
```

### Loading State Pattern
```typescript
if (loading) return <SkeletonLoader />;
if (error) return <ErrorMessage error={error} />;
return <Content data={data} />;
```

### Toast Notification Pattern
```typescript
toast.success('Operation successful');
toast.error('Operation failed', {
  action: {
    label: 'Retry',
    onClick: () => handleRetry()
  }
});
```

### Stripe Price Formatting
```typescript
// Convert dollars to cents for Stripe
const stripeAmount = Math.round(amount * 100);
```

## Environment Variables
- Use NEXT_PUBLIC_ prefix for client-side vars
- Never commit real API keys
- Use AWS SSM for production secrets
- Validate env vars on startup

## Git Commit Message Format
```
type(scope): description

- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code restructuring
- test: test additions
- chore: maintenance
```

## Remember
This is a healthcare payment platform. Every suggestion should prioritize:
1. Security (HIPAA, PCI compliance)
2. Reliability (error handling, validation)
3. Performance (loading states, optimization)
4. Maintainability (clear code, documentation)
5. User Experience (accessibility, responsiveness)