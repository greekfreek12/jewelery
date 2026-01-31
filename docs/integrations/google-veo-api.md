# Google Veo API

Complete reference for Google's Veo video generation API via Vertex AI and Gemini API.

## Overview

| Model | Resolution | Duration | Audio | Speed |
|-------|------------|----------|-------|-------|
| `veo-3.1-generate-preview` | 720p, 1080p, 4K | 4-8s | Yes | Standard |
| `veo-3.1-fast-generate-preview` | 720p | 4-8s | Yes | Fast |
| `veo-3.0-generate-preview` | 720p, 1080p | 4-8s | Yes | Standard |

**Key Differentiator:** Veo supports **multi-image input** (up to 3 reference images) and **first/last frame interpolation**.

---

## Authentication

### Gemini API (Recommended)

```bash
x-goog-api-key: $GEMINI_API_KEY
```

Get your API key from [Google AI Studio](https://aistudio.google.com/apikey).

### Vertex AI

Requires Google Cloud project with Vertex AI enabled and service account credentials.

```bash
gcloud auth print-access-token
```

---

## Endpoints

### Gemini API

```
POST https://generativelanguage.googleapis.com/v1beta/models/{model}:predictLongRunning
```

### Vertex AI

```
POST https://{region}-aiplatform.googleapis.com/v1/projects/{project}/locations/{region}/publishers/google/models/{model}:predictLongRunning
```

---

## Generation Modes

Veo supports multiple generation modes:

| Mode | Input | Output |
|------|-------|--------|
| Text-to-Video | Text prompt | Video |
| Image-to-Video | 1 image + prompt | Video starting from image |
| First/Last Frame | 2 images + prompt | Video interpolating between frames |
| Reference Images | Up to 3 images + prompt | Video guided by reference style/content |
| Video Extension | Existing video + prompt | Extended video (+7 seconds) |

---

## Text-to-Video

### Request

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Professional plumber repairing a kitchen faucet, warm lighting, cinematic"
    }],
    "parameters": {
      "aspectRatio": "16:9",
      "resolution": "720p",
      "durationSeconds": "8",
      "generateAudio": true
    }
  }'
```

### Response (Operation Started)

```json
{
  "name": "operations/abc123-def456"
}
```

---

## Request Parameters

| Parameter | Type | Values | Default | Notes |
|-----------|------|--------|---------|-------|
| `aspectRatio` | string | `"16:9"`, `"9:16"` | `"16:9"` | Landscape or portrait |
| `resolution` | string | `"720p"`, `"1080p"`, `"4k"` | `"720p"` | 1080p/4K requires 8s duration |
| `durationSeconds` | string | `"4"`, `"6"`, `"8"` | `"8"` | Must be `"8"` for high resolutions |
| `generateAudio` | boolean | `true`, `false` | `true` | Native audio generation |
| `negativePrompt` | string | Any text | - | Content to avoid |
| `personGeneration` | string | `"allow_adult"` | - | Safety setting for people |
| `numberOfVideos` | integer | `1` | `1` | Videos per request |
| `seed` | integer | Any uint32 | Random | For reproducibility |

---

## Image-to-Video (Single Image)

Generate video from one image. The video unfolds around/from the image.

### Request

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Camera slowly zooms in, subtle movement, professional lighting",
      "image": {
        "inlineData": {
          "mimeType": "image/png",
          "data": "BASE64_ENCODED_IMAGE_HERE"
        }
      }
    }],
    "parameters": {
      "aspectRatio": "16:9",
      "durationSeconds": "8"
    }
  }'
```

### Image Requirements

- Resolution: 720p (1280×720) or higher recommended
- Aspect ratio: Should match `aspectRatio` parameter (16:9 or 9:16)
- Format: PNG, JPEG, WebP
- Images of other sizes/ratios may be resized or cropped

---

## First/Last Frame Interpolation (Two Images)

Generate video that transitions from the first image to the last image. Veo interpolates the motion between them.

**Use case:** Before/after transformations, day-to-night transitions, process demonstrations.

### Request

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Smooth transition showing the repair process, professional quality",
      "image": {
        "inlineData": {
          "mimeType": "image/png",
          "data": "FIRST_FRAME_BASE64"
        }
      }
    }],
    "parameters": {
      "aspectRatio": "16:9",
      "durationSeconds": "8",
      "lastFrame": {
        "inlineData": {
          "mimeType": "image/png",
          "data": "LAST_FRAME_BASE64"
        }
      }
    }
  }'
```

### Python Example

```python
import base64
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

# Load images
with open("before.png", "rb") as f:
    first_frame = base64.b64encode(f.read()).decode()
with open("after.png", "rb") as f:
    last_frame = base64.b64encode(f.read()).decode()

