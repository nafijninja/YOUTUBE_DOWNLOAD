// pages/api/info.js
import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  const { url, format } = req.query;

  if (!url || !format) {
    return res.status(400).json({ error: "Missing 'url' or 'format' query parameter." });
  }

  try {
    let normalizedUrl = url.trim();

    const parsed = new URL(normalizedUrl);

    // Normalize mobile YouTube URLs to www
    if (parsed.hostname.startsWith('m.')) {
      parsed.hostname = parsed.hostname.replace('m.', 'www.');
    }

    // Convert youtu.be to full format
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.split('/')[1];
      normalizedUrl = `https://www.youtube.com/watch?v=${id}`;
    }

    // Convert Shorts to watch format
    if (parsed.pathname.includes('/shorts/')) {
      const id = parsed.pathname.split('/shorts/')[1].split(/[/?&]/)[0];
      normalizedUrl = `https://www.youtube.com/watch?v=${id}`;
    }

    // Reparse if modified
    if (normalizedUrl !== url) {
      parsed.href = normalizedUrl;
    }

    const info = await ytdl.getInfo(normalizedUrl);

    const filteredFormats = ytdl.filterFormats(
      info.formats,
      format === 'audio' ? 'audioonly' : 'videoandaudio'
    );

    if (!filteredFormats.length) {
      return res.status(404).json({ error: "No suitable formats found." });
    }

    const selectedFormat = filteredFormats.find(f => f.contentLength) || filteredFormats[0];
    const sizeInBytes = selectedFormat.contentLength;
    const sizeInMB = sizeInBytes ? (parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2) : null;

    return res.status(200).json({
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.at(-1)?.url || '',
      size: sizeInMB,
      videoId: info.videoDetails.videoId,
      url: selectedFormat.url,
    });
  } catch (error) {
    console.error("Error fetching video info:", error);
    return res.status(500).json({ error: "Failed to fetch video details." });
  }
}
