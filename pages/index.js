import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import LinkPreview from '../components/LinkPreview';
import { useDropzone } from 'react-dropzone';

export default function Home() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [urls, setUrls] = useState('');
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('video');
  const [error, setError] = useState('');

  // Normalize any valid YouTube link to standard format
  const normalizeUrl = (url) => {
    try {
      const u = new URL(url.trim());
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        if (u.pathname.includes('/shorts/')) {
          const id = u.pathname.split('/shorts/')[1].split(/[/?&]/)[0];
          return `https://www.youtube.com/watch?v=${id}`;
        }
        if (u.hostname === 'youtu.be') {
          const id = u.pathname.split('/')[1];
          return `https://www.youtube.com/watch?v=${id}`;
        }
        if (u.hostname.startsWith('m.')) {
          u.hostname = u.hostname.replace('m.', 'www.');
        }
        return u.toString();
      }
    } catch (err) {
      return url;
    }
    return url;
  };

  const fetchVideoInfo = async (url) => {
    const normalizedUrl = normalizeUrl(url);
    const videoIdMatch = normalizedUrl.match(/[?&]v=([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      console.warn('Invalid video ID for:', url);
      return null;
    }

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(normalizedUrl)}&format=${format}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error('Fetch failed for', url, err.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setVideos([]);

    const videoUrls = urls.split('\n').map(u => u.trim()).filter(Boolean);
    const results = await Promise.all(videoUrls.map(fetchVideoInfo));
    const validVideos = results.filter(v => v !== null);

    if (validVideos.length === 0) {
      setError('No valid videos fetched.');
    }

    setVideos(validVideos);
    setIsLoading(false);
  };

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'text/plain': ['.txt'] },
    onDrop: (files) => {
      files[0].text().then(setUrls);
    },
  });

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit(e);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [urls, format]);

  return (
    <div className={`min-h-screen ${resolvedTheme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} p-4`}>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">YouTube Video Downloader</h1>
        <button onClick={handleThemeToggle} className="px-4 py-2 bg-gray-700 text-white rounded">
          Toggle {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Enter YouTube URLs, one per line"
          className="w-full h-32 border p-2 rounded text-black"
        />
        <div className="flex gap-4">
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="border p-2 rounded text-black">
            <option value="video">Video</option>
            <option value="audio">Audio</option>
          </select>
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {isLoading ? 'Loading...' : 'Fetch Videos'}
          </button>
        </div>
      </form>

      <div {...getRootProps()} className="mt-4 p-4 border-dashed border-2 rounded text-center cursor-pointer">
        <input {...getInputProps()} />
        <p>Drop a .txt file with URLs or click to upload</p>
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="mt-6 space-y-6">
        {videos.map((video, index) => (
          <div key={index} className="bg-gray-200 p-4 rounded">
            <h2 className="font-bold text-xl">{video.title}</h2>
            <div className="mb-4">
              <img src={video.thumbnailUrl} alt={video.title} className="w-full h-auto rounded" />
            </div>
            <LinkPreview video={video} />
            <div className="flex gap-4">
              <a
                href={video.downloadUrl}
                className="px-4 py-2 bg-green-600 text-white rounded"
                download
              >
                Download {format === 'video' ? 'Video' : 'Audio'}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
