# 🚀 QUICK START: Get CARLOPHILLIPS Live

## Current Status: ✅ READY TO DEPLOY

Your headless Next.js storefront is **production-ready** and committed to Git.

---

## 🎯 YOUR IMMEDIATE ACTION ITEMS:

### 1️⃣ DELETE THE OLD WEBSITE (5 minutes)

**The old site at www.carlophillips.com needs to be removed.**

**If it's hosted on:**
- **Vercel/Netlify**: Go to your dashboard → Delete the old project
- **Shopify Online Store**: Disable the theme (keep Shopify for backend only)
- **Other hosting**: Remove/delete the deployment

**Why?** The old site will conflict with the new deployment.

---

### 2️⃣ PUSH CODE TO GITHUB (10 minutes)

```bash
git remote add origin https://github.com/CubiqoUnited/carlophillips-site.git
git push origin main
git push origin staging
```

**After pushing, you'll have your code safely in version control.**

---

### 3️⃣ DEPLOY TO VERCEL (20 minutes)

**Vercel is the fastest way to deploy Next.js.**

**Steps:**
1. Go to https://vercel.com
2. Sign up with your GitHub account
3. Click "Add New" → "Project"
4. Import `CubiqoUnited/carlophillips-site`
5. Keep all default settings (Vercel auto-detects Next.js)
6. Click "Deploy"

**Vercel will give you a URL like:** `carlophillips-site.vercel.app`

---

### 4️⃣ ADD ENVIRONMENT VARIABLES TO VERCEL (10 minutes)

In Vercel project settings → Environment Variables, add:

```
NEXT_PUBLIC_BASE_URL=https://www.carlophillips.com
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=carlophillips.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=[your-storefront-token]
CORS_ORIGINS=https://www.carlophillips.com,https://staging.carlophillips.com
```

**After adding env vars:** Click "Redeploy" in Vercel.

---

### 5️⃣ CONNECT YOUR CUSTOM DOMAIN (15 minutes)

**In Vercel:**
1. Go to your project → Settings → Domains
2. Add domain: `www.carlophillips.com`
3. Vercel will show you DNS records to add

**In your Domain Registrar** (GoDaddy/Namecheap/Cloudflare):
1. Go to DNS Management for carlophillips.com
2. Add the CNAME record Vercel shows you
3. Wait 5-30 minutes for DNS propagation

**For staging:**
- Repeat above with `staging.carlophillips.com`
- Or use Vercel preview deployments (automatic staging)

---

### 6️⃣ TEST THE LIVE SITE (10 minutes)

Once DNS propagates:

1. **Visit www.carlophillips.com**
   - Homepage should load with "Gesture of Luxury"
   - Products should display

2. **Test Cart Flow:**
   - Add a product to cart
   - Click checkout
   - Should redirect to Shopify checkout
   - Use test card: `4242 4242 4242 4242`
   - Complete the order

3. **Verify Order:**
   - Check Shopify Admin → Orders
   - Check Printify → My Orders (should appear automatically)

---

## 🆘 NEED HELP?

### Option A: I Can Help
Tell me where you're stuck:
- "I don't have a GitHub account"
- "I need help with MongoDB"
- "DNS configuration is confusing"
- "Deployment failed with error: [paste error]"

### Option B: Use the Guides
- Full deployment guide: `/app/DEPLOYMENT.md`
- Project overview: `/app/README.md`

---

## 📊 TIMELINE:

| Step | Time | Status |
|------|------|--------|
| Delete old site | 5 min | ⏸️ Waiting |
| Push to GitHub | 10 min | ⏸️ Waiting |
| Deploy to Vercel | 20 min | ⏸️ Waiting |
| Add env vars | 10 min | ⏸️ Waiting |
| Connect domain | 15 min | ⏸️ Waiting |
| Test live site | 10 min | ⏸️ Waiting |
| **TOTAL** | **70 min** | |

---

## ✅ SUCCESS CRITERIA:

Your site is live when:
- [ ] www.carlophillips.com loads your new headless site
- [ ] Products display from Shopify
- [ ] You can add items to cart
- [ ] Checkout completes successfully
- [ ] Test order appears in Shopify Admin
- [ ] Test order appears in Printify for fulfillment

---

## 🎉 READY TO START?

**Tell me:**
1. Do you have a GitHub account? (If not, I'll guide you)
2. Do you have MongoDB hosting? (If not, I can help set up Atlas free tier)
3. Which step should we tackle first?

**Or just say: "Start the deployment process" and I'll guide you step-by-step.**
