/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';

let youTubeAPILoaded = false;
let youTubeAPILoading = false;
const playerCallbacks = [];

function loadYouTubeAPI() {
  if (youTubeAPILoaded) return Promise.resolve();
  if (youTubeAPILoading) {
    return new Promise(resolve => playerCallbacks.push(resolve));
  }
  youTubeAPILoading = true;
  return new Promise(resolve => {
    playerCallbacks.push(resolve);
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      youTubeAPILoaded = true;
      youTubeAPILoading = false;
      playerCallbacks.forEach(cb => cb());
      playerCallbacks.length = 0;
    };
  });
}

function YouTubePlayer({
  videoId,
  startSeconds = 0,
  volume = 20,
  playing = true,
  thumbnailUrl = null,
  style = {}
}) {
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let destroyed = false;

    loadYouTubeAPI().then(() => {
      if (destroyed || !containerRef.current) return;

      const div = document.createElement('div');
      containerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div, {
        videoId,
        playerVars: {
          autoplay: playing ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          start: Math.floor(startSeconds),
          mute: 0,
          playsinline: 1,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(volume);
            if (playing) e.target.playVideo();
            setReady(true);
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              e.target.seekTo(Math.floor(startSeconds));
              e.target.playVideo();
            }
          }
        }
      });
    });

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [videoId]);

  useEffect(() => {
    if (!playerRef.current || !ready) return;
    try {
      playerRef.current.setVolume(volume);
    } catch (e) {}
  }, [volume, ready]);

  useEffect(() => {
    if (!playerRef.current || !ready) return;
    try {
      if (playing) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {}
  }, [playing, ready]);

  return (
    <div
      ref={containerRef}
      className="youtube-player-container"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        ...style
      }}
    >
      {thumbnailUrl && (
        <img
          src={thumbnailUrl}
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: ready ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}
      <style>{`
        /*
         * Centering via flexbox on the container, not a CSS transform on the
         * iframe itself: Chrome-for-Android has a known compositor bug where
         * a transform applied directly to an iframe/video renders it black
         * (audio still plays) because the hardware video overlay surface
         * doesn't follow the transformed layer. Flex layout achieves the
         * same oversized-crop-to-cover effect without touching transform.
         */
        .youtube-player-container iframe {
          width: 177.78vh !important;
          height: 100vh !important;
          min-width: 100%;
          min-height: 56.25vw;
          border: none;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default YouTubePlayer;