operation = client.models.generate_videos(
    model="veo-3.1-generate-preview",
    prompt="Smooth transformation showing the plumbing repair",
    image=types.Image(
        inline_data=types.Blob(mime_type="image/png", data=first_frame)
    ),
    config=types.GenerateVideosConfig(
        aspect_ratio="16:9",
        duration_seconds=8,
        last_frame=types.Image(
            inline_data=types.Blob(mime_type="image/png", data=last_frame)
        )
    )
)
```

---

## Reference Images (Up to 3)

Use reference images to guide the video's style, composition, or content without using them as frames.

**Use case:** Style consistency, brand guidelines, maintaining visual identity.

### Request

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Professional plumber working, same style and color grading as references"
    }],
    "parameters": {
      "aspectRatio": "16:9",
      "durationSeconds": "8",
      "referenceImages": [
        {
          "image": {
            "inlineData": {
              "mimeType": "image/png",
              "data": "REFERENCE_1_BASE64"
            }
          },
          "referenceType": "asset"
        },
        {
          "image": {
            "inlineData": {
              "mimeType": "image/png",
              "data": "REFERENCE_2_BASE64"
            }
          },
          "referenceType": "asset"
        }
      ]
    }
  }'
```

### Reference Types

| Type | Purpose |
|------|---------|
| `"asset"` | General style/content reference |
| `"style"` | Color grading, mood, aesthetic |
| `"subject"` | Specific object or person consistency |

---

## Video Extension

Extend a previously generated Veo video by 7 seconds.

### Limitations

- Input must be MP4 format
- Input duration: 1-30 seconds
- Input resolution: 720p or 1080p only
- Input frame rate: 24 fps
- Input aspect ratio: 16:9 or 9:16
- Output adds exactly 7 seconds

### Request

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "Continue the scene, camera pulls back to reveal the full kitchen",
      "video": {
        "inlineData": {
          "mimeType": "video/mp4",
          "data": "VIDEO_BASE64"
        }
      }
    }],
    "parameters": {
      "resolution": "720p"
    }
  }'
```

---

## Polling for Results

Video generation is asynchronous. Poll the operation until complete.

### Poll Request

```bash
curl -X GET \
  "https://generativelanguage.googleapis.com/v1beta/operations/{operation_name}" \
  -H "x-goog-api-key: $GEMINI_API_KEY"
```

### In Progress Response

```json
{
  "name": "operations/abc123",
  "done": false
}
```

### Completed Response

```json
{
  "name": "operations/abc123",
  "done": true,
  "response": {
    "generateVideoResponse": {
      "generatedSamples": [{
        "video": {
          "uri": "https://generativelanguage.googleapis.com/v1beta/files/xyz789"
        }
      }]
    }
  }
}
```

### Download Video

```bash
curl -o video.mp4 \
  "https://generativelanguage.googleapis.com/v1beta/files/xyz789?alt=media" \
  -H "x-goog-api-key: $GEMINI_API_KEY"
```

---

## Complete Python Example

```python
import os
import time
import base64
from google import genai
from google.genai import types

def generate_video(
    prompt: str,
    first_frame_path: str = None,
    last_frame_path: str = None,
    duration: int = 8,
    aspect_ratio: str = "16:9",
    resolution: str = "720p"
) -> str:
    """Generate video with Veo 3.1, optionally with first/last frames."""

    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    # Build config
    config = types.GenerateVideosConfig(
        aspect_ratio=aspect_ratio,
        duration_seconds=duration,
        resolution=resolution,
        generate_audio=True
    )

    # Add last frame if provided
    if last_frame_path:
        with open(last_frame_path, "rb") as f:
            last_frame_b64 = base64.b64encode(f.read()).decode()
        config.last_frame = types.Image(
            inline_data=types.Blob(mime_type="image/png", data=last_frame_b64)
        )

    # Build request
    kwargs = {
        "model": "veo-3.1-generate-preview",
        "prompt": prompt,
        "config": config
    }

    # Add first frame if provided
    if first_frame_path:
        with open(first_frame_path, "rb") as f:
            first_frame_b64 = base64.b64encode(f.read()).decode()
        kwargs["image"] = types.Image(
            inline_data=types.Blob(mime_type="image/png", data=first_frame_b64)
        )

    # Start generation
    operation = client.models.generate_videos(**kwargs)

    # Poll until complete (typically 11s - 6min)
    print(f"Started operation: {operation.name}")
    while not operation.done:
        time.sleep(10)
        operation = client.operations.get(operation)
        print(".", end="", flush=True)

    print(" Done!")

    # Download video
    video_file = operation.response.generated_videos[0].video
    output_path = "output.mp4"
    client.files.download(file=video_file, path=output_path)

    return output_path


# Usage examples:

# Text-to-video
video = generate_video(
    prompt="Professional plumber fixing a kitchen sink, warm lighting"
)

# Image-to-video (single image)
video = generate_video(
    prompt="Camera slowly zooms in, subtle water movement",
    first_frame_path="hero-image.png"
)

