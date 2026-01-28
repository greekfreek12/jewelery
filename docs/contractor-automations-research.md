# Contractor Automations Research

**Date:** January 24, 2026
**Status:** Research Complete
**Decision:** Hybrid approach - Make.com for complex integrations, potentially n8n later for white-label

---

## Executive Summary

Goal: Set up automations for contractors (Google reviews, QuickBooks, Facebook posts, etc.) without requiring them to create their own automation accounts.

**Recommendation:** Start with Make.com using Zoom onboarding, evaluate white-label options later.

---

## Platform Comparison

### Make.com

| Aspect | Details |
|--------|---------|
| **Hosting** | Cloud (they host) |
| **Pricing** | $9-29/mo per 10k ops, Enterprise custom |
| **White-label** | Yes - enterprise tier, contact sales |
| **Embed in app** | Only via white-label |
| **Multi-tenant** | Folders per contractor |
| **Integrations** | 1500+ including Jobber, Housecall Pro, ServiceTitan |
| **QuickBooks** | Native triggers (Watch Payments, etc.) |
| **Learning curve** | Easier |

**White-label info:**
- Available for OEM customers
- Features: custom branding, SSO, organization management
- Pricing not public - must contact partners@make.com
- Docs: https://developers.make.com/white-label-documentation

### n8n

| Aspect | Details |
|--------|---------|
| **Hosting** | Self-hosted (free) or cloud ($20+/mo) |
| **Pricing** | Free self-hosted |
| **White-label** | Yes - fully customizable |
| **Embed in app** | Yes - iframe or subdomain |
| **Multi-tenant** | Built-in workspaces per user |
| **Integrations** | 400+ but missing Jobber, Housecall Pro |
| **QuickBooks** | Actions only, no native triggers (use webhooks) |
| **Learning curve** | Slightly harder |

---

## Integration Availability

| Integration | Make.com | n8n | Notes |
|-------------|----------|-----|-------|
| QuickBooks (triggers) | ✅ Native | ❌ Webhook only | n8n requires manual webhook setup |
| QuickBooks (actions) | ✅ Native | ✅ 42 actions | Both work for actions |
| Google Business Profile | ✅ Native | ✅ Native | Both work |
| Facebook Pages | ✅ Native | ✅ Native | Both work |
| Jobber | ✅ Native | ❌ HTTP only | Must build custom in n8n |
| Housecall Pro | ✅ Native | ❌ HTTP only | Must build custom in n8n |
| ServiceTitan | ✅ Native | ❌ HTTP only | Must build custom in n8n |
| TextGrid SMS | ⚠️ HTTP Request | ⚠️ HTTP Request | Both use HTTP node |

---

## QuickBooks Webhook Workaround (n8n)

If using n8n, QuickBooks triggers work via webhooks:

1. Create webhook node in n8n → get URL like `https://your-n8n.com/webhook/abc123`
2. In QuickBooks Developer Portal, configure webhook endpoint
3. Select events: "Payment Created", "Invoice Created", etc.
4. QuickBooks sends data to n8n when events occur

**Requirements:**
- Free Intuit Developer Account (instant)
- Create app in dashboard (instant)
- Sandbox keys (instant)
- Production keys (basic questionnaire, days not months)

