# AWS Amplify Deployment Checklist

## 📋 **Pre-Deployment Checklist**

### ✅ **Git Repository Status**

- [ ] All necessary files are tracked in git
- [ ] `.gitignore` is optimized for AWS Amplify
- [ ] No sensitive files (API keys, secrets) are committed
- [ ] Branch is ready for deployment (staging/main)

### ✅ **Required Files for Deployment**

**Essential Build Files:**

- [x] `package.json` - Dependencies and scripts
- [x] `pnpm-lock.yaml` - Lock file for reproducible builds
- [x] `amplify.yml` - AWS Amplify build specification
- [x] `next.config.ts` - Next.js configuration
- [x] `tsconfig.json` - TypeScript configuration
- [x] `postcss.config.mjs` - PostCSS configuration
- [x] `components.json` - shadcn/ui configuration

**Source Code:**

- [x] `src/` directory - All application source code
- [x] `public/` directory - Static assets (images, icons)

**Documentation:**

- [x] `README.md` - Project overview and setup
- [x] `API_DOCUMENTATION.md` - API reference
- [x] `DEPLOYMENT.md` - Deployment instructions

### ✅ **Environment Variables Setup**

**Required Environment Variables for Amplify:**

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_[your_live_key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_[your_live_key]

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.amplifyapp.com

# AWS Configuration (if using AWS services)
AWS_ACCESS_KEY_ID=[your_aws_access_key]
AWS_SECRET_ACCESS_KEY=[your_aws_secret_key]
AWS_REGION=us-east-1
```

**Security Notes:**

- ⚠️ Never commit actual API keys to git
- ⚠️ Use AWS Amplify environment variable management
- ⚠️ Enable production mode Stripe keys for live deployment

### ✅ **AWS Amplify Configuration**

**Build Settings (amplify.yml):**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm@8
        - pnpm install
    build:
      commands:
        - pnpm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**Amplify Console Setup:**

- [ ] Connect GitHub repository
- [ ] Select correct branch (staging/main)
- [ ] Configure environment variables
- [ ] Enable custom domain (if needed)
- [ ] Set up SSL certificate

### ✅ **Files Excluded from Deployment**

The following files are properly excluded via `.gitignore`:

**Development Files:**

- `node_modules/` - Dependencies (rebuilt during deployment)
- `.next/` - Build artifacts (generated during deployment)
- `.env.local` - Local environment variables
- Coverage reports and test outputs

**IDE Files:**

- `.vscode/` - VS Code settings
- `.idea/` - IDE configurations

**System Files:**

- `.DS_Store` - macOS system files
- `Thumbs.db` - Windows system files

**Security Files:**

- `*.pem` - SSL certificates
- `*.key` - Private keys
- `.aws/` - AWS credentials

### ✅ **Files Included for Deployment**

**Source Code:**

- All files in `src/` directory
- All files in `public/` directory
- Component configurations and styles

**Configuration:**

- `package.json` and `pnpm-lock.yaml`
- `next.config.ts` and `tsconfig.json`
- `amplify.yml` build specification
- PostCSS and Tailwind configurations

**Documentation:**

- `README.md`, `API_DOCUMENTATION.md`
- Environment file templates (`.env.example`)

## 🚀 **Deployment Steps**

### 1. **Push to GitHub**

```bash
git add .
git commit -m "feat: optimize for AWS Amplify deployment"
git push origin staging
```

### 2. **AWS Amplify Console**

1. Login to AWS Amplify Console
2. Create new app or update existing app
3. Connect to GitHub repository
4. Select branch (staging/main)
5. Configure build settings (use amplify.yml)
6. Set environment variables
7. Deploy

### 3. **Post-Deployment Verification**

- [ ] Application loads correctly
- [ ] API endpoints respond properly
- [ ] Stripe checkout functionality works
- [ ] Payment methods (card + ACH) are available
- [ ] Success page displays correctly
- [ ] Dashboard shows subscription data
- [ ] Customer portal is accessible

### 4. **Production Configuration**

- [ ] Update Stripe webhooks URL
- [ ] Configure custom domain
- [ ] Set up monitoring and alerts
- [ ] Test with real payment methods
- [ ] Verify HIPAA compliance

## 🔍 **Troubleshooting**

### Common Issues:

1. **Build Fails**: Check pnpm version and dependencies
2. **Environment Variables**: Ensure all required vars are set
3. **API Errors**: Verify Stripe keys and environment configuration
4. **Missing Files**: Check `.gitignore` doesn't exclude necessary files

### Debug Commands:

```bash
# Check git status
git status

# Verify tracked files
git ls-files | grep -E "(src|public|package|amplify|next.config)"

# Test local build
pnpm build
```

## 📞 **Support**

For deployment issues:

- Check AWS Amplify build logs
- Review environment variable configuration
- Verify Stripe webhook endpoints
- Test API endpoints manually

The repository is now optimized for AWS Amplify deployment with all necessary files included and sensitive data properly excluded.
