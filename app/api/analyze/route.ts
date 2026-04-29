import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const YT_KEY = process.env.YOUTUBE_API_KEY
const YT = 'https://www.googleapis.com/youtube/v3'

// Resolve channel ID from various URL formats
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
      // bare path like /mkbhd
      username = path.slice(1).split('/')[0]
    }
  } catch {
    // treat as bare handle
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

  if (!data.items?.length) throw new Error('Channel not found. Make sure the URL is a valid public YouTube channel.')

  const channel = data.items[0]
  const subs = parseInt(channel.statistics?.subscriberCount || '0')
  const subsFormatted = subs >= 1_000_000
    ? `${(subs / 1_000_000).toFixed(1)}M`
    : subs >= 1000
    ? `${(subs / 1000).toFixed(1)}K`
    : String(subs)

  const thumbs = channel.snippet.thumbnails
  const avatar: string | undefined =
    thumbs?.high?.url ?? thumbs?.medium?.url ?? thumbs?.default?.url ?? undefined

  return {
    id: channel.id,
    name: channel.snippet.title,
    subs: subsFormatted,
    avatar,
  }
}

// Get uploads playlist ID for a channel
async function getUploadsPlaylistId(channelId: string): Promise<string> {
  const res = await fetch(`${YT}/channels?part=contentDetails&id=${channelId}&key=${YT_KEY}`)
  const data = await res.json()
  return data.items[0].contentDetails.relatedPlaylists.uploads
}

// Fetch video IDs from playlist (up to 50)
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

// Get stats for videos and return top 10 by views
async function getTopVideos(videoIds: string[]): Promise<VideoStats[]> {
  if (!videoIds.length) throw new Error('No videos found on this channel.')
  const ids = videoIds.slice(0, 50).join(',')
  const res = await fetch(`${YT}/videos?part=snippet,statistics&id=${ids}&key=${YT_KEY}`)
  const data = await res.json()

  const videos: VideoStats[] = (data.items || []).map((v: {
    id: string
    snippet: { title: string; description: string }
    statistics: { viewCount?: string; likeCount?: string }
  }) => ({
    id: v.id,
    title: v.snippet.title,
    views: parseInt(v.statistics.viewCount || '0'),
    likes: parseInt(v.statistics.likeCount || '0'),
    description: v.snippet.description.slice(0, 200),
  }))

  return videos.sort((a, b) => b.views - a.views).slice(0, 10)
}

// Call Claude to generate 5 video ideas
async function generateIdeas(channelName: string, videos: VideoStats[]) {
  const videoList = videos.map((v, i) =>
    `${i + 1}. "${v.title}" — ${v.views.toLocaleString()} views, ${v.likes.toLocaleString()} likes`
  ).join('\n')

  const systemPrompt = `You are an expert YouTube growth strategist with deep knowledge of content optimization, audience psychology, and viral video mechanics. You analyze channel data and generate high-potential video ideas backed by data patterns.

Always respond with valid JSON only — no markdown, no extra text.`

  const userPrompt = `Channel: ${channelName}

Top performing videos:
${videoList}

Analyze the patterns in these top videos and generate exactly 5 new video ideas ranked by predicted performance (rank 1 = highest potential).

Respond with this exact JSON structure:
{
  "ideas": [
    {
      "rank": 1,
      "title": "exact video title optimized for clicks and search",
      "performanceReason": "2-3 sentence explanation of why this will perform based on the channel's proven patterns",
      "thumbnailConcept": "Describe the visual scene — colors, setting, mood, lighting, props, objects, text style and placement. Written like you're describing it to someone. No technical prompt language."
    }
  ]
}`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  // Strip markdown code fences if present
  const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(clean)
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return Response.json({ error: 'URL is required' }, { status: 400 })

    const channel = await resolveChannelId(url)
    const uploadsId = await getUploadsPlaylistId(channel.id)
    const videoIds = await getPlaylistVideoIds(uploadsId)
    const topVideos = await getTopVideos(videoIds)
    const analysis = await generateIdeas(channel.name, topVideos)

    // Top 3 video thumbnails as face references — high-res, always show the creator
    const faceRefs = topVideos.slice(0, 3).map(v => `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`)

    return Response.json({
      channelName: channel.name,
      subscriberCount: channel.subs,
      totalVideosAnalyzed: topVideos.length,
      channelAvatar: channel.avatar,
      faceRefs,
      ideas: analysis.ideas,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
