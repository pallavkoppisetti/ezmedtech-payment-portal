# AWS Amplify Deployment Guide

## 🚀 **Deployment Overview**

This guide will help you deploy the EZMedTech Payment Portal to AWS Amplify with production-ready configurations.

## 📋 **Prerequisites**

- AWS Account with Amplify access
- GitHub repository with the project
- Stripe account (test/live keys)
- Domain name (optional)

## 🛠 **Step-by-Step Deployment**

### **1. Prepare Your Repository**

Ensure your repository has the required files:
- ✅ `amplify.yml` - Build configuration
- ✅ `next.config.ts` - Production optimizations
- ✅ `.env.example` - Environment template
- ✅ `.gitignore` - Environment file exclusions

### **2. Create Amplify App**

1. **Login to AWS Amplify Console**
   - Visit: https://console.aws.amazon.com/amplify/
   - Click "Create new app"

2. **Connect Repository**
   - Choose "GitHub" as source
   - Authorize AWS Amplify to access your repository
   - Select `ezmedtech-payment-portal` repository
   - Choose `master` branch

3. **Configure Build Settings**
   - Amplify will automatically detect `amplify.yml`
   - Verify the build configuration is loaded correctly
   - The file includes environment validation and caching

### **3. Environment Variables & Secret Management**

In the Amplify Console, go to **App settings** > **Environment variables** and add the following variables. The Stripe secret key is managed separately and securely via AWS SSM Parameter Store and an IAM role.

#### **A. Configure Environment Variables in Amplify**
```bash
# The public key for Stripe.js on the client-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key

# The name of the SSM Parameter Store parameter holding the secret key
STRIPE_SECRET_KEY_PARAM_NAME=/amplify/d2n13ux3l85z6g/main/STRIPE_SECRET_KEY

# The public URL of your application
NEXT_PUBLIC_APP_URL=https://your-app-name.amplifyapp.com
```

#### **B. Store the Stripe Secret Key in AWS SSM Parameter Store**

1.  Navigate to the **AWS Systems Manager** console.
2.  In the left navigation pane, click **Parameter Store**.
3.  Click **Create parameter**.
4.  **Name**: Enter the exact name you used for `STRIPE_SECRET_KEY_PARAM_NAME` (e.g., `/amplify/d2n13ux3l85z6g/main/STRIPE_SECRET_KEY`).
5.  **Type**: Select `SecureString`. AWS will encrypt the parameter using the default KMS key.
6.  **Value**: Paste your live Stripe secret key (`sk_live_...`).
7.  Click **Create parameter**.

#### **C. Create and Assign an IAM Compute Role for SSM Access**

For your Amplify application to securely access the secret at runtime, you must grant it permissions via a dedicated IAM Compute Role.

1.  **Create an IAM Policy**:
    *   Navigate to the **IAM** console > **Policies** > **Create policy**.
    *   Switch to the **JSON** editor and paste the following policy. Replace the placeholder with your AWS Account ID, Region, and the exact parameter name.

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "ssm:GetParameters",
                "Resource": "arn:aws:ssm:<REGION>:<ACCOUNT_ID>:parameter/<PARAMETER_NAME>"
            }
        ]
    }
    ```
    *   **Example Resource**: `arn:aws:ssm:us-east-1:123456789012:parameter/amplify/d2n13ux3l85z6g/main/STRIPE_SECRET_KEY`
    *   Name the policy something descriptive, like `AmplifyComputeSSM-StripeKey-Access`.

2.  **Create the IAM Compute Role**:
    *   Navigate to **IAM** > **Roles** > **Create role**.
    *   For **Trusted entity type**, select **Custom trust policy**.
    *   Paste the following trust policy, which allows Amplify to assume this role.

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Service": "amplify.amazonaws.com"
                },
                "Action": "sts:AssumeRole"
            }
        ]
    }
    ```
    *   Click **Next**.
    *   Attach the `AmplifyComputeSSM-StripeKey-Access` policy you created in the previous step.
    *   Name the role `Amplify-Compute-Role-For-Stripe-SSM` and create it.

3.  **Assign the Role to Your Amplify App**:
    *   In the **Amplify Console**, navigate to your app > **App settings** > **General**.
    *   Click **Edit**.
    *   Under **App details**, find the **Compute role** dropdown.
    *   Select the `Amplify-Compute-Role-For-Stripe-SSM` role you just created.
    *   Click **Save**.

Your application is now configured to securely fetch the Stripe secret key from SSM Parameter Store during runtime.

