// components/LinkPreview.js
import React from 'react';
import ReactPlayer from 'react-player';

const LinkPreview = ({ video }) => {
  if (!video) return null;

  const { title, thumbnail, size, url, videoId } = video;

  return (
    <div className="video-preview border p-4 rounded shadow-md space-y-4">
      {/* Embedded YouTube Player */}
      <ReactPlayer 
        url={`https://www.youtube.com/watch?v=${videoId}`} 
        width="100%" 
        height="360px"
        controls
        className="rounded"
      />

      {/* Thumbnail fallback */}
      {!ReactPlayer.canPlay(url) && (
        <div className="relative">
          <img 
            src={thumbnail} 
            alt={title} 
            className="w-full h-auto rounded mt-4"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold">{title}</h3>

      {/* Size Info */}
      <p className="text-sm text-gray-500">
        Size: {size ? `${size} MB` : 'N/A'}
      </p>

      {/* Download Link */}
      <div className="flex flex-wrap gap-2">
        <a
          href={url}
          download
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Download
        </a>

        <button 
          onClick={() => navigator.clipboard.writeText(url)} 
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
};

export default LinkPreview;
