import React from 'react';
import ReactPlayer from 'react-player';

const LinkPreview = ({ video }) => {
  if (!video) return null;

  const { title, thumbnail, size, url } = video;

  return (
    <div className="video-preview border p-4 rounded shadow-md space-y-4">
      {/* YouTube video preview */}
      <ReactPlayer 
        url={`https://www.youtube.com/watch?v=${video.videoId}`} 
        width="100%" 
        height="auto" 
        className="rounded"
      />

      {/* Thumbnail Image */}
      <div className="relative">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-auto rounded mt-4"
        />
      </div>

      {/* Video Title */}
      <h3 className="text-xl font-semibold">{title}</h3>

      {/* Video Size */}
      <p className="text-sm text-gray-500">
        Size: {size ? (size / 1024 / 1024).toFixed(2) : 'N/A'} MB
      </p>

      {/* Download Link */}
      <div className="mt-4">
        <a href={url} download className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Download
        </a>
      </div>

      {/* Copy Link Button */}
      <button 
        onClick={() => navigator.clipboard.writeText(url)} 
        className="mt-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
      >
        Copy Link
      </button>
    </div>
  );
};

export default LinkPreview;
