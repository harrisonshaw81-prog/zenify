import Anthropic from '@anthropic-ai/sdk'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const maxDuration = 60
import { verifyProCookie, COOKIE_NAME as PRO_COOKIE } from '@/lib/pro-cookie'
import { signFreeCookie, verifyFreeCookie, FREE_COOKIE_NAME, FREE_DAILY_LIMIT } from '@/lib/free-usage'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const YT_KEY = process.env.YOUTUBE_API_KEY
const YT = 'https://www.googleapis.com/youtube/v3'

async function resolveChannelId(url: string): Promise<{ id: string; name: string; subs: string; avatar?: string }> {
  let handle: string | null = null
  let channelId: string | null = null
  let username: string | null = null

  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`)
    const path = u.pathname

    if (path.startsWith('/@')) {
      handle = path.slice(2).split('/')[0]
    } else if (path.startsWith('/channel/')) {
      channelId = path.split('/channel/')[1].split('/')[0]
    } else if (path.startsWith('/c/')) {
      username = path.split('/c/')[1].split('/')[0]
    } else if (path.startsWith('/user/')) {
      username = path.split('/user/')[1].split('/')[0]
    } else if (path.length > 1) {
      username = path.slice(1).split('/')[0]
    }
  } catch {
    handle = url.replace('@', '')
  }

  let apiUrl: string
  if (channelId) {
    apiUrl = `${YT}/channels?part=snippet,statistics&id=${channelId}&key=${YT_KEY}`
  } else if (handle) {
    apiUrl = `${YT}/channels?part=snippet,statistics&forHandle=${handle}&key=${YT_KEY}`
  } else {
    apiUrl = `${YT}/channels?part=snippet,statistics&forUsername=${username}&key=${YT_KEY}`
  }

  const res = await fetch(apiUrl)
  const data = await res.json()

  if (data.error) throw new Error(`YouTube API error: ${data.error.message ?? 'unknown error'}`)
  if (!data.items?.length) throw new Error('Channel not found. Make sure the URL is a valid public YouTube channel.')

  const channel = data.items[0]
  const subs = parseInt(channel.statistics?.subscriberCount || '0')
  const subsFormatted = subs >= 1_000_000
    ? `${(subs / 1_000_000).toFixed(1)}M`
    : subs >= 1000
    ? `${(subs / 1000).toFixed(1)}K`
    : String(subs)

  const thumbs = channel.snippet?.thumbnails
  const avatar: string | undefined =
    thumbs?.high?.url ?? thumbs?.medium?.url ?? thumbs?.default?.url ?? undefined

  return { id: channel.id, name: channel.snippet.title, subs: subsFormatted, avatar }
}

async function getUploadsPlaylistId(channelId: string): Promise<string> {
  const res = await fetch(`${YT}/channels?part=contentDetails&id=${channelId}&key=${YT_KEY}`)
  const data = await res.json()
  const uploadsId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
  if (!uploadsId) throw new Error('This channel has no public uploads.')
  return uploadsId
}

async function getPlaylistVideoIds(playlistId: string): Promise<string[]> {
  const res = await fetch(`${YT}/playlistItems?part=contentDetails&playlistId=${playlistId}&maxResults=50&key=${YT_KEY}`)
  const data = await res.json()
  return (data.items || []).map((item: { contentDetails: { videoId: string } }) => item.contentDetails.videoId)
}

interface VideoStats {
  id: string
  title: string
  views: number
  likes: number
  description: string
}

async function getTopVideos(videoIds: string[]): Promise<VideoStats[]> {
  if (!videoIds.length) throw new Error('No public videos found on this channel.')
  const ids = videoIds.slice(0, 50).join(',')
  const res = await fetch(`${YT}/videos?part=snippet,statistics&id=${ids}&key=${YT_KEY}`)
  const data = await res.json()

  const videos: VideoStats[] = (data.items || []).map((v: {
    id: string
    snippet: { title: string; description: string }
    statistics?: { viewCount?: string; likeCount?: string }
  }) => ({
    id: v.id,
    title: v.snippet.title,
    views: parseInt(v.statistics?.viewCount || '0'),
    likes: parseInt(v.statistics?.likeCount || '0'),
    description: v.snippet.description?.slice(0, 200) ?? '',
  }))

  if (!videos.length) throw new Error('No public videos found on this channel.')
  return videos.sort((a, b) => b.views - a.views).slice(0, 10)
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

async function analyzeChannelStyle(thumbnailImages: string[]): Promise<string> {
  if (thumbnailImages.length === 0) return ''

  const content: Anthropic.MessageParam['content'] = [
    ...thumbnailImages.map(data => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data },
    })),
    {
      type: 'text' as const,
      text: `Analyze these top-performing YouTube thumbnails and describe this channel's consistent thumbnail style.

Cover:
- Background and setting (environments, footage, scenes they consistently use)
- Color palette (dominant colors, contrast level, saturation)
- Text treatment (font weight, position on screen, color, shadow or outline effects)
- Graphic overlays or design elements
- Composition and framing
- Overall energy and mood

Be specific and descriptive. Do not mention any people, faces, or expressions. Write as a style guide that could reproduce this channel's exact thumbnail aesthetic.`,
    },
  ]

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content }],
    })
    return msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : ''
  } catch {
    return ''
  }
}

