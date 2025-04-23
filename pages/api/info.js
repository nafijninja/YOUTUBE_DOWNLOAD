import ytdl from 'ytdl-core';

export default async (req, res) => {
  const { url, format } = req.query;
  
  try {
    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, format === 'audio' ? 'audioonly' : 'videoandaudio');
    const videoDetails = {
      title: info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails[0].url,
      size: formats[0].contentLength,
      videoId: info.videoDetails.videoId,
      url: ytdl.chooseFormat(info.formats, { quality: 'highestvideo' }).url,
    };
    res.status(200).json(videoDetails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch video details." });
  }
};
    