import '../styles/globals.css';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>YouTube Downloader</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Download YouTube videos and audio easily." />
        <meta name="keywords" content="YouTube, downloader, video, audio, download" />
        
        {/* Open Graph meta tags for Facebook and LinkedIn */}
        <meta property="og:title" content="YouTube Downloader" />
        <meta property="og:description" content="Download YouTube videos and audio with ease." />
        <meta property="og:image" content="/og-image.jpg" />
        
        {/* Twitter meta tags for Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="YouTube Downloader" />
        <meta name="twitter:description" content="Download YouTube videos and audio with ease." />
        <meta name="twitter:image" content="/twitter-image.jpg" />
        
        {/* Manifest and Icons */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