function extractJSON(text: string): object | null {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : null
  } catch {
    return null
  }
}

async function generateIdeas(channelName: string, videos: VideoStats[], thumbnailImages: string[]) {
  const videoList = videos.map((v, i) =>
    `${i + 1}. "${v.title}" - ${v.views.toLocaleString()} views, ${v.likes.toLocaleString()} likes`
  ).join('\n')

  const systemPrompt = `You are an expert YouTube growth strategist with deep knowledge of content optimization, audience psychology, and viral video mechanics. You analyze channel data and generate high-potential video ideas backed by data patterns.

Always respond with valid JSON only - no markdown, no extra text.`

  const userText = `Channel: ${channelName}

Top performing videos:
${videoList}

Analyze the patterns in these top videos and generate exactly 5 new video ideas ranked by predicted performance (rank 1 = highest potential).

Respond with this exact JSON structure:
{
  "ideas": [
    {
      "rank": 1,
      "title": "exact video title optimized for clicks and search — no hashtags, no emojis",
      "performanceReason": "2-3 sentence explanation of why this will perform based on the channel's proven patterns",
      "thumbnailConcept": "Visual brief rooted in this channel's thumbnail style. Do NOT describe any person, face, expression, or body pose. Describe only: the setting and background, dominant color palette, lighting style, emotional energy, and how the title text appears (position, weight, color). Be specific and cinematic."
    }
  ]
}`

  const userTextWithImages = thumbnailImages.length > 0
    ? `Channel: ${channelName}

The attached images are the top-performing thumbnails from this channel. Study their visual style carefully: color palette, composition, text treatment, lighting, mood, and energy. The thumbnailConcept for each idea must match and build on this established visual style.

Top performing videos:
${videoList}

Analyze the patterns in these top videos and generate exactly 5 new video ideas ranked by predicted performance (rank 1 = highest potential).

Respond with this exact JSON structure:
{
  "ideas": [
    {
      "rank": 1,
      "title": "exact video title optimized for clicks and search — no hashtags, no emojis",
      "performanceReason": "2-3 sentence explanation of why this will perform based on the channel's proven patterns",
      "thumbnailConcept": "Visual brief rooted in this channel's thumbnail style. Do NOT describe any person, face, expression, or body pose. Describe only: the setting and background, dominant color palette, lighting style, emotional energy, and how the title text appears (position, weight, color). Match the visual style of their top thumbnails. Be specific and cinematic."
    }
  ]
}`
    : userText

  const contentWithImages: Anthropic.MessageParam['content'] = [
    ...thumbnailImages.map(data => ({
      type: 'image' as const,
      source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data },
    })),
    { type: 'text' as const, text: userTextWithImages },
  ]

  const contentTextOnly: Anthropic.MessageParam['content'] = [
    { type: 'text' as const, text: userText },
  ]

  async function callClaude(content: Anthropic.MessageParam['content']): Promise<object | null> {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content }],
      })
      const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
      return extractJSON(text)
    } catch {
      return null
    }
  }

  // Try with images first; fall back to text-only on any failure
  const result = (thumbnailImages.length > 0 ? await callClaude(contentWithImages) : null)
    ?? await callClaude(contentTextOnly)

  if (!result) throw new Error('Analysis failed — please try again.')
  return result
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    const cookieStore = await cookies()
    const isPro = verifyProCookie(cookieStore.get(PRO_COOKIE)?.value)

    const today = new Date().toISOString().split('T')[0]
    let freeCount = 0

    if (!isPro) {
      const existing = verifyFreeCookie(cookieStore.get(FREE_COOKIE_NAME)?.value)
      freeCount = existing?.day === today ? existing.count : 0
      if (freeCount >= FREE_DAILY_LIMIT) {
        return NextResponse.json(
          { error: 'free_limit_reached', message: `Free tier allows ${FREE_DAILY_LIMIT} analyses per day. Upgrade to Pro for unlimited.` },
          { status: 429 }
        )
      }
    }

    const channel = await resolveChannelId(url)
    const uploadsId = await getUploadsPlaylistId(channel.id)
    const videoIds = await getPlaylistVideoIds(uploadsId)
    const topVideos = await getTopVideos(videoIds)

    const faceRefs = topVideos.slice(0, 8).map(v => `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`)
    const thumbnailImages = (await Promise.all(faceRefs.slice(0, 3).map(fetchBase64))).filter((d): d is string => d !== null)

    const [analysis, thumbnailStyle] = await Promise.all([
      generateIdeas(channel.name, topVideos, thumbnailImages),
      analyzeChannelStyle(thumbnailImages),
    ])

    const response = NextResponse.json({
      channelName: channel.name,
      subscriberCount: channel.subs,
      totalVideosAnalyzed: topVideos.length,
      channelAvatar: channel.avatar,
      faceRefs,
      thumbnailStyle,
      ideas: (analysis as { ideas: unknown[] }).ideas,
    })

    if (!isPro) {
      response.cookies.set(FREE_COOKIE_NAME, signFreeCookie(freeCount + 1, today), {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 2 * 24 * 60 * 60,
        path: '/',
      })
    }

    return response
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong, please try again.'
    console.error('[analyze]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
