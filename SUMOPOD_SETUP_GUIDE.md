# ✅ SumoPod Payment Gateway - Setup Guide

**Status**: Database migration done, code implemented, ready for configuration

---

## 📋 WHAT'S BEEN DONE

### Database ✅
- [x] Created billing schema (Subscription, Invoice, PaymentHistory models)
- [x] Migration applied to production database successfully
- [x] Prisma client regenerated

### Backend Services ✅
- [x] `src/server/services/sumopod-service.ts` - Payment API integration
- [x] `src/server/services/billing-service.ts` - Subscription logic  
- [x] `src/app/api/webhook/sumopod/route.ts` - Webhook handler

### Frontend ✅
- [x] `src/components/billing/pricing-cards.tsx` - Pricing UI
- [x] `src/app/(app)/billing/page.tsx` - Main billing page
- [x] `src/app/(app)/billing/success/page.tsx` - Payment success page
- [x] `src/app/(app)/billing/cancel/page.tsx` - Payment cancel page
- [x] `src/app/(app)/billing/actions.ts` - Server actions

### Environment ✅
- [x] Added SumoPod config to `.env`

---

## 🔑 NEXT STEPS (YOU MUST DO THIS)

### Step 1: Get SumoPod Credentials

1. Go to **https://sumopod.com**
2. Create account → Complete KYC verification
3. Go to **Managed Payment** → **API Keys**
4. Copy these 3 values:
   - `API_KEY`
   - `API_SECRET`  
   - `WEBHOOK_SECRET`

### Step 2: Update .env File

**File**: `.env` in project root

Replace:
```env
SUMOPOD_API_KEY="YOUR_API_KEY_HERE"
SUMOPOD_API_SECRET="YOUR_API_SECRET_HERE"
SUMOPOD_WEBHOOK_SECRET="YOUR_WEBHOOK_SECRET_HERE"
```

With your actual SumoPod credentials

### Step 3: Configure Webhook URL

In SumoPod dashboard:
1. Go to **Settings** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/webhook/sumopod`
   - For local dev: Use **ngrok tunnel** (e.g., `https://abc123.ngrok.io/api/webhook/sumopod`)
3. Select events: `payment.success`, `payment.failed`, `payment.expired`

### Step 4: Test in Sandbox

1. Keep `SUMOPOD_BASE_URL="https://api-pay-sandbox.sumopod.com"` in .env
2. Run: `npm run dev`
3. Go to: `http://localhost:3000/billing`
4. Click "Upgrade to Basic"
5. Use test card: `4111111111111111` + any future date

### Step 5: Deploy to Production

When ready:
1. Change `.env`:
   ```env
   SUMOPOD_BASE_URL="https://api-pay.sumopod.com"
   ```
2. Update webhook URL to production domain
3. Deploy to Vercel

---

## 📊 PRICING (Already Configured)

| Plan | Monthly | Yearly (10% off) |
|------|---------|------------------|
| BASIC | Rp 99,000 | Rp 990,000 |
| PRO | Rp 299,000 | Rp 2,990,000 |

---

## 🔗 URLS CREATED

| Page | URL |
|------|-----|
| Billing Page | `/billing` |
| Success | `/billing/success?invoice=INV-XXXX` |
| Cancel | `/billing/cancel` |
| Webhook | `/api/webhook/sumopod` |

---

## 💾 DATABASE TABLES

```
subscription (1 per tenant)
├─ id, tenantId, plan, status
├─ currentPeriodStart, currentPeriodEnd
├─ isOnTrial, trialStartDate, trialEndDate
└─ relations: invoices[], paymentHistory[]

invoice (multiple per subscription)
├─ invoiceNumber, amount, total, status
├─ dueDate, paidDate, description
└─ items (JSON)

payment_history (multiple per subscription)
├─ sumopodPaymentId, amount, status
├─ paymentMethod, failureReason, metadata
└─ createdAt, processedAt
```

---

## 🧪 TESTING CHECKLIST

- [ ] Got SumoPod credentials
- [ ] Updated .env file
- [ ] Configured webhook URL (sandbox)
- [ ] Tested upgrade flow locally
- [ ] Payment link generates correctly
- [ ] Test payment succeeds (check DB)
- [ ] Invoice marked as PAID
- [ ] Subscription upgraded to BASIC
- [ ] Webhook received successfully
- [ ] Deploy to production
- [ ] Update webhook to prod domain
- [ ] Test with real payment (optional)

---

## 🐛 TROUBLESHOOTING

### Payment link not generated
- Check `.env` values are correct
- Check network in browser DevTools
- Check backend logs: `npm run dev`

### Webhook not received
- Check webhook URL is accessible
- In SumoPod dashboard → Logs, see if webhook was sent
- Use ngrok tunnel for local testing
- Check `/api/webhook/sumopod` route exists

### Invoice not updating  
- Check SumoPod webhook secret matches
- Check database connection
- Check payment status is "success"

### Subscription not upgrading
- Check invoice.invoiceNumber matches order_id from webhook
- Check tenantId is correct in database
- Check subscription record exists

---

## 📞 SUPPORT

- **SumoPod Docs**: https://docs.sumopod.com
- **Status**: Check SumoPod dashboard logs
- **Backend Logs**: Run `npm run dev` and check console

---

## ⏱️ ESTIMATED TIME

- Getting SumoPod account + credentials: **10 minutes**
- Configuring webhook: **5 minutes**
- Testing locally: **15 minutes**
- Deploying: **5 minutes**
- **Total: ~35 minutes to go live**

---

**NEXT**: Follow steps 1-4 above, then test locally! 🚀
