# EZMedTech Payment Portal - API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the EZMedTech Payment Portal, including payment processing, subscription management, and health monitoring.

## Authentication

All API endpoints use server-side Stripe secret keys for authentication. No user authentication is required for public endpoints, but sensitive operations require proper Stripe configuration.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## API Endpoints

### Stripe Integration

#### 🏦 Checkout Session Creation

**Endpoint**: `POST /api/stripe/checkout`

Creates a Stripe checkout session with support for multiple payment methods.

**Features**:

- Multi-payment support (cards + ACH)
- HIPAA-compliant payment processing
- Automatic customer management
- Flexible pricing (tier IDs or Stripe price IDs)

**Request Body**:

```typescript
{
  priceId: string;                           // Required: 'professional' or 'price_xxx'
  customerEmail?: string;                    // Optional: Customer email
  customerId?: string;                       // Optional: Existing Stripe customer
  payment_method_type?: 'card'|'ach'|'both'; // Optional: Default 'both'
  metadata?: Record<string, string>;         // Optional: Custom metadata
}
```

**Response**:

```typescript
{
  url: string; // Stripe checkout URL
  sessionId: string; // Session ID for tracking
}
```

**Example**:

```bash
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "professional",
    "customerEmail": "doctor@clinic.com",
    "payment_method_type": "both"
  }'
```

---

#### ✅ Session Verification

**Endpoint**: `GET /api/stripe/verify-session`

Verifies and retrieves checkout session information with payment method details.

**Query Parameters**:

- `session_id`: Stripe checkout session ID (required)

**Response**:

```typescript
{
  success: boolean;
  subscription?: {
    id: string;
    status: string;
    planName: string;
    amount: number;
    currency: string;
    interval: string;
    nextBillingDate: string;
    customerEmail: string;
    customerName?: string;
  };
  paymentMethod?: {
    id: string;
    type: string;      // 'card' or 'us_bank_account'
    object: string;
  } | null;
  error?: string;
  details?: string;
}
```

**Example**:

```bash
curl "http://localhost:3000/api/stripe/verify-session?session_id=cs_test_SESSION_ID"
```

---

#### 🏢 Customer Portal

**Endpoint**: `POST /api/stripe/portal`

Creates a Stripe customer portal session for billing management.

**Request Body**:

```typescript
{
  customer_id: string;     // Required: Stripe customer ID
  return_url?: string;     // Optional: Return URL after portal
}
```

**Response**:

```typescript
{
  url: string; // Stripe customer portal URL
}
```

**Example**:

```bash
curl -X POST http://localhost:3000/api/stripe/portal \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "cus_stripe_customer_id"}'
```

---

#### 🔧 Connection Testing

**Endpoint**: `GET /api/stripe/test-connection`

Tests Stripe API connectivity and account configuration.

**Response**:

```typescript
{
  success: boolean;
  message: string;
  account: {
    connected: boolean;
    productCount: number;
  };
  error?: string;
}
```

**Example**:

```bash
curl http://localhost:3000/api/stripe/test-connection
```

---

### Payment Methods API (Optional)

#### 📋 List Payment Methods

**Endpoint**: `GET /api/stripe/payment-methods`

Lists payment methods for a customer with filtering and pagination.

**Query Parameters**:

- `customer_id`: Stripe customer ID (required)
- `type`: Payment method type filter (optional)
- `limit`: Number of results (optional, default: 10)

**Response**:

```typescript
{
  success: boolean;
  paymentMethods: Array<{
    id: string;
    type: string;
    created: number;
    // ... additional Stripe payment method fields
  }>;
  hasMore: boolean;
  error?: string;
}
```

#### ➕ Create Payment Method

**Endpoint**: `POST /api/stripe/payment-methods`

Creates and attaches a new payment method to a customer.

**Request Body**:

```typescript
{
  customer_id: string;     // Required: Stripe customer ID
  payment_method_id: string; // Required: Payment method to attach
  set_default?: boolean;   // Optional: Set as default payment method
}
```

#### 🗑️ Delete Payment Method

