import { GoogleGenAI } from '@google/genai'
import Anthropic from '@anthropic-ai/sdk'
import sharp from 'sharp'

export const maxDuration = 60

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_CLOUD_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const generationConfig = {
  maxOutputTokens: 32768,
  temperature: 0.7,
  topP: 0.95,
  responseModalities: ['TEXT', 'IMAGE'],
  imageConfig: { aspectRatio: '16:9' },
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' },
  ],
}

async function fetchBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return Buffer.from(await res.arrayBuffer()).toString('base64')
  } catch {
    return null
  }
}

async function cropBase64(base64: string, bbox: { left: number; top: number; right: number; bottom: number }): Promise<Buffer> {
  const buffer = Buffer.from(base64, 'base64')
  const img = sharp(buffer)
  const { width: w = 480, height: h = 360 } = await img.metadata()
  const left = Math.max(0, Math.round((bbox.left / 100) * w))
  const top = Math.max(0, Math.round((bbox.top / 100) * h))
  const right = Math.min(w, Math.round((bbox.right / 100) * w))
  const bottom = Math.min(h, Math.round((bbox.bottom / 100) * h))
  return img
    .extract({ left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) })
    .jpeg({ quality: 95 })
    .toBuffer()
}

async function removeBackgroundFal(imageUrl: string): Promise<Buffer> {
  const res = await fetch('https://fal.run/fal-ai/imageutils/rembg', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image_url: imageUrl }),
  })
  if (!res.ok) throw new Error(`fal rembg ${res.status}`)
  const json = await res.json()
  const resultUrl = json.image?.url
  if (!resultUrl) throw new Error('fal rembg: no result URL')
  const imgRes = await fetch(resultUrl)
  return Buffer.from(await imgRes.arrayBuffer())
}

async function cropAndRemoveBackground(
  imageBase64: string,
  imageUrl: string,
  bbox: { left: number; top: number; right: number; bottom: number }
): Promise<{ data: string; mimeType: string }> {
  // Step 1: rembg the full thumbnail (uses the public URL — no upload needed)
  const bgRemovedPng = await removeBackgroundFal(imageUrl)

  // Step 2: crop the bg-removed PNG down to just the character bbox
  const bgRemovedBase64 = bgRemovedPng.toString('base64')
  const img = sharp(bgRemovedPng)
  const { width: w = 480, height: h = 360 } = await img.metadata()
  const left = Math.max(0, Math.round((bbox.left / 100) * w))
  const top = Math.max(0, Math.round((bbox.top / 100) * h))
  const right = Math.min(w, Math.round((bbox.right / 100) * w))
  const bottom = Math.min(h, Math.round((bbox.bottom / 100) * h))
  const cropped = await img
    .extract({ left, top, width: Math.max(1, right - left), height: Math.max(1, bottom - top) })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .jpeg({ quality: 95 })
    .toBuffer()

  return { data: cropped.toString('base64'), mimeType: 'image/jpeg' }
}

