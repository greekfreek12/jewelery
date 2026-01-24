# Social Media Automation via Make.com

Automate social media posting for contractors — share completed jobs, review highlights, and seasonal promotions.

## Supported Platforms

| Platform | Make Integration | Can Post? | Best For |
|----------|------------------|-----------|----------|
| **Facebook Pages** | ✅ Official | Yes | Business page posts |
| **Instagram Business** | ✅ Official | Yes | Visual job photos |
| **LinkedIn** | ✅ Official | Yes | B2B / commercial contractors |
| **X (Twitter)** | ✅ Official | Yes | Quick updates |
| **TikTok** | ⚠️ Limited | Check status | Video content |

---

## Use Cases for Contractors

### 1. Auto-Post Completed Jobs
When job is marked complete → Post before/after photos to social

> "Just finished this beautiful kitchen remodel in Austin! Another happy customer. #AustinContractor #KitchenRemodel"

### 2. Share 5-Star Reviews
When customer gives 5-star rating → Auto-post to social

> "Thank you John for the amazing review! ⭐⭐⭐⭐⭐ 'Carlos was professional and fixed our AC in no time!' #CustomerLove"

### 3. Seasonal Promotions
Scheduled posts for seasonal services

> "Fall is here! Time for your annual furnace tune-up. Book now: [link] #HVACMaintenance"

### 4. Job Milestones
Share team achievements

> "We just completed our 500th job this year! Thank you to all our amazing customers. 🎉"

---

## Facebook Pages

### Triggers

| Trigger | Description |
|---------|-------------|
| Watch Posts | Fires when new post is created on page |
| Watch Comments | Fires when new comment on posts |
| Watch Page Feed | Monitor page activity |

### Actions

| Action | Description |
|--------|-------------|
| **Create a Post** | Post text to page |
| **Create a Multi-Photo Post** | Post with multiple images |
| **Upload a Photo** | Upload single photo |
| **Upload a Video** | Upload video content |
| **Upload a Reel** | Upload short-form video |
| Update a Post | Edit existing post |
| Delete a Post | Remove post |
| Create a Comment | Comment on posts |
| Like a Post | Like content |
| Delete a Comment | Remove comment |

### Example: Auto-Post Completed Job

```
Your Webhook (job completed)
    ↓
Make: Get job details + photos
    ↓
Make: Facebook Pages → Create a Multi-Photo Post
    - Page: Contractor's FB page
    - Message: "Just completed a {{job_type}} in {{city}}! #{{business_name}}"
    - Photos: Before/after images
```

---

## Instagram Business

**Requires:** Facebook Business account linked to Instagram

### Triggers

| Trigger | Description |
|---------|-------------|
| Watch Media | Fires when new media added to account |
| Watch Comments | Fires when new comments |

### Actions

| Action | Description |
|--------|-------------|
| **Upload Photo as Post** | Single image post |
| **Upload Carousel** | Multiple photos/videos in one post |
| **Upload and Post Reel** | Short-form video |
| Create a Comment | Comment on posts |
| Create a Reply | Reply to comments |

### Example: Share Review to Instagram

```
Your system: 5-star review received
    ↓
Make: Create image with review text (Canva/Bannerbear)
    ↓
Make: Instagram → Upload Photo as Post
    - Caption: "Thank you {{customer_name}}! ⭐⭐⭐⭐⭐ #CustomerReview"
    - Image: Generated review graphic
```

---

## LinkedIn (Company Pages)

### Actions

| Action | Description |
|--------|-------------|
| **Create a Post** | Post to company page |
| Upload Image | Add image to post |
| Create a Comment | Comment on posts |

### Best For
- Commercial contractors
- B2B services
- Professional updates
- Hiring announcements

---

## X (Twitter)

### Triggers

| Trigger | Description |
|---------|-------------|
| Watch Tweets | Monitor for new tweets |
| Watch Mentions | Track @mentions |

### Actions

| Action | Description |
|--------|-------------|
| **Create a Tweet** | Post new tweet |
| Create a Tweet with Media | Tweet with image/video |
| Retweet | Share existing tweet |
| Like a Tweet | Like content |
| Delete a Tweet | Remove tweet |

---

## Cross-Platform Posting

Post to multiple platforms at once:

```
Trigger: Job Completed
    ↓
Make: Router (parallel paths)
    ├── Facebook Pages → Create Post
    ├── Instagram → Upload Photo
    ├── LinkedIn → Create Post
    └── X → Create Tweet
```

### Content Adaptation

Each platform has different requirements:

| Platform | Max Length | Image Size | Hashtags |
|----------|------------|------------|----------|
| Facebook | 63,206 chars | 1200x630 | 2-3 |
| Instagram | 2,200 chars | 1080x1080 | 5-30 |
| LinkedIn | 3,000 chars | 1200x627 | 3-5 |
| X | 280 chars | 1200x675 | 1-2 |

---

## Image Generation

For auto-generating social images (review graphics, job photos with text overlay):

| Tool | Make Integration | Use Case |
|------|------------------|----------|
| **Canva** | ✅ Yes | Templates, designs |
| **Bannerbear** | ✅ Yes | Dynamic image generation |
| **Placid** | ✅ Yes | Auto-generated graphics |
| **Creatomate** | ✅ Yes | Video/image templates |

### Example: Auto-Generate Review Graphic

```
5-star review received
    ↓
Make: Bannerbear → Generate Image
    - Template: "review_card"
    - Customer name: {{name}}
    - Review text: {{review}}
    - Stars: 5
    ↓
Make: Instagram → Upload Photo
```

---

## Contractor Social Media Workflow

### Setup Checklist

- [ ] Contractor connects Facebook Page to Make
- [ ] Contractor connects Instagram Business to Make
- [ ] Choose which platforms to auto-post to
- [ ] Set up content templates (job complete, review share, etc.)
- [ ] Configure which jobs to share (filter by type, photos required, etc.)
- [ ] Test with sample post

### Content Rules

Recommend contractors set rules:

1. **Only post jobs with photos** — No photos = no auto-post
2. **Customer approval** — Option to ask customer before posting
3. **Frequency limit** — Max 1-2 posts per day
4. **Business hours only** — Don't post at 2am

---

## Privacy Considerations

⚠️ **Important:** Before auto-posting job photos:

1. **Get customer consent** — Add checkbox to job completion form
2. **Don't share addresses** — Blur or omit location details
3. **No interior photos without permission** — Especially for residential
4. **Review before posting** — Option for manual approval queue

### Consent Template

Add to job completion flow:
> "May we share photos of this completed work on our social media? (No personal info will be shared)"

---

## Pricing Considerations

Social media automation could be a premium feature:

| Tier | Includes |
|------|----------|
| **Base ($297/mo)** | Review requests only |
| **Pro ($397/mo)** | + Social media automation |
| **Enterprise** | + AI content generation |

---

## Resources

- [Facebook Pages on Make](https://www.make.com/en/integrations/facebook-pages)
- [Instagram Business on Make](https://www.make.com/en/integrations/instagram-business)
- [Make Social Media Guide](https://www.make.com/en/automate/social-media-management)