**NOT required:** Full App Store approval (that's 6+ months, only for public apps)

Source: https://community.n8n.io/t/quickbooks-trigger-or-webhooks/7543

---

## Recommended Approach: Hybrid

### Phase 1: Make.com (Now)

Use Make.com with Zoom onboarding for all contractors.

**Account structure:**
```
Your Make.com Account (Teams plan)
├── 📁 Folder: "Templates" (master copies)
│   ├── Google Review → AI Response
│   ├── Google Review → Facebook Post
│   ├── Weekly Google Post
│   ├── QuickBooks Invoice → Review Request
│   ├── Housecall Pro Job Complete → Review Request
│   └── Jobber Invoice → Review Request
│
├── 📁 Folder: "Nick's Contracting"
│   └── (cloned scenarios with his connections)
│
├── 📁 Folder: "Joe's Plumbing"
│   └── (cloned scenarios with his connections)
```

### Phase 2: n8n (Later, Optional)

Add self-hosted n8n for:
- White-labeled simple automations
- Embedded workflow editor in your app
- Cost savings on high-volume operations

Keep Make for Jobber/Housecall Pro contractors.

---

## Template Scenarios to Build

| Template | Trigger | Actions |
|----------|---------|---------|
| Google Review → AI Response | New Google review | OpenAI generates response → Post reply |
| Google Review → Facebook Post | New 4-5 star review | Create Facebook post with review quote |
| Weekly Google Post | Schedule (Monday 9am) | OpenAI generates tip → Post to Google |
| QuickBooks Paid → Review Request | Invoice paid | Wait 2hr → Send SMS via TextGrid |
| Housecall Pro Job Done → Review Request | Job completed | Wait 2hr → Send SMS |
| Jobber Invoice Paid → Review Request | Invoice paid | Wait 2hr → Send SMS |
| Low Review Alert | New 1-2 star review | SMS/email alert to contractor |

---

## Onboarding Process (Zoom Call)

**Before call (you do):**
1. Create folder in Make: "[Contractor Name]"
2. Clone all relevant template scenarios into folder
3. All scenarios start OFF

**During call (30-60 min):**
1. Intro - explain automations (5 min)
2. Connect Google Business Profile (5 min)
3. Connect Facebook Page if needed (5 min)
4. Connect QuickBooks/Housecall Pro/Jobber (10 min)
5. Customize settings - delays, messages, AI tone (10 min)
6. Test everything (10 min)
7. Turn ON selected scenarios (2 min)
8. Wrap up - show logs, schedule follow-up (5 min)

**Customization per contractor:**
- Delay times (clone has default, edit for their preference)
- SMS message text (business name, tone)
- Google review link
- AI response style
- Which automations are active

---

## Make.com API Capabilities

### What CAN be automated via API:

| Action | Endpoint | Use Case |
|--------|----------|----------|
| Create folder | `POST /scenarios-folders` | Auto-create on contractor signup |
| Clone scenario | `POST /scenarios/{id}/clone` | Clone templates to contractor folder |
| Move to folder | `PATCH /scenarios/{id}` | Organize scenarios |
| Turn ON | `POST /scenarios/{id}/start` | Enable from your app |
| Turn OFF | `POST /scenarios/{id}/stop` | Disable from your app |
| Run manually | `POST /scenarios/{id}/run` | Test execution |
| Delete | `DELETE /scenarios/{id}` | Cleanup |

### What requires manual work:

| Action | Why |
|--------|-----|
| Connect accounts (OAuth) | Requires user interaction in browser |
| Edit module settings | Must modify entire blueprint JSON |
| Customize messages | Easier in Make UI than via API |

### API Authentication

```
Authorization: Token your-api-token
```

Requires paid Make account.

### Potential App Integration

```
Your App Dashboard
─────────────────────────────────────────────────

Contractor: Nick's Contracting

Automations:
┌─────────────────────────────────────┬────────┐
│ Google Review → AI Response         │ [ON]   │  ← API toggle
│ Google Review → Facebook Post       │ [OFF]  │  ← API toggle
│ QuickBooks → Review Request         │ [ON]   │  ← API toggle
└─────────────────────────────────────┴────────┘

[Add Automation]  ← Clones template via API
[Open in Make]    ← Deep link to Make for editing
```

---

## Cost Estimates

### Make.com

| Plan | Price | Operations | Good For |
|------|-------|------------|----------|
| Free | $0 | 1,000/mo | Testing |
| Core | $9/mo | 10,000/mo | 1-5 contractors |
| Pro | $16/mo | 10,000/mo + features | 5-20 contractors |
| Teams | $29/mo | 10,000/mo + collaboration | 20+ contractors |
| Enterprise | Custom | Unlimited | White-label |

*Operations = each module execution. A 5-module scenario = 5 ops per run.*

### n8n Self-Hosted

| Component | Cost |
|-----------|------|
| Hosting (Railway/Render) | $5-20/mo |
| n8n software | Free |
| Your time to set up | 4-8 hours |

---

## Next Steps

1. **Build template scenarios in Make** (4-8 hours)
   - Start with Google Review → AI Response
   - Then QuickBooks → Review Request

2. **Onboard first contractor** via Zoom
   - Test the full flow
   - Refine onboarding process

3. **Contact Make about white-label** (optional)
   - Email: partners@make.com
   - Ask about pricing for 10-50 contractor accounts

4. **Evaluate n8n later** if:
   - Make white-label too expensive
   - Want fully embedded experience
   - High operation volume makes self-hosting worthwhile

---

## Resources

- Make API Docs: https://developers.make.com/api-documentation/api-reference/scenarios
- Make White Label: https://developers.make.com/white-label-documentation
- Make Partner Program: https://www.make.com/en/partners
- n8n Docs: https://docs.n8n.io/
- n8n QuickBooks: https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.quickbooks/
- QuickBooks Developer: https://developer.intuit.com/app/developer/homepage
