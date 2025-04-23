import ytdl from 'ytdl-core';

export default async (req, res) => {
  const { url, format } = req.query;

  try {
    // Fetch video information from YouTube
    const info = await ytdl.getInfo(url);

    // Filter formats based on requested type (audio or video+audio)
    const formats = ytdl.filterFormats(info.formats, format === 'audio' ? 'audioonly' : 'videoandaudio');

    // Choose the highest quality format based on user request
    const selectedFormat = formats[0];

    // Check if contentLength exists and convert bytes to MB if present
    const sizeInBytes = selectedFormat.contentLength;
    let fileSize = 'Unknown';

    if (sizeInBytes) {
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);  // Convert bytes to MB
      fileSize = `${sizeInMB} MB`;
    }

    // Prepare video details for response
    const videoDetails = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      size: fileSize, // Display the file size in MB or "Unknown"
      videoId: info.videoDetails.videoId,
      url: ytdl.chooseFormat(info.formats, { quality: 'highestvideo' }).url,
    };

    // Send a successful response with video details
    res.status(200).json(videoDetails);
  } catch (err) {
    // If an error occurs, send a 500 response with the error message
    res.status(500).json({ error: "Failed to fetch video details." });
  }
};
