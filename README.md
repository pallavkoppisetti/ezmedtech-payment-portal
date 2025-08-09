# EZMedTech Payment Portal

A comprehensive healthcare SaaS payment portal built with Next.js 14, Stripe, and modern React patterns. Features complete subscription management with **multi-payment method support** (credit cards + ACH bank accounts), professional dashboard, and HIPAA-compliant payment processing.

![Healthcare SaaS Platform](https://img.shields.io/badge/Healthcare-SaaS-blue)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-635bff)
![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-green)

## 🚀 **Features**

### **🏦 Multi-Payment Method Support**

- ✅ **Credit/Debit Cards**: Real-time processing with global support
- ✅ **ACH Bank Accounts**: US bank account payments with 3-5 day settlement
- ✅ **Payment Method Detection**: Automatic UI adaptation based on payment type
- ✅ **Settlement Tracking**: Clear settlement dates and processing status
- ✅ **HIPAA Compliance**: Healthcare-specific payment handling and mandates

### **💳 Complete Stripe Integration**

- ✅ **Flexible Checkout**: Single session supporting both payment methods
- ✅ **Smart Session Verification**: Enhanced logic for card vs ACH payment validation
- ✅ **ACH Payment Handling**: Proper verification for unpaid ACH subscriptions  
- ✅ **Customer Portal**: Integrated billing management and payment updates
- ✅ **Error Recovery**: Comprehensive error handling and user guidance
- ✅ **API Health Monitoring**: Connection testing and status validation

### **📊 Professional Dashboard**

- ✅ **Payment Method Display**: Visual indicators for card vs ACH payments
- ✅ **Subscription Management**: Real-time status and billing information
- ✅ **Settlement Tracking**: ACH payment processing timelines
- ✅ **Usage Analytics**: Visual progress indicators and metrics
- ✅ **Billing History**: Downloadable invoices and payment records

### **🎨 Healthcare-Focused Design**

- ✅ **Professional Branding**: Healthcare industry-appropriate design
- ✅ **Mobile Responsive**: Optimized for medical professionals on-the-go
- ✅ **Accessibility**: WCAG 2.1 AA compliant interface
- ✅ **Loading States**: Clear feedback for payment processing delays
- ✅ **Error Messaging**: User-friendly error communication

## 🛠 **Tech Stack**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Payment Processing**: Stripe v18.4.0 (Cards + ACH)
- **Deployment**: AWS Amplify
- **Notifications**: Sonner
- **Icons**: Lucide React

## 📦 **Installation**

### **Prerequisites**

- Node.js 18+
- pnpm (recommended) or npm
- Stripe account with ACH capabilities enabled
- AWS account (for production deployment)

### **Setup**

1. **Clone the repository**

```bash
git clone https://github.com/pallavkoppisetti/ezmedtech-payment-portal.git
cd ezmedtech-payment-portal
```

2. **Install dependencies**

```bash
pnpm install
# or
npm install
```

3. **Environment Setup**

```bash
cp .env.example .env.local
```

4. **Configure Environment Variables**

Create a `.env.local` file by copying the example:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Stripe **publishable key** and the name of the AWS SSM parameter where your secret key is stored.

```bash
# Stripe Configuration (Required)
# The secret key is securely fetched from AWS SSM Parameter Store
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY_PARAM_NAME=/amplify/d2n13ux3l85z6g/main/STRIPE_SECRET_KEY

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. **Secret Management with AWS SSM**

For local development, the Stripe secret key is fetched from AWS SSM Parameter Store. Ensure your local AWS environment is configured with credentials that have permission to read the specified parameter. The application uses the AWS SDK, which will automatically pick up credentials from your environment (e.g., from `~/.aws/credentials` or environment variables).

For production, you must configure an IAM role for your Amplify application with permissions to access the SSM parameter. See the [Deployment Guide](./DEPLOYMENT.md) for detailed instructions.

6. **Start Development Server**

```bash
pnpm dev
# or
npm run dev
```

7. **Open in Browser**
   Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 **Testing the Application**

### **Complete User Flow**

1. **Landing Page** - Visit `/` for healthcare-focused hero section
2. **Pricing** - Navigate to `/pricing` to view subscription plans
3. **Multi-Payment Checkout** - Click "Subscribe" to see both payment options
4. **Card Payment** - Test with `4242 4242 4242 4242` (any future date, any CVC)
5. **ACH Payment** - Test with routing `110000000`, account `000123456789`
6. **Success Page** - Verify payment method detection and settlement info
7. **Dashboard** - View subscription with payment method details

### **Automated Testing**

```bash
# Run comprehensive payment method tests
./test-ach-checkout.sh

# Test payment methods API (if available)
./test-payment-methods-api.sh
```

### **Manual API Testing**

```bash
# Test Stripe connection
curl http://localhost:3000/api/stripe/test-connection

# Create checkout session (both payment methods)
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId": "professional", "customerEmail": "test@clinic.com"}'

# Create ACH-only checkout
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId": "professional", "payment_method_type": "ach", "customerEmail": "test@clinic.com"}'

# Verify session with payment method info
curl "http://localhost:3000/api/stripe/verify-session?session_id=cs_test_SESSION_ID"

# Test customer portal (requires valid customer ID)
curl -X POST http://localhost:3000/api/stripe/portal \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "cus_test_123"}'
```

### **Test Payment Methods**

**Credit/Debit Cards:**

```
Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
```

**ACH Bank Account:**

```
Routing Number: 110000000
Account Number: 000123456789
Account Type: Checking
```

## 📁 **Project Structure**

```
src/
├── app/
│   ├── api/stripe/              # Stripe API routes
│   │   ├── checkout/            # Subscription checkout
│   │   ├── verify-session/      # Session verification
│   │   ├── portal/              # Customer portal
│   │   └── test-connection/     # API health checks
│   ├── dashboard/               # Professional dashboard
│   ├── success/                 # Enhanced success page
│   ├── pricing/                 # Pricing with checkout
│   ├── contact/                 # Contact page
│   ├── page.tsx                 # Landing page
│   └── layout.tsx               # Root layout
├── components/
│   ├── billing/                 # Billing components
│   ├── shared/                  # Shared components
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── stripe/                  # Stripe configuration
│   └── utils.ts                 # Utility functions
└── .env.local                   # Environment variables
```

## 🎯 **Key Features**

### **Pricing Plans**

- **Basic**: $29/month - 100 patients, basic reporting, email support
- **Professional**: $79/month - 1,000 patients, advanced analytics, priority support
- **Enterprise**: $199/month - Unlimited patients, custom integrations, 24/7 support

### **Dashboard Capabilities**

- Real-time subscription status and billing information
- Visual usage statistics with color-coded progress bars
- Payment method management and billing history
- Direct access to Stripe customer portal
- Professional loading states and error handling

### **API Endpoints**

- `POST /api/stripe/checkout` - Create subscription checkout sessions (supports card + ACH)
- `GET /api/stripe/verify-session` - **Enhanced verification** with ACH support
- `POST /api/stripe/portal` - Generate customer portal URLs  
- `GET /api/stripe/test-connection` - Test Stripe API connectivity

#### **Enhanced Session Verification** 🎯

The `/api/stripe/verify-session` endpoint includes **smart verification logic** for different payment methods:

**Card Payments**: Traditional verification checking `payment_status === 'paid'`
**ACH Payments**: Enhanced logic that verifies subscription creation success even when `payment_status === 'unpaid'`

ACH payments are considered successful when:
- Session status is `complete`
- Subscription exists and status is `active`, `trialing`, or `past_due`
- Payment method type is detected as `us_bank_account`

**Response includes**:
- `paymentMethodType`: Detected payment method (`card`, `us_bank_account`)
- `verificationMethod`: Logic used (`card_payment`, `ach_subscription`)
- Enhanced error messaging for debugging

## 🚀 **Deployment**

### **Vercel (Recommended)**

1. Push to GitHub repository
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### **Environment Variables for Production**

```bash
# Replace test keys with live keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **Production Checklist**

- [ ] Replace Stripe test keys with live keys
- [ ] Configure webhook endpoints
- [ ] Set up authentication system
- [ ] Add monitoring and error tracking
- [ ] Configure DNS and SSL
- [ ] Test complete user flow

## 🔧 **Development**

### **Available Scripts**

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

### **Code Quality**

- **TypeScript**: Full type safety across all components
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit validation

## 📚 **Documentation**

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Comprehensive project overview
- **[Stripe Documentation](https://stripe.com/docs)** - Payment processing
- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[shadcn/ui](https://ui.shadcn.com)** - Component library

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For support and questions:

- Create an issue in the GitHub repository
- Contact: support@ezmedtech.com
- Documentation: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

**Built with ❤️ for healthcare professionals by the EZMedTech team**
