import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_CLOUD_API_KEY })

const generationConfig = {
  maxOutputTokens: 32768,
  temperature: 1,
  topP: 0.95,
  responseModalities: ['TEXT', 'IMAGE'],
  imageConfig: {
    aspectRatio: '16:9',
    imageSize: '1K',
  },
  safetySettings: [
    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' },
  ],
}

export async function POST(request: Request) {
  try {
    const { concept, title, faceRefs } = await request.json()
    if (!concept) return Response.json({ error: 'concept is required' }, { status: 400 })

    const parts: object[] = []

    // Attach top thumbnails as visual style references
    const refs = Array.isArray(faceRefs) ? faceRefs.slice(0, 2) : []
    for (const url of refs) {
      try {
        const res = await fetch(url)
        if (!res.ok) continue
        const b64 = Buffer.from(await res.arrayBuffer()).toString('base64')
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: b64 } })
      } catch {
        continue
      }
    }

    const styleNote = parts.length > 0
      ? `The attached images are top-performing thumbnails from this channel. Study their visual style, color palette, composition, and energy — then create something better.`
      : ''

    const prompt = `Generate a YouTube thumbnail for a video titled "${title}".

Thumbnail concept: ${concept}

${styleNote}

Rules:
- 16:9 landscape, fill the entire frame, no borders
- Bold, sharp, perfectly legible text showing the video title — no distorted or warped text
- Hyper-saturated vibrant colors, deep blacks, extreme contrast, cinematic lighting
- Viral YouTube thumbnail energy — high drama, high emotion
- Professional quality`

    parts.push({ text: prompt })

    const streamingResp = await (ai.models as never as {
      generateContentStream: (req: object) => Promise<AsyncIterable<{
        candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> } }>
      }>>
    }).generateContentStream({
      model: 'gemini-3-pro-image-preview',
      contents: [{ role: 'user', parts }],
      config: generationConfig,
    })

    let imageData: { data: string; mimeType: string } | null = null
    for await (const chunk of streamingResp) {
      const imgPart = chunk.candidates?.[0]?.content?.parts?.find(p => p.inlineData)
      if (imgPart?.inlineData) {
        imageData = imgPart.inlineData
        break
      }
    }

    if (!imageData) return Response.json({ error: 'No image returned from model' }, { status: 500 })

    return Response.json({ imageUrl: `data:${imageData.mimeType};base64,${imageData.data}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
