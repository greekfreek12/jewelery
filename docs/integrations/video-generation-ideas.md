# Video Generation Implementation Ideas

Use cases for AI video generation on contractor sites, with API recommendations.

## Quick Comparison

| Feature | Grok Imagine | Veo 3.1 |
|---------|--------------|---------|
| **Image input** | 1 image | 1-3 images |
| **First/last frame** | No | Yes |
| **Video editing** | Yes (full) | No (extension only) |
| **Max duration** | 15s | 8s |
| **Max resolution** | 720p | 4K |
| **Native audio** | Yes | Yes |
| **Pricing** | Unknown | $0.15-0.75/s |
| **Latency** | ~5s | 11s-6min |

---

## Implementation Ideas (Ranked by Value)

### 1. Hero Section Animated Background ⭐⭐⭐⭐⭐

**Value:** Highest - immediate visual differentiation

**Description:** Convert static hero images into subtle looping video backgrounds.

**Recommended API:** Grok Imagine (simpler, faster)

**Input:** 1 hero image (already have from Google Photos)

**Output:** 6-8 second looping video

**Prompt template:**
```
Subtle cinematic movement, professional {category} work environment,
warm lighting, slight camera drift, ambient motion
```

**Cost estimate:** ~$0.50-1.50 per site (one-time)

**Implementation:**
```typescript
// In site config
interface HeroContent {
  headline: string;
  background_image: string;
  background_video?: string;  // NEW
}

// In HeroSection component
{background_video ? (
  <video
    autoPlay
    muted
    loop
    playsInline
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src={background_video} type="video/mp4" />
  </video>
) : (
  <img src={background_image} ... />
)}
```

---

### 2. Before/After Project Showcases ⭐⭐⭐⭐

**Value:** High - demonstrates results visually

**Description:** Animate transitions between before and after photos.

**Recommended API:** Veo 3.1 (first/last frame interpolation)

**Input:** 2 images (before state, after state)

**Output:** 6-8 second transformation video

**Prompt template:**
```
Smooth professional transition showing the {service} transformation,
high quality, satisfying reveal
```

**Cost estimate:** ~$1.20-3.00 per video

**Use cases:**
- Drain cleaning (clogged → flowing)
- Bathroom renovation (old → new)
- Pipe repair (damaged → fixed)
- Water heater (rusty → new unit)

**Gallery integration:**
```typescript
interface GalleryImage {
  url: string;
  caption?: string;
  before_url?: string;      // NEW - enables video generation
  transformation_video?: string;  // NEW - generated video
}
```

---

### 3. Service Explainer Videos ⭐⭐⭐⭐

**Value:** High - educates customers, builds trust

**Description:** Short videos explaining each service offered.

**Recommended API:** Veo 3.1 (reference images for consistency)

**Input:** Text prompt + optional reference images for brand consistency

**Output:** 6-8 second explainer per service

**Prompt templates by service:**

| Service | Prompt |
|---------|--------|
| Drain Cleaning | "Professional plumber using drain snake, water flowing freely, satisfied result" |
| Water Heater | "Technician inspecting water heater, adjusting settings, thumbs up" |
| Leak Detection | "Plumber using detection equipment, finding leak, professional repair" |
| Pipe Repair | "Close-up of pipe repair, expert hands, quality materials, finished joint" |
| Emergency | "Plumber arriving at night, flashlight, urgent but professional response" |

**Cost estimate:** ~$6-18 per site (6 services)

**Integration:**
```typescript
interface ServiceItem {
  title: string;
  description: string;
  image?: string;
  video?: string;  // NEW - plays on hover or click
}
```

---

### 4. Social Media Content Generator ⭐⭐⭐⭐

**Value:** High - gives contractors shareable content

**Description:** Generate vertical videos for Instagram/TikTok.

**Recommended API:** Grok Imagine (supports 9:16, faster iteration)

**Input:** Text prompt

**Output:** 8-15 second vertical video

**Content ideas:**
- "5 Signs You Need a Plumber"
- "DIY vs Call a Pro"
- "Emergency Plumbing Tips"
- "Seasonal maintenance reminders"

**Prompt template:**
```
Professional plumber speaking to camera, vertical format 9:16,
text overlay space at top, engaging expression, {topic}
```

**Cost estimate:** ~$2-4 per video