export async function POST(request: Request) {
  try {
    const { title, faceRefs, thumbnailStyle } = await request.json()
    if (!title) return Response.json({ error: 'title is required' }, { status: 400 })

    // One-liner style hint — strip headers, quoted examples, and bullet syntax
    const styleHint = thumbnailStyle
      ? thumbnailStyle
          .replace(/#+.*\n/g, '')           // remove markdown headers
          .replace(/"[^"]*"/g, '')           // remove quoted text (example phrases)
          .replace(/\*\*|\*/g, '')           // remove bold/italic markers
          .replace(/[-•]\s+/g, '')           // remove bullet points
          .trim()
          .split('\n')
          .find((l: string) => l.trim().length > 20)
          ?.trim() ?? ''
      : ''

    const allUrls: string[] = Array.isArray(faceRefs) ? faceRefs.slice(0, 8) : []
    const fetchResults = await Promise.all(allUrls.map(async (url) => {
      const data = await fetchBase64(url)
      return data ? { url, data } : null
    }))
    const valid = fetchResults.filter((r): r is { url: string; data: string } => r !== null)
    const urls = valid.map(r => r.url)
    const images = valid.map(r => r.data)

    let identityType: string | null = null
    let characterRef: { data: string; mimeType: string } | null = null
    let bgRemoved = false

    if (images.length >= 1) {
      const detectionContent: Anthropic.MessageParam['content'] = [
        ...images.map(data => ({
          type: 'image' as const,
          source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data },
        })),
        {
          type: 'text' as const,
          text: `Find the character or face that appears in the MOST of these thumbnails. Output ONLY a single line — no explanation, no extra text.

Format: yes: [type] | [best image index 0-based]:[left%,top%,right%,bottom%]
Or if none: no

Examples:
yes: blue Minecraft avatar | 3:8,5,42,90
yes: person | 0:20,5,65,88
yes: VRChat avatar | 2:10,5,40,88
no`,
        },
      ]

      const detectionMsg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 80,
        system: 'You output ONLY the exact format requested. No thinking, no preamble, no explanation. One line.',
        messages: [{ role: 'user', content: detectionContent }],
      })

      const rawAnswer = detectionMsg.content[0].type === 'text' ? detectionMsg.content[0].text.trim() : ''
      console.log(`[thumb] detection: "${rawAnswer}"`)

      const yesLine = rawAnswer.split('\n').find(l => /^yes:/i.test(l.trim()))?.trim() ?? ''

      if (yesLine) {
        const parts = yesLine.split('|')
        identityType = parts[0].replace(/^yes:\s*/i, '').trim()

        // Parse "index:left,top,right,bottom"
        const refPart = (parts[1] ?? '').trim()
        const match = refPart.match(/^(\d+):(\d+(?:\.\d+)?),(\d+(?:\.\d+)?),(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/)

        if (match) {
          const idx = parseInt(match[1], 10)
          const bbox = {
            left: parseFloat(match[2]),
            top: parseFloat(match[3]),
            right: parseFloat(match[4]),
            bottom: parseFloat(match[5]),
          }

          if (idx >= 0 && idx < urls.length) {
            console.log(`[thumb] character at image ${idx}, bbox: ${JSON.stringify(bbox)}`)
            try {
              characterRef = await cropAndRemoveBackground(images[idx], urls[idx], bbox)
              bgRemoved = true
              console.log(`[thumb] crop+rembg success, size: ${characterRef.data.length}`)
            } catch (e) {
              console.log(`[thumb] crop+rembg failed: ${e}, falling back to raw crop`)
              try {
                const cropped = await cropBase64(images[idx], bbox)
                characterRef = { data: cropped.toString('base64'), mimeType: 'image/jpeg' }
              } catch {
                characterRef = { data: images[idx], mimeType: 'image/jpeg' }
              }
            }
          }
        } else {
          console.log(`[thumb] bbox parse failed for: "${refPart}"`)
          // Fallback: no bbox, use first image raw
          if (images.length > 0) characterRef = { data: images[0], mimeType: 'image/jpeg' }
        }
      }
    }

    const isRealPerson = /^person$/i.test((identityType ?? '').trim())

    let imagePrompt: string
    if (identityType && characterRef) {
      const subject = isRealPerson ? 'person' : 'character'
      imagePrompt = `Place this ${subject} in a YouTube thumbnail for the video: "${title}". Do not change the ${subject} in any way. Directly place them into the thumbnail as is. Add bold punchy text — 3 to 5 words max. Single scene only, no corner insets.${styleHint ? ` Style: ${styleHint}` : ''}`
    } else {
      imagePrompt = `Create a YouTube thumbnail for the video: "${title}". Bold punchy text — 3 to 5 words max. Vibrant colors. Single scene only, no corner insets.${styleHint ? ` Style: ${styleHint}` : ''}`
    }

    console.log(`[thumb] identityType: ${identityType}, hasRef: ${!!characterRef}, bgRemoved: ${bgRemoved}`)
    console.log(`[thumb] prompt: ${imagePrompt}`)

    const parts: object[] = []
    if (identityType && characterRef) {
      parts.push({ inlineData: { mimeType: characterRef.mimeType, data: characterRef.data } })
      parts.push({ text: imagePrompt })
    } else {
      parts.push({ text: imagePrompt })
    }

    const response = await (ai.models as never as {
      generateContent: (req: object) => Promise<{
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> } }>
      }>
    }).generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: [{ role: 'user', parts }],
      config: generationConfig,
    })

    const responseParts = response.candidates?.[0]?.content?.parts ?? []
    const imageData = responseParts.find(p => p.inlineData)?.inlineData ?? null

    if (!imageData) return Response.json({ error: 'No image returned from model' }, { status: 500 })

    return Response.json({
      imageUrl: `data:${imageData.mimeType};base64,${imageData.data}`,
      _debug: {
        identityType,
        bgRemoved,
        refSize: characterRef ? Math.round(characterRef.data.length / 1024) + 'KB' : null,
        prompt: imagePrompt,
      },
    })
  } catch (err) {
    console.error('[thumb] error:', err)
    const message = 'Something went wrong, please try again.'
    return Response.json({ error: message }, { status: 500 })
  }
}
