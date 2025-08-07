# EZMedTech Payment Portal

A comprehensive healthcare SaaS payment portal built with Next.js 14, Stripe, and modern React patterns. Features complete subscription management, professional dashboard, context-aware navigation, and integrated billing portal.

![Healthcare SaaS Platform](https://img.shields.io/badge/Healthcare-SaaS-blue)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-635bff)

## 🚀 **Features**

### **Complete Stripe Integration**
- ✅ Subscription checkout with session creation
- ✅ Real-time session verification and validation
- ✅ Integrated customer portal for billing management
- ✅ Comprehensive error handling and recovery
- ✅ API health checks and connection testing

### **Professional Dashboard**
- ✅ Real-time subscription status and billing information
- ✅ Usage statistics with visual progress indicators
- ✅ Payment method display and management
- ✅ Billing history with downloadable invoices
- ✅ Direct access to Stripe customer portal

### **Context-Aware Navigation**
- ✅ Dynamic navigation based on user authentication state
- ✅ Professional user menu with subscription information
- ✅ Mobile-responsive design with touch interactions
- ✅ Integrated billing portal access
- ✅ Professional healthcare branding

## 🛠 **Tech Stack**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Payment Processing**: Stripe
- **Notifications**: Sonner
- **Icons**: Lucide React

## 📦 **Installation**

### **Prerequisites**
- Node.js 18+ 
- pnpm (recommended) or npm
- Stripe account with test/live keys

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
3. **Checkout** - Click "Get Started" to test Stripe checkout
4. **Payment** - Use Stripe test card: `4242 4242 4242 4242`
5. **Success** - Complete checkout and return to `/success`
6. **Dashboard** - View `/dashboard` for subscription management
7. **Portal** - Test billing portal from navigation menu

### **API Testing**
```bash
# Test Stripe connection
curl http://localhost:3000/api/stripe/test-connection

# Create checkout session
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_test_basic_monthly"}'

# Test customer portal (requires valid customer ID)
curl -X POST http://localhost:3000/api/stripe/portal \
  -H "Content-Type: application/json" \
  -d '{"customer_id": "cus_test_123"}'
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
- `POST /api/stripe/checkout` - Create subscription checkout sessions
- `GET /api/stripe/verify-session` - Verify completed sessions
- `POST /api/stripe/portal` - Generate customer portal URLs
- `GET /api/stripe/test-connection` - Test Stripe API connectivity

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
