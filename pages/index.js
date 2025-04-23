import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import LinkPreview from '../components/LinkPreview';
import { useDropzone } from 'react-dropzone';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [urls, setUrls] = useState("");
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState("video");
  const [error, setError] = useState("");

  const fetchVideoInfo = async (url) => {
    try {
      const res = await fetch(`/api/info?url=${url}&format=${format}`);
      const data = await res.json();
      return data;
    } catch (err) {
      setError("Failed to fetch video information.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const videoUrls = urls.split('\n').map((url) => url.trim()).filter(Boolean);
    const videoInfo = await Promise.all(videoUrls.map(fetchVideoInfo));
    setVideos(videoInfo.filter(info => info !== null));
    setIsLoading(false);
  };

  const handleThemeChange = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: 'text/plain',
    onDrop: (acceptedFiles) => {
      acceptedFiles[0].text().then((text) => setUrls(text));
    },
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Enter') handleSubmit(e);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [urls]);

  return (
    <div className={`container ${theme === 'dark' ? 'dark' : ''}`}>
      <header>
        <h1>YouTube Video Downloader</h1>
        <button onClick={handleThemeChange}>Toggle Dark Mode</button>
      </header>
      <form onSubmit={handleSubmit}>
        <textarea 
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Enter YouTube URLs, one per line"
        />
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
        </select>
        <button type="submit" disabled={isLoading}>Fetch Videos</button>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {videos.length > 0 && (
        <div>
          {videos.map((video, index) => (
            <LinkPreview key={index} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
    