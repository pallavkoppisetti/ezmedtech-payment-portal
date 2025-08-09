# Stripe Checkout API Documentation

## Overview

The Stripe checkout API creates HIPAA-compliant subscription checkout sessions for the EZMedTech payment portal with support for multiple payment methods including credit/debit cards and ACH bank account payments.

## API Endpoint

```
POST /api/stripe/checkout
```

## Features

- ✅ **Multi-Payment Support**: Credit/debit cards and ACH bank account payments
- ✅ **HIPAA Compliance**: Healthcare-specific metadata and secure payment handling
- ✅ **Flexible Pricing**: Support for tier IDs ('professional') or direct Stripe price IDs
- ✅ **Automatic Customer Management**: Creates or associates existing Stripe customers
- ✅ **Tax Collection**: Built-in tax ID collection for business compliance
- ✅ **Promotion Codes**: Support for discount codes and promotional offers

## Request Body

```typescript
interface CheckoutRequestBody {
  priceId: string; // Required: Stripe price ID or tier ID (e.g., 'professional')
  customerId?: string; // Optional: Existing Stripe customer ID
  customerEmail?: string; // Optional: Customer email for new customer creation
  payment_method_type?: 'card' | 'ach' | 'both'; // Optional: Payment method preference (default: 'both')
  metadata?: Record<string, string>; // Optional: Additional metadata for tracking
}
```

### Payment Method Types

- **`'card'`**: Credit/debit cards only
- **`'ach'`**: ACH bank account payments only (US only)
- **`'both'`**: Both payment methods available (default)

## Response Formats

### Success Response (200)

```typescript
interface CheckoutResponse {
  url: string; // Stripe checkout session URL for redirection
  sessionId: string; // Checkout session ID for tracking and verification
}
```

### Error Response (400/500)

```typescript
interface ErrorResponse {
  error: string; // User-friendly error message
  details?: string; // Detailed error information for debugging
}
```

## Usage Examples

### Basic Usage (Both Payment Methods)

```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: 'professional', // Tier ID
    customerEmail: 'doctor@clinic.com',
  }),
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe checkout
```

### Card-Only Checkout

```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: 'professional',
    payment_method_type: 'card',
    customerEmail: 'user@example.com',
  }),
});
```

### ACH-Only Checkout

```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: 'professional',
    payment_method_type: 'ach',
    customerEmail: 'clinic@healthcare.com',
    metadata: {
      payment_preference: 'ach',
      organization_type: 'healthcare',
    },
  }),
});
```

### With Existing Customer

```typescript
const response = await fetch('/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    priceId: 'price_basic_yearly',
    customerId: 'cus_stripe_customer_id',
    metadata: {
      source: 'pricing_page',
      plan: 'basic',
    },
  }),
});
```

### Using the Helper Functions

```typescript
import { createCheckoutSession } from '@/lib/stripe/checkout';

// Create checkout with default settings (both payment methods)
const { url, sessionId } = await createCheckoutSession({
  priceId: 'professional',
  customerEmail: 'doctor@clinic.com',
  metadata: { source: 'pricing_page' },
});

// Redirect to checkout
window.location.href = url;
```

## URL Configuration

The API uses the following redirect URLs:

- **Success URL**: `{baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL**: `{baseUrl}/pricing`

Where `baseUrl` is determined by the `NEXT_PUBLIC_APP_URL` environment variable.

## Payment Method Configuration

### ACH (Bank Account) Payments

When ACH is enabled (`'ach'` or `'both'`), the following features are automatically configured:

- **Verification Method**: Automatic verification via Stripe
- **Payment Collection**: Collected when required
- **Authorization Text**: HIPAA-compliant mandate text
- **Processing Time**: 3-5 business days for settlement
- **Geographic Restriction**: US bank accounts only

### Credit/Debit Card Payments

Standard Stripe card processing with:

- **Real-time Processing**: Immediate payment confirmation
- **Global Support**: International card acceptance
- **3D Secure**: Automatic fraud protection
- **Multiple Card Types**: Visa, Mastercard, American Express, etc.

## Features

- ✅ **Multi-Payment Support**: Cards and ACH bank accounts
- ✅ **HIPAA Compliance**: Healthcare-specific payment handling
- ✅ **Flexible Pricing**: Tier IDs and direct Stripe price IDs
- ✅ **Customer Management**: Automatic customer creation/association
- ✅ **Metadata Tracking**: Comprehensive payment tracking
- ✅ **Tax Collection**: Built-in tax ID collection
- ✅ **Promotion Codes**: Discount code support
- ✅ **Address Collection**: Required billing address collection
- ✅ **Error Handling**: Comprehensive error management
- ✅ **TypeScript Support**: Full type safety

## Error Handling

The API handles various error scenarios:

| Error Type                  | Status Code | Description                      |
| --------------------------- | ----------- | -------------------------------- |
| Missing priceId             | 400         | Required field validation        |
| Invalid payment_method_type | 400         | Must be 'card', 'ach', or 'both' |
| Invalid pricing tier        | 400         | Tier ID not found                |
| Missing Stripe price ID     | 500         | Configuration error              |
| Stripe API errors           | 500         | Payment processor errors         |
| Network errors              | 500         | Connection issues                |

## Security & Compliance

- 🔒 **Server-side Stripe secret key validation**
- 🔒 **Request body validation and sanitization**
- 🔒 **HIPAA-compliant payment processing**
- 🔒 **PCI DSS compliance via Stripe**
- 🔒 **Secure metadata handling (500-char limit)**
- 🔒 **HTTPS-only redirect URLs**
- 🔒 **Error message sanitization**

## Testing

### Test Payment Methods

**Test Credit Card:**

```
Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

**Test ACH Bank Account:**

```
Routing: 110000000
Account: 000123456789
Account Type: Checking
```

### Test Script

Run the included test script to verify all functionality:

```bash
./test-ach-checkout.sh
```

## Next Steps

1. ✅ Set up Stripe webhook handling for subscription events
2. ✅ Configure success page to handle both payment methods
3. ✅ Implement payment method verification in dashboard
4. 🔄 Add subscription management features
5. 🔄 Implement user authentication and session management
6. 🔄 Set up monitoring and alerts for failed payments