**Admin interface:**
```typescript
// Admin panel button
<Button onClick={() => generateSocialContent(site.id, "winter-tips")}>
  Generate Winter Tips Video
</Button>
```

---

### 5. Animated Review Testimonials ⭐⭐⭐

**Value:** Medium-High - social proof with visual appeal

**Description:** Animate customer testimonials with relevant visuals.

**Recommended API:** Veo 3.1 (text overlay support)

**Input:** Review text + prompt

**Output:** 6-8 second testimonial video

**Prompt template:**
```
Happy homeowner in {room_type}, smiling, satisfied expression,
warm residential setting, space for text overlay at bottom
```

**Cost estimate:** ~$1-2 per review video

**Integration:**
```typescript
interface ReviewItem {
  author: string;
  text: string;
  rating: number;
  video?: string;  // NEW - animated version
}
```

---

### 6. Team/Owner Introduction ⭐⭐⭐

**Value:** Medium - humanizes the business

**Description:** Animate static team photos with subtle motion.

**Recommended API:** Grok Imagine (image-to-video, subtle motion)

**Input:** 1 team/owner photo

**Output:** 3-4 second subtle animation (smile, nod, wave)

**Prompt template:**
```
Subtle professional animation, person smiles warmly,
slight head movement, friendly and approachable, loop-ready
```

**Cost estimate:** ~$0.50-1.00 per person

---

### 7. Service Area Map Animation ⭐⭐

**Value:** Medium - visual interest on service area section

**Description:** Animated map showing service coverage.

**Recommended API:** Veo 3.1 (precise control needed)

**Input:** Map image with service areas highlighted

**Output:** 6 second animation (areas lighting up, routes drawing)

**Prompt template:**
```
Map animation, service areas highlighting one by one,
professional infographic style, smooth transitions
```

**Cost estimate:** ~$1.50 per site

---

## Implementation Priority

### Phase 1: Hero Videos (Highest Impact)
1. Add `background_video` field to `HeroContent` type
2. Create video generation script using Grok Imagine
3. Update `NicksHeroSection` to support video backgrounds
4. Generate for existing sites with good hero images

### Phase 2: Before/After Gallery
1. Add `before_url` and `transformation_video` to gallery items
2. Create admin UI to upload before/after pairs
3. Integrate Veo 3.1 for interpolation
4. Add video player to gallery modal

### Phase 3: Service Videos
1. Create service video prompt templates
2. Batch generate for all service types
3. Add hover/click video playback to service cards

### Phase 4: Social Content
1. Build admin interface for content generation
2. Create prompt library by topic
3. Add download/share functionality

---

## Database Schema Updates

```sql
-- Add video fields to sites config
ALTER TABLE sites
ADD COLUMN hero_video_url TEXT,
ADD COLUMN hero_video_generated_at TIMESTAMPTZ;

-- Track generated videos
CREATE TABLE generated_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  type TEXT NOT NULL,  -- 'hero', 'service', 'gallery', 'social'
  prompt TEXT NOT NULL,
  api_used TEXT NOT NULL,  -- 'grok', 'veo'
  input_images JSONB,  -- array of source image URLs
  output_url TEXT,
  duration_seconds INTEGER,
  cost_cents INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Environment Variables

```bash
# Add to .env.local
XAI_API_KEY=xai-...
GEMINI_API_KEY=AIza...
```

---

## Cost Projections

### Per Site (Full Implementation)
| Feature | Count | Unit Cost | Total |
|---------|-------|-----------|-------|
| Hero video | 1 | $1.00 | $1.00 |
| Service videos | 6 | $2.00 | $12.00 |
| Gallery before/after | 3 | $2.00 | $6.00 |
| Team animation | 1 | $0.75 | $0.75 |
| **Total per site** | | | **~$20** |

### At Scale (100 sites)
| Feature | Total Cost |
|---------|------------|
| Hero videos only | $100-150 |
| Full implementation | $2,000 |

---

## Next Steps

1. **Set up API keys** - Get XAI_API_KEY and GEMINI_API_KEY
2. **Create test script** - Generate one hero video to validate flow
3. **Update types** - Add video fields to SiteConfig
4. **Update components** - Add video support to HeroSection
5. **Build generation pipeline** - Batch process existing sites

---

## Related Documentation

- [xAI Grok Imagine API](./xai-grok-imagine-api.md)
- [Google Veo API](./google-veo-api.md)
- [Site Generation Process](../site-generation-status.md)
