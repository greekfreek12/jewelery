# Google Business Profile Integration via Make.com

Integration: **Official Make.com integration** (Google My Business)

## Why This Matters for Contractors

Google Business Profile (GBP) is critical for local contractors:
- **Where customers find you** — Google Search, Google Maps
- **Reviews live here** — The reviews you're collecting
- **Posts appear in search** — Free local marketing

---

## Use Cases

### 1. Auto-Reply to Reviews
When new review appears → Auto-respond with thank you

> ⭐⭐⭐⭐⭐ "Great service from Carlos!"
> **Your Reply:** "Thank you so much for the kind words! We're glad Carlos took great care of you. See you next time!"

### 2. Post Completed Jobs to GBP
Job completed → Create GBP post with photo

> "Just completed an AC installation in Phoenix! Beat the heat with a new system. Call us: (555) 123-4567"

### 3. Share Offers/Promotions
Scheduled seasonal promotions

> "🍂 Fall Special: $49 Furnace Tune-Up! Book by Oct 31. Call now!"

### 4. Sync Reviews to Your Dashboard
Pull GBP reviews into your platform for tracking/analytics

---

## Available Triggers

| Trigger | Description |
|---------|-------------|
| **Watch Reviews** | Fires when new review is posted |

---

## Available Actions

### Posts

| Action | Description |
|--------|-------------|
| **Create a Post** | Create local post (appears in search/maps) |
| Delete a Post | Remove post |

### Reviews

| Action | Description |
|--------|-------------|
| **Create/Update Reply** | Reply to a review (or update existing reply) |

### Locations

| Action | Description |
|--------|-------------|
| List Locations | Get all business locations |

### Invitations

| Action | Description |
|--------|-------------|
| Accept Invitation | Accept management invitation |
| Decline Invitation | Decline invitation |
| Delete Role | Remove user role |

### Media

| Action | Description |
|--------|-------------|
| List Media Items | Get photos/videos |
| Upload Media | Add photo/video to listing |

### Universal

| Action | Description |
|--------|-------------|
| Make an API Call | Custom API request |

---

## GBP Post Types

Google Business Profile supports several post types:

| Post Type | Description | Best For |
|-----------|-------------|----------|
| **What's New** | General update | Completed jobs, news |
| **Offer** | Promotion with dates | Seasonal specials |
| **Event** | Event with date/time | Open houses, community events |

### Post Structure

```json
{
  "summary": "Just completed a kitchen remodel in Austin!",
  "callToAction": {
    "actionType": "CALL",
    "url": "tel:+15551234567"
  },
  "media": {
    "mediaFormat": "PHOTO",
    "sourceUrl": "https://example.com/job-photo.jpg"
  }
}
```

---

## Auto-Reply to Reviews

### Positive Review (4-5 stars)

```
GBP: Watch Reviews
    ↓
Make: Filter (rating >= 4)
    ↓
Make: GBP → Create Reply
    - Reply: "Thank you {{reviewer_name}} for the wonderful review!
              We're thrilled you had a great experience.
              See you next time! - The {{business_name}} Team"
```

### Negative Review (1-3 stars)

```
GBP: Watch Reviews
    ↓
Make: Filter (rating <= 3)
    ↓
Make: Send notification to contractor (don't auto-reply)
    ↓
Contractor manually responds (negative reviews need personal touch)
```

### Reply Templates

**5-star:**
> "Wow, thank you {{name}}! We're so glad {{tech_name}} took great care of you. Reviews like this make our day!"

**4-star:**
> "Thank you {{name}} for the great feedback! We're always looking to improve — let us know if there's anything we could do better next time."

**1-3 star (manual):**
> Flag for owner to personally respond. Don't auto-reply to negative reviews.

---

## Auto-Post Completed Jobs

```
Your webhook: Job completed (with photos)
    ↓
Make: GBP → Create a Post
    - Type: "What's New"
    - Summary: "Just finished a {{job_type}} in {{city}}!
               Another happy customer. Call us for your next project!"
    - Photo: Job completion photo
    - CTA: "CALL" → contractor phone
```

### Content Guidelines

GBP posts should:
- Be under 1,500 characters (300 ideal)
- Include a call-to-action (Call, Book, Learn More)
- Have a relevant photo
- Not be spammy or overly promotional

---

## Sync Reviews to Your Platform

Pull reviews into your dashboard for analytics:

```
GBP: Watch Reviews
    ↓
Make: HTTP Request → Your webhook
    - reviewer_name
    - rating (1-5)
    - review_text
    - review_date
    ↓
Your system: Store in reviews table
    ↓
Your system: Display in dashboard
```

### Data Available

```json
{
  "reviewer": {
    "displayName": "John S.",
    "profilePhotoUrl": "https://..."
  },
  "starRating": "FIVE",
  "comment": "Carlos was amazing! Fixed our AC in no time.",
  "createTime": "2025-01-24T15:30:00Z",
  "updateTime": "2025-01-24T15:30:00Z",
  "reviewReply": null
}
```

---

## Known Issues (2025)

⚠️ **API Limitations:**

Some users have reported issues with GBP post creation via Make:
- 403 errors on post creation
- API deprecation concerns (Google has changed APIs multiple times)

### Workarounds

1. **Test thoroughly** before promising this feature
2. **Have manual fallback** — If auto-post fails, queue for manual posting
3. **Monitor Google's API changes** — They update frequently

---

## Setup Checklist for Contractors

### For Review Auto-Reply

- [ ] Contractor has verified Google Business Profile
- [ ] Contractor connects GBP to Make via OAuth
- [ ] Configure positive review auto-reply template
- [ ] Configure negative review notification (email to owner)
- [ ] Test with existing reviews

### For Auto-Posting

- [ ] All above, plus:
- [ ] Configure job completion → GBP post workflow
- [ ] Set posting frequency limits (max 1-2/day)
- [ ] Test post creation
- [ ] Monitor for API errors

---

## GBP vs Social Media Posts

| Aspect | GBP Posts | Social Media |
|--------|-----------|--------------|
| **Visibility** | Google Search/Maps | Platform feeds |
| **SEO impact** | High (local search) | Low |
| **Shelf life** | 7 days prominent, then archived | Varies |
| **Audience** | People searching for services | Followers |
| **Best for** | Local discovery | Engagement/branding |

**Recommendation:** Do both. GBP posts help SEO, social builds community.

---

## Feature Ideas

### Review Response AI

Use AI to generate personalized responses:

```
GBP: New 5-star review
    ↓
Make: OpenAI → Generate response
    - Prompt: "Write a warm thank-you reply to this review: {{review_text}}"
    - Tone: Professional, friendly
    ↓
Make: GBP → Create Reply
```

### Review Aggregation Dashboard

Show contractors all their reviews in one place:
- GBP reviews (via this integration)
- Yelp reviews (via Yelp API)
- Facebook reviews (via FB integration)

---

## Pricing Considerations

| Feature | Tier |
|---------|------|
| Review request SMS | Base ($297/mo) |
| GBP review sync to dashboard | Base |
| Auto-reply to positive reviews | Pro ($397/mo) |
| Auto-post jobs to GBP | Pro |
| AI-generated review responses | Enterprise |

---

## Resources

- [Google My Business on Make](https://www.make.com/en/integrations/google-my-business)
- [GBP API Documentation](https://developers.google.com/my-business)
- [GBP Post Guidelines](https://support.google.com/business/answer/7662907)
