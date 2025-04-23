import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import LinkPreview from '../components/LinkPreview';
import { useDropzone } from 'react-dropzone';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [urls, setUrls] = useState('');
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState('video');
  const [error, setError] = useState('');

  // Helper function to extract video ID from various YouTube URL formats
  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S+?v=|(?:v|e(?:mbed)?)\/|\S+\/[\w\-]+(?:\S*?=|\/)?)|youtu\.be\/)([\w\-]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Fetch video info from API
  const fetchVideoInfo = async (url) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return null;
    }

    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}&format=${format}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error('Fetch failed for', url, err.message);
      setError('Failed to fetch video information.');
      return null;
    }
  };

  // Handle form submit
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

  // Toggle dark/light theme
  const handleThemeToggle = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Dropzone setup for file upload
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'text/plain': ['.txt'] },
    onDrop: (files) => {
      files[0].text().then(setUrls);
    },
  });

  // Handle keypress event for submitting when Ctrl/Command + Enter is pressed
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
    <div className={`container ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-white text-black'} p-4`}>
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">YouTube Video Downloader</h1>
        <button onClick={handleThemeToggle} className="px-4 py-2 bg-gray-700 text-white rounded">
          Toggle Dark Mode
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder="Enter YouTube URLs, one per line"
          className="w-full h-32 border p-2 rounded"
        />
        <div className="flex gap-4">
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="border p-2 rounded">
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
          <LinkPreview key={index} video={video} />
        ))}
      </div>
    </div>
  );
}
