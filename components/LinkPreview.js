import React from 'react';
import ReactPlayer from 'react-player';

const LinkPreview = ({ video }) => {
  return (
    <div className="video-preview">
      <ReactPlayer url={`https://www.youtube.com/watch?v=${video.videoId}`} width="100%" height="100%" />
      <img src={video.thumbnail} alt={video.title} />
      <h3>{video.title}</h3>
      <p>Size: {video.size ? (video.size / 1024 / 1024).toFixed(2) : 'N/A'} MB</p>
      <a href={video.url} download>Download</a>
      <button onClick={() => navigator.clipboard.writeText(video.url)}>Copy Link</button>
    </div>
  );
};

export default LinkPreview;
    