### **4. Domain Configuration**

#### **Option A: Use Amplify Domain**
- Your app will be available at: `https://master.your-app-id.amplifyapp.com`

#### **Option B: Custom Domain**
1. Go to **App settings** > **Domain management**
2. Click "Add domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

### **5. Deploy the Application**

1. **Trigger Initial Build**
   - Click "Save and deploy"
   - Monitor build progress in real-time
   - Build typically takes 3-5 minutes

2. **Verify Build Success**
   - Check all build phases complete successfully
   - Verify environment variables are detected
   - Confirm no build errors

### **6. Post-Deployment Verification**

#### **Test Complete User Flow**
1. **Landing Page** - Verify branding and layout
2. **Pricing Page** - Test plan selection
3. **Stripe Checkout** - Complete test transaction
4. **Success Page** - Verify session validation
5. **Dashboard** - Check subscription display
6. **Navigation** - Test user menu and portal access

#### **Security Headers Check**
Use tools like https://securityheaders.com to verify:
- ✅ Content Security Policy
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Strict-Transport-Security

#### **Performance Testing**
- **Google PageSpeed Insights**: Test Core Web Vitals
- **GTmetrix**: Analyze loading performance
- **Lighthouse**: Check accessibility and SEO

## 🔧 **Production Optimizations**

### **Automatic Deployments**
- ✅ Commits to `master` trigger automatic builds
- ✅ Build cache optimizes subsequent deployments
- ✅ Environment variables validated during build

### **Performance Features**
- ✅ Next.js static optimization
- ✅ Image optimization with WebP/AVIF
- ✅ Webpack bundle splitting
- ✅ Aggressive caching for static assets

### **Security Features**
- ✅ Security headers for healthcare compliance
- ✅ CSP allowing only Stripe domains
- ✅ HTTPS enforcement
- ✅ XSS and clickjacking protection

## 🌍 **Environment-Specific Configurations**

### **Staging Environment**
1. Create a new branch: `staging`
2. Connect staging branch in Amplify
3. Use Stripe test keys for staging
4. Configure staging-specific environment variables

### **Production Environment**
1. Use `master` branch for production
2. Configure live Stripe keys
3. Set up custom domain
4. Enable monitoring and alerting

## 📊 **Monitoring & Analytics**

### **AWS CloudWatch**
- Monitor application performance
- Set up alerts for errors
- Track deployment metrics

### **Stripe Dashboard**
- Monitor payment processing
- Track subscription metrics
- Set up webhook monitoring

### **User Analytics**
- Google Analytics (optional)
- Conversion tracking
- User behavior analysis

## 🚨 **Troubleshooting**

### **Common Build Issues**

#### **Environment Variables Not Found**
```bash
❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set
```
**Solution**: Verify environment variables are set in Amplify Console

#### **Build Timeout**
```bash
Build failed: timeout
```
**Solution**: Check for large dependencies or infinite loops in build process

#### **TypeScript Errors**
```bash
Type check failed
```
**Solution**: Run `npm run type-check` locally to identify issues

### **Common Runtime Issues**

#### **Stripe Errors**
- Verify API keys are correct for environment
- Check network connectivity to Stripe
- Validate CSP headers allow Stripe domains

#### **Navigation Issues**
- Clear browser cache
- Check for JavaScript console errors
- Verify all routes are accessible

## 🔄 **Continuous Deployment**

### **Automated Pipeline**
1. **Code Push** → GitHub repository
2. **Webhook** → Triggers Amplify build
3. **Build** → Runs tests and optimizations
4. **Deploy** → Updates production environment
5. **Notify** → Deployment status notifications

### **Quality Gates**
- ✅ TypeScript compilation
- ✅ ESLint validation
- ✅ Environment variable validation
- ✅ Build optimization

## 📈 **Scaling Considerations**

### **Performance Optimization**
- Monitor Core Web Vitals
- Optimize images and assets
- Implement edge caching
- Consider CDN for global distribution

### **Security Monitoring**
- Regular security header audits
- Stripe integration monitoring
- User authentication tracking
- Compliance reporting

---

## 🎉 **Success Checklist**

- [ ] Application builds successfully
- [ ] All environment variables configured
- [ ] Stripe integration working
- [ ] Security headers active
- [ ] Performance metrics acceptable
- [ ] Custom domain configured (if applicable)
- [ ] Monitoring and alerts set up
- [ ] Complete user flow tested

**Your EZMedTech Payment Portal is now live and production-ready!** 🚀