# First/last frame interpolation
video = generate_video(
    prompt="Smooth transition showing the repair process",
    first_frame_path="before.png",
    last_frame_path="after.png"
)
```

---

## TypeScript Example

```typescript
import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateVideo(options: {
  prompt: string;
  firstFrame?: string;  // file path
  lastFrame?: string;   // file path
  duration?: number;
  aspectRatio?: string;
}): Promise<string> {
  const { prompt, firstFrame, lastFrame, duration = 8, aspectRatio = "16:9" } = options;

  // Build request
  const instances: any[] = [{ prompt }];
  const parameters: any = {
    aspectRatio,
    durationSeconds: String(duration),
    generateAudio: true
  };

  // Add first frame
  if (firstFrame) {
    const data = fs.readFileSync(firstFrame).toString("base64");
    instances[0].image = {
      inlineData: { mimeType: "image/png", data }
    };
  }

  // Add last frame
  if (lastFrame) {
    const data = fs.readFileSync(lastFrame).toString("base64");
    parameters.lastFrame = {
      inlineData: { mimeType: "image/png", data }
    };
  }

  // Start generation
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning",
    {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ instances, parameters })
    }
  );

  const { name: operationName } = await response.json();

  // Poll until complete
  while (true) {
    const pollResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
      { headers: { "x-goog-api-key": process.env.GEMINI_API_KEY! } }
    );

    const operation = await pollResponse.json();

    if (operation.done) {
      return operation.response.generateVideoResponse.generatedSamples[0].video.uri;
    }

    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

// Usage
const videoUrl = await generateVideo({
  prompt: "Professional plumber at work",
  firstFrame: "./hero.png",
  lastFrame: "./hero-end.png",
  duration: 8
});
```

---

## Pricing

| Model | Cost per Second |
|-------|-----------------|
| Veo 3.1 Fast | $0.15 |
| Veo 3.1 Standard | $0.40 |
| Veo 3.0 Full (with audio) | $0.75 |

### Cost Examples

| Video | Model | Duration | Cost |
|-------|-------|----------|------|
| Hero background | Veo 3.1 Fast | 8s | $1.20 |
| Service showcase | Veo 3.1 Standard | 6s | $2.40 |
| Premium commercial | Veo 3.0 Full | 8s | $6.00 |

### Subscription Options

| Plan | Price | Access |
|------|-------|--------|
| Google AI Pro | $19.99/mo | Veo 3 Fast via Gemini app |
| Google AI Ultra | $249.99/mo | Full Veo 3 via Gemini/Flow |

---

## Latency

| Model | Typical Latency |
|-------|-----------------|
| Veo 3.1 Fast | 11-60 seconds |
| Veo 3.1 Standard | 1-3 minutes |
| Veo 3.0 Full | 2-6 minutes |

---

## Content Safety

- All videos are watermarked with SynthID (invisible digital watermark)
- Person generation requires explicit `personGeneration: "allow_adult"` parameter
- Content filtering is applied automatically
- Generated videos are retained on server for 2 days

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `INVALID_ARGUMENT` | Bad parameters | Check parameter values and types |
| `RESOURCE_EXHAUSTED` | Quota exceeded | Wait or increase quota |
| `FAILED_PRECONDITION` | Model not available | Check model availability in your region |
| `DEADLINE_EXCEEDED` | Generation timeout | Retry with shorter duration |

### Error Response

```json
{
  "error": {
    "code": 400,
    "message": "Invalid aspect ratio",
    "status": "INVALID_ARGUMENT"
  }
}
```

---

## Comparison: Veo vs Grok

| Feature | Veo 3.1 | Grok Imagine |
|---------|---------|--------------|
| Max duration | 8 seconds | 15 seconds |
| Max resolution | 4K | 720p |
| Multi-image input | Up to 3 | 1 |
| First/last frame | Yes | No |
| Video editing | Extension only | Full editing |
| Native audio | Yes | Yes |
| Fastest latency | ~11 seconds | ~5 seconds |
| Cheapest option | $0.15/s | Unknown |

### When to Use Each

**Use Veo when:**
- You need before/after interpolation (first/last frame)
- You want multiple reference images for style consistency
- You need 1080p or 4K resolution
- Budget is a concern ($0.15/s for fast tier)

**Use Grok when:**
- You need longer videos (up to 15 seconds)
- You want to edit existing videos (object removal, style transfer)
- You need faster turnaround
- You're already using xAI for other services

---

## Best Practices

### Prompt Engineering

1. **Describe the motion**: "Camera slowly zooms in", "Subject walks from left to right"
2. **Specify lighting**: "Golden hour lighting", "Soft studio lights", "Natural daylight"
3. **Include style**: "Cinematic", "Documentary style", "Commercial quality"
4. **Add context**: "Professional setting", "Modern kitchen", "Residential home"

### First/Last Frame Tips

1. **Keep framing similar**: Same camera angle, similar composition
2. **Logical transitions**: Changes should be physically plausible
3. **Consistent lighting**: Similar light direction in both frames
4. **Clear subjects**: Main subject visible in both frames

### Cost Optimization

1. Use Veo 3.1 Fast for drafts and testing
2. Generate at 720p, upscale later if needed
3. Use 4-second duration for loops
4. Cache generated videos (2-day server retention)

---

## Related Documentation

- [xAI Grok Imagine API](./xai-grok-imagine-api.md) - Alternative with video editing
- [Video Generation Implementation Ideas](./video-generation-ideas.md) - Use cases for contractor sites

---

## Changelog

- **2025-03**: Veo 2 released
- **2025-12**: Veo 3.0 released with audio
- **2026-01**: Veo 3.1 released with first/last frame and reference images
