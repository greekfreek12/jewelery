# xAI Grok Imagine API

Complete reference for xAI's image and video generation APIs.

## Overview

| Feature | Model | Capability |
|---------|-------|------------|
| Image Generation | `grok-imagine-image` | Text-to-image, image editing |
| Video Generation | `grok-imagine-video` | Text-to-video, image-to-video, video editing |

**Base URL:** `https://api.x.ai/v1`

**Authentication:** Bearer token via `Authorization` header

```bash
Authorization: Bearer $XAI_API_KEY
```

---

## Image Generation

### Endpoint

```
POST https://api.x.ai/v1/images/generations
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | `grok-imagine-image` |
| `prompt` | string | Yes | Description of desired image |
| `n` | integer | No | Number of images (1-10, default: 1) |
| `aspect_ratio` | string | No | Format like `"4:3"`, `"16:9"`, `"1:1"` |
| `response_format` | string | No | `"url"` (default) or `"b64_json"` |

### Request Example

```bash
curl -X POST https://api.x.ai/v1/images/generations \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-image",
    "prompt": "Professional plumber repairing a kitchen sink, warm lighting, photorealistic",
    "n": 1,
    "aspect_ratio": "16:9",
    "response_format": "url"
  }'
```

### Response

```json
{
  "created": 1706644800,
  "data": [
    {
      "url": "https://api.x.ai/generated/abc123.png"
    }
  ]
}
```

### Python Example (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["XAI_API_KEY"],
    base_url="https://api.x.ai/v1"
)

response = client.images.generate(
    model="grok-imagine-image",
    prompt="Professional plumber repairing a kitchen sink",
    n=1
)

image_url = response.data[0].url
```

### TypeScript Example

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1"
});

const response = await client.images.generate({
  model: "grok-imagine-image",
  prompt: "Professional plumber repairing a kitchen sink",
  n: 1
});

const imageUrl = response.data[0].url;
```

---

## Image Editing

### Endpoint

```
POST https://api.x.ai/v1/images/edits
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | `grok-imagine-image` |
| `prompt` | string | Yes | Description of desired edits |
| `image` | string | Yes | Base64-encoded image or public URL |
| `response_format` | string | No | `"url"` (default) or `"b64_json"` |

### Request Example

```bash
curl -X POST https://api.x.ai/v1/images/edits \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-image",
    "prompt": "Change the lighting to golden hour, add warm tones",
    "image": "https://example.com/original-image.jpg"
  }'
```

---

## Video Generation

### Endpoint

```
POST https://api.x.ai/v1/videos/generations
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | `grok-imagine-video` |
| `prompt` | string | Yes | Description of desired video |
| `duration` | integer | No | Length in seconds (1-15, default varies) |
| `aspect_ratio` | string | No | `"16:9"` (default), `"9:16"`, `"4:3"`, `"1:1"`, `"3:4"`, `"3:2"`, `"2:3"` |
| `resolution` | string | No | `"720p"` or `"480p"` |
| `image_url` | string | No | Source image for image-to-video |

### Async Pattern

Video generation is asynchronous. The API returns a `request_id` that you poll for results.

#### Step 1: Start Generation

```bash
curl -X POST https://api.x.ai/v1/videos/generations \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-video",
    "prompt": "Aerial view of a plumber van driving through a suburban neighborhood",
    "duration": 8,
    "aspect_ratio": "16:9",
    "resolution": "720p"
  }'
```

#### Response

```json
{
  "request_id": "vid_abc123xyz"
}
```

#### Step 2: Poll for Result

```bash
curl https://api.x.ai/v1/videos/vid_abc123xyz \
  -H "Authorization: Bearer $XAI_API_KEY"
```

#### Final Response

```json
{
  "url": "https://api.x.ai/generated/video_abc123.mp4",
  "duration": "8"
}
```

### Python Example (xAI SDK)

```python
from xai_sdk import Client
import time

client = Client(api_key=os.environ["XAI_API_KEY"])

# Option 1: Auto-polling (blocks until complete)
response = client.video.generate(
    model="grok-imagine-video",
    prompt="Professional plumber fixing a pipe, cinematic lighting",
    duration=8,
    aspect_ratio="16:9",
    resolution="720p"
)
print(response.url)

# Option 2: Manual async
job = client.video.start(
    model="grok-imagine-video",
    prompt="Water flowing through clean pipes"
)

# Poll until complete
while True:
    result = client.video.get(job.request_id)
    if result.url:
        break
    time.sleep(5)