**Endpoint**: `DELETE /api/stripe/payment-methods`

Detaches a payment method from a customer.

**Request Body**:

```typescript
{
  payment_method_id: string; // Required: Payment method to detach
}
```

---

## Error Handling

All endpoints follow consistent error response patterns:

```typescript
{
  success: false;
  error: string;      // User-friendly error message
  details?: string;   // Technical details for debugging
}
```

### Common HTTP Status Codes

- `200`: Success
- `400`: Bad Request (validation errors)
- `404`: Not Found (session expired, customer not found)
- `405`: Method Not Allowed
- `500`: Internal Server Error (Stripe API errors, server issues)

### Stripe-Specific Errors

The API handles various Stripe error types:

- **Invalid Request**: Missing or invalid parameters
- **Authentication**: Invalid API keys
- **Card Declined**: Payment method issues
- **Rate Limit**: Too many requests
- **API Connection**: Network connectivity issues

---

## Testing

### Automated Testing

Run the comprehensive test suite:

```bash
# Test all checkout functionality
./test-ach-checkout.sh

# Test payment methods API (if implemented)
./test-payment-methods-api.sh
```

### Test Data

**Test Credit Card**:

```
Number: 4242 4242 4242 4242
Expiry: 12/25
CVC: 123
```

**Test ACH Bank Account**:

```
Routing: 110000000
Account: 000123456789
Type: Checking
```

### Test Scenarios

1. **Multi-Payment Checkout**: Default behavior shows both options
2. **Card-Only Checkout**: Restrict to credit/debit cards
3. **ACH-Only Checkout**: Bank account payments only
4. **Session Verification**: Validate successful payments
5. **Error Handling**: Invalid sessions, missing parameters
6. **Customer Portal**: Billing management access

---

## Security & Compliance

### HIPAA Compliance

- Server-side Stripe secret key handling
- Healthcare-specific ACH mandate text
- Secure metadata handling (500-char limit)
- HTTPS-only communication

### PCI Compliance

- No sensitive payment data stored locally
- Stripe handles all payment processing
- Tokenized payment method references only

### Rate Limiting

API endpoints include built-in rate limiting:

- 100 requests per minute per IP (checkout)
- 50 requests per minute per IP (payment methods)
- 500 requests per minute per IP (health checks)

---

## Monitoring & Alerts

### Health Checks

- `/api/stripe/test-connection`: Stripe API connectivity
- Automatic retry logic for failed requests
- Error logging for debugging

### Metrics

Key metrics to monitor:

- Checkout session creation rate
- Payment success/failure ratios
- ACH vs card payment distribution
- Customer portal usage
- API response times
- Error rates by endpoint

---

## Development

### Environment Variables

Required environment variables (store in `.env.local`):

```bash
# Stripe Configuration (use .env.local for security)
STRIPE_SECRET_KEY=sk_test_[your_secret_key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[your_publishable_key]

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AWS Configuration (for production)
AWS_ACCESS_KEY_ID=[your_access_key]
AWS_SECRET_ACCESS_KEY=[your_secret_key]
AWS_REGION=us-east-1
```

**Security Note**: Never commit actual API keys to version control. Use `.env.local` for development and secure environment variable management in production.

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
./test-ach-checkout.sh
```

### Deployment

The application is configured for AWS Amplify deployment with:

- Automatic builds on git push
- Environment variable management
- SSL certificate handling
- CDN distribution

---

## Support & Troubleshooting

### Common Issues

1. **Checkout Session Expired**: Sessions expire after 24 hours
2. **Invalid Price ID**: Check pricing tier configuration
3. **ACH Not Available**: Ensure US bank account and proper Stripe setup
4. **Customer Portal Access**: Requires valid Stripe customer ID

### Debug Mode

Enable debug logging:

```bash
DEBUG=stripe* pnpm dev
```

### Contact

For technical support or integration questions:

- **Documentation**: See `STRIPE_CHECKOUT_API.md` for detailed endpoint docs
- **Testing**: Use provided test scripts for validation
- **Monitoring**: Check `/api/stripe/test-connection` for connectivity
