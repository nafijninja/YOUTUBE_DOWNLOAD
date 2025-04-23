// pages/api/info.js
import ytdl from 'ytdl-core';

export default async function handler(req, res) {
  const { url, format } = req.query;

  // Check if both 'url' and 'format' query parameters are provided
  if (!url || !format) {
    return res.status(400).json({ error: "Missing 'url' or 'format' query parameter." });
  }

  try {
    // Normalize the YouTube URL for safety and standardization
    let normalizedUrl = url;

    // If the URL is a short YouTube link (youtu.be), convert it to the full format
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.split('/')[1];
      normalizedUrl = `https://www.youtube.com/watch?v=${id}`;
    }

    // If the URL is a YouTube Shorts URL, convert it to the full YouTube video URL
    if (parsed.pathname.includes('/shorts/')) {
      const id = parsed.pathname.split('/shorts/')[1].split(/[/?&]/)[0];
      normalizedUrl = `https://www.youtube.com/watch?v=${id}`;
    }

    // Fetch video information from ytdl-core using the normalized URL
    const info = await ytdl.getInfo(normalizedUrl);

    // Filter formats based on the requested format (audio or video)
    const filteredFormats = ytdl.filterFormats(
      info.formats,
      format === 'audio' ? 'audioonly' : 'videoandaudio'
    );

    if (filteredFormats.length === 0) {
      return res.status(404).json({ error: "No suitable formats found." });
    }

    // Select the best format with contentLength available, or just pick the first
    const selectedFormat = filteredFormats.find(f => f.contentLength) || filteredFormats[0];

    // Calculate the size of the video/audio in MB
    const sizeInBytes = selectedFormat.contentLength;
    const sizeInMB = sizeInBytes ? (parseInt(sizeInBytes) / (1024 * 1024)).toFixed(2) : null;

    // Prepare the response with video details
    const videoDetails = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails.at(-1).url,
      size: sizeInMB,
      videoId: info.videoDetails.videoId,
      url: selectedFormat.url, // URL for the chosen format (audio or video)
    };

    // Return the video details as a JSON response
    return res.status(200).json(videoDetails);
  } catch (error) {
    // Log any errors and return a 500 server error response
    console.error("Error fetching video info:", error);
    return res.status(500).json({ error: "Failed to fetch video details." });
  }
}