print(result.url)
```

### TypeScript Example

```typescript
async function generateVideo(prompt: string): Promise<string> {
  // Start generation
  const startResponse = await fetch("https://api.x.ai/v1/videos/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "grok-imagine-video",
      prompt,
      duration: 8,
      aspect_ratio: "16:9"
    })
  });

  const { request_id } = await startResponse.json();

  // Poll for result
  while (true) {
    const pollResponse = await fetch(`https://api.x.ai/v1/videos/${request_id}`, {
      headers: { "Authorization": `Bearer ${process.env.XAI_API_KEY}` }
    });

    const result = await pollResponse.json();
    if (result.url) return result.url;

    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}
```

---

## Image-to-Video

Generate video from a static image.

### Request Example

```bash
curl -X POST https://api.x.ai/v1/videos/generations \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-video",
    "prompt": "Camera slowly zooms in, subtle water movement, professional lighting",
    "image_url": "https://example.com/hero-image.jpg",
    "duration": 6,
    "aspect_ratio": "16:9"
  }'
```

### Python Example

```python
response = client.video.generate(
    model="grok-imagine-video",
    prompt="Subtle camera push-in, water droplets catching light",
    image_url="https://example.com/plumber-hero.jpg",
    duration=6
)
```

---

## Video Editing

Edit existing videos with text prompts.

### Endpoint

```
POST https://api.x.ai/v1/videos/edits
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | string | Yes | `grok-imagine-video` |
| `prompt` | string | Yes | Description of desired edits |
| `video_url` | string | Yes | Public URL to source video |

### Limitations

- Maximum input video length: **8.7 seconds**
- Output duration matches input (cannot change length)
- Video URL must be publicly accessible

### Editing Capabilities

| Capability | Example Prompt |
|------------|----------------|
| Object manipulation | "Remove the ladder from the background" |
| Style transfer | "Convert to cinematic color grading" |
| Scene control | "Change lighting to golden hour" |
| Weather adjustment | "Add light rain in the background" |
| Camera effects | "Add subtle depth of field blur" |

### Request Example

```bash
curl -X POST https://api.x.ai/v1/videos/edits \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-video",
    "prompt": "Add warm golden hour lighting, increase contrast slightly",
    "video_url": "https://example.com/original-video.mp4"
  }'
```

---

## SDK Compatibility

Grok APIs are compatible with OpenAI and Anthropic SDKs. Simply change the base URL:

```python
# OpenAI SDK
from openai import OpenAI
client = OpenAI(api_key=XAI_KEY, base_url="https://api.x.ai/v1")

# Anthropic SDK
from anthropic import Anthropic
client = Anthropic(api_key=XAI_KEY, base_url="https://api.x.ai/v1")
```

---

## Rate Limits

- Model-specific limits viewable in [xAI Console](https://console.x.ai)
- Contact support@x.ai for higher limits
- Image tokens: 256-1,792 per image (based on size)

---

## Pricing

Pricing is not publicly documented for image/video generation. Check the [xAI Console](https://console.x.ai) for current rates.

**General reference:**
- Text models: $2/1M input tokens, $10/1M output tokens
- $25 free credits on signup
- Image/video pricing: token-based or per-generation (check console)

---

## Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Invalid API key | Check `XAI_API_KEY` is set correctly |
| 429 | Rate limit exceeded | Wait and retry, or request limit increase |
| 400 | Invalid parameters | Check request body format |
| 404 | Request ID not found | Video generation may have failed |

### Error Response Format

```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "code": 429
  }
}
```

---

## Best Practices

### Prompt Engineering

1. **Be specific**: "Professional plumber in blue uniform repairing chrome faucet" > "plumber fixing sink"
2. **Include lighting**: "warm natural lighting", "soft studio lighting", "golden hour"
3. **Specify style**: "photorealistic", "cinematic", "professional commercial photography"
4. **Add context**: "modern kitchen", "residential bathroom", "commercial building"

### Video Generation Tips

1. **Start with images**: Generate a static image first, then animate it for more control
2. **Keep prompts focused**: Describe one clear action or scene
3. **Use appropriate duration**: 6-8 seconds for hero backgrounds, 4 seconds for loops
4. **Match aspect ratio**: 16:9 for web, 9:16 for social media

### Cost Optimization

1. Generate at 480p for drafts, 720p for production
2. Use image generation to validate composition before video
3. Batch similar generations to optimize API calls

---

## Related Documentation

- [Google Veo API](./google-veo-api.md) - Alternative video generation API
- [Video Generation Implementation Ideas](./video-generation-ideas.md) - Use cases for contractor sites

---

## Changelog

- **2025-03-21**: Aurora image model released on API
- **2025-07-28**: Grok Imagine video generation released
- **2026-01-28**: Grok Imagine API unified bundle launched
