# Stripe Checkout API Documentation

## Overview

The Stripe checkout API route creates subscription checkout sessions for the EZMedTech payment portal.

## API Endpoint

```
POST /api/stripe/checkout
```

## Request Body

```typescript
interface CheckoutRequestBody {
  priceId: string;           // Required: Stripe price ID for the subscription
  customerId?: string;       // Optional: Existing Stripe customer ID
  customerEmail?: string;    // Optional: Customer email for new customer creation
  metadata?: Record<string, string>; // Optional: Additional metadata
}
```

## Response

### Success Response (200)

```typescript
interface CheckoutResponse {
  url: string;        // Stripe checkout session URL
  sessionId: string;  // Checkout session ID for tracking
}
```

### Error Response (400/500)

```typescript
interface ErrorResponse {
  error: string;      // Error message
  details?: string;   // Additional error details
}
```

## Usage Examples

### Basic Usage

```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: 'price_professional_monthly',
  }),
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe checkout
```

### With Customer Information

```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: 'price_basic_yearly',
    customerEmail: 'user@example.com',
    metadata: {
      source: 'pricing_page',
      plan: 'basic',
    },
  }),
});
```

### Using the Helper Functions

```typescript
import { redirectToCheckout } from '@/lib/stripe/checkout';
import { getPricingTierById } from '@/lib/stripe/products';

const tier = getPricingTierById('professional');
if (tier) {
  await redirectToCheckout(tier, 'monthly', {
    customerEmail: 'user@example.com',
    metadata: { source: 'dashboard' },
  });
}
```

## URL Configuration

The API uses the following redirect URLs:

- **Success URL**: `{baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL**: `{baseUrl}/pricing`

Where `baseUrl` is determined by the `NEXT_PUBLIC_APP_URL` environment variable.

## Features

- ✅ Subscription checkout sessions
- ✅ Customer creation and management
- ✅ Metadata tracking
- ✅ Success/cancel URL redirects
- ✅ Billing address collection
- ✅ Tax ID collection
- ✅ Promotion code support
- ✅ Comprehensive error handling
- ✅ TypeScript support

## Error Handling

The API includes comprehensive error handling for:

- Missing required fields
- Stripe API errors
- Network errors
- Invalid price IDs
- Authentication errors

## Security

- Server-side Stripe secret key validation
- Request body validation
- Proper error message sanitization
- HTTPS redirect URLs

## Next Steps

1. Replace placeholder Stripe price IDs in `src/lib/stripe/products.ts`
2. Set up Stripe webhook handling for subscription events
3. Create dashboard pages for subscription management
4. Implement user authentication and session management
