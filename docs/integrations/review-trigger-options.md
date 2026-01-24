# Review Request Trigger Options

When should a review request be sent? This doc outlines options to discuss with contractors during onboarding.

## Quick Recommendation

**For most contractors:** Trigger on **Job Completed**
- Fires at the natural "we're done" moment
- Customer experience is fresh in their mind
- One request per job (not per visit)

---

## All Trigger Options

### Option 1: Job Completed (Recommended)

**When:** Tech marks job as complete in the field

| Pros | Cons |
|------|------|
| Immediate - customer experience is fresh | Before payment (could be awkward if dispute) |
| Natural timing - "we just finished" | Tech might forget to mark complete |
| Works for all job types | |

**Best for:** Most contractors, especially service calls

**Make setup:**
- Jobber: "Watch Events" or "Watch Job Updates" → filter for completed
- Housecall Pro: "Watch Updated Jobs" → filter status = completed

---

### Option 2: Visit Completed

**When:** Individual visit/appointment marked done

| Pros | Cons |
|------|------|
| Most immediate timing | May fire multiple times for multi-visit jobs |
| Good for recurring service | Customer may get multiple requests |
| Per-technician tracking | Need deduplication logic |

**Best for:** Single-visit service calls, recurring maintenance

**Make setup:**
- Jobber: "Complete a Visit" webhook event
- Housecall Pro: N/A (use job completed instead)

**Note:** Add filter to skip if review already requested for this customer in last 30 days.

---

### Option 3: Invoice Created

**When:** Invoice is generated for the job

| Pros | Cons |
|------|------|
| Service is definitely complete | May be delayed if office generates invoices |
| Natural business milestone | Customer waiting for bill, not ideal timing |
| Works for quote-to-invoice flow | |

**Best for:** Contractors who invoice same-day, office-managed billing

**Make setup:**
- Jobber: "Watch Events" → invoice created
- Housecall Pro: Job has invoice → use "List Job Invoices"

---

### Option 4: Invoice Paid

**When:** Customer pays the invoice

| Pros | Cons |
|------|------|
| Positive interaction (they paid) | Can be days/weeks after service |
| No awkward timing if payment issues | Memory of experience may fade |
| Customer in "transaction complete" mindset | Slower review request cycle |

**Best for:** High-ticket jobs ($1000+), contractors with payment issues

**Make setup:**
- Jobber: "Watch Events" → invoice paid OR poll invoices for status
- Housecall Pro: "Watch Updated Jobs" → filter status = paid

---

### Option 5: Scheduled Delay After Job

**When:** X hours/days after job completion

| Pros | Cons |
|------|------|
| Gives customer time to "live with" the work | Adds complexity |
| Good for work that takes time to evaluate | Customer may forget details |
| Can avoid "too soon" feeling | Requires delay module in Make |

**Best for:** Remodeling, installations, work that needs to "settle"

**Make setup:**
- Any trigger → Add "Sleep" module (e.g., 24 hours) → Then webhook

**Suggested delays:**
- Service calls: No delay (immediate)
- Installations: 24 hours
- Remodeling/construction: 2-3 days

---

## Decision Framework for Onboarding

Ask the contractor:

### Question 1: Job Type
> "What's your typical job - same-day service calls or multi-day projects?"

- Same-day → **Job Completed** (immediate)
- Multi-day → **Job Completed** or **Delayed**

### Question 2: Payment Timing
> "Do customers usually pay on the spot or after getting an invoice?"

- Pay on spot → **Job Completed** works fine
- Invoice later → Consider **Invoice Paid** for high-ticket

### Question 3: Multiple Visits
> "Do you often have multiple visits for one job?"

- Yes → Use **Job Completed**, not visit completed
- No → Either works

### Question 4: Past Experience
> "Have you had customers complain about being asked for reviews too soon?"

- Yes → Add 24-hour delay
- No → Immediate is fine

---

## Trigger Comparison Matrix

| Trigger | Timing | Risk | Complexity | Best For |
|---------|--------|------|------------|----------|
| Job Completed | Immediate | Low | Simple | Most contractors |
| Visit Completed | Immediate | Medium (duplicates) | Medium | Single-visit only |
| Invoice Created | Delayed | Low | Simple | Office-managed |
| Invoice Paid | Most delayed | Very low | Simple | High-ticket jobs |
| Scheduled Delay | Configurable | Low | Medium | Installations, remodels |

---

## Deduplication Rules

Regardless of trigger, your webhook should check:

1. **No duplicate requests** - Don't send if customer has pending review request
2. **Cooldown period** - Don't send if customer reviewed in last 90 days
3. **Opt-out check** - Don't send if customer opted out
4. **Recent contact** - Don't send if same customer had review request in last 30 days

These are handled in your webhook endpoint, not in Make.

---

## Example Onboarding Script

> "Okay, so we're going to set up automatic review requests. Most of our contractors trigger these right when the job is marked complete - that way the customer's experience is fresh. Does that timing work for you, or would you prefer to wait until they've paid?"

If they want to wait:
> "No problem - we can trigger it when the invoice is marked paid instead. That way there's no awkward timing if there's ever a payment question."

If they do multi-day projects:
> "Since you do bigger projects, we could add a 24-hour delay so the customer has time to see the finished work. Want to try that?"
