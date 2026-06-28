# CARLOPHILLIPS DEPLOYMENT GUIDE

## 🎯 Deployment Overview

This guide covers deploying the CARLOPHILLIPS headless ecommerce site to:
- **Staging**: staging.carlophillips.com
- **Production**: www.carlophillips.com

---

## ✅ Pre-Deployment Checklist

### 1. Git Repository
- [x] Git initialized and code committed
- [x] .gitignore properly configured
- [x] README.md created
- [ ] Push to GitHub/GitLab (See instructions below)

### 2. Environment Configs
- [x] Local env files removed from Git
- [ ] Vercel environment variables configured for staging and production
- [x] No hardcoded URLs in code
- [x] All secrets use environment variables

### 3. Deployment Readiness
- [x] Deployment agent check: **PASSED ✅**
- [x] Next.js build configuration verified
- [x] Shopify API integration tested
- [x] Shopify credentials externalized

---

## 📦 STEP 1: Git Repository

Use the existing GitHub repository:

```bash
git remote add origin https://github.com/CubiqoUnited/carlophillips-site.git
git push origin main
git push origin staging
```

---

## 🌐 STEP 2: Domain Configuration

You need to configure DNS for your domains to point to your deployment.

### Required DNS Records:

**For www.carlophillips.com (Production):**
```
Type: CNAME or A
Name: www
Value: [YOUR_DEPLOYMENT_SERVER_IP or CNAME]
TTL: 3600
```

**For staging.carlophillips.com (Staging):**
```
Type: CNAME or A
Name: staging
Value: [YOUR_STAGING_SERVER_IP or CNAME]
TTL: 3600
```

### Where to Configure DNS:
1. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Go to DNS Management for carlophillips.com
3. Add the above records
4. Wait 5-60 minutes for DNS propagation

---

## 🚀 STEP 3A: Deploy to Vercel (Recommended for Next.js)

### Why Vercel?
- Built specifically for Next.js
- Automatic deployments from Git
- Free tier available
- Built-in staging environments
- Global CDN

### Deployment Steps:

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up/login with GitHub/GitLab account

2. **Import Repository:**
   - Click "Add New" > "Project"
   - Import `CubiqoUnited/carlophillips-site`

3. **Configure Production Deployment:**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `yarn build`
   - Output Directory: `.next`
   
4. **Add Environment Variables (Production):**
   ```
   NEXT_PUBLIC_BASE_URL=https://www.carlophillips.com
   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=carlophillips.myshopify.com
   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=[your-storefront-token]
   CORS_ORIGINS=https://www.carlophillips.com,https://staging.carlophillips.com
   ```

5. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a deployment URL (e.g., carlophillips.vercel.app)

6. **Add Custom Domain:**
   - Go to Project Settings > Domains
   - Add: www.carlophillips.com
   - Vercel will provide DNS configuration instructions

7. **Create Staging Environment:**
   - Use the `staging` branch for preview/staging deploys
   - Set preview environment variables in Vercel
   - Attach `staging.carlophillips.com` to the staging deployment

---

## 🚀 STEP 3B: Deploy to Other Platforms

### Option: Railway.app
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NEXT_PUBLIC_BASE_URL=https://www.carlophillips.com
# ... add all other env vars

# Deploy
railway up
```

### Option: DigitalOcean App Platform
1. Go to DigitalOcean App Platform
2. Connect your Git repository
3. Configure build settings (similar to Vercel)
4. Add environment variables
5. Deploy

### Option: Custom VPS (Advanced)
If deploying to your own server:
```bash
# On your server
git clone [your-repo-url]
cd carlophillips-site

# Install dependencies
yarn install

# Build
yarn build

# Start with PM2
npm install -g pm2
pm2 start yarn --name "carlophillips" -- start
pm2 save
pm2 startup
```

---

## 🔧 STEP 4: Post-Deployment Configuration

### 1. Update Shopify
- Go to Shopify Admin > Settings > Domains
- Add your custom domain: www.carlophillips.com
- This allows Shopify checkout to redirect back properly

### 2. Test the Deployment

**Production Test (www.carlophillips.com):**
```bash
# Test homepage loads
curl -I https://www.carlophillips.com

# Test product fetching
curl https://www.carlophillips.com/api/health
```

**Staging Test (staging.carlophillips.com):**
```bash
curl -I https://staging.carlophillips.com
```

### 3. Complete a Test Order

1. Visit www.carlophillips.com
2. Add a product to cart
3. Click checkout
4. Use Shopify test card: 4242 4242 4242 4242
5. Complete the order
6. Verify order appears in:
   - Shopify Admin > Orders
   - Printify > My Orders

### 4. Configure Analytics (Optional)

Add to your environment variables:
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXX

# TikTok Pixel
NEXT_PUBLIC_TIKTOK_PIXEL_ID=XXXXXXXXXXXX
```

---

## 📊 Monitoring & Maintenance

### Health Checks
- Production: https://www.carlophillips.com/api/health
- Staging: https://staging.carlophillips.com/api/health

### Logs
If deployed on Vercel:
- Go to your project > Deployments
- Click on any deployment
- View "Logs" tab for real-time logs

### Shopify Integration
- Monitor Shopify Admin > Analytics for orders
- Check Printify for fulfillment status
- Review Shopify Payment settings regularly

---

## 🚨 Troubleshooting

### Issue: Site not loading after deployment
**Solution:**
- Check DNS propagation: https://www.whatsmydns.net
- Verify environment variables are set correctly
- Check deployment logs for build errors

### Issue: Products not showing
**Solution:**
- Verify Shopify credentials in environment
- Check products are published to "Headless" channel
- Test Shopify API with: https://your-domain.com/api/health

### Issue: Checkout not working
**Solution:**
- Verify Shopify Payments is enabled
- Check CORS settings in environment
- Ensure custom domain is added to Shopify

### Issue: Orders not reaching Printify
**Solution:**
- Check Printify app is installed in Shopify
- Verify Order Approval is set to "Automatic"
- Check Printify > Account > Integration status

---

## 📝 Rollback Procedure

If production deployment fails:

1. **On Vercel:**
   - Go to Deployments
   - Find previous working deployment
   - Click "..." > "Promote to Production"

2. **On Git:**
   ```bash
   # Find previous working commit
   git log --oneline

   # Revert to that commit
   git revert [commit-hash]
   git push
   ```

---

## 🔐 Security Checklist

- [ ] HTTPS enabled on both domains
- [ ] Shopify Storefront token is public (not Admin API)
- [ ] No sensitive credentials in Git repository
- [ ] CORS properly configured
- [ ] Environment variables set correctly
- [ ] MongoDB connection secured
- [ ] Rate limiting configured (if needed)

---

## 📞 Support Contacts

**Deployment Issues:**
- Check deployment platform docs (Vercel, Railway, etc.)
- Review application logs

**Shopify Issues:**
- Shopify Admin > Help Center
- Check Shopify Status page

**Domain/DNS Issues:**
- Contact your domain registrar support
- Check DNS propagation time (up to 48 hours)

---

## ✅ Deployment Success Criteria

Your deployment is successful when:
- [ ] www.carlophillips.com loads the homepage
- [ ] Products display correctly
- [ ] Cart adds items successfully
- [ ] Checkout redirects to Shopify
- [ ] Test order completes successfully
- [ ] Order appears in Shopify Admin
- [ ] Order appears in Printify for fulfillment
- [ ] staging.carlophillips.com works (if applicable)

---

**🎉 Once all checks pass, your CARLOPHILLIPS premium ecommerce site is LIVE!**
